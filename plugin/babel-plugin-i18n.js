const {declare} = require('@babel/helper-plugin-utils')
const importModule = require("@babel/helper-module-imports")
const generate = require('@babel/generator').default

module.exports = declare((api, options, dirname) => {
  let index = 0

  function nextI18nKey() {
    ++index
    return `i18n${index}`
  }

  function getReplaceExpression(path, value, importId) {
    const expressionParams = path.isTemplateLiteral() ?
        path.node.expressions.map(item => generate(item).code) : null
    let replaceExpression = api.template.ast(
        `${importId}.t('${value}'${expressionParams ? ',' + expressionParams.join(',') : ''})`
    ).expression;
    if (path.findParent(p => p.isJSXAttribute()) && !path.findParent(p=> p.isJSXExpressionContainer())) {
      replaceExpression = api.types.JSXExpressionContainer(replaceExpression);
    }
    return replaceExpression;
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          // 先引入 @pjt/i18n
          path.traverse({
            ImportDeclaration(currentPath) {
              const requirePath = currentPath.get('source').node.value
              if (requirePath === options.i18nPath) {
                const specifierPath = currentPath.get('specifiers.0')
                state.i18nImportId = specifierPath.toString()
              }
            }
          })
          if (!state.i18nImportId) {
            state.i18nImportId = importModule.addDefault(path, options.i18nPath, {
              nameHint: path.scope.generateUid(options.i18nPath)
            }).name;
          }
          path.traverse({
            'StringLiteral|TemplateLiteral'(currentPath) {
              if (currentPath.node.leadingComments) {
                // 将前面先的注释 /* i18n-disable */ 去掉
                // 并且标记，当前的语句不进行处理
                currentPath.node.leadingComments =
                    currentPath.node.leadingComments.filter(commentBlock => {
                      if (commentBlock.value.includes('i18n-disable')) {
                        // 打上标记
                        currentPath.node.skipTransform = true
                        return false
                      }
                      return true
                    })
              }
              // import的module也是具有StringLiteral的类型
              // 比如import _ from 'lodash' 其中的lodash是StringLiteral
              // 对于import语句，也不需要处理，直接跳过
              if(currentPath.findParent(p => p.isImportDeclaration())) {
                currentPath.node.skipTransform = true
              }
            }
          })
        }
      },
      StringLiteral(path, state) {
        if (path.node.skipTransform) {
          return
        }
        const key = nextI18nKey()
        const replaceExpression = getReplaceExpression(path, key, state.i18nImportId)
        path.replaceWith(replaceExpression)
        path.skip();
      },
      TemplateLiteral(path, state) {
        if (path.node.skipTransform) {
          return;
        }
        const value = path.get('quasis').map(item => item.node.value.raw).join('{placeholder}');
        if(value) {
          const key = nextI18nKey();
          const replaceExpression = getReplaceExpression(path, key, state.i18nImportId);
          path.replaceWith(replaceExpression);
          path.skip();
        }
      }
    }
  }
})
