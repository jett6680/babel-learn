const { declare } = require('@babel/helper-plugin-utils')

module.exports = declare((api, options, dirname) => {
  api.assertVersion(7)
  return {
    pre(file) {
      file.set('errors', [])
    },
    visitor: {
      ForStatement(path, state) {
        const errors = state.file.get('errors')
        const testOperator = path.node.test.operator
        const updateOperator = path.node.update.operator
        let shouldUpdateOperator = undefined
        // 这个条件不够严谨，当前只是做语法检测测试
        if (['<', '<='].includes(testOperator)) {
          shouldUpdateOperator = '++'
        } else if (['>', '>='].includes(testOperator)) {
          shouldUpdateOperator = '--'
        }
        if (shouldUpdateOperator !== updateOperator) {
          const temp = Error.stackTraceLimit
          Error.stackTraceLimit = 0
          errors.push(path.get('update').buildCodeFrameError('for operator error'))
          Error.stackTraceLimit = temp
        }
      }
    },
    post(file) {
      console.log(file.get('errors'))
    }
  }
})