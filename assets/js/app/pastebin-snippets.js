define(["exports", "module"], function (exports, module) {
	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var PasteBinSnippets = (function () {
		function PasteBinSnippets() {
			_classCallCheck(this, PasteBinSnippets);
		}

		_createClass(PasteBinSnippets, [{
			key: "fetchHtml",
			value: function fetchHtml() {
				// $.ajax...
				$.ajax({
					method: "POST",
					processData: false,
					data: {
						api_option: "trends",
						api_dev_key: "8e7b79a7d80d2b650281cd1012997f19"
					},
					url: "http://pastebin.com/api/api_post.php",
					dataType: "jsonp",
					success: parseSnippets
				});
				console.log("hello");

				function parseSnippets(data) {
					console.log(data);
				}
			}
		}]);

		return PasteBinSnippets;
	})();

	module.exports = PasteBinSnippets;
});
//# sourceMappingURL=pastebin-snippets.js.map
