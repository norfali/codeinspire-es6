define(['exports', './codepen-snippets', './cssdeck-snippets'], function (exports, _codepenSnippets, _cssdeckSnippets) {
  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _Codepens = _interopRequireDefault(_codepenSnippets);

  var _CssDeck = _interopRequireDefault(_cssdeckSnippets);

  var codepen = new _Codepens['default']();
  codepen.fetchSnippets();

  var cssdeck = new _CssDeck['default']();
  cssdeck.fetchSnippets();
});
//# sourceMappingURL=app.js.map
