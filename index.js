const {transformSync} = require('@babel/core')
const printLogInfoPlugin = require('./plugin/babel-plugin-print-log')

const sourceCode = `
  console.log('nihao')

  function say() {
      console.info('哈哈哈  我是info')
  }

  console.error('哈哈哈 我是error')

  export default function App() {
      return (
          <div> { console.log('jsx print') } </div>
      )
  }
`

const {code, map} = transformSync(sourceCode, {
    plugins: [printLogInfoPlugin],
    parserOpts: {
        sourceType: 'unambiguous',
        plugins: ['jsx']
    },
    sourceMap: true
})

console.log(code)
console.log(map)