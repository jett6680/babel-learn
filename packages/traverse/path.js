
// types实现的引入
const types = {}

class NodePath {
  constructor(node, parent, parentPath, key, listKey) {
    this.node = node
    this.parent = parent
    this.parentPath = parentPath
    this.key = key
    this.listKey = listKey
  }

  get scope() {
    if (this.__scope) {
      return this.__scope;
    }
    const isBlock = this.isBlock();
    const parentScope = this.parentPath && this.parentPath.scope;
    return this.__scope = (isBlock ? new Scope(parentScope, this) : parentScope);
  }

  isBlock() {
    return types.visitorKeys.get(this.node.type).isBlock;
  }

  replaceWith(node) {
    if (this.listKey !== undefined) {
      this.parent[this.key].splice(this.listKey, 1, node);
    } else {
      this.parent[this.key] = node
    }
  }

  remove() {
    if (this.listKey !== undefined) {
      this.parent[this.key].splice(this.listKey, 1);
    } else {
      this.parent[this.key] = null
    }
  }

  findParent(callback) {
    let currentPath = this.parentPath
    while (currentPath && !callback(currentPath)) {
      currentPath = currentPath.parentPath
    }
    return currentPath
  }

  find(callback) {
    let currentPath = this
    while (currentPath && !callback(currentPath)) {
      currentPath = currentPath.parentPath
    }
    return currentPath
  }

  traverse() {
    // 同 traverse 只不过不遍历当前节点
  }

  skip() {
    this.node.__shouldSkip = true;
  }

  toString() {

  }

}

module.exports = NodePath