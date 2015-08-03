define(['exports', 'module'], function (exports, module) {
	// Snippet Class

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Snippet = (function () {
		function Snippet() {
			_classCallCheck(this, Snippet);
		}

		_createClass(Snippet, [{
			key: 'insertSnippets',
			value: function insertSnippets(snippetArea, snippets) {

				$(snippetArea).append(snippets);
			}

			// Custom date format
		}, {
			key: 'parseDate',
			value: function parseDate(itemDate) {
				var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

				var newDate = new Date(itemDate);

				return newDate.getDate() + " " + months[newDate.getMonth()] + " " + newDate.getFullYear();
			}
		}, {
			key: 'ajaxProgress',
			value: function ajaxProgress(status, element) {

				var animRepeaterTimer = null;
				var loader = '<div class="loader">\n\t\t\t\t\t\t\t\t\t<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="#4273FF">\n\t\t\t\t\t\t\t\t\t<circle transform="translate(8 0)" cx="0" cy="16" r="0"> \n\t\t\t\t\t\t\t\t\t<animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline"/>\n\t\t\t\t\t\t\t\t\t</circle>\n\t\t\t\t\t\t\t\t\t<circle transform="translate(16 0)" cx="0" cy="16" r="0"> \n\t\t\t\t\t\t\t\t\t<animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.3" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline"/>\n\t\t\t\t\t\t\t\t\t</circle>\n\t\t\t\t\t\t\t\t\t<circle transform="translate(24 0)" cx="0" cy="16" r="1.58103"> \n\t\t\t\t\t\t\t\t\t<animate attributeName="r" values="0; 4; 0; 0" dur="1.2s" repeatCount="indefinite" begin="0.6" keytimes="0;0.2;0.7;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.6 0.4 0.8" calcMode="spline"/>\n\t\t\t\t\t\t\t\t\t</circle>\n\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t\t</div>';
				// Start
				if (status == "start") {
					$(element).before(loader);
				} else if (status == "end") {
					$(element).siblings('.loader').fadeOut(function () {
						$(element).fadeIn();
					});
				}
			}
		}]);

		return Snippet;
	})();

	module.exports = Snippet;
});
//# sourceMappingURL=snippet.js.map
