define(["exports"], function (exports) {
	/*
 	EXAMPLE OF CONST FILE
 */

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var CODEPEN_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Fcodepen.io%2Fpicks%2Ffeed%2F'&format=json&diagnostics=false&callback=";
	exports.CODEPEN_URL = CODEPEN_URL;
	var CSSDECK_URL = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%3D'http%3A%2F%2Ffeeds.feedburner.com%2Fcssdeck%3Fformat%3Dxml'%20LIMIT%207&format=json&callback=";
	exports.CSSDECK_URL = CSSDECK_URL;
});
//# sourceMappingURL=urls.js.map
