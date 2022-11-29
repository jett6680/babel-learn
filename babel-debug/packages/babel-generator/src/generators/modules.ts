import type Printer from "../printer";
import {
  isClassDeclaration,
  isExportDefaultSpecifier,
  isExportNamespaceSpecifier,
  isImportDefaultSpecifier,
  isImportNamespaceSpecifier,
  isStatement,
} from "@babel/types";
import type * as t from "@babel/types";

export function ImportSpecifier(this: Printer, node: t.ImportSpecifier) {
  if (node.importKind === "type" || node.importKind === "typeof") {
    this.word(node.importKind);
    this.space();
  }

  this.print(node.imported, node);
  // @ts-expect-error todo(flow-ts) maybe check node type instead of relying on name to be undefined on t.StringLiteral
  if (node.local && node.local.name !== node.imported.name) {
    this.space();
    this.word("as");
    this.space();
    this.print(node.local, node);
  }
}

export function ImportDefaultSpecifier(
  this: Printer,
  node: t.ImportDefaultSpecifier,
) {
  this.print(node.local, node);
}

export function ExportDefaultSpecifier(
  this: Printer,
  node: t.ExportDefaultSpecifier,
) {
  this.print(node.exported, node);
}

export function ExportSpecifier(this: Printer, node: t.ExportSpecifier) {
  if (node.exportKind === "type") {
    this.word("type");
    this.space();
  }

  this.print(node.local, node);
  // @ts-expect-error todo(flow-ts) maybe check node type instead of relying on name to be undefined on t.StringLiteral
  if (node.exported && node.local.name !== node.exported.name) {
    this.space();
    this.word("as");
    this.space();
    this.print(node.exported, node);
  }
}

export function ExportNamespaceSpecifier(
  this: Printer,
  node: t.ExportNamespaceSpecifier,
) {
  this.token("*");
  this.space();
  this.word("as");
  this.space();
  this.print(node.exported, node);
}

export function _printAssertions(
  this: Printer,
  node: Extract<t.Node, { assertions?: t.ImportAttribute[] }>,
) {
  this.word("assert");
  this.space();
  this.token("{");
  this.space();
  this.printList(node.assertions, node);
  this.space();
  this.token("}");
}

export function ExportAllDeclaration(
  this: Printer,
  node: t.ExportAllDeclaration | t.DeclareExportAllDeclaration,
) {
  this.word("export");
  this.space();
  if (node.exportKind === "type") {
    this.word("type");
    this.space();
  }
  this.token("*");
  this.space();
  this.word("from");
  this.space();
  // @ts-expect-error Fixme: assertions is not defined in DeclareExportAllDeclaration
  if (node.assertions?.length) {
    this.print(node.source, node, true);
    this.space();
    // @ts-expect-error Fixme: assertions is not defined in DeclareExportAllDeclaration
    this._printAssertions(node);
  } else {
    this.print(node.source, node);
  }

  this.semicolon();
}

export function ExportNamedDeclaration(
  this: Printer,
  node: t.ExportNamedDeclaration,
) {
  if (!process.env.BABEL_8_BREAKING) {
    if (
      this.format.decoratorsBeforeExport &&
      isClassDeclaration(node.declaration)
    ) {
      this.printJoin(node.declaration.decorators, node);
    }
  }

  this.word("export");
  this.space();
  if (node.declaration) {
    const declar = node.declaration;
    this.print(declar, node);
    if (!isStatement(declar)) this.semicolon();
  } else {
    if (node.exportKind === "type") {
      this.word("type");
      this.space();
    }

    const specifiers = node.specifiers.slice(0);

    // print "special" specifiers first
    let hasSpecial = false;
    for (;;) {
      const first = specifiers[0];
      if (
        isExportDefaultSpecifier(first) ||
        isExportNamespaceSpecifier(first)
      ) {
        hasSpecial = true;
        this.print(specifiers.shift(), node);
        if (specifiers.length) {
          this.token(",");
          this.space();
        }
      } else {
        break;
      }
    }

    if (specifiers.length || (!specifiers.length && !hasSpecial)) {
      this.token("{");
      if (specifiers.length) {
        this.space();
        this.printList(specifiers, node);
        this.space();
      }
      this.token("}");
    }

    if (node.source) {
      this.space();
      this.word("from");
      this.space();
      if (node.assertions?.length) {
        this.print(node.source, node, true);
        this.space();
        this._printAssertions(node);
      } else {
        this.print(node.source, node);
      }
    }

    this.semicolon();
  }
}

export function ExportDefaultDeclaration(
  this: Printer,
  node: t.ExportDefaultDeclaration,
) {
  if (!process.env.BABEL_8_BREAKING) {
    if (
      this.format.decoratorsBeforeExport &&
      isClassDeclaration(node.declaration)
    ) {
      this.printJoin(node.declaration.decorators, node);
    }
  }

  this.word("export");
  this.noIndentInnerCommentsHere();
  this.space();
  this.word("default");
  this.space();
  const declar = node.declaration;
  this.print(declar, node);
  if (!isStatement(declar)) this.semicolon();
}

export function ImportDeclaration(this: Printer, node: t.ImportDeclaration) {
  this.word("import");
  this.space();

  const isTypeKind = node.importKind === "type" || node.importKind === "typeof";
  if (isTypeKind) {
    this.noIndentInnerCommentsHere();
    this.word(node.importKind);
    this.space();
  } else if (node.module) {
    this.noIndentInnerCommentsHere();
    this.word("module");
    this.space();
  }

  const specifiers = node.specifiers.slice(0);
  const hasSpecifiers = !!specifiers.length;
  // print "special" specifiers first. The loop condition is constant,
  // but there is a "break" in the body.
  while (hasSpecifiers) {
    const first = specifiers[0];
    if (isImportDefaultSpecifier(first) || isImportNamespaceSpecifier(first)) {
      this.print(specifiers.shift(), node);
      if (specifiers.length) {
        this.token(",");
        this.space();
      }
    } else {
      break;
    }
  }

  if (specifiers.length) {
    this.token("{");
    this.space();
    this.printList(specifiers, node);
    this.space();
    this.token("}");
  } else if (isTypeKind && !hasSpecifiers) {
    this.token("{");
    this.token("}");
  }

  if (hasSpecifiers || isTypeKind) {
    this.space();
    this.word("from");
    this.space();
  }

  if (node.assertions?.length) {
    this.print(node.source, node, true);
    this.space();
    this._printAssertions(node);
  } else {
    this.print(node.source, node);
  }
  if (!process.env.BABEL_8_BREAKING) {
    // @ts-ignore(Babel 7 vs Babel 8) Babel 7 supports module attributes
    if (node.attributes?.length) {
      this.space();
      this.word("with");
      this.space();
      // @ts-ignore(Babel 7 vs Babel 8) Babel 7 supports module attributes
      this.printList(node.attributes, node);
    }
  }

  this.semicolon();
}

export function ImportAttribute(this: Printer, node: t.ImportAttribute) {
  this.print(node.key);
  this.token(":");
  this.space();
  this.print(node.value);
}

export function ImportNamespaceSpecifier(
  this: Printer,
  node: t.ImportNamespaceSpecifier,
) {
  this.token("*");
  this.space();
  this.word("as");
  this.space();
  this.print(node.local, node);
}
