# babel-learn

学习Babel之前，先认真阅读下列两份文档

# Babel用户手册

https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/user-handbook.md

# Babel插件手册

https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md

# Babel的AST结构

https://github.com/babel/babel/blob/main/packages/babel-parser/ast/spec.md#privatename

# ESTree的AST结构

https://github.com/estree/estree

# babel-debug目录
 
babel源代码，可配合vscode进行source-map调试
安装node_modules后，需要讲源码对应的map文件映射到babel-debug目录即可

# 思维导图

Babel7.x.png

- [packages目录下手写版Babel](./packages/core/index.js)
- [根据API自动生成文档插件](./plugin/babel-plugin-auto-api-document.js)
- [自动注入日志打点插件](./plugin/babel-plugin-auto-track.js)
- [代码语法检测插件(Demo)](./plugin/babel-plugin-code-lint.js)
- [项目多语言i8n Babel插件](./plugin/babel-plugin-i18n.js)
- [自动生成模块依赖图插件](./plugin/babel-plugin-module-iterator.js)
- [console.log增强Babel插件(Demo)](./plugin/babel-plugin-print-log.js)
- [TS类型检测插件(Demo)](./plugin/babel-plugin-types-check.js)