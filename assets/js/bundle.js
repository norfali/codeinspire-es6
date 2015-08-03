/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

define('snippet',['exports', 'module'], function (exports, module) {
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
;
define('constants/urls',["exports"], function (exports) {
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
;
define('codepen-snippets',['exports', 'module', './snippet', './constants/urls'], function (exports, module, _snippet, _constantsUrls) {
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var Codepens = (function (_Snippet) {
		_inherits(Codepens, _Snippet);

		function Codepens() {
			_classCallCheck(this, Codepens);

			_get(Object.getPrototypeOf(Codepens.prototype), 'constructor', this).call(this);
		}

		_createClass(Codepens, [{
			key: 'fetchSnippets',
			value: function fetchSnippets(url, element) {

				this.sendRequest(_constantsUrls.CODEPEN_URL, '.snippets-codepen');
			}

			// Use in child class only
		}, {
			key: 'sendRequest',
			value: function sendRequest(url, element) {
				$.ajax({
					method: "GET",
					url: url,
					beforeSend: _get(Object.getPrototypeOf(Codepens.prototype), 'ajaxProgress', this).call(this, "start", element),
					success: this.handleResults.bind(this)
				});
			}
		}, {
			key: 'handleResults',
			value: function handleResults(data) {
				var _this = this;

				var results = data.query.results.item;

				var items = results.map(function (r) {
					return _this.createSnippet(r);
				});
			}
		}, {
			key: 'createSnippet',
			value: function createSnippet(r) {
				var creator = r.creator;
				var date = r.date;
				var link = r.link;
				var subject = r.subject;
				var title = r.title;
				var description = r.description;

				var languages = $(description).find("small").html().replace(/(This Pen uses)/, "Languages used");
				languages = languages.replace(/(,)\s(and)\s/, "");

				// YGL returns date string wrapped with u21B5 chars
				var friendlyDate = _get(Object.getPrototypeOf(Codepens.prototype), 'parseDate', this).call(this, date.replace(/\u21B5/g, "").trim());

				var snippet = '<li class="snippets__item"><div class="test">\n\t\t<div class="snippets__more"><a href="' + link + '" class="snippets__codelink">' + subject + '</a></div>\n\t\t<h5 class="snippets__creator">By ' + creator + '</h5>\n\t\t<code class="snippets__languages">' + languages + '</code>\n\t\t</div></li>';

				_get(Object.getPrototypeOf(Codepens.prototype), 'insertSnippets', this).call(this, ".snippets-codepen", snippet);

				_get(Object.getPrototypeOf(Codepens.prototype), 'ajaxProgress', this).call(this, "end", ".snippets-codepen");
			}
		}, {
			key: 'insertSnippets',
			value: function insertSnippets(snippetArea, snippets) {}
		}, {
			key: 'parseDate',
			value: function parseDate(itemDate) {}
		}, {
			key: 'ajaxProgress',
			value: function ajaxProgress(status, element) {}
		}]);

		return Codepens;
	})(_snippet);

	module.exports = Codepens;
});
//# sourceMappingURL=codepen-snippets.js.map
;
define('cssdeck-snippets',['exports', 'module', './snippet', './constants/urls'], function (exports, module, _snippet, _constantsUrls) {
	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

	var CssDeck = (function (_Snippet) {
		_inherits(CssDeck, _Snippet);

		function CssDeck() {
			_classCallCheck(this, CssDeck);

			_get(Object.getPrototypeOf(CssDeck.prototype), 'constructor', this).call(this);
		}

		_createClass(CssDeck, [{
			key: 'fetchSnippets',
			value: function fetchSnippets(url, element) {

				//super.fetchSnippets(ajaxUrl.CSSDECK_URL, '.snippets-cssdeck');
				this.sendRequest(_constantsUrls.CSSDECK_URL, '.snippets-cssdeck');
			}
		}, {
			key: 'sendRequest',
			value: function sendRequest(url, element) {
				$.ajax({
					method: "GET",
					url: url,
					beforeSend: _get(Object.getPrototypeOf(CssDeck.prototype), 'ajaxProgress', this).call(this, "start", element),
					success: this.handleResults.bind(this)
				});
			}
		}, {
			key: 'handleResults',
			value: function handleResults(data) {
				var _this = this;

				var results = data.query.results.item;

				var items = results.map(function (r) {
					return _this.createSnippet(r);
				});
			}
		}, {
			key: 'createSnippet',
			value: function createSnippet(r) {
				var pubDate = r.pubDate;
				var origLink = r.origLink;
				var title = r.title;
				var description = r.description;

				var text = $(description).html();

				// YGL returns date string wrapped with u21B5 chars
				var friendlyDate = _get(Object.getPrototypeOf(CssDeck.prototype), 'parseDate', this).call(this, pubDate.replace(/\u21B5/g, "").trim());

				var snippet = '<li class="snippets__item"><div class="test">\n\t\t<div class="snippets__more"><a href="' + origLink + '" class="snippets__codelink">' + title + '</a></div>\n\t\t<h5 class="snippets__creator">By Anon</h5>\n\t\t<p>' + text + '</p>\n\t\t</div></li>';

				_get(Object.getPrototypeOf(CssDeck.prototype), 'insertSnippets', this).call(this, ".snippets-cssdeck", snippet);
				_get(Object.getPrototypeOf(CssDeck.prototype), 'ajaxProgress', this).call(this, "end", ".snippets-cssdeck");
			}
		}, {
			key: 'insertSnippets',
			value: function insertSnippets(snippetArea, snippets) {}
		}, {
			key: 'parseDate',
			value: function parseDate(itemDate) {}
		}, {
			key: 'ajaxProgress',
			value: function ajaxProgress(status, element) {}
		}]);

		return CssDeck;
	})(_snippet);

	module.exports = CssDeck;
});
//# sourceMappingURL=cssdeck-snippets.js.map
;
define('app',['exports', './codepen-snippets', './cssdeck-snippets'], function (exports, _codepenSnippets, _cssdeckSnippets) {
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
;

require(["app"]);
