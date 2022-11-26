const path = require('path')
const pluginTester = require('babel-plugin-tester').default
const printLogInfoPlugin = require('./plugin/babel-plugin-print-log')

pluginTester({
  plugin: printLogInfoPlugin,
  fixtures: path.join(__dirname, '__fixtures__'),
  tests: {
    'add console log': {
      code: 'console.log(1111)',
      output: 'consolele.log(111)'
    }
  }
})