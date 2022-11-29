const { declare } = require('@babel/helper-plugin-utils')
const doctrine = require('doctrine')

function resolveType(typeAnnotation) {
  const type = typeAnnotation.type
  switch (type) {
    case 'TSNumberKeyword':
      return 'number'
    case 'TSStringKeyword':
      return 'string'
    case 'TSBooleanKeyword':
      return 'boolean'
    default:
      return 'void'
  }
}

// 解析函数体上面的类型注释
function parseCommentBlock(path) {
  if (path.node.leadingComments && path.node.leadingComments[0].value) {
    return doctrine.parse(path.node.leadingComments[0].value, {
      unwrap: true
    })
  }
  return null
}

// 根据函数定义生成api文档
module.exports = declare((api, options, dirname) => {
  api.assertVersion(7)
  return {
    pre(file) {
      file.set('docs', [])
    },
    post(file) {
      // 可将结果打印出来 拼接MD或者HTML显示文档
      console.log('扫描的api结果: %O', file.get('docs'),)
    },
    visitor: {
      FunctionDeclaration(path, state) {
        const list = state.file.get('docs')
        list.push({
          type: 'function',
          name: path.get('id').toString(),
          params: path.get('params').map(p => {
            return {
              name: p.toString(),
              type: resolveType(p.getTypeAnnotation())
            }
          }),
          return: resolveType(path.get('returnType').getTypeAnnotation()),
          doc: parseCommentBlock(path)
        })
        state.file.set('docs', list)
      },
      ClassDeclaration(path, state) {
        const list = state.file.get('docs')
        const classInfo = {
          type: 'class',
          name: '',
          constructorInfo: {},
          methodsInfo: [],
          propertiesInfo: []
        }
        path.traverse({
          ClassProperty(currentPath) {
            classInfo.propertiesInfo.push({
              name: currentPath.get('key').toString(),
              type: resolveType(currentPath.getTypeAnnotation()),
              doc: parseCommentBlock(currentPath)
            })
          },
          ClassMethod(currentPath) {
            if (currentPath.node.kind === 'constructor') {
              classInfo.constructorInfo = {
                params: currentPath.get('params').map(paramPath => {
                  return {
                    name: paramPath.toString(),
                    type: resolveType(paramPath.getTypeAnnotation()),
                    doc: parseCommentBlock(currentPath)
                  }
                })
              }
            } else {
              classInfo.methodsInfo.push({
                name: currentPath.get('key').toString(),
                params: currentPath.get('params').map(p => {
                  return {
                    name: p.toString(),
                    type: resolveType(p.getTypeAnnotation())
                  }
                }),
                return: resolveType(currentPath.get('returnType').getTypeAnnotation()),
                doc: parseCommentBlock(currentPath)
              })
            }
          }
        })
        if (path.node.leadingComments) {
          classInfo.doc = parseCommentBlock(path);
        }
        list.push(classInfo)
        state.file.set('docs', list)
      }
    }
  }
})