/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	__webpack_require__(1);

	var _storage = __webpack_require__(5);

	var _storage2 = _interopRequireDefault(_storage);

	var _cordova = __webpack_require__(6);

	var _config = __webpack_require__(7);

	var _models = __webpack_require__(8);

	var _calculation = __webpack_require__(9);

	__webpack_require__(10);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var SUBMIT_URL = 'http://' + window.SERVER_URL + '/ReceiveSubmit';
	var ERROR_URL = function ERROR_URL(id) {
	  return _config.API + '/tickets/error/' + id;
	};

	//const ERROR_URL  = `http://${window.SERVER_URL}/ReceiveError`;


	// Error handler, for debug on cordova

	var showError = function showError(e) {
	  try {
	    // Get the stack trace.
	    throw new Error();
	  } catch (err) {
	    setTimeout(function () {
	      return alert(JSON.stringify(e.message || e) + '\n' + JSON.stringify(err));
	    }, 0);
	  }
	};

	window.onerror = function (msg, url, lineNo, columnNo, error) {
	  var string = msg.toLowerCase();
	  var substring = 'script error';
	  if (string.indexOf(substring) > -1) {
	    alert('Script Error: ' + msg);
	  } else {
	    var message = ['Message: ' + msg, 'URL: ' + url, 'Line: ' + lineNo, 'Column: ' + columnNo, 'Error object: ' + JSON.stringify(error || {})].join('\n');

	    alert(message);
	  }
	  return false;
	};

	/*
	 * I/O
	 */

	var getBasicAuth = function getBasicAuth(user, password) {
	  return 'Basic ' + btoa(user + ':' + password);
	};

	var getOrPrompt = function getOrPrompt(key, message) {
	  var value = localStorage[key];
	  if (!value) {
	    value = prompt(message);
	    localStorage[key] = value;
	  }
	  return value;
	};

	function fetchTicketData(id) {
	  var user = getOrPrompt('user', 'Enter your username');
	  var password = getOrPrompt('password', 'Enter your password');

	  return $.ajax(_config.API + '/tickets/' + id, {
	    type: 'GET',
	    headers: {
	      Authorization: getBasicAuth(user, password)
	    },
	    dataType: 'json',
	    success: function success(data) {
	      return (0, _models.normalizeOrder)(data);
	    },
	    error: showError
	  });
	}

	function postTicketReady(id) {
	  var user = getOrPrompt('user', 'Enter your username');
	  var password = getOrPrompt('password', 'Enter your password');

	  return $.ajax(_config.API + '/tickets/ready/' + id, {
	    type: 'POST',
	    headers: {
	      Authorization: getBasicAuth(user, password)
	    },
	    dataType: 'json',
	    success: function success(data) {
	      return (0, _models.normalizeOrder)(data);
	    },
	    error: showError
	  });
	}

	/*
	 * DataTable & Renderers
	 */

	var R = {
	  pickEditor: function pickEditor(data, type, item) {
	    return '<input class="form-control" type="text"/>';
	  },
	  description: function description(data, type, item) {
	    return item.id + '<br/>' + item.description;
	  },
	  number: function number(len) {
	    return function (data) {
	      return Number(data).toFixed(2).toString();
	    };
	  },
	  currency: function currency(value) {
	    if (value == undefined) value = 0;

	    var n = value,
	        c = 2,
	        d = '.',
	        t = ',',
	        s = n < 0 ? "-" : "",
	        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
	        j = (j = i.length) > 3 ? j % 3 : 0;

	    return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	  }
	};

	var Dt = function () {
	  function Dt(selector, data) {
	    _classCallCheck(this, Dt);

	    var dtColumns = [{ data: 'qtyOrdered', width: 60 }, { data: 'qtyShipped', width: 60 }, { data: 'qtyPicked', width: 100, render: R.pickEditor }, { data: 'qtyBO', width: 60 }, { data: 'description', render: R.description }, { data: 'uom', width: 100 }, { data: 'wts', width: 100, render: R.number(2) }, { data: 'value', width: 100, render: R.currency }];

	    var elt = $(selector);

	    // Initialisation of the DataTables ofject for the list of quotes
	    var dt = elt.DataTable({
	      dom: 'rltp',
	      columns: dtColumns,
	      data: data,
	      pageLength: 10,
	      order: [[6, 'desc']]
	    });

	    elt.on('change', 'input', function (e) {
	      if (e.target.cellIndex) {
	        window.open('/quote/#' + dt.row(this).data().id);
	      }
	    });

	    this._dt = dt;
	  }

	  _createClass(Dt, [{
	    key: 'setData',
	    value: function setData(data) {
	      this._dt.clear();
	      this._dt.rows.add(data);
	      this._dt.draw();
	    }
	  }]);

	  return Dt;
	}();

	/*
	 * Controller
	 */

	function mainController(_) {
	  var _this = this;

	  this.order = (0, _models.normalizeOrder)(window.ORDER_DATA);

	  // Only in memory
	  this.palletImages = [];
	  this.additionalImages = [];

	  // For send-to-correction
	  this.notes = '';
	  this.message = {
	    class: 'default',
	    text: ''
	  };

	  // Initial sequence of actions
	  var init = function init() {
	    //const dt = new Dt('#orderItems table', this.order.items);

	    /*
	     * If the order hasError == true on load, it means it has
	     * been sent to correction. If it has been updated on the server,
	     * the server will reply with the updated data, which will have
	     * hasError == false.
	     */
	    if (_this.order.hasError) {
	      fetchTicketData(_this.order.orderID).then(function (ticket) {
	        if (ticket.hasError) return;

	        _this.order = ticket;
	        //dt.setData(this.order.items);

	        _this.message.class = 'success';
	        _this.message.text = 'Ticket has been updated. Ready to continue.';

	        _.$apply();
	      });
	    }
	  };

	  // Debug & storage
	  _.save = function () {
	    return _storage2.default.set('order', _this.order);
	  };
	  _.clear = function () {
	    return _storage2.default.clear();
	  };
	  _.stats = function () {
	    return _storage2.default.stats();
	  };

	  // True if any item has backorder
	  _.hasBackOrders = function () {
	    return _this.order.items.reduce(function (prev, cur) {
	      return prev || !!cur.qtyBO;
	    }, false);
	  };

	  // Display the total weight
	  _.totalWeight = function () {
	    return (0, _calculation.getTotalWeight)(_this.order.items);
	  };

	  // Display the total value
	  _.totalValue = function () {
	    return (0, _calculation.getTotalValue)(_this.order.items);
	  };

	  // Display the total cube size.
	  _.totalPalletVolume = function () {
	    return (0, _calculation.getTotalPalletVolume)(_this.order.pallets);
	  };

	  // Display the total pallet weight
	  _.totalPalletWeight = function () {
	    return (0, _calculation.getTotalPalletWeight)(_this.order.pallets);
	  };

	  // Display pallet properties
	  _.getVolume = _calculation.getVolume;
	  _.getWeightPerVolume = _calculation.getWeightPerVolume;

	  // Pallet/Details functions

	  // Add shipment detail
	  _.addPallet = function () {
	    return _this.order.pallets.push((0, _models.getNewShipment)());
	  };

	  // Delete shipment detail.
	  _.deletePallet = function (index) {
	    _this.order.pallets.splice(index, 1);
	    _this.palletImages.splice(index, 1);
	  };

	  _.addPalletPicture = function (i) {
	    (0, _cordova.getPicture)().then(function (data) {
	      _this.palletImages[i] = data;
	      _.$apply();
	    }, showError);
	  };

	  _.addAdditionalPicture = function (i) {
	    (0, _cordova.getPicture)().then(function (data) {
	      _this.additionalImages[i] = data;
	      _.$apply();
	    }, showError);
	  };

	  _.onClickSignature = function (id) {
	    var elt = $('#' + id);
	    var width = elt.width();
	    var height = elt.height();
	    (0, _cordova.getSignature)(width, height).then(function (svg) {
	      _this.order[id] = svg;
	      _.$apply();
	    });
	  };

	  // Event handlers

	  // Update an item's quantity
	  _.onDidChangeQuantity = _calculation.updateItemQty;

	  // Send a change-request
	  _.onRequestChange = function () {
	    _this.order.hasError = true;
	    _this.message.class = 'danger';
	    _this.message.text = 'This ticket has been sent to correction. Awaiting update.';
	    _.onSubmit();
	  };

	  _.onCarrierNotified = function () {
	    postTicketReady(_this.order.id).then(function (ticket) {
	      console.log('READY', ticket);
	    });
	  };

	  // Data submit
	  _.onSubmit = function () {
	    var form = $('#mainform');

	    $('#form_data').val(JSON.stringify(_this.order));

	    if (!_this.order.hasError) {
	      _storage2.default.clear();
	      form.attr('action', SUBMIT_URL);
	    } else {
	      form.attr('action', ERROR_URL(_this.order.id));
	    }

	    form.submit();
	  };

	  // Save data on change.
	  _.$watch(function () {
	    return _this.order;
	  }, function (next, prev) {
	    _storage2.default.set('order', next);
	    console.log('saved');
	  }, true);

	  _.$watch(function () {
	    return _this.message;
	  }, function (next, prev) {
	    _storage2.default.set('message', next);
	  }, true);

	  window.addEventListener('savestate', function (event) {
	    var state = event.detail.state;
	    state.ORDER_DATA = JSON.stringify(_this);
	  });

	  window.addEventListener('restorestate', function (event) {
	    var state = event.detail.state;
	    if (state.ORDER_DATA) {
	      $.extend(_this, JSON.parse(state.ORDER_DATA));
	      _.$apply();
	    }
	  });

	  $(function () {
	    return init();
	  });

	  window.vm = this;
	  window._ = _;
	}

	angular.module('dacoApp', []);
	angular.module('dacoApp').controller('mainCtrl', ['$scope', mainController]).filter('rawHtml', ['$sce', function ($sce) {
	  return function (val) {
	    return $sce.trustAsHtml(val);
	  };
	}]);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./style.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./style.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, "/*\r\n * style.css\r\n * Copyright (C) 2016 romgrk\r\n *\r\n * Distributed under terms of the MIT license.\r\n */\r\n\r\nbody {\r\n  background: #fff;\r\n  color: black;\r\n}\r\n\r\n.navbar {\r\n  border-radius: 0 !important;\r\n}\r\n\r\n.th-sm {\r\n  text-align: center;\r\n  width: 80px;\r\n}\r\n\r\n#pickedBy, #verifiedBy {\r\n  height: 200px;\r\n  min-width: 400px;\r\n}\r\n\r\n.todo {\r\n  color: magenta;\r\n  font-weight: bold;\r\n}\r\n", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 * storage.js
	 * Copyright (C) 2016  <@>
	 *
	 * Distributed under terms of the MIT license.
	 */

	/**
	 * Storage:
	 * get()/set() store data to lacalStorage, prefixing the key with the current
	 * window.location.href value, in order to have a namespaced storage per document.
	 * Otherwise, all keys would be shared amongst all documents.
	 */
	exports.default = Storage = {
	  get: function get(key, defaultValue) {
	    var data = localStorage.getItem(window.location.href + '.' + key);
	    if (data) {
	      try {
	        return JSON.parse(data);
	      } catch (err) {}
	    }
	    return defaultValue;
	  },
	  set: function set(key, value) {
	    try {
	      localStorage.setItem(window.location.href + '.' + key, JSON.stringify(value));
	    } catch (err) {
	      if (/quota/i.test(err.message)) {
	        localStorage.clear();
	        localStorage.setItem(window.location.href + '.' + key, JSON.stringify(value));
	      } else {
	        alert(JSON.stringify(err));
	      }
	    }
	  },
	  remove: function remove(key) {
	    localStorage.removeItem(window.location.href + '.' + key);
	  },
	  clear: function clear() {
	    for (var key in localStorage) {
	      if (key.indexOf(window.location.href) == 0) localStorage.removeItem(key);
	    }
	  },
	  clearAll: function clearAll() {
	    localStorage.clear();
	  },
	  stats: function stats() {
	    var data = '';
	    for (var key in window.localStorage) {
	      if (window.localStorage.hasOwnProperty(key)) data += window.localStorage[key];
	    }
	    return data.length * 16 / (8 * 1024);
	  }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 * camera.js
	 * Copyright (C) 2016  <@>
	 *
	 * Distributed under terms of the MIT license.
	 */

	var getPicture = exports.getPicture = function getPicture(options) {
	  return new Promise(function (resolve, reject) {
	    options = options || { quality: 50, destinationType: navigator.camera.DestinationType.DATA_URL };
	    var prefix = options.destinationType == navigator.camera.DestinationType.DATA_URL ? 'data:image/jpeg;base64,' : '';
	    navigator.camera.getPicture(function (data) {
	      return resolve(prefix + data);
	    }, reject, options);
	  });
	};

	var getSignature = exports.getSignature = function getSignature(width, height) {
	  return new Promise(function (resolve, reject) {
	    var options = {
	      mode: 'signature',
	      width: width,
	      height: height
	    };
	    var callback = function callback(data) {
	      resolve(navigator.handDrawTool.getSVG(data, width, height));
	    };
	    navigator.handDrawTool.record(callback, options);
	  });
	};

	/*
	 * Polyfills for browser
	 */

	var FILE_URI = 0;
	var DATA_URL = 1;

	var buildContainer = function buildContainer() {
	  var container = document.createElement('div');
	  container.style.position = 'fixed';
	  container.style.zIndex = '100';
	  container.style.top = '0';
	  container.style.left = '0';
	  container.style.width = '100%';
	  container.style.height = '100%';
	  container.style.verticalAlign = 'middle';
	  container.style.backgroundColor = 'rgba(0,0,0,0.3)';
	  return container;
	};

	var capturePhoto = function capturePhoto(options) {
	  return new Promise(function (resolve, reject) {
	    var container = buildContainer();
	    var video = document.createElement('video');
	    var canvas = document.createElement('canvas');
	    container.appendChild(video);
	    container.appendChild(canvas);
	    video.style.width = '100%';
	    video.style.height = '100%';
	    canvas.style.opacity = '0';

	    var init = function init(stream) {
	      // Cleanup
	      var accept = function accept(data) {
	        stream.getTracks()[0].stop();
	        URL.revokeObjectURL(stream);
	        document.body.removeChild(container);
	        resolve(data);
	      };

	      video.src = URL.createObjectURL(stream);
	      video.addEventListener('click', function (ev) {
	        canvas.width = video.videoWidth;
	        canvas.height = video.videoHeight;
	        canvas.getContext('2d').drawImage(video, 0, 0);
	        if (options.destinationType == FILE_URI) {
	          canvas.toBlob(function (blob) {
	            return accept(URL.createObjectURL(blob));
	          });
	        } else {
	          accept(canvas.toDataURL('image/jpeg'));
	        }
	      });
	    };

	    navigator.mediaDevices.getUserMedia(options || { video: true }).then(init).catch(function () {
	      document.body.removeChild(container);
	      reject();
	    });

	    document.body.appendChild(container);
	  });
	};

	var capturePath = function capturePath() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var width = options.width || 500;
	  var height = options.height || 200;
	  return new Promise(function (resolve, reject) {
	    var ns = 'http://www.w3.org/2000/svg';
	    var container = buildContainer();
	    var div = document.createElement('div');
	    var accept = document.createElement('button');
	    var clear = document.createElement('button');
	    var svg = document.createElementNS(ns, 'svg');
	    var path = document.createElementNS(ns, 'path');
	    svg.setAttribute('width', width);
	    svg.setAttribute('height', height);
	    div.style.width = width + ' px';
	    div.style.height = height + ' px';
	    div.style.top = '50%';
	    div.style.left = '50%';
	    div.style.transform = 'translate(-50%, -50%)';
	    div.style.margin = 'auto';
	    div.style.display = 'block';
	    div.style.position = 'absolute';
	    div.style.cursor = 'default';
	    if (options.background) div.style.background = 'url(' + options.background + ')';else div.style.backgroundColor = 'white';
	    div.style.backgroundSize = width + 'px ' + height + 'px';
	    path.setAttribute('stroke', 'dodgerblue');
	    path.setAttribute('stroke-width', '1');
	    path.setAttribute('fill', 'none');
	    path.setAttribute('pointer-events', 'none');
	    accept.style.position = 'absolute';
	    accept.style.bottom = '0';
	    accept.style.right = '0';
	    accept.innerText = 'Accept';
	    clear.style.position = 'absolute';
	    clear.style.bottom = '0';
	    clear.style.left = '0';
	    clear.innerText = 'Clear';

	    var data = options.edit || '';

	    var getCoords = function getCoords(ev) {
	      return ev.offsetX + ',' + ev.offsetY;
	    };

	    var onMouseDown = function onMouseDown(ev) {
	      data += 'M' + getCoords(ev) + ' ';
	      path.setAttribute('d', data);
	      ev.preventDefault();
	      ev.stopImmediatePropagation();
	    };

	    var onMouseMove = function onMouseMove(ev) {
	      if (ev.buttons & 1) {
	        data += 'L' + getCoords(ev) + ' ';
	        path.setAttribute('d', data);
	      }
	      ev.preventDefault();
	      ev.stopImmediatePropagation();
	    };

	    var onClear = function onClear(ev) {
	      data = '';
	      path.setAttribute('d', data);
	    };

	    var onAccept = function onAccept(ev) {
	      document.body.removeChild(container);
	      resolve(data);
	    };

	    svg.addEventListener('mousedown', onMouseDown);
	    svg.addEventListener('mousemove', onMouseMove);
	    svg.addEventListener('touchstart', onMouseDown);
	    svg.addEventListener('touchmove', onMouseMove);
	    accept.addEventListener('click', onAccept);
	    clear.addEventListener('click', onClear);

	    svg.appendChild(path);
	    div.appendChild(svg);
	    div.appendChild(accept);
	    div.appendChild(clear);
	    container.appendChild(div);
	    document.body.appendChild(container);
	  });
	};

	var attachStateEvents = function attachStateEvents() {
	  window.addEventListener('load', function (e) {
	    var key = location.href;
	    var state = {};
	    for (var n in localStorage) {
	      if (n.indexOf(key) == 0) state[n.replace(key + '.', '')] = localStorage[n];
	    }
	    var restoreEvent = new CustomEvent('restorestate', {
	      detail: { state: state } });
	    window.dispatchEvent(restoreEvent);
	  });
	  window.addEventListener('unload', function (e) {
	    var key = location.href;
	    var state = {};
	    var saveEvent = new CustomEvent('savestate', {
	      detail: { state: state } });
	    window.dispatchEvent(saveEvent);
	    for (var n in state) {
	      localStorage[key + '.' + n] = state[n];
	    }
	  });
	};

	/*
	 * Initialization
	 */

	if (!window.cordova) {
	  window.Camera = {
	    PictureSourceType: {},
	    EncodingType: {},
	    DestinationType: {
	      FILE_URI: FILE_URI,
	      DATA_URL: DATA_URL
	    },
	    getPicture: function getPicture(resolve, reject) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	      options = Object.assign(options, { video: true });

	      // Translate CameraOptions to browsers' options
	      if (options.targetWidth) options.width = options.targetWidth;
	      if (options.targetHeight) options.height = options.targetHeight;

	      capturePhoto(options).then(function (data) {
	        return resolve(data.replace(/^.*base64,/, ''));
	      }).catch(reject);
	    }
	  };

	  navigator.camera = window.Camera;

	  navigator.handDrawTool = {
	    record: function record(resolve, options) {
	      capturePath(options).then(resolve);
	    },
	    getSVG: function getSVG(data, width, height) {
	      return '\n      <svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">\n        <path id="p" stroke="dodgerblue" stroke-width="1" fill="none" d="' + data + '"/>\n      </svg>';
	    }
	  };

	  attachStateEvents();
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 * config.js
	 * Copyright (C) 2016  <@>
	 *
	 * Distributed under terms of the MIT license.
	 */

	var url = 'https://dacocorp-quotes-orders.appliedhandlingnw.com/api';
	if (location.href.indexOf('dacocorp') == -1) {
	  url = '';
	}

	var API = exports.API = url;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.parseTicket = exports.normalizeOrder = exports.getNewShipment = undefined;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /*
	                                                                                                                                                                                                                                                                   * models.js
	                                                                                                                                                                                                                                                                   * Copyright (C) 2016 romgrk <romgrk@Romgrk-ARCH>
	                                                                                                                                                                                                                                                                   *
	                                                                                                                                                                                                                                                                   * Distributed under terms of the MIT license.
	                                                                                                                                                                                                                                                                   */

	var _calculation = __webpack_require__(9);

	var getNewShipment = exports.getNewShipment = function getNewShipment() {
	  return {
	    L: 0, W: 0, H: 0,
	    weight: 0,
	    detail: '',
	    image: ''
	  };
	};

	var normalizeOrder = exports.normalizeOrder = function normalizeOrder(o) {

	  o.billTo = o.billTo.replace(/<br \/>/g, '\n');
	  o.shipTo = o.shipTo.replace(/<br \/>/g, '\n');

	  o.isPlaced = o.isPlaced || false;
	  o.isReady = o.isReady || false;
	  o.isShipped = o.isShipped || false;
	  o.hasError = o.hasError || false;

	  o.pickedBy = '';
	  o.verifiedBy = '';

	  o.items.forEach(function (i) {
	    i.qtyOrdered = parseInt(i.qtyOrdered);
	    i.qtyShipped = parseInt(i.qtyShipped);
	    //i.qtyPicked  = parseInt(i.qtyPicked);
	    i.qtyBO = parseInt(i.qtyBO);
	    if (typeof i.value == 'string') i.value = parseFloat(i.value.substring(1));

	    if (!i.wts) {
	      i.wts = i.WTS;
	      delete i.WTS;
	    }
	    if (typeof i.wts == 'string') i.wts = parseFloat(i.wts);

	    (0, _calculation.updateItemQty)(i);
	  });

	  if (!o.pallets) o.pallets = [];

	  return o;
	};

	var parseTicket = exports.parseTicket = function parseTicket(t) {
	  var json = JSON.parse(t.data);
	  return _extends({}, json, t, {
	    items: json.items });
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});


	/*
	 * Calculation functions
	 */

	var getVolume = exports.getVolume = function getVolume(pallet) {
	  return pallet.L * pallet.W * pallet.H / 1728;
	};

	var getWeightPerVolume = exports.getWeightPerVolume = function getWeightPerVolume(pallet) {
	  return pallet.weight / getVolume(pallet);
	};

	var getTotalPalletVolume = exports.getTotalPalletVolume = function getTotalPalletVolume(pallets) {
	  return pallets.reduce(function (prev, cur) {
	    return prev + getVolume(cur);
	  }, 0);
	};

	var getTotalPalletWeight = exports.getTotalPalletWeight = function getTotalPalletWeight(pallets) {
	  return pallets.reduce(function (prev, cur) {
	    return prev + cur.weight;
	  }, 0);
	};

	var getWeight = exports.getWeight = function getWeight(item) {
	  return item.wts * (item.qtyPicked || 0);
	};

	var getTotalWeight = exports.getTotalWeight = function getTotalWeight(items) {
	  return items.reduce(function (prev, cur) {
	    return prev + getWeight(cur);
	  }, 0);
	};

	var getTotalValue = exports.getTotalValue = function getTotalValue(items) {
	  return items.reduce(function (prev, cur) {
	    return prev + cur.value;
	  }, 0);
	};

	var updateItemQty = exports.updateItemQty = function updateItemQty(i) {
	  return i.qtyBO = i.qtyPicked <= i.qtyOrdered ? i.qtyOrdered - i.qtyPicked : 0;
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	/*! Capture OnTheGo v2.0.0-beta-1 | (c) 2016 Objectif Lune, Inc. */

	(function ($) {
	  // Global variables that are available to all COTG Widgets
	  var browserSupportsSvg = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

	  $.fn.cotgSignature = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        container: $('[role=signature]', this),
	        svgDataElem: $('[role=signature-data]', this),
	        sigData: null,

	        init: function init() {
	          // STANDARD DOM EVENTS
	          widget.container.on('click.cotg', widget.onClick);

	          // CUSTOM EVENTS
	          widget.object.on('set.cotg', widget.onSet);
	          widget.object.on('clear.cotg', widget.onClear);
	          widget.object.on('save-state.cotg', widget.onSaveState);
	          widget.object.on('restore-state.cotg', widget.onRestoreState);
	          widget.object.on('draw.cotg', widget.onDraw);
	        },

	        /*
	         * Draw the signature item to the panel inside the widget
	         */
	        onDraw: function onDraw() {
	          if (!!widget.sigData) {
	            var width = widget.container.width();
	            var height = widget.container.height();

	            if (browserSupportsSvg) {
	              widget.container.html(navigator.handDrawTool.getSVG(widget.sigData, width, height));
	            } else {
	              widget.container.html('');

	              var canvas = document.createElement('canvas');
	              canvas.setAttribute('width', width);
	              canvas.setAttribute('height', height);
	              widget.container.append(canvas);
	              navigator.handDrawTool.drawInContext(canvas.getContext('2d'), widget.sigData, width, height);
	            }
	          }
	        },

	        onClick: function onClick(event) {
	          var width = widget.container.width();
	          var height = widget.container.height();

	          navigator.handDrawTool.record(
	          // call back
	          function (data) {
	            widget.svgDataElem.val(navigator.handDrawTool.getSVG(data, width, height));
	            widget.object.trigger('set.cotg', data);
	          }, { // options
	            mode: 'signature',
	            width: width,
	            height: height
	          });
	        },

	        onSaveState: function onSaveState(event, state) {
	          state[widget.object.attr('id')] = widget.sigData;
	        },

	        onRestoreState: function onRestoreState(event, state) {
	          widget.sigData = state[widget.object.attr('id')];
	          if (!!widget.sigData) {
	            document.addEventListener('deviceready', function () {
	              widget.object.trigger('draw.cotg');
	            }, false);
	          }
	        },

	        onSet: function onSet(event, data) {
	          widget.sigData = data;
	          if (!!widget.sigData) {
	            widget.object.trigger('draw.cotg');
	          }
	        },

	        onClear: function onClear(event) {
	          widget.sigData = null;
	          widget.svgDataElem.val('');
	          widget.container.html('');
	        }
	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgDatePicker = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        isoDateInput: null,
	        trigger: null,
	        formattedDateInput: null,

	        init: function init() {
	          if (widget.object.is('input') && widget.object.attr('role') === 'cotg.DatePicker') {
	            // A plain input field with the datepicker role
	            widget.isoDateInput = widget.object;
	            widget.trigger = widget.isoDateInput;
	            widget.formattedDateInput = $();
	          } else if ($('[role=trigger]', widget.object).length > 0) {
	            widget.isoDateInput = $('[role=date-data]', widget.object);
	            if (widget.isoDateInput.length == 0) {
	              widget.isoDateInput = $('[role=date]', widget.object);
	              widget.formattedDateInput = $();
	            } else {
	              widget.formattedDateInput = $('[role=date]', widget.object);
	            }
	            widget.trigger = $('[role=trigger]', widget.object);
	          } else {
	            // Formatted date is shown, raw date is submitted via hidden
	            widget.isoDateInput = $('[role=date-data]', widget.object);
	            widget.formattedDateInput = $('[role=date]', widget.object);
	            widget.trigger = widget.formattedDateInput;
	          }
	          widget.isoDateInput.prop("readonly", true);
	          widget.formattedDateInput.prop("readonly", true);

	          // STANDARD DOM EVENTS
	          widget.trigger.on('click.cotg', widget.onClick);

	          // CUSTOM EVENTS
	          widget.object.on('set.cotg', widget.onSet);
	          widget.object.on('clear.cotg', widget.onClear);
	          widget.object.on('show-date-picker.cotg', widget.onShowDatePicker);
	        },

	        onClick: function onClick(e) {
	          var timeStamp = Date.parse(widget.isoDateInput.val());
	          if (isNaN(timeStamp)) {
	            widget.object.trigger('show-date-picker.cotg', new Date());
	          } else {
	            var parts = widget.isoDateInput.val().split("-");
	            var date = new Date(parts[0], Number(parts[1]) - 1, parts[2]);
	            widget.object.trigger('show-date-picker.cotg', date);
	          }
	        },

	        onSet: function onSet(event, date) {
	          widget.set(date);
	        },

	        onClear: function onClear() {
	          widget.isoDateInput.val('');
	          widget.formattedDateInput.val('');
	        },

	        onShowDatePicker: function onShowDatePicker(event, oldDate) {
	          navigator.datePicker.show({
	            date: oldDate,
	            mode: 'date'
	          }, widget.set);
	        },

	        set: function set(date) {
	          if (date !== undefined) {
	            widget.isoDateInput.val(widget.generateISODateString(date));

	            navigator.globalization.dateToString(date, function (date) {
	              widget.formattedDateInput.val(date.value);
	            }, null, {
	              formatLength: 'short',
	              selector: 'date'
	            });
	          }
	        },

	        generateISODateString: function generateISODateString(date) {
	          var day = date.getDate();
	          var month = date.getMonth() + 1;
	          var year = date.getFullYear();
	          var result = "";
	          result += year;
	          result += "-";
	          result += month < 10 ? "0" + month : month;
	          result += "-";
	          result += day < 10 ? "0" + day : day;

	          return result;
	        }
	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgTimePicker = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        isoTimeInput: null,
	        trigger: null,
	        formattedTimeInput: null,

	        init: function init() {
	          if (widget.object.is('input') && widget.object.attr('role') === 'cotg.TimePicker') {
	            // A plain input field with the timepicker role
	            widget.isoTimeInput = widget.object;
	            widget.trigger = widget.isoTimeInput;
	            widget.formattedTimeInput = $();
	          } else if ($('[role=trigger]', widget.object).length > 0) {
	            widget.isoTimeInput = $('[role=time-data]', widget.object);
	            if (widget.isoTimeInput.length == 0) {
	              widget.isoTimeInput = $('[role=time]', widget.object);
	              widget.formattedTimeInput = $();
	            } else {
	              widget.formattedTimeInput = $('[role=time]', widget.object);
	            }
	            widget.trigger = $('[role=trigger]', widget.object);
	          } else {
	            // Formatted time is shown, raw time is submitted via hidden
	            widget.isoTimeInput = $('[role=time-data]', widget.object);
	            widget.formattedTimeInput = $('[role=time]', widget.object);
	            widget.trigger = widget.formattedTimeInput;
	          }
	          widget.isoTimeInput.prop("readonly", true);
	          widget.formattedTimeInput.prop("readonly", true);

	          // STANDARD DOM EVENTS
	          widget.trigger.on('click.cotg', widget.onClick);

	          // CUSTOM EVENTS
	          widget.object.on('set.cotg', widget.onSet);
	          widget.object.on('clear.cotg', widget.onClear);
	          widget.object.on('show-time-picker.cotg', widget.onShowTimePicker);
	        },

	        onClick: function onClick(e) {
	          navigator.globalization.stringToDate(widget.isoTimeInput.val(), function (date) {
	            // success
	            var time = new Date();
	            t.setHours(date.hour);
	            t.setMinutes(date.minute);
	            widget.object.trigger('show-time-picker.cotg', time);
	          }, function () {
	            // error
	            widget.object.trigger('show-time-picker.cotg', new Date());
	          }, {
	            // options
	            formatLength: 'short',
	            selector: 'time'
	          });
	        },

	        onSet: function onSet(event, date) {
	          widget.set(date);
	        },

	        onClear: function onClear() {
	          widget.isoTimeInput.val('');
	          widget.formattedTimeInput.val('');
	        },

	        onShowTimePicker: function onShowTimePicker(event, oldTime) {
	          navigator.datePicker.show({
	            date: oldTime,
	            mode: 'time'
	          }, widget.set);
	        },

	        set: function set(time) {
	          if (time !== undefined) {
	            widget.formattedTimeInput.val(time.toLocaleTimeString());

	            navigator.globalization.dateToString(time, function (time) {
	              widget.isoTimeInput.val(time.value);
	            }, null, {
	              formatLength: 'short',
	              selector: 'time'
	            });
	          }
	        }
	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgGeolocation = function (options) {

	    var settings = $.extend($.fn.cotgGeolocation.defaults, options);

	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        dataElement: $('[role=geolocation-data]', this),
	        infoElement: $('[role=geolocation-info]', this),
	        getButton: $('[role=get-button]', this),

	        init: function init() {
	          widget.getButton.on('click.cotg', widget.onUpdate);

	          // CUSTOM EVENTS
	          widget.object.on('clear.cotg', widget.onClear);
	          widget.object.on('update.cotg', widget.onUpdate);
	          widget.object.on('restore-state.cotg', widget.onRestoreState);
	        },

	        onClear: function onClear() {
	          widget.dataElement.val('');
	          widget.infoElement.html('');
	        },

	        onUpdate: function onUpdate() {
	          var params = {};
	          if (widget.object.attr('data-params')) {
	            params = JSON.parse(widget.object.attr('data-params'));
	          }
	          var localSettings = $.extend(settings, params);
	          navigator.geolocation.getCurrentPosition(widget.handleSuccess, widget.handleError, localSettings);
	        },

	        onRestoreState: function onRestoreState(event, state) {
	          if (widget.dataElement.val().length > 0) {
	            widget.showInfo(JSON.parse(widget.dataElement.val()));
	          }
	        },

	        handleError: function handleError(err) {
	          widget.dataElement.val(JSON.stringify(err));
	          widget.infoElement.html('Error ' + err.code + ': ' + err.message);
	        },

	        handleSuccess: function handleSuccess(position) {
	          widget.dataElement.val(JSON.stringify(position, ['accuracy', 'altitude', 'altitudeAccuracy', 'heading', 'latitude', 'longitude', 'speed', 'timestamp', 'coords']));
	          widget.showInfo(position);
	        },

	        showInfo: function showInfo(position) {
	          if ("coords" in position) {
	            var geo = '<p><strong>Latitude:</strong> ' + widget.degToDms(position.coords.latitude) + ' (' + position.coords.latitude + ')<br />' + '<strong>Longitude:</strong> ' + widget.degToDms(position.coords.longitude) + ' (' + position.coords.longitude + ')<br />' + '<strong>Timestamp:</strong> ' + position.timestamp + '</p>';
	            widget.infoElement.html(geo);
	          }
	        },

	        degToDms: function degToDms(deg) {
	          var d = Math.floor(deg);
	          var minfloat = (deg - d) * 60;
	          var m = Math.floor(minfloat);
	          var secfloat = (minfloat - m) * 60;
	          var s = Math.round(secfloat);
	          if (s == 60) {
	            m++;
	            s = 0;
	          }
	          if (m == 60) {
	            d++;
	            m = 0;
	          }
	          return '' + d + '&deg; ' + m + "' " + s + '"';
	        }
	      };

	      widget.init();
	    });
	  };
	  $.fn.cotgGeolocation.defaults = {
	    enableHighAccuracy: false,
	    maximumAge: 3000,
	    timeout: 2700
	  };

	  $.fn.cotgPhotoWidget = function (options) {
	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        imageElement: $('[role=photo]', this),
	        imageDataElement: $('[role=photo-data]', this),
	        takeButton: $('[role=take-button]', this),
	        pickButton: $('[role=pick-button]', this),
	        clearButton: $('[role=clear-button]', this),
	        descElement: $('[role=photo-info]', this),
	        settings: $.fn.cotgPhotoWidget.defaults,

	        init: function init(options) {
	          widget.object.parents("label").click(function (event) {
	            event.preventDefault();
	          });

	          //widget.imageElement.hide();
	          if (widget.object.attr('data-params')) {
	            widget.settings = $.extend(widget.settings, JSON.parse(widget.object.attr('data-params')));
	          }

	          widget.settings = $.extend(widget.settings, options);

	          if (widget.settings.source === 'take' || widget.settings.source === 'takeandpick' || widget.settings.source === undefined) {
	            widget.takeButton.click(function () {
	              widget.getPicture(false);
	            });
	          } else {
	            widget.takeButton.remove();
	          }

	          if (widget.settings.source === 'pick' || widget.settings.source === 'takeandpick' || widget.settings.source === undefined) {
	            widget.pickButton.click(function () {
	              widget.getPicture(true);
	            });
	          } else {
	            widget.pickButton.remove();
	          }

	          widget.clearButton.click(widget.onClear);
	          widget.clearButton.hide();

	          if (widget.settings.allowannotations) {
	            $(widget.object).cotgNoteOnImage();

	            // For backwards compatibility see SHARED-46029:
	            $('[role=control-wrapper]', widget.object).css("position", "relative");
	          }

	          // Events
	          widget.object.on('clear.cotg', widget.onClear);
	          widget.object.on('save-state.cotg', widget.onSaveState);
	          widget.object.on('restore-state.cotg', widget.onRestoreState);
	        },

	        getPicture: function getPicture(fromLibrary) {
	          // Get the parameters
	          var imgWidth;
	          var imgHeight;
	          if (widget.settings.scaleimage === true && (widget.settings.width || widget.settings.height)) {
	            imgWidth = widget.settings.width;
	            imgHeight = widget.settings.height;
	          }

	          var encodingtype;
	          var format;
	          if (widget.settings.encodingtype === 'png') {
	            encodingtype = Camera.EncodingType.PNG;
	            format = ".png";
	          } else {
	            encodingtype = Camera.EncodingType.JPEG;
	            format = ".jpg";
	          }

	          var imgQuality = widget.settings.quality;
	          var editimage = widget.settings.editimage; // allow iOS users to rotate
	          // and crop

	          navigator.camera.getPicture(function (data) {
	            // on success
	            widget.imageElement.prop('src', data);
	            widget.imageElement.show();
	            widget.object.addClass('captured');
	            widget.imageDataElement.val(data);

	            if (widget.clearButton != null) {
	              widget.clearButton.show();
	            }

	            widget.object.trigger('set.cotg');
	            widget.imageElement.trigger('bind-to-image.cotg', false);

	            // Some debug info
	            if (widget.descElement.length) {
	              widget.descElement.html('Source: ' + (fromLibrary ? 'library' : 'camera') + ', Format: ' + format + ', Quality: ' + imgQuality + '<br />' + 'Width: ' + imgWidth + ' px, Height: ' + imgHeight + ' px');
	            }
	          }, function (event) {// on error
	            // do nothing is fine
	          }, { // options
	            sourceType: fromLibrary ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA,
	            allowEdit: editimage,
	            targetWidth: imgWidth,
	            targetHeight: imgHeight,
	            encodingType: encodingtype,
	            quality: imgQuality,
	            destinationType: Camera.DestinationType.FILE_URI,
	            correctOrientation: true
	          }
	          // Note that on Android, the option saveToAlbum is not
	          // supported and allowEdit IS supported, contrary to what
	          // what is described
	          // in documentation web page.
	          );
	        },

	        onClear: function onClear() {
	          widget.clearButton.hide();
	          widget.imageElement.prop('src', '');
	          widget.imageElement.hide();
	          widget.imageDataElement.val('');
	          widget.descElement.html('');
	          if (widget.settings.allowannotations) {
	            // Make sure annotations are cleared, the normal clear.cotg is sent to both but
	            // the order is not guaranteed. We must first remove the image and then clear annotations.
	            widget.object.trigger('clear-note.cotg');
	          }
	        },

	        onSaveState: function onSaveState(event, state) {
	          if (widget.imageElement.is(':visible')) {
	            state[widget.object.attr('id')] = widget.imageElement.prop('src');
	          }
	        },

	        onRestoreState: function onRestoreState(event, state) {
	          var imageSource = state[widget.object.attr('id')];
	          if (!!imageSource) {
	            widget.imageDataElement.val(imageSource);
	            widget.imageElement.prop('src', imageSource);
	            widget.imageElement.show();
	            widget.clearButton.show();
	          }
	        }
	      };
	      widget.init(options);
	    });
	  };
	  $.fn.cotgPhotoWidget.defaults = {
	    editimage: false,
	    encodingtype: 'jpg',
	    height: 864,
	    width: 1152,
	    source: 'takeandpick',
	    scaleimage: true,
	    quality: 80,
	    allowannotations: false
	  };

	  $.fn.cotgNoteOnImage = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        imageElement: $('img', this),
	        noteElement: $('[role=note]', this),
	        noteDataElement: $('[role=note-data]', this),
	        clearButton: $('[role=clear-button]', this),
	        noteData: null,

	        init: function init() {
	          widget.clearButton.on('click.note-cotg', widget.onClear);
	          widget.clearButton.hide();

	          widget.object.parents("label").click(function (event) {
	            event.preventDefault();
	          });

	          widget.noteDataElement.html('');
	          widget.noteElement.html('');

	          widget.bindToImage(false);

	          // Events
	          widget.object.on('clear.cotg', widget.onClear);

	          // To only clear the annotation if it's combined PhotoWidget and NoteOnImage element
	          widget.object.on('clear-note.cotg', widget.onClear);

	          widget.object.on('save-state.cotg', widget.onSaveState);
	          widget.object.on('restore-state.cotg', widget.onRestoreState);

	          widget.imageElement.on('bind-to-image.cotg', function (event, redraw) {
	            widget.bindToImage(redraw);
	          });
	        },

	        bindToImage: function bindToImage(redraw) {
	          if (!widget.noteDataElement.length) {
	            widget.imageElement.after('<input name="' + widget.object.attr('id') + '-note-data" role="note-data" type="hidden">');
	            widget.noteDataElement = $('[role=note-data]', widget.object);
	          }
	          if (!widget.noteElement.length) {
	            widget.imageElement.after('<div role="note" style="position: absolute;"></div>');
	            widget.noteElement = $('[role=note]', widget.object);
	          }

	          // Determine the location for the annotation canvas
	          // Wait till the images is loaded so we can retrieve the proper position information
	          widget.imageElement.one('load', function () {
	            widget.initNoteElement(redraw);
	          }).each(function () {
	            if (this.complete) {
	              widget.initNoteElement(redraw);
	            }
	          });
	        },

	        initNoteElement: function initNoteElement(redraw) {
	          var imgPos = widget.imageElement.position();
	          widget.noteElement.css({
	            height: widget.imageElement.outerHeight() + "px",
	            width: widget.imageElement.outerWidth() + "px",
	            left: parseFloat(imgPos.left).toFixed(2) + "px",
	            top: parseFloat(imgPos.top).toFixed(2) + "px"
	          });

	          // Bind the annotation editor to the click event of the note area
	          widget.noteElement.off("click.cotg").on("click.cotg", function () {
	            widget.annotationEditor();
	          });

	          if (redraw) {
	            widget.draw();
	          }
	        },

	        draw: function draw() {
	          if (!!widget.noteData) {
	            widget.noteElement.html('');
	            var imgWidth = widget.imageElement.width();
	            var imgHeight = widget.imageElement.height();

	            if (browserSupportsSvg) {
	              widget.noteElement.html(navigator.handDrawTool.getSVG(widget.noteData, imgWidth, imgHeight));
	            } else {
	              var imgCanvas = document.createElement('canvas');
	              imgCanvas.setAttribute('width', imgWidth);
	              imgCanvas.setAttribute('height', imgHeight);
	              widget.noteElement.append(imgCanvas);
	              navigator.handDrawTool.drawInContext(imgCanvas.getContext('2d'), widget.noteData, imgWidth, imgHeight);
	            }
	          }
	        },

	        annotationEditor: function annotationEditor() {
	          var imgWidth = widget.imageElement.width();
	          var imgHeight = widget.imageElement.height();

	          navigator.handDrawTool.record(
	          // callback
	          function (data) {
	            widget.noteData = data;
	            widget.noteDataElement.val(navigator.handDrawTool.getSVG(data, imgWidth, imgHeight));
	            widget.draw();
	            widget.clearButton.show();

	            widget.object.trigger('set.cotg');
	          },
	          // options
	          {
	            mode: 'annotation',
	            width: imgWidth,
	            height: imgHeight,
	            edit: widget.noteData,
	            background: widget.imageElement.attr('src')
	          });
	        },

	        onClear: function onClear() {
	          widget.noteData = null;
	          widget.noteElement.html('');
	          widget.noteElement.css('outline', '');
	          widget.noteElement.css('height', '0px');
	          widget.noteElement.css('width', '0px');
	          widget.noteDataElement.val('');
	          widget.initNoteElement(false);

	          if (widget.clearButton) {
	            widget.clearButton.hide();
	          }
	        },

	        onSaveState: function onSaveState(event, state) {
	          state[widget.object.attr('id') + '-annot'] = widget.noteData;
	        },

	        onRestoreState: function onRestoreState(event, state) {
	          widget.noteData = state[widget.object.attr('id') + '-annot'];
	          if (!!widget.noteData) {
	            document.addEventListener('deviceready', function () {
	              widget.bindToImage(true);
	              widget.clearButton.show();
	            }, false);
	          }
	        }

	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgBarcode = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),
	        dataElement: $('[role=barcode-data]', this),
	        scanButton: $('[role=scan-button]', this),

	        init: function init() {
	          widget.scanButton.on('click.cotg', widget.onScan);

	          // CUSTOM EVENTS
	          widget.object.on('clear.cotg', widget.onClear);
	          widget.object.on('scan.cotg', widget.onScan);
	        },

	        onClear: function onClear() {
	          widget.dataElement.val('');
	        },

	        onScan: function onScan() {
	          navigator.barcodeScanner.scan(function (result) {
	            if (!result.cancelled) {
	              delete result.cancelled;
	              widget.dataElement.val(JSON.stringify(result));
	              widget.object.trigger('set.cotg');
	            }
	          }, function () {
	            that.dataElement.val('Error scanning barcode!');
	          });
	        }
	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgUserAccount = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),

	        init: function init() {
	          document.addEventListener('deviceready', function () {
	            widget.object.val(navigator.cotgHost.loginIdentifier);
	            widget.object.trigger('set.cotg');
	          });

	          // CUSTOM EVENTS
	          widget.object.on('clear.cotg', widget.onClear);
	        },

	        onClear: function onClear() {
	          widget.object.val('');
	        }
	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgDeviceInfo = function () {
	    return this.each(function () {
	      var widget = {
	        object: $(this),

	        init: function init() {
	          document.addEventListener('deviceready', function () {
	            widget.object.val(JSON.stringify(device));
	            widget.object.trigger('set.cotg');
	          }, false);

	          // CUSTOM EVENTS
	          widget.object.on('clear.cotg', widget.onClear);
	        },

	        onClear: function onClear() {
	          widget.object.val('');
	        }
	      };

	      widget.init();
	    });
	  };

	  $.fn.cotgLocale = function () {
	    this.each(function () {
	      var widget = {
	        object: $(this),

	        init: function init() {
	          document.addEventListener('deviceready', function () {
	            navigator.globalization.getLocaleName(function (locale) {
	              widget.object.val(locale.value);
	              widget.object.trigger('set.cotg');
	            }, function () {
	              widget.object.val('Error getting locale!');
	            });
	          }, false);

	          // CUSTOM EVENTS
	          widget.object.on('clear.cotg', widget.onClear);
	        },

	        onClear: function onClear() {
	          widget.object.val('');
	        }
	      };

	      widget.init();
	    });

	    return this;
	  };

	  $.fn.cotgUpdateCloneIds = function () {
	    return this.each(function () {
	      $tableId = $(this).attr('id');
	      $("tbody tr", this).each(function (rowIndex) {
	        $("label, input, textarea, select, [role^='cotg.']", this).each(function () {
	          $(this).cotgAddSuffixToAttr('id', $tableId, rowIndex, false);
	          $(this).cotgAddSuffixToAttr('name', $tableId, rowIndex, true);
	          $(this).cotgAddSuffixToAttr('for', $tableId, rowIndex, false);
	        });
	      });
	    });
	  };

	  $.fn.cotgAddSuffixToAttr = function (attr, tableId, rowIdx, useArrayNotation) {
	    return this.each(function () {
	      var value = $(this).attr(attr);
	      if (value != undefined) {
	        // When the user deletes a row that isn't that last row
	        // the id of the row below is wrong. In that case we first
	        // need to remove the suffix we had previously added, before
	        // we can apply the correct suffix.
	        var regex = useArrayNotation ? /.+\[row_\d+\]\[(.+)\]/i : /.+row_\d+__(.+)_/i;
	        var found = value.match(regex);
	        if (found != null) {
	          value = found[1];
	        }
	        var newValue = tableId;
	        if (useArrayNotation) {
	          newValue = newValue + '[row_' + rowIdx + '][' + value + ']';
	        } else {
	          newValue = newValue + '_row_' + rowIdx + '__' + value + '_';
	        }
	        $(this).attr(attr, newValue);
	      }
	    });
	  };

	  $.fn.cotgAddRow = function (buttonPress) {
	    return this.each(function () {
	      $table = $(this);
	      var $tbody = $table.find('tbody');
	      var $newRow = $tbody.children("tr").first().clone();

	      $newRow.find('input, textarea').not(':input[type=checkbox]').not(':input[type=radio]').val("");
	      $newRow.find('input[type=checkbox]').prop("checked", false);

	      $tbody.append($newRow);
	      $table.cotgUpdateCloneIds();

	      if (buttonPress) {
	        $newRow.find('input[type=checkbox][checked], input[type=radio][checked]').prop("checked", true);
	        $newRow.find('input[value]').not(':input[type=checkbox]').not(':input[type=radio]').each(function () {
	          var value = $(this).attr("value").trim();
	          if (value.length > 0) {
	            $(this).val(value);
	          }
	        });
	        $newRow.find('textarea').each(function () {
	          $(this).val($(this).html());
	        });
	        $newRow.find('select').each(function () {
	          var optionValue = $(this).find('option[selected]').val();
	          if (optionValue !== undefined) {
	            $(this).val(optionValue);
	          }
	        });

	        var clones = parseInt($table.attr('data-cotg-clones'));
	        if (isNaN(clones)) {
	          clones = 1;
	        } else {
	          clones++;
	        }
	        $table.attr('data-cotg-clones', clones);
	      }

	      initWidgets($newRow);
	    });
	  };

	  $.fn.cotgDeleteRow = function () {
	    return this.each(function () {
	      var $table = $(this).closest('table');
	      var rowCount = $table.find("tbody tr").length;
	      if (rowCount > 1) {
	        $(this).remove();

	        var clones = parseInt($table.attr('data-cotg-clones'));
	        if (!isNaN(clones)) {
	          clones--;
	          $table.attr('data-cotg-clones', clones);
	        }
	        $table.cotgUpdateCloneIds();
	      }
	    });
	  };

	  /**
	   * Saves the state of all the clones, this includes the number of clones
	   * and the value of all input fields for each clone. Typically a clone is a table row.
	   *
	   * The data-cotg-clones attribute is typically set on the table element which must have an
	   * id attribute with a unique value.
	   *
	   * @param state
	   */
	  function saveClones(state) {
	    $('[data-cotg-clones]').each(function () {
	      var numberOfClones = parseInt($(this).attr('data-cotg-clones'));
	      if (isNaN(numberOfClones)) {
	        return;
	      }

	      var id = $(this).attr('id');
	      if (id == undefined) {
	        return;
	      }

	      if (state['data-cotg-clones'] == undefined) {
	        state['data-cotg-clones'] = {};
	      }
	      state['data-cotg-clones'][id] = { 'numberOfClones': numberOfClones };

	      var values = [];
	      $('tbody tr input:not([type=radio]):not([type=checkbox]), tbody tr select, tbody tr textarea', $(this)).each(function () {
	        values.push($(this).val());
	      });
	      state['data-cotg-clones'][id]['values'] = values;

	      var checked = [];
	      $('tbody tr input[type=checkbox]:checked, tbody tr input[type=radio]:checked', $(this)).each(function () {
	        var inputID = $(this).attr('id');
	        if (inputID !== undefined) {
	          checked.push(inputID);
	        }
	      });
	      state['data-cotg-clones'][id]['checked'] = checked;
	    });
	  }

	  /**
	   * Recreates all the clones (table rows), makes sure all the cloned input fields have
	   * unique id's names etc. Restores the values for all the input fields.
	   *
	   * @param state
	   */
	  function recreateClones(state) {
	    var clonesState = state['data-cotg-clones'];
	    if (clonesState == undefined) return;

	    for (var id in clonesState) {
	      $('#' + id).attr('data-cotg-clones', clonesState[id].numberOfClones);
	    }

	    $('[data-cotg-clones]').each(function () {
	      var numberOfClones = parseInt($(this).attr('data-cotg-clones'));
	      if (isNaN(numberOfClones)) {
	        return;
	      }

	      for (var i = 0; i < numberOfClones; i++) {
	        $(this).cotgAddRow(false);
	      }

	      var contextState = state['data-cotg-clones'][$(this).attr('id')];
	      $('tbody tr input:not([type=radio]):not([type=checkbox]), tbody tr select, tbody tr textarea', $(this)).each(function (index) {
	        $(this).val(contextState.values[index]);
	      });

	      // Restore checked state for checkboxes and radio buttons based on the stored ids
	      for (var i = 0; i < contextState.checked.length; i++) {
	        var escapedSelector = "#" + contextState.checked[i].replace(/\[/g, "\\[").replace(/\]/g, "\\]");
	        $(escapedSelector).prop("checked", true);
	      }
	    });
	  }

	  window.addEventListener('savestate', function (event) {
	    saveClones(event.detail.state);
	    jQuery('[role^=cotg\\.]').trigger('save-state.cotg', [event.detail.state]);
	    window.dispatchEvent(new CustomEvent("olcotgsavestate", { "detail": event.detail }));
	  }, false);

	  window.addEventListener('restorestate', function (event) {
	    recreateClones(event.detail.state);
	    jQuery('[role^=cotg\\.]').trigger('restore-state.cotg', [event.detail.state]);
	    window.dispatchEvent(new CustomEvent("olcotgrestorestate", { "detail": event.detail }));
	  }, false);

	  function initWidgets($context) {
	    $('[role="cotg.Signature"]', $context).cotgSignature();
	    $('[role="cotg.DatePicker"]', $context).cotgDatePicker();
	    $('[role="cotg.TimePicker"]', $context).cotgTimePicker();
	    $('[role="cotg.Geolocation"]', $context).cotgGeolocation();
	    $('[role="cotg.PhotoWidget"]', $context).cotgPhotoWidget();
	    $('[role="cotg.NoteOnImage"]', $context).cotgNoteOnImage();
	    $('[role="cotg.Barcode"]', $context).cotgBarcode();
	    $('[role="cotg.UserAccount"]', $context).cotgUserAccount();
	    $('[role="cotg.DeviceInfo"]', $context).cotgDeviceInfo();
	    $('[role="cotg.Locale"]', $context).cotgLocale();
	  }

	  $(document).ready(function () {
	    initWidgets();

	    $("table [role=cotg-add-row-button]").on("click", function () {
	      $(this).closest('table').cotgAddRow(true);
	    });

	    $("table").on("click", "[role=cotg-delete-row-button]", function () {
	      $(this).closest('tr').cotgDeleteRow();
	    });

	    // note table[role=cotg-table] needs to be kept for backwards compatibility SHARED-40369
	    $('form table[role="cotg.FieldsTable"], form table[role=cotg-table], form table[data-detail]').each(function () {
	      $(this).cotgUpdateCloneIds();
	    });
	  });
	})(jQuery);

/***/ }
/******/ ]);
