define(["exports", "foo"], function (_exports, _foo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "some exports", {
    enumerable: true,
    get: function () {
      return _foo.foo;
    }
  });
});
