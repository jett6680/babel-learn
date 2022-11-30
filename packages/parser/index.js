const { Parser, TokenType } = require('acorn')

Parser.acorn.keywordTypes["powerjett"] = new TokenType("powerjett", { keyword: "powerjett" });

class MyParser extends Parser {
  parse(...args) {
    let keywords = 'break|case|catch|continue|debugger|default|do|else|finally|for|function|if|return|switch|throw|try|var|while|with|null|true|false|instanceof|typeof|void|delete|new|in|this|const|class|extends|export|import|super'
    // 增加powerjett关键字
    keywords += '|powerjett'
    this.keywords = new RegExp('^(?:' + keywords + ')$')
    return super.parse(...args)
  }

  parseStatement(context, topLevel, exports) {
    var starttype = this.type;

    if (starttype == Parser.acorn.keywordTypes["powerjett"]) {
      var node = this.startNode();
      return this.parsePowerjettStatement(node);
    }
    else {
      return (super.parseStatement(context, topLevel, exports));
    }
  }

  parsePowerjettStatement(node) {
    this.next();
    return this.finishNode({ value: 'powerjett' }, 'PowerjettStatement');//新增加的ssh语句
  };
}

module.exports = MyParser