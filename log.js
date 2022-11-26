const parser = require('@babel/parser')
const generator = require('@babel/generator')
const traverse = require('@babel/traverse')


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

// step1 生成ast
// step2 插入log
// step3 生成目标代码

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous',
    plugins: [ 'jsx' ]
})

console.log(ast)