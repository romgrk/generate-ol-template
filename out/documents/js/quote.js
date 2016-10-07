/******/ (function(modules) { // webpackBootstrap
/******/ 	var parentHotUpdateCallback = this["webpackHotUpdate"];
/******/ 	this["webpackHotUpdate"] = 
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if(parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadUpdateChunk(chunkId) { // eslint-disable-line no-unused-vars
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.type = "text/javascript";
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		head.appendChild(script);
/******/ 	}
/******/ 	
/******/ 	function hotDownloadManifest(callback) { // eslint-disable-line no-unused-vars
/******/ 		if(typeof XMLHttpRequest === "undefined")
/******/ 			return callback(new Error("No browser support"));
/******/ 		try {
/******/ 			var request = new XMLHttpRequest();
/******/ 			var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 			request.open("GET", requestPath, true);
/******/ 			request.timeout = 10000;
/******/ 			request.send(null);
/******/ 		} catch(err) {
/******/ 			return callback(err);
/******/ 		}
/******/ 		request.onreadystatechange = function() {
/******/ 			if(request.readyState !== 4) return;
/******/ 			if(request.status === 0) {
/******/ 				// timeout
/******/ 				callback(new Error("Manifest request to " + requestPath + " timed out."));
/******/ 			} else if(request.status === 404) {
/******/ 				// no update available
/******/ 				callback();
/******/ 			} else if(request.status !== 200 && request.status !== 304) {
/******/ 				// other failure
/******/ 				callback(new Error("Manifest request to " + requestPath + " failed."));
/******/ 			} else {
/******/ 				// success
/******/ 				try {
/******/ 					var update = JSON.parse(request.responseText);
/******/ 				} catch(e) {
/******/ 					callback(e);
/******/ 					return;
/******/ 				}
/******/ 				callback(null, update);
/******/ 			}
/******/ 		};
/******/ 	}

/******/ 	
/******/ 	
/******/ 	// Copied from https://github.com/facebook/react/blob/bef45b0/src/shared/utils/canDefineProperty.js
/******/ 	var canDefineProperty = false;
/******/ 	try {
/******/ 		Object.defineProperty({}, "x", {
/******/ 			get: function() {}
/******/ 		});
/******/ 		canDefineProperty = true;
/******/ 	} catch(x) {
/******/ 		// IE will fail on defineProperty
/******/ 	}
/******/ 	
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "e31aeca99cb94133c614"; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	
/******/ 	function hotCreateRequire(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var me = installedModules[moduleId];
/******/ 		if(!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if(me.hot.active) {
/******/ 				if(installedModules[request]) {
/******/ 					if(installedModules[request].parents.indexOf(moduleId) < 0)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 					if(me.children.indexOf(request) < 0)
/******/ 						me.children.push(request);
/******/ 				} else hotCurrentParents = [moduleId];
/******/ 			} else {
/******/ 				console.warn("[HMR] unexpected require(" + request + ") from disposed module " + moduleId);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		for(var name in __webpack_require__) {
/******/ 			if(Object.prototype.hasOwnProperty.call(__webpack_require__, name)) {
/******/ 				if(canDefineProperty) {
/******/ 					Object.defineProperty(fn, name, (function(name) {
/******/ 						return {
/******/ 							configurable: true,
/******/ 							enumerable: true,
/******/ 							get: function() {
/******/ 								return __webpack_require__[name];
/******/ 							},
/******/ 							set: function(value) {
/******/ 								__webpack_require__[name] = value;
/******/ 							}
/******/ 						};
/******/ 					}(name)));
/******/ 				} else {
/******/ 					fn[name] = __webpack_require__[name];
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		function ensure(chunkId, callback) {
/******/ 			if(hotStatus === "ready")
/******/ 				hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			__webpack_require__.e(chunkId, function() {
/******/ 				try {
/******/ 					callback.call(null, fn);
/******/ 				} finally {
/******/ 					finishChunkLoading();
/******/ 				}
/******/ 	
/******/ 				function finishChunkLoading() {
/******/ 					hotChunksLoading--;
/******/ 					if(hotStatus === "prepare") {
/******/ 						if(!hotWaitingFilesMap[chunkId]) {
/******/ 							hotEnsureUpdateChunk(chunkId);
/******/ 						}
/******/ 						if(hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 							hotUpdateDownloaded();
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		}
/******/ 		if(canDefineProperty) {
/******/ 			Object.defineProperty(fn, "e", {
/******/ 				enumerable: true,
/******/ 				value: ensure
/******/ 			});
/******/ 		} else {
/******/ 			fn.e = ensure;
/******/ 		}
/******/ 		return fn;
/******/ 	}
/******/ 	
/******/ 	function hotCreateModule(moduleId) { // eslint-disable-line no-unused-vars
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 	
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfAccepted = true;
/******/ 				else if(typeof dep === "function")
/******/ 					hot._selfAccepted = dep;
/******/ 				else if(typeof dep === "object")
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback;
/******/ 				else
/******/ 					hot._acceptedDependencies[dep] = callback;
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if(typeof dep === "undefined")
/******/ 					hot._selfDeclined = true;
/******/ 				else if(typeof dep === "number")
/******/ 					hot._declinedDependencies[dep] = true;
/******/ 				else
/******/ 					for(var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if(idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if(!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if(idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/ 	
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		return hot;
/******/ 	}
/******/ 	
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/ 	
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for(var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/ 	
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailibleFilesMap = {};
/******/ 	var hotCallback;
/******/ 	
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/ 	
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = (+id) + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/ 	
/******/ 	function hotCheck(apply, callback) {
/******/ 		if(hotStatus !== "idle") throw new Error("check() is only allowed in idle status");
/******/ 		if(typeof apply === "function") {
/******/ 			hotApplyOnUpdate = false;
/******/ 			callback = apply;
/******/ 		} else {
/******/ 			hotApplyOnUpdate = apply;
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 		hotSetStatus("check");
/******/ 		hotDownloadManifest(function(err, update) {
/******/ 			if(err) return callback(err);
/******/ 			if(!update) {
/******/ 				hotSetStatus("idle");
/******/ 				callback(null, null);
/******/ 				return;
/******/ 			}
/******/ 	
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotAvailibleFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			for(var i = 0; i < update.c.length; i++)
/******/ 				hotAvailibleFilesMap[update.c[i]] = true;
/******/ 			hotUpdateNewHash = update.h;
/******/ 	
/******/ 			hotSetStatus("prepare");
/******/ 			hotCallback = callback;
/******/ 			hotUpdate = {};
/******/ 			var chunkId = 1;
/******/ 			{ // eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if(hotStatus === "prepare" && hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 		});
/******/ 	}
/******/ 	
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) { // eslint-disable-line no-unused-vars
/******/ 		if(!hotAvailibleFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for(var moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if(!hotAvailibleFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var callback = hotCallback;
/******/ 		hotCallback = null;
/******/ 		if(!callback) return;
/******/ 		if(hotApplyOnUpdate) {
/******/ 			hotApply(hotApplyOnUpdate, callback);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for(var id in hotUpdate) {
/******/ 				if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			callback(null, outdatedModules);
/******/ 		}
/******/ 	}
/******/ 	
/******/ 	function hotApply(options, callback) {
/******/ 		if(hotStatus !== "ready") throw new Error("apply() is only allowed in ready status");
/******/ 		if(typeof options === "function") {
/******/ 			callback = options;
/******/ 			options = {};
/******/ 		} else if(options && typeof options === "object") {
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		} else {
/******/ 			options = {};
/******/ 			callback = callback || function(err) {
/******/ 				if(err) throw err;
/******/ 			};
/******/ 		}
/******/ 	
/******/ 		function getAffectedStuff(module) {
/******/ 			var outdatedModules = [module];
/******/ 			var outdatedDependencies = {};
/******/ 	
/******/ 			var queue = outdatedModules.slice();
/******/ 			while(queue.length > 0) {
/******/ 				var moduleId = queue.pop();
/******/ 				var module = installedModules[moduleId];
/******/ 				if(!module || module.hot._selfAccepted)
/******/ 					continue;
/******/ 				if(module.hot._selfDeclined) {
/******/ 					return new Error("Aborted because of self decline: " + moduleId);
/******/ 				}
/******/ 				if(moduleId === 0) {
/******/ 					return;
/******/ 				}
/******/ 				for(var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if(parent.hot._declinedDependencies[moduleId]) {
/******/ 						return new Error("Aborted because of declined dependency: " + moduleId + " in " + parentId);
/******/ 					}
/******/ 					if(outdatedModules.indexOf(parentId) >= 0) continue;
/******/ 					if(parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if(!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push(parentId);
/******/ 				}
/******/ 			}
/******/ 	
/******/ 			return [outdatedModules, outdatedDependencies];
/******/ 		}
/******/ 	
/******/ 		function addAllToSet(a, b) {
/******/ 			for(var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if(a.indexOf(item) < 0)
/******/ 					a.push(item);
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/ 		for(var id in hotUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				var moduleId = toModuleId(id);
/******/ 				var result = getAffectedStuff(moduleId);
/******/ 				if(!result) {
/******/ 					if(options.ignoreUnaccepted)
/******/ 						continue;
/******/ 					hotSetStatus("abort");
/******/ 					return callback(new Error("Aborted because " + moduleId + " is not accepted"));
/******/ 				}
/******/ 				if(result instanceof Error) {
/******/ 					hotSetStatus("abort");
/******/ 					return callback(result);
/******/ 				}
/******/ 				appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 				addAllToSet(outdatedModules, result[0]);
/******/ 				for(var moduleId in result[1]) {
/******/ 					if(Object.prototype.hasOwnProperty.call(result[1], moduleId)) {
/******/ 						if(!outdatedDependencies[moduleId])
/******/ 							outdatedDependencies[moduleId] = [];
/******/ 						addAllToSet(outdatedDependencies[moduleId], result[1][moduleId]);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for(var i = 0; i < outdatedModules.length; i++) {
/******/ 			var moduleId = outdatedModules[i];
/******/ 			if(installedModules[moduleId] && installedModules[moduleId].hot._selfAccepted)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/ 	
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		var queue = outdatedModules.slice();
/******/ 		while(queue.length > 0) {
/******/ 			var moduleId = queue.pop();
/******/ 			var module = installedModules[moduleId];
/******/ 			if(!module) continue;
/******/ 	
/******/ 			var data = {};
/******/ 	
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for(var j = 0; j < disposeHandlers.length; j++) {
/******/ 				var cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/ 	
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/ 	
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/ 	
/******/ 			// remove "parents" references from all children
/******/ 			for(var j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if(!child) continue;
/******/ 				var idx = child.parents.indexOf(moduleId);
/******/ 				if(idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// remove outdated dependency from module children
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				for(var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 					var dependency = moduleOutdatedDependencies[j];
/******/ 					var idx = module.children.indexOf(dependency);
/******/ 					if(idx >= 0) module.children.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/ 	
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/ 	
/******/ 		// insert new code
/******/ 		for(var moduleId in appliedUpdate) {
/******/ 			if(Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for(var moduleId in outdatedDependencies) {
/******/ 			if(Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)) {
/******/ 				var module = installedModules[moduleId];
/******/ 				var moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 				var callbacks = [];
/******/ 				for(var i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 					var dependency = moduleOutdatedDependencies[i];
/******/ 					var cb = module.hot._acceptedDependencies[dependency];
/******/ 					if(callbacks.indexOf(cb) >= 0) continue;
/******/ 					callbacks.push(cb);
/******/ 				}
/******/ 				for(var i = 0; i < callbacks.length; i++) {
/******/ 					var cb = callbacks[i];
/******/ 					try {
/******/ 						cb(outdatedDependencies);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// Load self accepted modules
/******/ 		for(var i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			var moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch(err) {
/******/ 				if(typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch(err) {
/******/ 						if(!error)
/******/ 							error = err;
/******/ 					}
/******/ 				} else if(!error)
/******/ 					error = err;
/******/ 			}
/******/ 		}
/******/ 	
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if(error) {
/******/ 			hotSetStatus("fail");
/******/ 			return callback(error);
/******/ 		}
/******/ 	
/******/ 		hotSetStatus("idle");
/******/ 		callback(null, outdatedModules);
/******/ 	}

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
/******/ 			loaded: false,
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: hotCurrentParents,
/******/ 			children: []
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));

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

/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };

/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(11);

	__webpack_require__(12);

	__webpack_require__(16);

	__webpack_require__(17);

	__webpack_require__(18);

	__webpack_require__(19);

	__webpack_require__(20);

	////////////////////////////////////////////
	// Classic warning
	if (navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
	  alert('This page is best viewed in Chrome, Firefox or Safari.\nSome features may not work properly in IE.\nWe appreciate your understanding!');
	}

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
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

	var GM_MIN = exports.GM_MIN = 10;
	var GM_MAX = exports.GM_MAX = 80;

	var PROJECT_ITEMS = exports.PROJECT_ITEMS = [{ name: 'installation', label: 'Installation' }, { name: 'electrical', label: 'Electrical requirements' }, { name: 'equipment', label: 'Equipment rental' }, { name: 'seismic', label: 'Seismic Calcs' }, { name: 'fire', label: 'Fire suppression' }, { name: 'permits', label: 'Permits' }, { name: 'hardware', label: 'Hardware' }, { name: 'misc', label: 'Misc. Costs' }, { name: 'hvac', label: 'HVAC Installation' }, { name: 'special', label: 'Special inspections' }];

	var CONFIG = exports.CONFIG = {
	  API_URL: apiUrl,
	  DATE_FORMAT: 'MM/dd/yyyy',
	  PROJECT_ITEMS: PROJECT_ITEMS,
	  GM_MIN: GM_MIN,
	  GM_MAX: GM_MAX
	};

	var App = exports.App = void 0;
	if (!App) {
	  exports.App = App = angular.module('quoteApp', ['ui.sortable']);
	  App.config(function ($httpProvider) {});
	  App.constant('CONFIG', CONFIG);
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _config = __webpack_require__(11);

	var _actions = __webpack_require__(13);

	var _models = __webpack_require__(14);

	var _utils = __webpack_require__(15);

	_config.App.controller('quoteCtrl', ['$scope', '$location', quoteController]);

	function quoteController($scope, $location) {
	  var _this = this;

	  $scope.CONFIG = _config.CONFIG;

	  this.request = false;

	  this.quoteID = null;
	  this.quoteData = (0, _models.getNewQuote)();

	  this.salesReps = [];
	  this.shepards = [];

	  this.tax = {
	    isLoading: false,
	    hasError: false,
	    message: { Summary: '' }
	  };

	  ////////////////////////////////////////////
	  // Select2 functions
	  ////////////////////////////////////////////

	  var updateShippingData = function updateShippingData(selector, data) {
	    if (data) {
	      var text = data.replace(/[\s\-]/gi, '');
	      var fnCompare = function fnCompare() {
	        return $(this).html().replace(/[\s\-]/gi, '') == text;
	      };
	      $(selector).trigger('selectText.ajaxInput', [text, fnCompare]);
	    }
	  };

	  var setValueFor = function setValueFor(selector, value) {
	    if ($(selector).data('select2') != undefined && value) $(selector).data('select2').$selection.find('.select2-selection__rendered').text(value);
	  };

	  var renderSameAsBillTo = function renderSameAsBillTo() {
	    var delay = arguments.length <= 0 || arguments[0] === undefined ? 50 : arguments[0];

	    setTimeout(function () {
	      setValueFor("#billTo", _this.quoteData.billTo.name);
	      setValueFor("#BTContact", _this.quoteData.billTo.contactName);
	      setValueFor("#shipTo", _this.quoteData.shipTo.name);
	      setValueFor("#STContact", _this.quoteData.shipTo.contactName);
	    }, delay);
	  };

	  var renderShippingTerms = function renderShippingTerms() {
	    var delay = arguments.length <= 0 || arguments[0] === undefined ? 50 : arguments[0];

	    setTimeout(function () {
	      setValueFor("#paymentTermsID", _this.quoteData.infos.paymentTerms);
	      setValueFor("#shippingMethodID", _this.quoteData.infos.shippingMethod);
	      setValueFor("#shippingPointID", _this.quoteData.infos.shippingPoint);
	      setValueFor("#shippingTermsID", _this.quoteData.infos.shippingTerms);
	      setValueFor("#taxStatusID", _this.quoteData.infos.taxStatus);
	    }, delay);
	  };

	  var showTooltip = function showTooltip(target) {
	    var unBind = $scope.$on('saved.DACO', function () {
	      $('.manual-tooltip').tooltip('show');
	      setTimeout(function () {
	        return $('.manual-tooltip').tooltip('hide');
	      }, 4000);
	      unBind();
	    });
	  };

	  ////////////////////////////////////////////
	  // Data loading & saving
	  ////////////////////////////////////////////

	  var receiveData = function receiveData(data) {
	    _this.request = undefined;

	    // Previously, qty was stored as a string.
	    // Compensate by parsing back to a number.
	    data.items.forEach(function (item) {
	      item.qty = Number(item.qty) || 1;
	    });

	    _this.quoteData = data;
	    $scope.$digest();

	    setTimeout(function () {
	      return $('#loadingModal').modal('hide');
	    }, 100);

	    renderSameAsBillTo(100);
	    renderShippingTerms();

	    return data;
	  };

	  var receiveError = function receiveError(e) {
	    _this.request = undefined;
	    alert('Error while communicating with server: ' + JSON.stringify(e));
	  };

	  var loadQuote = function loadQuote(id) {
	    $('#loadingModal').modal('show');
	    _this.request = $.ajax({
	      type: 'GET',
	      url: _config.CONFIG.API_URL + '/quotes/' + _this.quoteID,
	      contentType: "application/json; charset=utf-8",
	      dataType: "json",
	      success: receiveData,
	      failure: receiveError
	    });
	    return _this.request;
	  };

	  var saveQuote = function saveQuote() {
	    var addParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var reload = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

	    if (_this.request) return _this.request;
	    console.log('saveQuote()');
	    _this.request = $.ajax({
	      type: 'POST',
	      url: _config.CONFIG.API_URL + '/quotes/' + _this.quoteID,
	      data: JSON.stringify($.extend({}, _this.quoteData, addParams)),
	      contentType: "application/json; charset=utf-8",
	      dataType: "json",
	      success: function success(data) {
	        _this.request = undefined;
	        if (_this.quoteID == 'new') {
	          _this.quoteData = data;
	          _this.quoteID = data.id;
	        } else {
	          $scope.mainForm.$setPristine();
	          if (reload) loadQuote(_this.quoteID);
	          $scope.$emit('saved.DACO');
	        }
	        return data;
	      },
	      failure: receiveError
	    });
	    return _this.request;
	  };

	  ////////////////////////////////////////////
	  // Totals calculation
	  ////////////////////////////////////////////

	  var calculateTotal = function calculateTotal() {
	    var q = $scope.quote.quoteData;
	    q.totals.total = q.totals.totalSellPrice + q.freight.totalSalePrice;
	    $scope.calculateTaxes();
	  };

	  var calculateTaxes = function calculateTaxes() {
	    var q = $scope.quote.quoteData;
	    var tax = $scope.quote.tax;

	    q.totals.tax = 0;
	    q.totals.taxedTotal = q.totals.total;

	    if (!/AVA ?TAX/i.test(q.infos.taxStatus)) return;

	    var amount = q.totals.total;
	    var address = (0, _models.getNewAddress)(q.shipTo);

	    tax.isLoading = true;
	    (0, _actions.fetchTax)(amount, address).then(function (data) {
	      tax.isLoading = false;
	      tax.data = data;
	      if (data.ResultCode == 'Error') {
	        tax.hasError = true;
	        tax.message = data.Messages[0];
	      } else {
	        tax.hasError = false;
	        q.totals.tax = parseFloat(data.TotalTaxCalculated);
	        q.totals.taxedTotal = q.totals.total + (q.totals.tax || 0);
	      }
	      $scope.$apply();
	    }, function (err) {
	      tax.isLoading = false;
	      tax.hasError = true;
	      tax.message = { Summary: 'Network error while calculating taxes.', err: err };
	      $scope.$apply();
	    });
	  };

	  ////////////////////////////////////////////
	  // Scope & scope accessible functions
	  ////////////////////////////////////////////

	  $scope.calculateTotal = calculateTotal;
	  $scope.calculateTaxes = calculateTaxes;

	  $scope.addProjectItem = function (description) {
	    $scope.$broadcast('projectItemAdd.DACO', [description]);
	  };

	  // Order submission/creation
	  $scope.upgradeOrder = function (e) {
	    var params = {};
	    if (_this.quoteData.type == 'q') {
	      if (!window.confirm('Convert this quote to a sales order?')) return;
	      _this.quoteData.type = 'o';
	      params.send = 2;
	      params.sendTo = _this.quoteData.infos.shepard;
	    } else if (_this.quoteData.type == 'o') {
	      if (!_.every(_this.quoteData.items, function (i) {
	        return i.itemNum != '';
	      })) {
	        window.alert('This order has items with no number. Please correct them before submitting.');
	        return;
	      }
	      if (!window.confirm('Submit this sales order?')) return;
	      _this.quoteData.type = 'so';
	    }

	    $scope.$emit('doSave.DACO', params, true);
	    showTooltip(e.currentTarget);
	  };

	  //  Send order to email
	  $scope.sendQuote = function (e, user) {
	    var sendTo;
	    switch (user) {
	      case 's':
	        sendTo = _this.quoteData.infos.shepard;
	        break;
	      case 'r':
	        sendTo = _this.quoteData.infos.salesRep;
	        break;
	      default:
	        sendTo = currentUsername;
	    }

	    $scope.$emit('doSave.DACO', { send: 1, sendTo: sendTo });
	    showTooltip(e.currentTarget);
	  };

	  // Event for forcing save from child scopes
	  $scope.$on('doSave.DACO', function (e, addParams, reload) {
	    // Debounce this.
	    if (_this.saveTimeout) return;

	    _this.saveTimeout = setTimeout(function () {
	      _this.saveTimeout = undefined;
	      saveQuote(addParams, reload);
	    }, 100);
	  });

	  ////////////////////////////////////////////
	  // Section: Watchers
	  ////////////////////////////////////////////

	  $scope.$watch(angular.bind(this, function () {
	    return _this.quoteData;
	  }), function (nVal, oVal) {
	    if ($scope.mainForm.$pristine) // Save only if the form has been changed
	      return;
	    if (_this.request === false) // Do not save on initial load
	      return;
	    if (!oVal || !oVal.infos) return;

	    // If new billTo, then new shipTo
	    if (nVal.billTo.new) nVal.shipTo.new = true;

	    $scope.$emit('doSave.DACO');
	  }, true);

	  $scope.$watch('quote.quoteData.billTo', function (newVal, oldVal) {
	    var sameAs = _this.quoteData.infos.sameAsBillTo;
	    if (sameAs) {
	      _this.quoteData.shipTo = _extends({}, _this.quoteData.billTo);
	      renderSameAsBillTo();
	    }
	  }, true);

	  $scope.$watch('quote.quoteData.shipTo', function (newVal, oldVal) {
	    var q = _this.quoteData;
	    var sameAs = q.infos.sameAsBillTo;
	    // If shipTo differs from billTo, its not sameAs
	    if (sameAs) {
	      if (!_.isEqual(q.shipTo, q.billTo)) {
	        q.infos.sameAsBillTo = false;
	      }
	    }

	    /*
	     * If the shipTo address changes, then the tax needs to be
	     * calculated again.
	     */
	    calculateTotal();
	    calculateTaxes();
	  }, true);

	  $scope.$watch('quote.quoteData.infos.taxStatus', function (newVal, oldVal) {
	    calculateTaxes();
	  });

	  $scope.$watch('quote.quoteData.infos.sameAsBillTo', function (newVal, oldVal) {
	    _this.quoteData.infos.sameAsBillTo = newVal;
	    if (newVal) {
	      _this.quoteData.shipTo = _extends({}, _this.quoteData.billTo);
	      renderSameAsBillTo();
	    }
	  });

	  ////////////////////////////////////////////
	  // Section: initialization

	  // Company selects

	  $('#billTo').select2({
	    minimumInputLength: 1,
	    ajax: {
	      url: _config.CONFIG.API_URL + '/customers',
	      dataType: 'json',
	      delay: 100,
	      data: function data(params) {
	        return { q: params.term, page: params.page };
	      },
	      cache: true
	    }
	  });
	  $('#billTo').on('select2:select', function (e) {
	    var data = $(e.target).find('option:selected').data().data;

	    _this.quoteData.billTo = (0, _models.extractShippingData)(data);
	    $('#BTContact').trigger('clear.ajaxInput');

	    // Update the sales rep
	    if (data.SLPRSNID) _this.quoteData.infos.salesRep = (0, _models.findSalesRep)(_this.salesReps, data.SLPRSNID);

	    // Update payment terms, ship method and tax status from Customer if present
	    updateShippingData('#paymentTermsID', data.PYMTRMID);
	    updateShippingData('#shippingMethodID', data.SHIPMTHD);
	    updateShippingData('#taxStatusID', data.TAXSCHID);

	    (0, _actions.fetchCustomersShipTo)(_this.quoteData.billTo.id).then(function (d) {
	      return $('#shipTo').select2('destroy').select2({ data: d.results });
	    });

	    $scope.$digest();
	  });

	  $('#shipTo').select2();
	  $('#shipTo').on('select2:select', function (e) {
	    var data = $(e.target).find('option:selected').data().data;

	    _this.quoteData.shipTo = (0, _models.extractShippingData)(data);
	    $('#STContact').trigger('clear.ajaxInput');
	  });

	  // Contact selects
	  $(document).on("select2:select", '#BTContact, #STContact', function (e) {
	    var data = $(e.target).find('option:selected').data().data;
	    var target;
	    if ($(e.target).attr('id') == 'BTContact') target = _this.quoteData.billTo;else target = _this.quoteData.shipTo;
	    $.extend(target, (0, _models.extractContactData)(data));
	    $scope.$digest();
	    renderSameAsBillTo();
	  });

	  ////////////////////////////////////////////
	  // Datepicker settings & events
	  // Note: The datepicker is attached to an invisible input.
	  // The button in the same .input-group toggles the picker.
	  var datepicker = $('.datepicker input').datepicker({
	    autoclose: true,
	    format: 'mm-dd-yyyy'
	  });
	  datepicker.on('changeDate', function (event) {
	    $('.datepicker input').datepicker('hide');
	    $('.datepicker input').val(event.format());
	  });
	  $('.datepicker button').click(function (event) {
	    $('.datepicker input').datepicker('show');
	  });

	  // Tooltip setup
	  $('.manual-tooltip').tooltip({ trigger: 'manual' });

	  // Input auto-select
	  $(document).on('click', 'input[type=text], input[type=number]', function () {
	    $(this).select();
	  });

	  ////////////////////////////////////////////
	  // Data loading

	  this.quoteID = (0, _utils.getQuoteID)($location.url());

	  if (this.quoteID.indexOf('new') == 0) {
	    // Create new quote
	    $.extend(this.quoteData, $location.search());
	    $.extend(this.quoteData, { creator: currentUsername });
	    saveQuote().then(function (data) {
	      _this.quoteID = data.id;
	      if (data.id == undefined) console.error('Error creating the quote/order');else $location.url('/' + _this.quoteID);
	    });
	  } else {
	    // Load existing quote
	    loadQuote(this.quoteID).then(function () {
	      var billToID = _this.quoteData.billTo.id;
	      if (billToID) (0, _actions.fetchCustomersShipTo)(billToID).then(function (d) {
	        $('#shipTo').select2('destroy').select2({ data: d.results });
	        renderSameAsBillTo();
	      });
	    });
	  }

	  (0, _actions.fetchUsers)(_config.CONFIG.API_URL + '/users', this);

	  window.vm = this;
	  window.q = this.quoteData;
	  window.scope = $scope;
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.fetchTax = exports.fetchCustomersShipTo = exports.fetchUsers = undefined;

	var _config = __webpack_require__(11);

	var fetchUsers = exports.fetchUsers = function fetchUsers(url, scope) {
	  return $.getJSON(url).then(function (resp) {
	    //ADD TEMP USERS FROM OL
	    var tempUsers = [{ type: 'Inside Sales', company: 'Daco', firstName: 'test OL: Justin', lastName: 'Cox', user: 'coxj', email: 'justin@dacocorp.com' }, { type: 'Inside Sales', company: 'OL', firstName: 'test OL: Marcos', lastName: 'Valois', user: 'valoism', email: 'valoism@ca.objectiflune.com' }, { type: 'Inside Sales', company: 'OL', firstName: 'test OL: Romain', lastName: 'Gregoire', user: 'gregoirer', email: 'gregoirer@ca.objectiflune.com' }, { type: 'Inside Sales', company: 'PO', firstName: 'test OL: Derek', lastName: 'Dahl', user: 'derek', email: 'Derek.Dahl@pacificoffice.com' }, { type: 'TM', company: 'PO', firstName: 'test OL: Derek', lastName: 'Dahl', user: 'derek', email: 'Derek.Dahl@pacificoffice.com' }, { type: 'TM', company: 'OL', firstName: 'test OL: Romain', lastName: 'Gregoire', user: 'gregoirer', email: 'gregoirer@ca.objectiflune.com' }, { type: 'TM', company: 'Daco', firstName: 'test OL: Justin', lastName: 'Cox', user: 'coxj', email: 'justin@dacocorp.com' }, { type: 'TM', company: 'OL', firstName: 'test OL: Raphael', lastName: 'Lalonde', user: 'lalonder', email: 'lalonder@ca.objectiflune.com' }];
	    var users = resp.concat(tempUsers);
	    users.forEach(function (item) {
	      if (item.type == 'Inside Sales') scope.shepards.push(item);else if (item.type == 'TM') scope.salesReps.push(item);
	    });
	  });
	}; /*
	    * actions.js
	    * Copyright (C) 2016  <@>
	    *
	    * Distributed under terms of the MIT license.
	    */

	var fetchCustomersShipTo = exports.fetchCustomersShipTo = function fetchCustomersShipTo(id) {
	  return $.ajax({
	    url: _config.CONFIG.API_URL + '/customers/ship',
	    data: { customerId: id },
	    dataType: 'json'
	  });
	};

	var fetchTax = exports.fetchTax = function fetchTax(amount, address) {
	  return $.ajax({
	    type: 'POST',
	    url: _config.CONFIG.API_URL + '/tax/get',
	    data: JSON.stringify({ amount: amount, address: address }),
	    contentType: "application/json; charset=utf-8",
	    dataType: "json"
	  });
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	/*
	 * quote.js
	 * Copyright (C) 2016  Rom Grk <romgrk.cc@gmail.com>
	 *
	 * Distributed under terms of the MIT license.
	 */

	var getNewQuote = exports.getNewQuote = function getNewQuote() {
	  return {
	    id: null,
	    type: 'q',
	    company: 'daco',
	    infos: {
	      created: new Date(),
	      creator: '',
	      customOrder: false,
	      customInstructions: '',
	      description: '',
	      gsaContract: '',
	      hasCustomInstructions: false,
	      leadTime: '',
	      modified: null,
	      notes: '',
	      paymentTerms: '',
	      paymentTermsID: '',
	      poNumber: '',
	      reqShipDate: null,
	      salesRep: '',
	      sameAddr: false,
	      shepard: '',
	      sameAsBillTo: true,
	      shippingMethod: '',
	      shippingMethodID: '',
	      shippingPoint: 'SEE NOTES',
	      shippingPointID: '0',
	      shippingTerms: '',
	      shippingTermsID: '',
	      specialInstructions: ''
	    },
	    project: {
	      isProject: false
	      /* ... project fields; see config.js */
	    },
	    totals: {
	      totalShipWeight: 0,
	      totalNetCost: 0,
	      totalUnitSellPrice: 0,
	      totalGM: 0,
	      totalSellPrice: 0,
	      total: 0,
	      tax: 0,
	      taxedTotal: 0
	    },
	    billTo: getNewShippingInfo(),
	    shipTo: getNewShippingInfo(),
	    items: [],
	    freight: {
	      totalCost: 0,
	      totalGM: 0,
	      totalSalePrice: 0,
	      items: []
	    },
	    isSalesOrder: true };
	};

	var getNewShippingInfo = exports.getNewShippingInfo = function getNewShippingInfo() {
	  var info = {
	    id: null,
	    name: '',
	    companyName: '',
	    address: '',
	    cityStateZip: '',
	    city: '',
	    state: '',
	    zip: '',
	    priceLevel: '',
	    contactId: '',
	    contactName: '',
	    phone: '',
	    fax: '',
	    email: '',
	    new: false
	  };
	  return info;
	};

	var getNewItem = exports.getNewItem = function getNewItem() {
	  var newItem = {};
	  newItem.qty = 1;
	  newItem.itemNum = "";
	  newItem.itemDescription = "";
	  newItem.supplierVendor = "";
	  newItem.leadTime = "";
	  newItem.shipWeight = 0;
	  newItem.totalShipWeight = 0;
	  newItem.unitCost = 0;
	  newItem.totalNetCost = 0;
	  newItem.grossMargin = 0;
	  newItem.unitSellPrice = 0;
	  newItem.totalSellPrice = 0;
	  newItem.pricing = [];
	  newItem.focusDesc = false; //Just to give the focus for the input description
	  newItem.focusVendor = false; //Just to give the focus for the input suplier vendor
	  newItem.newProd = false; //indicate this product was created by customer: create by description, not by itemNum
	  newItem.allowUnitCostEdition = false;
	  return newItem;
	};

	var getNewFreight = exports.getNewFreight = function getNewFreight() {
	  var newFreight = {};
	  newFreight.itemNum = null;
	  newFreight.qty = "";
	  newFreight.carrier = "";
	  newFreight.description = "";
	  newFreight.cost = 0;
	  newFreight.grossMargin = 0;
	  newFreight.salePrice = 0;
	  newFreight.focusCarrier = false; // Just to give the focus for the input suplier Carrier
	  newFreight.focusDesc = false; // Just to give the focus for the input description
	  return newFreight;
	};

	var addressId = 0;
	var getNewAddress = exports.getNewAddress = function getNewAddress(shipping) {
	  var address = {
	    AddressCode: '' + addressId++,
	    Line1: shipping.address,
	    City: shipping.city,
	    Region: shipping.state,
	    PostalCode: shipping.zip
	  };
	  return address;
	};

	var extractShippingData = exports.extractShippingData = function extractShippingData(data) {
	  var shipping = {};
	  shipping.id = data.id;
	  shipping.name = data.text;
	  shipping.companyName = data.companyName || data.ShipToName;
	  shipping.address = [data.ADDRESS1, data.ADDRESS2, data.ADDRESS3].filter(function (v) {
	    return v != '';
	  }).join(',');
	  shipping.address1 = data.ADDRESS1;
	  shipping.address2 = data.ADDRESS2;
	  shipping.address3 = data.ADDRESS3;
	  shipping.cityStateZip = data.city + ' ' + data.state + ' ' + data.zip;
	  shipping.city = data.city;
	  shipping.state = data.state;
	  shipping.zip = data.zip;
	  shipping.priceLevel = data.priceLevel || '';
	  //shipping.phone        = data.phone || '';
	  //shipping.fax          = data.fax || '';
	  //shipping.email;
	  return shipping;
	};

	var extractContactData = exports.extractContactData = function extractContactData(data) {
	  var contact = {};
	  contact.contactId = data.id;
	  contact.contactName = data.contactName;
	  contact.phone = data.phone ? data.phone + (data.ext ? ' (' + data.ext + ')' : '') : '';
	  contact.fax = data.fax ? data.fax + (data.faxExt ? ' (' + data.faxExt + ')' : '') : '';
	  contact.email = data.email || '';
	  return contact;
	};

	var extractItemData = exports.extractItemData = function extractItemData(data) {
	  var i = {};
	  i.itemDescription = data.itemdesc;
	  i.pricing = data.pricing;
	  i.shipWeight = data.ITEMSHWT / 100;
	  i.unitCost = !i.unitCost || i.unitCost < 0 ? 0 : i.unitCost;
	  i.unitCost = data.currcost > 0 ? data.currcost : i.unitCost;
	  i.qtyAvail = data.QtyAvail || 0;
	  i.allowUnitCostEdition = i.qtyAvail == 0;
	  return i;
	};

	var extractFreightData = exports.extractFreightData = function extractFreightData(data) {
	  var f = _extends({}, data);
	  f.description = data.itemdesc;
	  return f;
	};

	var findSalesRep = exports.findSalesRep = function findSalesRep(salesReps, territory) {
	  here: for (var idx in salesReps) {
	    var territories = salesReps[idx].territories;

	    if (!territories) continue here;

	    territories = territories.split(',');

	    for (var tx in territories) {
	      if (territories[tx] == territory) {
	        return salesReps[idx].user;
	      }
	    }
	  }
	  return null;
	};

	// Find the default sellPrice for item i; depends on the current
	// customer price level.
	var getSellPrice = exports.getSellPrice = function getSellPrice(i) {
	  var priceLevel = arguments.length <= 1 || arguments[1] === undefined ? 'END USER' : arguments[1];

	  var price;

	  if (!i.pricing) return undefined;

	  if (i.pricing.length == 1 && i.pricing[0].UOMPRICE) return i.pricing[0].UOMPRICE;

	  for (var idx in i.pricing) {
	    var level = i.pricing[idx].PRCLEVEL.trim();
	    if ((level == 'END USER' || level == priceLevel || priceLevel == 'ALL') && i.qty >= i.pricing[idx].FROMQTY && i.qty <= i.pricing[idx].TOQTY) {
	      price = i.pricing[idx].UOMPRICE;
	    }
	  }

	  return price;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getQuoteID = exports.isUnsigned = exports.isPercentage = exports.getCorrectedGrossMargin = exports.isGrossMarginOk = undefined;

	var _config = __webpack_require__(11);

	// Function to determine if we should display an error based on the GM percentage
	var isGrossMarginOk = exports.isGrossMarginOk = function isGrossMarginOk(i) {
	  var value = i.grossMargin;
	  return !isNaN(value) && value <= _config.GM_MAX && value >= _config.GM_MIN;
	}; /*
	    * utils.js
	    * Copyright (C) 2016 romgrk <romgrk@Romgrk-ARCH>
	    *
	    * Distributed under terms of the MIT license.
	    */

	var getCorrectedGrossMargin = exports.getCorrectedGrossMargin = function getCorrectedGrossMargin(value) {
	  if (value > _config.GM_MAX) return _config.GM_MAX;
	  if (value < _config.GM_MIN || isNaN(value)) return _config.GM_MIN;
	  return value;
	};

	var isPercentage = exports.isPercentage = function isPercentage(value) {
	  return !isNaN(value) && value < 100 && value > 0;
	};

	var isUnsigned = exports.isUnsigned = function isUnsigned(value) {
	  return value > 0 && Number.isInteger(value);
	};

	var getQuoteID = exports.getQuoteID = function getQuoteID(url) {
	  return url.length > 0 ? url.substring(1) : 'new';
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _config = __webpack_require__(11);

	var _models = __webpack_require__(14);

	var _utils = __webpack_require__(15);

	_config.App.controller('freightCtrl', ['$scope', freightController]);

	function freightController($scope) {
	  var _this = this;

	  // Define a property in the scope for the new freight to create.
	  $scope.newFreight = (0, _models.getNewFreight)();

	  // idx: Index of the object corresponding to the pressed button.
	  this.deleteFreight = function (e, idx) {
	    $scope.quote.quoteData.freight.items.splice(idx, 1);
	    calcFreightTotals();
	    $scope.$emit('doSave.DACO');
	  };

	  this.deleteAllFreight = function (e) {
	    if (!confirm('Are you sure you want to delete ALL freights?')) return;
	    $scope.quote.quoteData.freight.items = [];
	    calcFreightTotals();
	    $scope.$emit('doSave.DACO');
	  };

	  //////////////////////////////////////////////////////////////////////////////

	  // Functions being called when calculating fields in the Freight table.
	  var calcFreightCost = function calcFreightCost(i) {
	    return i.salePrice - i.salePrice * (i.grossMargin / 100);
	  };

	  var calcFreightSalePrice = function calcFreightSalePrice(i) {
	    return i.cost / (1 - i.grossMargin / 100);
	  };

	  var calcFreightGM = function calcFreightGM(i) {
	    return (i.salePrice - i.cost) / i.salePrice * 100;
	  };

	  var calcFreightTotals = function calcFreightTotals() {
	    var freight = $scope.quote.quoteData.freight;
	    var items = freight.items;

	    var totalCosts = items.reduce(function (prev, cur) {
	      return prev + cur.cost;
	    }, 0);
	    var totalSalePrice = items.reduce(function (prev, cur) {
	      return prev + cur.salePrice;
	    }, 0);

	    freight.totalCost = totalCosts;
	    freight.totalSalePrice = totalSalePrice;
	    freight.totalGM = 100 * (totalSalePrice - totalCosts) / totalSalePrice;

	    $scope.calculateTotal();
	  };

	  // Function activated when the Add Freight button is pressed.
	  // It basically adds the information to the live Freight JSON object, making it appear on the UI.
	  // Then, the newFreight object is reset to clear all the New Freight Row fields on the UI.
	  // e: Event object.
	  this.addFreight = function (data) {
	    var f = $scope.newFreight;
	    if (data) {
	      f.focusCarrier = true;
	      $.extend(f, (0, _models.extractFreightData)(data));
	    } else {
	      f.focusDesc = true;
	    }

	    $scope.quote.quoteData.freight.items.push(angular.copy($scope.newFreight));
	    $scope.newFreight = (0, _models.getNewFreight)();
	    calcFreightTotals();
	    $("#selNewItemFreight").trigger("clear.ajaxInput");
	    $scope.$emit('doSave.DACO');
	    setTimeout(function () {
	      return $scope.$digest();
	    }, 100);
	  };

	  // Functions to calculate the fields in the Freight table.

	  this.freightCostChanged = function (item) {
	    item.salePrice = calcFreightSalePrice(item);
	    calcFreightTotals();
	  };

	  this.freightSalePriceChanged = function (item) {
	    item.grossMargin = calcFreightGM(item);
	    item.checkError = (0, _utils.isGrossMarginOk)(item.grossMargin);
	    calcFreightTotals();
	  };

	  this.freightGMChanged = function (item) {
	    item.checkError = (0, _utils.isGrossMarginOk)(item.grossMargin);
	    item.salePrice = calcFreightSalePrice(item);
	    calcFreightTotals();
	  };

	  //////////////////////////////////////////////////////////////////////////
	  // Section: event handlers

	  // Event to identify when a new freight is selected
	  this.onBlurCarrier = function (item) {
	    if (item.carrier.replace(/\s+/gi, '') != '') _this.addFreight();
	  };

	  this.onBlurGM = function (i) {
	    i.grossMargin = Number(i.grossMargin);
	    if (i.itemNum) {
	      i.checkError = !(0, _utils.isGrossMarginOk)(i.grossMargin);
	      _this.freightGMChanged(i);
	      $scope.$emit('doSave.DACO');
	    }
	  };

	  //////////////////////////////////////////////////////////////////////////

	  // Dropdown item selection
	  $(document).on("select2:select", '#selNewItemFreight', function (e) {
	    if (!(e.params && e.params.data)) return;
	    _this.addFreight(e.params.data);
	  });
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _config = __webpack_require__(11);

	var _models = __webpack_require__(14);

	var _utils = __webpack_require__(15);

	_config.App.controller('quoteItemsCtrl', ['$scope', quoteItemController]);

	function quoteItemController($scope) {
	  var _this = this;

	  this.newItem = (0, _models.getNewItem)();

	  //////////////////////////////////////////////////////////////////////////////
	  // Functions being called when calculating fields in the Quote Items table.


	  var calcTotalSellPrice = function calcTotalSellPrice(i) {
	    return i.qty * i.unitSellPrice;
	  };

	  var calcGM = function calcGM(i) {
	    return (i.unitSellPrice - i.unitCost) / i.unitSellPrice * 100;
	  };

	  var calcSellPrice = function calcSellPrice(i) {
	    return i.unitCost / (1 - i.grossMargin / 100);
	  };

	  //////////////////////////////////////////////////////////////////////////////
	  // Recalculate totals for all items

	  var calcTotals = function calcTotals() {
	    var items = $scope.quote.quoteData.items;
	    var totalNetCost = items.reduce(function (prev, cur) {
	      return prev + cur.totalNetCost;
	    }, 0);
	    var totalUnitSellPrice = items.reduce(function (prev, cur) {
	      return prev + cur.unitSellPrice;
	    }, 0);
	    var totalSellPrice = items.reduce(function (prev, cur) {
	      return prev + cur.totalSellPrice;
	    }, 0);

	    // If we have a Total Net Cost, an Unit Sell Price or a Total Sell Price in the new Item,
	    // add them to the total.
	    if (_this.newItem.totalNetCost) totalNetCost += _this.newItem.totalNetCost;

	    if (_this.newItem.unitSellPrice) totalUnitSellPrice += _this.newItem.unitSellPrice;

	    if (_this.newItem.totalNetCost) totalSellPrice += _this.newItem.totalSellPrice;

	    var totals = $scope.quote.quoteData.totals;
	    totals.totalNetCost = totalNetCost;
	    totals.totalUnitSellPrice = totalUnitSellPrice;
	    totals.totalSellPrice = totalSellPrice;

	    totals.totalGM = 100 * ((totalSellPrice - totalNetCost) / totalSellPrice);

	    $scope.calculateTotal();
	  };

	  var calcTotalShipWeight = function calcTotalShipWeight() {
	    var items = $scope.quote.quoteData.items;
	    var totals = $scope.quote.quoteData.totals;
	    var sum = items.reduce(function (prev, cur) {
	      return prev + (cur.totalShipWeight || 0);
	    }, 0);
	    totals.totalShipWeight = sum;
	  };

	  //////////////////////////////////////////////////////////////////////////////
	  // EVENTS: NG-CHANGE ON PRODUCT ITEMS : START
	  //////////////////////////////////////////////////////////////////////////////

	  this.quantityChanged = function (i) {
	    if (!(0, _utils.isUnsigned)(i.qty)) return;

	    // Calculate unit sell price only if product is not custom
	    if (i.itemNum) {
	      var maybeUnitSellPrice = (0, _models.getSellPrice)(i, $scope.quote.quoteData.billTo.priceLevel);
	      if (maybeUnitSellPrice && i.unitSellPrice != maybeUnitSellPrice) {
	        i.unitSellPrice = maybeUnitSellPrice;
	        i.grossMargin = calcGM(i);
	        if (i.itemNum) i.checkError = !(0, _utils.isGrossMarginOk)(i);
	      }
	    }

	    i.totalShipWeight = i.qty * i.shipWeight;
	    i.totalNetCost = i.qty * i.unitCost;
	    i.totalSellPrice = calcTotalSellPrice(i);

	    calcTotals();
	    calcTotalShipWeight();
	  };

	  this.unitCostChanged = function (i) {
	    if (i.unitCost == null) return;
	    i.totalNetCost = i.qty * i.unitCost;
	    i.unitSellPrice = calcSellPrice(i);
	    i.totalSellPrice = calcTotalSellPrice(i);
	    calcTotals();
	  };

	  this.totalNetCostChanged = function (i) {
	    i.unitCost = i.totalNetCost / i.qty;
	    i.unitSellPrice = calcSellPrice(i);
	    i.totalSellPrice = calcTotalSellPrice(i);
	    calcTotals();
	  };

	  this.grossMarginChanged = function (i) {
	    if (i.itemNum) i.checkError = !(0, _utils.isGrossMarginOk)(i);
	    i.unitSellPrice = calcSellPrice(i);
	    i.totalSellPrice = calcTotalSellPrice(i);
	    calcTotals();
	  };

	  this.unitSellPriceChanged = function (i) {
	    i.grossMargin = calcGM(i);
	    if (i.itemNum) i.checkError = !(0, _utils.isGrossMarginOk)(i);
	    i.totalSellPrice = calcTotalSellPrice(i);
	    calcTotals();
	  };

	  this.totalSellPriceChanged = function (i) {
	    i.unitSellPrice = i.totalSellPrice / i.qty;
	    i.grossMargin = calcGM(i);
	    if (i.itemNum) i.checkError = !(0, _utils.isGrossMarginOk)(i);
	    calcTotals();
	  };

	  this.totalShipWeightChanged = function (i) {

	    /*
	     * Ship weight is not supposed to change.
	     * Although, for custom items, their is no per-unit
	     * ship weight. Therefore, we calculate the intended
	     * ship weight from the totalShipWeight field, which
	     * is editable by the user.
	     */
	    if (!i.itemNum) i.shipWeight = i.totalShipWeight / i.qty;

	    calcTotalShipWeight();
	  };

	  //////////////////////////////////////////////////////////////////////////////
	  // EVENTS: NG-BLUR ON PRODUCT ITEMS : START
	  //////////////////////////////////////////////////////////////////////////////

	  this.onBlurQty = function (i) {
	    if (!(0, _utils.isUnsigned)(i.qty)) i.qty = 1;
	  };

	  this.onBlurUnitCost = function (i) {
	    if (i.unitCost && isNaN(i.unitCost)) {
	      i.unitCost = 0;
	      _this.unitCostChanged(i);
	    }
	  };

	  this.onBlurGM = function (i) {
	    i.checkError = !(0, _utils.isGrossMarginOk)(i);
	    _this.grossMarginChanged(i);
	  };

	  // Event to identify when a new product is created
	  this.onBlurNewItemDescription = function (e) {
	    if (_this.newItem.itemDescription.replace(/\s+/gi, '') != '') _this.addItem();
	  };

	  //////////////////////////////////////////////////////////////////////////////

	  // Adds the this.newItem object to the items' list.
	  // If no data is passed, it means we are creating a custom item.
	  this.addItem = function (data) {
	    var i = _this.newItem;

	    if (data) {
	      $.extend(i, (0, _models.extractItemData)(data));

	      // If there is a default sellPrice, use it and calculate the
	      // gross margin based on that. Otherwise, set GM to 35 and
	      // calculate sellPrice based on it.
	      var sellPrice = (0, _models.getSellPrice)(i, $scope.quote.quoteData.billTo.priceLevel);
	      if (sellPrice) {
	        i.unitSellPrice = sellPrice;
	        i.grossMargin = calcGM(i);
	      } else {
	        i.grossMargin = 35.0;
	        i.unitSellPrice = calcSellPrice(i);
	      }

	      i.totalNetCost = i.qty * i.unitCost;
	      i.totalSellPrice = i.qty * i.unitSellPrice;
	      i.totalShipWeight = i.qty * i.shipWeight;

	      i.focusDesc = true;
	    } else {
	      i.focusVendor = true;
	    }

	    $scope.quote.quoteData.items.push(angular.copy(i));

	    _this.newItem = (0, _models.getNewItem)();

	    calcTotals();

	    $scope.$emit('doSave.DACO');
	    $scope.$digest();
	  };

	  // @param {} idx Index of the object corresponding to the pressed button.
	  this.deleteItem = function (idx) {
	    $scope.quote.quoteData.items.splice(idx, 1);
	    calcTotals();
	    calcTotalShipWeight();
	    $scope.$emit('doSave.DACO');
	  };

	  this.deleteAllItem = function () {
	    if (!confirm("Are you sure you want to delete all items?")) return;
	    $scope.quote.quoteData.items = [];
	    calcTotals();
	    calcTotalShipWeight();
	    $scope.$emit('doSave.DACO');
	  };

	  $scope.$on('projectItemAdd.DACO', function (e, arrAddedProjectItems) {
	    for (var idx in arrAddedProjectItems) {
	      _this.newItem = (0, _models.getNewItem)();
	      _this.newItem.itemDescription = 'Project : ' + arrAddedProjectItems[idx];
	      _this.addItem();
	    }
	  });

	  //////////////////////////////////////////////////////////////////////////////

	  // Dropdown item selection
	  $(document).on("select2:select", '#selNewItem', function (e) {
	    if (e.params && e.params.data) _this.addItem(e.params.data);
	    $("#selNewItem").trigger("clear.ajaxInput");
	  });

	  window.qi = this;
	}

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';

	var app = angular.module('quoteApp');
	app.directive('ajaxSearchInput', ajaxSearchInputDirective);
	app.directive('ajaxSelect', ajaxSelectDirective);

	function addColorDot(sel) {
	  var text = sel.text;
	  var colors = /-(RED|BLUE?|YELLOW|YEL|GREEN|GRN|BLACK|BLK|WHITE|WHT|ORANGE|ORG|PURPLE|GRA?Y|PINK|TEA|orange)/;
	  var matches = text.match(colors);
	  var dot = '<i class="dot invisible"></i>';
	  if (matches) dot = '<i class="dot" ' + matches[1] + '></i>';
	  text = dot + text;

	  var qty_pattern = '(Qty.: 0)';
	  if (~text.indexOf(qty_pattern)) text = text.replace(qty_pattern, '(Qty.: <span style="color: red;">0</span>)');

	  return text;
	}

	ajaxSearchInputDirective.$inject = ['$parse'];
	function ajaxSearchInputDirective($parse) {
	  var definition = {
	    template: '<select></select>',
	    replace: true,
	    restrict: 'E',
	    require: 'ngModel',
	    scope: {
	      id: '@',
	      url: '@',
	      itemClass: '@',
	      containerClass: '@',
	      dropdownClass: '@',
	      selectedText: '=',
	      textAttr: '@',
	      queryParamName: '@',
	      queryParam: '&?',
	      selectItem: '&?',
	      minimumInputLength: '@'
	    },
	    link: link
	  };

	  function link(_scope, elt, attr, ngModel) {
	    var _this = this;

	    var paramsFor = function paramsFor(param) {
	      if (_scope.queryParam) {
	        var ret = $parse(_scope.queryParam)(_scope, param);
	        ret.q = param.term;
	        return ret;
	      } else {
	        var d = {};
	        d[_scope.queryParamName || 'q'] = param.term;
	        return d;
	      }
	    };

	    var selectOptions = {
	      minimumInputLength: _scope.minimumInputLength || 3,
	      dropdownParent: elt.parent(),
	      escapeMarkup: function escapeMarkup(m) {
	        return m;
	      },
	      id: function id(v) {
	        return v.id;
	      },
	      ajax: {
	        processResults: function processResults(d) {
	          return d;
	        },
	        url: _scope.url,
	        delay: 100,
	        dataType: 'json',
	        data: paramsFor
	      }
	    };

	    if (elt.attr('color-dot') != undefined) selectOptions.templateResult = addColorDot;

	    if (_scope.itemClass) elt.addClass(_scope.itemClass);

	    // Fill the selected item if there is one
	    if (!ngModel.$isEmpty(ngModel.$modelValue)) {
	      elt.append($('<option/>').attr('value', ngModel.$modelValue).text(_scope.selectedText));
	    }

	    if (_scope.id) elt.attr('id', _scope.id);

	    //////////////////////////////////////
	    // Initialize Select2

	    elt.select2(selectOptions);

	    if (_scope.containerClass) elt.data('select2').$container.addClass(_scope.containerClass);
	    if (_scope.dropdownClass) elt.data('select2').$dropdown.addClass(_scope.dropdownClass);

	    //////////////////////////////////////
	    // Events

	    elt.on('select2:select', function (e) {
	      var opt = elt.find('option:selected');
	      var text = opt.text() || '';
	      if ('selectedText' in _scope && _scope.selectedText) _scope.selectedText = text;
	      if (_scope.selectItem) _scope.selectItem(e);
	      _scope.$apply();
	    });

	    elt.on('clear.ajaxInput', function () {
	      elt.data('select2').$selection.find('.select2-selection__rendered').text('');
	      if ('selectedText' in _scope) _scope.selectedText = '';
	      elt.select2('destroy').select2(selectOptions);
	    });

	    if (attr.openOnFocus) {
	      elt.data('select2').listeners['*'].push(function (name) {
	        if (name == 'focus') {
	          $(_this.$element).select2('open');
	        }
	      });
	    }
	  }

	  return definition;
	}

	ajaxSelectDirective.$inject = ['$http'];
	function ajaxSelectDirective($http) {
	  var definition = {
	    replace: true,
	    restrict: 'A',
	    require: 'ngModel',
	    scope: {
	      id: '@',
	      url: '@',
	      selectedText: '=',
	      selectedValue: '=',
	      itemClass: '@',
	      containerClass: '@',
	      dropdownClass: '@',
	      minimumInputLength: '@'
	    },
	    link: link
	  };
	  function link(_scope, elt, attr, ngModel) {
	    if (_scope.itemClass != '') elt.addClass(_scope.itemClass);

	    if (_scope.id) elt.attr('id', _scope.id);

	    //////////////////////////////////////
	    // Initialize Select2 after Initial selection

	    var results = [];
	    var initialSelectionWatch;

	    function receiveData(data) {
	      results = data.data.results;
	      initialSelectionWatch = _scope.$watch(function () {
	        return ngModel.$modelValue;
	      }, initialize);
	    }

	    function initialize() {
	      var _this2 = this;

	      var selectOptions = {
	        minimumInputLength: _scope.minimumInputLength || 0,
	        dropdownParent: elt.parent(),
	        width: 'resolve',
	        data: results
	      };

	      elt.find('option').remove();
	      elt.select2(selectOptions);

	      if (!ngModel.$isEmpty(ngModel.$modelValue)) elt.val(ngModel.$modelValue);

	      if (_scope.selectedText) elt.data('select2').$selection.find('.select2-selection__rendered').text(_scope.selectedText);

	      // Set classes to the Select2 elements
	      if (_scope.containerClass) elt.data('select2').$container.addClass(_scope.containerClass);
	      if (_scope.dropdownClass) elt.data('select2').$dropdown.addClass(_scope.dropdownClass);

	      //////////////////////////////////////
	      // Events
	      elt.on('select2:select', function () {
	        var el = elt.find('option:selected');
	        _scope.selectedText = el.text();
	        _scope.$apply();
	      });

	      elt.on('clear.ajaxInput', function () {
	        elt.data('select2').$selection.find('.select2-selection__rendered').text('');
	        _scope.selectedText = '';
	        _scope.$apply();
	      });

	      elt.on('selectText.ajaxInput', function (e, text, fnCompare) {
	        fnCompare = fnCompare || function () {
	          return $(_this2).html() == text;
	        };
	        var el = elt.find('option').filter(fnCompare);
	        if (el.length > 0) {
	          ngModel.$modelValue = el.val();
	          _scope.selectedText = el.text();
	          elt.data('select2').$selection.find('.select2-selection__rendered').text(el.text());
	        }
	        debugger;
	      });

	      setTimeout(function () {
	        return _scope.$apply();
	      }, 10);

	      initialSelectionWatch();
	    }

	    // Load data from URL
	    $http.get(_scope.url).then(receiveData);
	  }
	  return definition;
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _config = __webpack_require__(11);

	_config.App.directive('dacoCurrency', CurrencyDirective);

	function CurrencyDirective() {
	  return {
	    require: 'ngModel',
	    restrict: 'A',
	    link: function link($scope, el, attrs, ngModelCtrl) {
	      var nbFractionDigitsMin = 2,
	          nbFractionDigitsMax = 2;
	      el.css({ 'text-align': 'right' });

	      if (attrs.nbDigits && attrs.nbDigits >= 0 && attrs.nbDigits <= 8) {
	        nbFractionDigitsMin = nbFractionDigitsMax = Number(attrs.nbDigits);
	      }
	      if (attrs.nbDigitsMin && attrs.nbDigitsMin >= 0 && attrs.nbDigitsMin <= 8) {
	        nbFractionDigitsMin = Number(attrs.nbDigitsMin);
	      }
	      if (attrs.nbDigitsMax && attrs.nbDigitsMax >= 0 && attrs.nbDigitsMax <= 8) {
	        nbFractionDigitsMax = Number(attrs.nbDigitsMax);
	      }

	      var formatNumber = function formatNumber(val) {
	        var num = Number(val);
	        if (isNaN(num)) num = 0;
	        var res = num.toLocaleString('en-US', {
	          minimumFractionDigits: nbFractionDigitsMin,
	          maximumFractionDigits: nbFractionDigitsMax
	        });

	        return res;
	      };

	      var parseNumber = function parseNumber(val) {
	        if (!val || typeof val != 'string') return 0;
	        return Number(val.replace(/\s/g, '').replace(/\,/, '.'));
	      };

	      ngModelCtrl.$formatters.push(formatNumber);
	      ngModelCtrl.$parsers.push(parseNumber);

	      el.on('keydown', function (e) {
	        // Allow: backspace, delete, tab, escape, enter and .
	        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 || e.keyCode == 65 && e.ctrlKey === true || // Allow: Ctrl+A
	        e.keyCode == 67 && e.ctrlKey === true || // Allow: Ctrl+C
	        e.keyCode == 88 && e.ctrlKey === true || // Allow: Ctrl+X
	        e.keyCode >= 35 && e.keyCode <= 39) {
	          // Allow: home, end, left, right
	          return; // let it happen, don't do anything
	        }
	        // Ensure that it is a number and stop the keypress
	        if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
	          e.preventDefault();
	        }
	      });

	      el.on('change.DACO', function () {
	        var nVal = parseNumber(el.val());
	        nVal = formatNumber(nVal);

	        el.val(nVal);
	        ngModelCtrl.$viewValue = nVal;
	      });
	    }
	  };
	}

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	angular.module('quoteApp').directive('focusItem', ['$timeout', focusItem]);

	function focusItem($timeout) {
	  var checkDirectivePrerequisites = function checkDirectivePrerequisites(attrs) {
	    if (!attrs.focusItem && attrs.focusItem != "") {
	      throw "focusItem missing attribute to evaluate";
	    }
	  };
	  var link = function link(scope, element, attrs, ctrls) {
	    checkDirectivePrerequisites(attrs);
	    scope.$watch(attrs.focusItem, function (currentValue, lastValue) {
	      if (currentValue == true) {
	        $timeout(function () {
	          element.focus();
	          scope[attrs.focusItem] = false;
	        });
	      }
	    });
	  };
	  return {
	    restrict: "A",
	    link: link
	  };
	}

/***/ }
/******/ ]);