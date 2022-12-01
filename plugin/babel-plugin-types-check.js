const { declare } = require('@babel/helper-plugin-utils')

function resolvedType(type) {
  if(type === 'NumberTypeAnnotation') {
    return 'number'
  }
  if(type === 'TSStringKeyword') {
    return 'string'
  }
  return 'void'
}

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7)
  return {
    pre(file) {
      file.set('errors', [])
    },
    visitor: {
      AssignmentExpression(path, state) {
        const realType = resolvedType(path.get('right').getTypeAnnotation().type)
        const definedBinding = path.scope.getBinding(path.get('left'))
        const definedType = resolvedType(definedBinding.path.get('id').getTypeAnnotation().type)
        if(definedType !== realType) {
          const temp = Error.stackTraceLimit = 0
          const error = path.get('right').buildCodeFrameError('类型错误')
          const errors = state.file.get('errors')
          errors.push(error)
          Error.stackTraceLimit = temp
          state.file.set('errors', error)
        }
      }
    },
    post(file) {
      console.log('errors: ', file.get('errors'))
    }
  }
})
