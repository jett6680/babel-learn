import { types as t, template } from "@babel/core";
import type { NodePath } from "@babel/traverse";
import {
  skipTransparentExprWrapperNodes,
  skipTransparentExprWrappers,
} from "@babel/helper-skip-transparent-expression-wrappers";
import { willPathCastToBoolean, findOutermostTransparentParent } from "./util";

const { ast } = template.expression;

function isSimpleMemberExpression(
  expression: t.Expression | t.Super,
): expression is t.Identifier | t.Super | t.MemberExpression {
  expression = skipTransparentExprWrapperNodes(expression);
  return (
    t.isIdentifier(expression) ||
    t.isSuper(expression) ||
    (t.isMemberExpression(expression) &&
      !expression.computed &&
      isSimpleMemberExpression(expression.object))
  );
}

/**
 * Test if a given optional chain `path` needs to be memoized
 * @param {NodePath} path
 * @returns {boolean}
 */
function needsMemoize(
  path: NodePath<t.OptionalCallExpression | t.OptionalMemberExpression>,
) {
  let optionalPath: NodePath = path;
  const { scope } = path;
  while (
    optionalPath.isOptionalMemberExpression() ||
    optionalPath.isOptionalCallExpression()
  ) {
    const { node } = optionalPath;
    const childPath = skipTransparentExprWrappers(
      // @ts-expect-error isOptionalMemberExpression does not work with NodePath union
      optionalPath.isOptionalMemberExpression()
        ? optionalPath.get("object")
        : optionalPath.get("callee"),
    );
    if (node.optional) {
      return !scope.isStatic(childPath.node);
    }

    optionalPath = childPath;
  }
}

