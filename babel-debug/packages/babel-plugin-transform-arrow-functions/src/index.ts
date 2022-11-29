import { declare } from "@babel/helper-plugin-utils";

export interface Options {
  spec?: boolean;
}

export default declare((api, options: Options) => {
  api.assertVersion(7);

  const noNewArrows = (api.assumption("noNewArrows") ??
    !options.spec) as boolean;

  return {
    name: "transform-arrow-functions",

    visitor: {
      ArrowFunctionExpression(path) {
        // In some conversion cases, it may have already been converted to a function while this callback
        // was queued up.
        if (!path.isArrowFunctionExpression()) return;

        path.arrowFunctionToExpression({
          // While other utils may be fine inserting other arrows to make more transforms possible,
          // the arrow transform itself absolutely cannot insert new arrow functions.
          allowInsertArrow: false,
          noNewArrows,

          // TODO(Babel 8): This is only needed for backward compat with @babel/traverse <7.13.0
          specCompliant: !noNewArrows,
        });
      },
    },
  };
});
