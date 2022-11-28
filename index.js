const fs = require('fs')
const { transformSync } = require('@babel/core')
//const printLogInfoPlugin = require('./plugin/babel-plugin-print-log')
const autoTrackPlugin = require('./plugin/babel-plugin-auto-track')
const sourceCode = fs.readFileSync('./src/index2.js', 'utf8')

const { code, map } = transformSync(sourceCode, {
    plugins: [
        [
            autoTrackPlugin,
            {
                trackerPath: '@pjt/tracker'
            }
        ]
    ],
    parserOpts: {
        sourceType: 'unambiguous',
        plugins: ['jsx']
    },
    sourceMap: true
})

console.log(code)