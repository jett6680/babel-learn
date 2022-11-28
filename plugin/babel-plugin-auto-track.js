const { declare } = require('@babel/helper-plugin-utils')
const importModule = require("@babel/helper-module-imports")

// 函数插入_tracker2方法调用

module.exports = declare((api, options, dirname) => {
    api.assertVersion(7);
    return {
        visitor: {
            Program: {
                enter(path, state) {
                    path.traverse({
                        ImportDeclaration(currentPath) {
                            const requirePath = currentPath.get('source').node.value
                            if (requirePath === options.trackerPath) {
                                // 如果说引入了
                                const specifierPath = currentPath.get('specifiers.0')
                                if (specifierPath.isImportSpecifier()) {
                                    // import { tracker } from '@pjt/tracker'
                                    state.trackerImportId = specifierPath.toString()
                                } else if (specifierPath.isImportNamespaceSpecifier()) {
                                    // import * as tracker from '@pjt/tracker'
                                    state.trackerImportId = specifierPath.get('local').toString();
                                } else if (specifierPath.isImportDefaultSpecifier()) {
                                    // import tracker from '@pjt/tracker'
                                    state.trackerImportId = specifierPath.toString()
                                }
                            }
                        }
                    })
                    // 说明没有引入 那么就自动引入，并且生成importId以及插入到函数体内的ast
                    if (!state.trackerImportId) {
                        state.trackerImportId = importModule.addDefault(path, options.trackerPath, {
                            nameHint: path.scope.generateUid(options.trackerPath)
                        }).name;
                    }
                    state.trackerAST = api.template.statement(`${state.trackerImportId}()`)();
                }
            },
            'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
                const bodyPath = path.get('body');
                if (bodyPath.isBlockStatement()) {
                    bodyPath.node.body.unshift(state.trackerAST);
                } else {
                    const ast = api.template.statement(
                        `{${state.trackerImportId}();return PREV_BODY;}`
                    )({
                        PREV_BODY: bodyPath.node
                    });
                    bodyPath.replaceWith(ast);
                }
            }
        }
    }
})
