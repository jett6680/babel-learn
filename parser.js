const parser = require('@babel/parser')

const sourceCode = `
  const myName = 'powerjett'
  function test(a, b) {
    return a + b
  }
`

const res = parser.parse(sourceCode)

console.log(res);