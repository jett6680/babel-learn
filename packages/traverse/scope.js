
class Binding {
  constructor(id, path) {
    this.id = id;
    this.path = path;
    this.referenced = false;
    this.referencePaths = [];
  }
}

class Scope {
  constructor(parentScope, path) {
    this.parent = parentScope
    this.bindings = {}
    this.path = path

    // 遍历当前的node 将作用域下的 var let const function等声明的变量添加到当前作用域
    path.traverse({
      VariableDeclarator: (childPath) => {
        this.registerBinding(childPath.node.id.name, childPath);
      },
      FunctionDeclaration: (childPath) => {
        // 对于函数 有自己的作用域， 所以没必要再遍历函数内部
        childPath.skip();
        this.registerBinding(childPath.node.id.name, childPath);
      }
    });
    //  变量和函数只能是被当前作用域或者子作用域使用，所以在这里，只需要遍历子作节点
    path.traverse({
      Identifier: childPath => {
        // 如果当前标识不是函数也不是变量定义，并且有对当前作用域变量的引用 
        // 那么就把当前引用的变量的path收集起来，并标记当前变量被引用了 referenced: true
        if (!childPath.findParent(p => p.isVariableDeclarator() || p.isFunctionDeclaration())) {
          const id = childPath.node.name;
          const binding = this.getBinding(id);
          if (binding) {
            binding.referenced = true;
            binding.referencePaths.push(childPath);
          }
        }
      }
    });
  }

  registerBinding(id, path) {
    this.bindings[id] = new Binding(id, path);
  }

  getOwnBinding(id) {
    return this.bindings[id];
  }

  getBinding(id) {
    let res = this.getOwnBinding(id);
    if (res === undefined && this.parent) {
      res = this.parent.getOwnBinding(id);
    }
    return res;
  }

  hasBinding(id) {
    return !!this.getBinding(id);
  }

}