const doctrine = require('doctrine')
// 解析注释的插件
var ast = doctrine.parse(
  [
    "/**",
    " * This function comment is parsed by doctrine",
    " * @param {{ok:String}} userName",
    "*/"
  ].join('\n'), { unwrap: true });

console.log(' %j ', ast)
