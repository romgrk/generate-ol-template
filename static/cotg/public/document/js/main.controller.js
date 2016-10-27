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
/***/ function(module, exports) {

	'use strict';

	// TODO :
	// - Add a warning when going over the shipped quantity

	angular.module('dacoApp', []);
	angular.module('dacoApp').controller('mainCtrl', ['$scope', mainController]);

	function getOrderData() {
	  var data = localStorage.getItem('order');
	  if (!data) data = decodeURIComponent($('#orderData').val());

	  var o = JSON.parse(data);

	  o.items.forEach(function (i) {
	    i.qtyOrdered = parseInt(i.qtyOrdered);
	    i.qtyShipped = parseInt(i.qtyShipped);
	    i.qtyPicked = parseInt(i.qtyPicked);
	    i.qtyBO = parseInt(i.qtyBO);
	    console.log(i);
	  });

	  if (!o.shipmentDetails) o.shipmentDetails = [];

	  return o;
	}

	function mainController($scope) {
	  var _this = this;

	  var VM = this;

	  // Order data, barcode info.
	  VM.order = getOrderData();

	  // Update an item's quantity
	  VM.updateItemQuantity = function (item) {
	    if (!isNaN(item.qtyPicked)) item.qtyBO = item.qtyShipped - item.qtyPicked;
	  };

	  VM.hasBackOrders = function () {
	    return VM.order.items.reduce(function (prev, cur) {
	      return prev || (cur.qtyBO ? true : false);
	    }, false);
	  };

	  // Display the total weight
	  VM.totalWeight = function () {
	    return VM.order.items.reduce(function (prev, cur) {
	      prev + cur.WTS * (cur.qtyPicked || 0);
	    }, 0);
	  };

	  // Display the total value
	  VM.totalValue = function () {
	    return VM.order.items.reduce(function (prev, cur) {
	      prev + cur.WTS * (cur.itemDeclaredValue || 0);
	    }, 0);
	  };

	  // Display the total cube size. (Length * Width * Height / 1728)
	  VM.totalCubeSize = function () {
	    return VM.order.shipmentDetails.reduce(function (prev, cur) {
	      return prev + cur.L * cur.W * cur.H / 1728;
	    }, 0);
	  };

	  // Display the total pallet weight
	  VM.totalPalletWeight = function () {
	    return VM.order.shipmentDetails.reduce(function (prev, cur) {
	      return prev + cur.Weight;
	    }, 0);
	  };

	  // Add shipment detail
	  VM.addShipmentDetail = function () {
	    return VM.order.shipmentDetails.push({ detail: '', L: 0, W: 0, H: 0, Weight: 0, image: '' });
	  };

	  // Delete shipment detail.
	  VM.deleteShipmentDetail = function (index) {
	    return VM.order.shipmentDetails.splice(index, 1);
	  };

	  // Remove last shipment detail
	  VM.removeLastShipmentDetail = function () {
	    return VM.order.shipmentDetails.pop();
	  };

	  // Force correct button.
	  VM.sendToCorrection = function () {
	    VM.order.hasError = true;
	    $('#orderData').val(JSON.stringify(VM.order));
	    $("#mainform").submit();
	  };

	  VM.onClickPicture = function (shipDetailIndex) {
	    //Check origin of request
	    if (typeof shipDetailIndex === 'string') {
	      VM.pictureTarget = shipDetailIndex;
	      VM.index = null;
	    } else {
	      VM.pictureTarget = 'palletPicture' + shipDetailIndex;
	      VM.index = shipDetailIndex;
	    }
	    //Call picture button
	    capturePhoto();
	  };

	  // Save data
	  $scope.$watch(function () {
	    return _this.order;
	  }, function (next, prev) {
	    var data = JSON.stringify(next);
	    localStorage.setItem('order', data);
	    $('#orderData').val(data);
	    console.log('saved');
	  }, true);

	  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	  //>>> CAPTURE PICTURE
	  //>>> reference: https://cordova.apache.org/docs/fr/3.1.0/cordova/camera/camera.getPicture.html
	  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	  var pictureSource; // picture source
	  var destinationType; // sets the format of returned value

	  // Wait for device API libraries to load
	  document.addEventListener("deviceready", onDeviceReady, false);

	  // Device APIs are available
	  function onDeviceReady() {
	    pictureSource = navigator.camera.PictureSourceType;
	    destinationType = navigator.camera.DestinationType;
	  }

	  // Set a promise to capture image
	  function capturePhoto() {
	    // Take picture using device camera and retrieve image as base64-encoded string
	    navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50,
	      destinationType: destinationType.DATA_URL });
	  }

	  // Called when a photo is successfully retrieved
	  function onPhotoDataSuccess(imageData) {
	    // Save image inside Global Variable, to be used before send
	    //Create picture inside JSON
	    var IMAGE_DATA = 'data:image/jpeg;base64,' + imageData;

	    if (VM.index == null) {
	      VM.order[VM.pictureTarget] = VM.pictureTarget + '-' + VM.order.orderNumber;
	      $('#' + VM.pictureTarget).val(IMAGE_DATA);
	    } else {
	      VM.order.shipmentDetails[Number(VM.index)].image = VM.pictureTarget + '-' + VM.order.orderNumber;
	      $('#palletPicture' + VM.index).val(IMAGE_DATA);
	    }

	    //Show the picture on the COTG
	    $scope.$apply(function () {
	      return $('#' + VM.pictureTarget + '_picture').attr("src", IMAGE_DATA);
	    });
	  }

	  // Called if something bad happens.
	  function onFail(message) {
	    alert('Failed because: ' + message);
	  }

	  //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

	  window.vm = this;
	}

/***/ }
/******/ ]);
