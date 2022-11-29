const { declare } = require('@babel/helper-plugin-utils')

// 根据函数定义生成api文档
module.exports = declare((api, options, dirname) => {
  api.assertVersion(7)
  return {
    pre(file) {

    },
    post(file) {

    },
    visitor: {

    }
  }
})