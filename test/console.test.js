const path = require('path')
const pluginTester = require('babel-plugin-tester').default
const printLogInfoPlugin = require('../plugin/babel-plugin-print-log')

pluginTester({
  filename: 'console.test.js',
  plugin: printLogInfoPlugin,
  fixtures: path.join(__dirname, '__fixtures__'),
  tests: {
    'add console log': {
      code: 'console.log(1111)',
      output: `console.log(\"unkown filename: (1, 0)\");\nconsole.log(1111);`
    },
    'test snapshot': {
      code: `
        function sayHi(person) {
          console.log('nihao')
          return 'Hello ' + person + '!'
        }
      `,
      snapshot: true,
    },
    'test input file': {
      fixture: path.join(__dirname, './__fixtures__/changed.js'),
      outputFixture: path.join(__dirname, './__fixtures__/changed-output.js')
    }
  }
})