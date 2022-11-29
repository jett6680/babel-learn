const template = require('@babel/template').default

const sourceCode = `
    test()
`

const result = template.ast(sourceCode)

console.log(result.expression)

// import fs from 'fs'
// import * as parser from "@babel/parser"
// import traverse from '@babel/traverse'
// import template from '@babel/template'
// import generate from '@babel/generator'
// import * as t from '@babel/types'
// import { codeFrameColumns } from '@babel/code-frame'



// const rawLines = `class Foo {
// constructor()
// }`;
// const location = { start: { line: 2, column: 2 } };

// const result = codeFrameColumns(rawLines, location, {
//     highlightCode: true,
//     message: '这里错啦'
// });

// console.log(result);
//const a = "var a = 1;";
//const b = "var b = 2;";
//const astA = parser.parse(a, {sourceFilename: "a.js"});
//const astB = parser.parse(b, {sourceFilename: "b.js"});
//const ast = {
//    type: "Program",
//    body: [].concat(astA.program.body, astB.program.body),
//};
//
//const {code, map} = generate.default(
//    ast,
//    {sourceMaps: true},
//    {
//        "a.js": a,
//        "b.js": b,
//    }
//);
//
//console.log(code)
//console.log('-----')
//console.log(map)

//const ast = fs.readFileSync('./ast.json', 'utf8')
//
//const { code, map } = generate.default(JSON.parse(ast), { sourceMaps: true })
//
//console.log(code)
//console.log('-------')
//console.log(map)
//
//


//const name = "my-module";
//const mod = "myModule";
//
//const ast = template.default.ast`
//var ${mod} = require("${name}");
//`;
//
//console.log(generate.default(ast).code);
//
//const buildRequire = template.default.smart(`
//var %%importName%% = require(%%source%%);
//`);

//const ast = buildRequire({
//    importName: t.identifier("myModule"),
//    source: t.stringLiteral("my-module"),
//});
//
//console.log(generate.default(ast).code);

//const code = fs.readFileSync('./src/index.js', 'utf8')
//const ast = parser.parse(code)
//
//traverse.default(ast, {
//    enter(path, state) {
//        if (path.isIdentifier({name: "name"})) {
//            path.node.name = "xxxxxxx";
//        }
//    },
//})
//
//fs.writeFileSync('./ast.json', JSON.stringify(ast))
