const NodePath = require('./path')
const astDefinationsMap = require('./definations')

function traverse(node, options, parent, parentPath, key, listKey) {
  const defination = astDefinationsMap.get(node.type)
  let visitorFunc = options[node.type] || {}
  if (typeof visitorFunc === 'function') {
    visitorFunc = {
      enter: visitorFunc
    }
  }
  const nodePath = new NodePath(node, parent, parentPath, key, listKey)
  visitorFunc.enter && visitorFunc.enter(nodePath)
  if (node.__shouldSkip) {
    return
  }
  if (defination.visitor && defination.visitor.length > 0) {
    defination.visitor.forEach(key => {
      if (Array.isArray(node[key])) {
        node[key].forEach((childNode, childNodeIndex) => {
          traverse(childNode, options, node, nodePath, key, childNodeIndex)
        })
      } else {
        traverse(node[key], options, node, nodePath, key)
      }
    })
  }
  visitorFunc.exit && visitorFunc.exit(nodePath)

}

module.exports = traverse