export function transform(
  path: NodePath<t.OptionalCallExpression | t.OptionalMemberExpression>,
  {
    pureGetters,
    noDocumentAll,
  }: { pureGetters: boolean; noDocumentAll: boolean },
) {
  const { scope } = path;
  // maybeWrapped points to the outermost transparent expression wrapper
  // or the path itself
  const maybeWrapped = findOutermostTransparentParent(path);
  const { parentPath } = maybeWrapped;
  const willReplacementCastToBoolean = willPathCastToBoolean(maybeWrapped);
  let isDeleteOperation = false;
  const parentIsCall =
    parentPath.isCallExpression({ callee: maybeWrapped.node }) &&
    // note that the first condition must implies that `path.optional` is `true`,
    // otherwise the parentPath should be an OptionalCallExpression
    path.isOptionalMemberExpression();

  const optionals = [];

  let optionalPath = path;
  // Replace `function (a, x = a.b?.c) {}` to `function (a, x = (() => a.b?.c)() ){}`
  // so the temporary variable can be injected in correct scope
  if (scope.path.isPattern() && needsMemoize(optionalPath)) {
    path.replaceWith(template.ast`(() => ${path.node})()` as t.Statement);
    // The injected optional chain will be queued and eventually transformed when visited
    return;
  }
  while (
    optionalPath.isOptionalMemberExpression() ||
    optionalPath.isOptionalCallExpression()
  ) {
    const { node } = optionalPath;
    if (node.optional) {
      optionals.push(node);
    }
    // @ts-expect-error isOptionalMemberExpression does not work with NodePath union
    if (optionalPath.isOptionalMemberExpression()) {
      // @ts-expect-error todo(flow->ts) avoid changing more type
      optionalPath.node.type = "MemberExpression";
      // @ts-expect-error todo(flow->ts)
      optionalPath = skipTransparentExprWrappers(optionalPath.get("object"));
    } else if (optionalPath.isOptionalCallExpression()) {
      // @ts-expect-error todo(flow->ts) avoid changing more type
      optionalPath.node.type = "CallExpression";
      // @ts-expect-error todo(flow->ts)
      optionalPath = skipTransparentExprWrappers(optionalPath.get("callee"));
    }
  }

  // todo: Improve replacementPath typings
  let replacementPath: NodePath<any> = path;
  if (parentPath.isUnaryExpression({ operator: "delete" })) {
    replacementPath = parentPath;
    isDeleteOperation = true;
  }
  for (let i = optionals.length - 1; i >= 0; i--) {
    const node = optionals[i] as unknown as
      | t.MemberExpression
      | t.CallExpression;

    const isCall = t.isCallExpression(node);

    const chainWithTypes = isCall
      ? // V8 intrinsics must not be an optional call
        (node.callee as t.Expression)
      : node.object;
    const chain = skipTransparentExprWrapperNodes(chainWithTypes);

    let ref;
    let check;
    if (isCall && t.isIdentifier(chain, { name: "eval" })) {
      check = ref = chain;
      // `eval?.()` is an indirect eval call transformed to `(0,eval)()`
      node.callee = t.sequenceExpression([t.numericLiteral(0), ref]);
    } else if (pureGetters && isCall && isSimpleMemberExpression(chain)) {
      // If we assume getters are pure (avoiding a Function#call) and we are at the call,
      // we can avoid a needless memoize. We only do this if the callee is a simple member
      // expression, to avoid multiple calls to nested call expressions.
      check = ref = node.callee;
    } else {
      ref = scope.maybeGenerateMemoised(chain);
      if (ref) {
        check = t.assignmentExpression(
          "=",
          t.cloneNode(ref),
          // Here `chainWithTypes` MUST NOT be cloned because it could be
          // updated when generating the memoised context of a call
          // expression. It must be an Expression when `ref` is an identifier
          chainWithTypes as t.Expression,
        );

        isCall ? (node.callee = ref) : (node.object = ref);
      } else {
        check = ref = chainWithTypes;
      }
    }

    // Ensure call expressions have the proper `this`
    // `foo.bar()` has context `foo`.
    if (isCall && t.isMemberExpression(chain)) {
      if (pureGetters && isSimpleMemberExpression(chain)) {
        // To avoid a Function#call, we can instead re-grab the property from the context object.
        // `a.?b.?()` translates roughly to `_a.b != null && _a.b()`
        node.callee = chainWithTypes;
      } else {
        // Otherwise, we need to memoize the context object, and change the call into a Function#call.
        // `a.?b.?()` translates roughly to `(_b = _a.b) != null && _b.call(_a)`
        const { object } = chain;
        let context: t.Expression;
        if (t.isSuper(object)) {
          context = t.thisExpression();
        } else {
          const memoized = scope.maybeGenerateMemoised(object);
          if (memoized) {
            context = memoized;
            chain.object = t.assignmentExpression("=", memoized, object);
          } else {
            context = object;
          }
        }

        node.arguments.unshift(t.cloneNode(context));
        // @ts-expect-error node.callee can not be an V8IntrinsicIdentifier: V8 intrinsic is disallowed in optional chain
        node.callee = t.memberExpression(node.callee, t.identifier("call"));
      }
    }
    let replacement = replacementPath.node;
    // Ensure (a?.b)() has proper `this`
    // The `parentIsCall` is constant within loop, we should check i === 0
    // to ensure that it is only applied to the first optional chain element
    // i.e. `?.b` in `(a?.b.c)()`
    if (i === 0 && parentIsCall) {
      // `(a?.b)()` to `(a == null ? undefined : a.b.bind(a))()`
      // object must not be Super as super?.foo is invalid
      const object = skipTransparentExprWrapperNodes(
        replacement.object,
      ) as t.Expression;
      let baseRef;
      if (!pureGetters || !isSimpleMemberExpression(object)) {
        // memoize the context object when getters are not always pure
        // or the object is not a simple member expression
        // `(a?.b.c)()` to `(a == null ? undefined : (_a$b = a.b).c.bind(_a$b))()`
        baseRef = scope.maybeGenerateMemoised(object);
        if (baseRef) {
          replacement.object = t.assignmentExpression("=", baseRef, object);
        }
      }
      replacement = t.callExpression(
        t.memberExpression(replacement, t.identifier("bind")),
        [t.cloneNode(baseRef ?? object)],
      );
    }

    if (willReplacementCastToBoolean) {
      // `if (a?.b) {}` transformed to `if (a != null && a.b) {}`
      // we don't need to return `void 0` because the returned value will
      // eveutally cast to boolean.
      const nonNullishCheck = noDocumentAll
        ? ast`${t.cloneNode(check)} != null`
        : ast`
            ${t.cloneNode(check)} !== null && ${t.cloneNode(ref)} !== void 0`;
      replacementPath.replaceWith(
        t.logicalExpression("&&", nonNullishCheck, replacement),
      );
      replacementPath = skipTransparentExprWrappers(
        // @ts-expect-error todo(flow->ts)
        replacementPath.get("right"),
      );
    } else {
      const nullishCheck = noDocumentAll
        ? ast`${t.cloneNode(check)} == null`
        : ast`
            ${t.cloneNode(check)} === null || ${t.cloneNode(ref)} === void 0`;

      const returnValue = isDeleteOperation ? ast`true` : ast`void 0`;
      replacementPath.replaceWith(
        t.conditionalExpression(nullishCheck, returnValue, replacement),
      );
      replacementPath = skipTransparentExprWrappers(
        // @ts-expect-error todo(flow->ts)
        replacementPath.get("alternate"),
      );
    }
  }
}
