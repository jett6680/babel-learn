const generator = require('@babel/generator').default
// babel 插件的写法
// step1 生成ast
// step2 插入log
// step3 生成目标代码

const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);

module.exports = (api, options, dirname) => {
    // console.log(Object.keys(api))
    // console.log(options)
    // console.log(dirname)
    // console.log('-----')
    const { types, template } = api
    return {
        visitor: {
            CallExpression(path, state) {
                if (path.node.isNew) {
                    return;
                }
                const calleeName = generator(path.node.callee).code;
                if (targetCalleeName.includes(calleeName)) {
                    const { line, column } = path.node.loc.start;

                    const fileName = (state && state.filename) || 'unkown filename'

                    const newNode = template.expression(`console.log("${fileName}: (${line}, ${column})")`)();
                    newNode.isNew = true;

                    if (path.findParent(path => path.isJSXElement())) {
                        path.replaceWith(types.arrayExpression([newNode, path.node]))
                        path.skip();
                    } else {
                        path.insertBefore(newNode);
                    }
                }
            }
        }
    }
}
