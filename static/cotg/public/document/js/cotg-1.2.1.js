/*! Capture OnTheGo v1.2.1 | (c) 2016 Objectif Lune, Inc. */

function initCOTG($) {

	// Capture OnTheGo includes the whole set of Cordova's official plugins plus
	// following plugins:
	// - Date-picker plugin
	// - Its own plugin to handle hand drawing (graphic annotations and
	// signatures).

	/***************************************************************************
	 * Date picker See
	 * https://github.com/VitaliiBlagodir/cordova-plugin-datepicker
	 */
	function DatePicker($element) {
		var that = this;
		that.object = $element;

		if (that.object.is('input') && that.object.attr('role') === 'cotg.DatePicker') {
			// A plain input field with the datepicker role
			that.isoDateInput = that.object;
			that.trigger = that.isoDateInput;
			that.formattedDateInput = $();
		} else if ($('[role=trigger]', that.object).length > 0) {
			that.isoDateInput = $('[role=date-data]', that.object);
			if (that.isoDateInput.length == 0) {
				that.isoDateInput = $('[role=date]', that.object);
				that.formattedDateInput = $();
			} else {
				that.formattedDateInput = $('[role=date]', that.object);
			}
			that.trigger = $('[role=trigger]', that.object);
		} else {
			// Formatted date is shown, raw date is submitted via hidden
			that.isoDateInput = $('[role=date-data]', that.object);
			that.formattedDateInput = $('[role=date]', that.object);
			that.trigger = that.formattedDateInput;
		}

		that.isoDateInput.prop("readonly", true);
		that.formattedDateInput.prop("readonly", true);
		
		function generateISODateString(date) {
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
		
		// Bind an event handler to the "click" JavaScript event.
		that.trigger.click(function() {

			function showDatePicker(oldDate) {
				navigator.datePicker.show({
					date : oldDate,
					mode : 'date'
				}, function(date) {
					if (date !== undefined) {
						that.isoDateInput.val(generateISODateString(date));
	
						navigator.globalization.dateToString(date, function(date) {
							that.formattedDateInput.val(date.value);
						}, null, {
							formatLength : 'short',
							selector : 'date'
						});
					}
				});
			}

			var timeStamp = Date.parse(that.isoDateInput.val());
			if (isNaN(timeStamp)) {
				showDatePicker(new Date());
			} else {
				var parts = that.isoDateInput.val().split("-");
				//var utcTimestamp = Date.UTC(parts[0], Number(parts[1]) - 1, parts[2]);
				var date = new Date(parts[0], Number(parts[1]) - 1, parts[2]);
				//var date = new Date(utcTimestamp);
				showDatePicker(date);
			}
		});
	}

	DatePicker.init = function ($element) {
		$('[role="cotg.DatePicker"]', $element).each(function() {
			widgets.push(new DatePicker($(this)));
		});
		$("[role='cotg.DatePicker']", $element).parents("label").click(function(event) {
			event.preventDefault();
		});
	};

	/***************************************************************************
	 * Time picker See
	 * https://github.com/VitaliiBlagodir/cordova-plugin-datepicker
	 */
	function TimePicker($element) {
		var that = this;
		that.object = $element;

		if (that.object.is('input') && that.object.attr('role') === 'cotg.TimePicker') {
			// A plain input field with the timepicker role
			that.timeElem = that.object;
			that.timeDataElem = that.object;
			that.trigger = that.object;
		} else if ($('[role=trigger]', that.object).length) {
			that.trigger = $('[role=trigger]', that.object);
			that.timeElem = $('[role=time]', that.object);
			that.timeDataElem = $('[role=time-data]', that.object);
		} else {
			// Formatted time is shown, raw time is submitted via hidden
			that.timeElem = $('[role=time]', that.object);
			that.trigger = that.timeElem;
			that.timeDataElem = $('[role=time-data]', that.object);
		}

		that.timeElem.prop("readonly", true);

		// Bind an event handler to the "click" JavaScript event.
		that.trigger.click(function() {
			function showDatePicker(oldTime) {
				navigator.datePicker.show({
					date : oldTime,
					mode : 'time'
				}, function(date) {
					if (date !== undefined) {
						that.timeElem.val(date.toLocaleTimeString());
						navigator.globalization.dateToString(date, function(date) {
							that.timeDataElem.val(date.value);
						}, null, {
							formatLength : 'short',
							selector : 'time'
						});
					}
				});
			}

			var d = that.timeDataElem.val();
			navigator.globalization.stringToDate(d, function(date) { // if
				// success
				var t = new Date();
				t.setHours(date.hour);
				t.setMinutes(date.minute);
				t.setMinutes(date.minute);
				showDatePicker(t);
			}, function() { // if error
				showDatePicker(new Date());
			}, {
				formatLength : 'short',
				selector : 'time'
			});
		});
	}

	TimePicker.init = function ($element) {
		$('[role="cotg.TimePicker"]').each(function() {
			widgets.push(new TimePicker($(this)));
		});
	};

	// /////////////// Image and hand-drawing capture
	// //////////////////////////////////

	// Initialize some useful flags
	var browserSupportsSvg = !!document.createElementNS
			&& !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;

	/***************************************************************************
	 * Capture/pick a picture from camera/photo library. See
	 * https://github.com/apache/cordova-plugin-camera/blob/master/doc/index.md
	 */
	// Create some helper classes and functions to reuse code.
	// For user photo
	// Cropping works well only from 5.3+
	function PhotoWidget($element) {
		var that = this;
		that.object = $element;
		that.onChangeListener = null;
		that.params = "";

		if (that.object.attr('data-params')) {
			that.params = JSON.parse(that.object.attr('data-params'));
		}
		
		that.imgElem = $('[role=photo]', that.object);
		that.imgDataElem = $('[role=photo-data]', that.object);
		that.takeButton = $('[role=take-button]', that.object);
		that.pickButton = $('[role=pick-button]', that.object);
		that.clearButton = $('[role=clear-button]', that.object);
		that.descElem = $('[role=photo-info]', that.object);
		
		that.imgElem.hide();
		
		if (that.params.allowannotations) {
			that.noteOnImage = new NoteOnImage($element);
			widgets.push(that.noteOnImage);

			// For backwards compatibility see SHARED-46029:
			$('[role=control-wrapper]', that.object).css("position", "relative");
		}

		if (that.clearButton != null) {
			that.clearButton.click(function() {
				that.clear();
				if (that.onChangeListener != null) {
					that.onChangeListener();
				}
			});
			that.clearButton.hide();
		}

		function getPicture(fromLibrary) {
			// Get the parameters
			var imgWidth;
			var imgHeight;
			if (that.params.scaleimage === true && (that.params.width || that.params.height)) {
				imgWidth = that.params.width;
				imgHeight = that.params.height;
			}

			var encodingtype;
			var format;
			if (that.params.encodingtype === 'png') {
				encodingtype = Camera.EncodingType.PNG;
				format = ".png";
			} else {
				encodingtype = Camera.EncodingType.JPEG
				format = ".jpg";
			}

			var imgQuality = that.params.quality;
			var editimage = that.params.editimage; // allow iOS users to rotate
			// and crop

			navigator.camera.getPicture(function(data) { // on success
				that.imgElem.prop('src', data);
				that.imgElem.show();
				that.object.addClass('captured');
				that.imgDataElem.val(data);
				// If we were using DestinationType.DATA_URL
				// below, it should be img.src =
				// "data:image/jpeg;base64," + data;
				// instead, but DATA_URL may cause memory issue
				// as the image can be quite big.

				if (that.clearButton != null) {
					that.clearButton.show();
				}

				if (that.onChangeListener != null) {
					that.onChangeListener();
				}

				if (that.noteOnImage) {
					that.noteOnImage.bindToImage(false);					
				}
				
				// Some debug info
				if (that.descElem.length) {
					that.descElem.html('Source: ' + (fromLibrary ? 'library' : 'camera') + ', Format: ' + format
							+ ', Quality: ' + imgQuality + '<br />' + 'Width: ' + imgWidth + ' px, Height: '
							+ imgHeight + ' px');
				}
			}, function(e) { // on error
				// do nothing is fine
			}, { // options
				sourceType : (fromLibrary ? Camera.PictureSourceType.PHOTOLIBRARY : Camera.PictureSourceType.CAMERA),
				allowEdit : editimage,
				targetWidth : imgWidth,
				targetHeight : imgHeight,
				encodingType : encodingtype,
				quality : imgQuality,
				destinationType : Camera.DestinationType.FILE_URI,
				correctOrientation : true
			}
			// Note that on Android, the option saveToAlbum is not
			// supported and allowEdit IS supported, contrary to what
			// what is described
			// in documentation web page.
			);
		}

		if (that.params.source === 'take' || that.params.source === 'takeandpick'
				|| that.params.source === undefined) {
			that.takeButton.click(function() {
				getPicture(false)
			});
		} else {
			that.takeButton.remove();
		}

		if (that.params.source === 'pick' || that.params.source === 'takeandpick'
				|| that.params.source === undefined) {
			that.pickButton.click(function() {
				getPicture(true)
			});
		} else {
			that.pickButton.remove();
		}

	}

	PhotoWidget.init = function($element) {
		$('[role="cotg.PhotoWidget"]', $element).each(function() {
			$('[role="photo"]', $(this)).attr('src', '');
			$('[role=photo-info]', $(this)).html('');
			widgets.push(new PhotoWidget($(this)));
		});

		$("[role='cotg.PhotoWidget']", $element).parents("label").click(function(event) {
			event.preventDefault();
		});
	};

	PhotoWidget.prototype.restore = function(state) {
		var that = this;
		var imgSrc = state[that.object.attr('id')];
		if (!!imgSrc) {
			that.imgDataElem.val(imgSrc);
			that.imgElem.prop('src', imgSrc);
			that.imgElem.show();
			if (that.clearButton != null) {
				that.clearButton.show();
			}
		}
	};

	PhotoWidget.prototype.save = function(state) {
		// our img element source is set dynamically but not saved (the hidden
		// data is but not the img element), thus we will keep it and reload
		// later.
		var that = this;
		if (that.imgElem.is(':visible')) {
			state[that.object.attr('id')] = that.imgElem.prop('src');
		}
	};

	PhotoWidget.prototype.clear = function() {
		var that = this;
		that.imgElem.prop('src', '');
		that.imgElem.hide();
		that.imgDataElem.val('');
		that.descElem.html('');
		
		if (that.clearButton != null) {
			that.clearButton.hide();
		}
		if (that.noteOnImage) {
			that.noteOnImage.clear();
		}
	};

	PhotoWidget.prototype.setOnChangeListener = function(f) {
		var that = this;
		that.onChangeListener = f;
	}
	
	/***************************************************************************
	 * Capture OnTheGo adds a plugin, HandDrawTool allows capture free-hand
	 * drawing. It works in two modes: signature and annotation.
	 * 
	 * We have the object 'navigator.handDrawTool' with following methods:
	 * 
	 * function record(callback, options);
	 * 
	 * Show the capture widget. 'callback' is a callback that will receive
	 * object that encapsulates graphic data. To get SVG data, call getSVG() by
	 * passing the object we get here as 'graphicData'. In the case where
	 * browser does not support SVG (a HTML5 feature), call drawInContext() to
	 * draw the image on a canvas (still a HTML5 feature but more widely
	 * supported).
	 * 
	 * 'options' is an object which can contain following: mode: The capture
	 * mode, 'signature' or 'annotation'. Default is 'annotation'. width: The
	 * width of capture area. Default is 100 pixels. See note below. height: The
	 * height of capture area. Default is 1/5 of the width. See note below.
	 * edit: An object returned to the success callback of previous call of
	 * record(), if you want to edit old data. background: An URL to an image
	 * used as background. The image will be stretched to full the capture area.
	 * 
	 * Note that the provided width and height in options are used to calculate
	 * the capture area size ratio only. The capture area will expand as wide as
	 * it can while keep the height so that the given ratio is respected.
	 * 
	 * ---------
	 * 
	 * function getSVG(graphicData, width, height)
	 * 
	 * Convert graphic data returned by record() to SVG. The width and the
	 * height is the size of SVG element. The original graphic is scaled to fill
	 * this dimension.
	 * 
	 * ---------
	 * 
	 * function drawInContext(context, graphicData, width, height)
	 * 
	 * Draw graphic data returned by record() into a canvas. The width and the
	 * height is the size of the canvas. The original graphic is scaled to fill
	 * this dimension.
	 */

	// A helper class to manage annotation on top of an image.
	//
	// Is called from NoteOnImage.init() but also from the PhotoWidget() constructor when
	// that annotations are enabled for that widget
	function NoteOnImage($element) {
		var that = this;
		that.object = $element;
		that.imgElem = $('img', that.object);
		that.noteData = null;
		that.clearButton = $('[role=clear-button]', that.object);
		
		if (that.clearButton != null) {
			that.clearButton.click(function(event) {
				that.clear();
			});
			that.clearButton.hide();
		}

		that.bindToImage(false);
	}

	NoteOnImage.prototype.bindToImage = function(redraw) {
		var that = this;
				
		if (!$('[role=note-data]', that.object).length) {
			that.imgElem.after('<input name="' + that.object.attr('id') + '-note-data" role="note-data" type="hidden">');
		}
		if (!$('[role=note]', that.object).length) {
			that.imgElem.after('<div role="note" style="position: absolute;"></div>');
		}	
		
		that.noteElem = $('[role=note]', that.object);	
		that.noteDataElem = $('[role=note-data]', that.object);	
		
		// Determine the location for the annotation canvas
		// Wait till the images is loaded so we can retrieve the proper position information
		that.imgElem.one('load', function() {
			that.initNoteElem(redraw);
		}).each(function() {
  			if (this.complete) {
  				that.initNoteElem(redraw);
  			}
		});
	}
	
	NoteOnImage.prototype.initNoteElem = function (redraw) {
		var that = this;
		var imgPos = that.imgElem.position();						
		that.noteElem.css({
			height: that.imgElem.outerHeight() + "px",
			width: that.imgElem.outerWidth() + "px",
			left: parseFloat(imgPos.left).toFixed(2) + "px",
			top: parseFloat(imgPos.top).toFixed(2) + "px",
		});
					
		// Bind the annotation editor to the click event of the note area
		that.noteElem.off("click.olcotg").on("click.olcotg", function() {
			that.annotationEditor();
		});
		
		if (redraw) {
			that.draw();
		}
	}
	
	NoteOnImage.prototype.draw = function() {
		var that = this;

		if (!!that.noteData) {
			that.noteElem.html('');
			var imgWidth = that.imgElem.width();
			var imgHeight = that.imgElem.height();

			if (browserSupportsSvg) {
				that.noteElem.html(navigator.handDrawTool.getSVG(that.noteData, imgWidth, imgHeight));
			} else {
				var imgCanvas = document.createElement('canvas');
				imgCanvas.setAttribute('width', imgWidth);
				imgCanvas.setAttribute('height', imgHeight);
				that.noteElem.append(imgCanvas);
				navigator.handDrawTool.drawInContext(imgCanvas.getContext('2d'), that.noteData, imgWidth, imgHeight);
			}
		}
	};
	
	/*
	* Invokes the handdraw editor with the photo as background image
	* Stores the result in a text input
	*/
	NoteOnImage.prototype.annotationEditor = function() {
		var that = this;			
		var imgWidth = that.imgElem.width();
		var imgHeight = that.imgElem.height();
		
		navigator.handDrawTool.record(
			// callback
			function(data) {
				that.noteData = data;
				that.noteDataElem.val(navigator.handDrawTool.getSVG(data, imgWidth, imgHeight));
				that.draw();
				if (that.clearButton) {
					that.clearButton.show();
				}
				
			},
			// options
			{
				mode: 'annotation',
				width: imgWidth,
				height: imgHeight,
				edit: that.noteData,
				background: that.imgElem.attr('src')
			}
		);
	}
	
	
	NoteOnImage.init = function($element) {
		$('[role="cotg.NoteOnImage"]', $element).each(function() {
			$('[role=note-data]', $element).val('');
			$('[role=note]', $element).html('');
			widgets.push(new NoteOnImage($(this)));
		});
		$("[role='cotg.NoteOnImage']", $element).parents("label").click(function(event) {
			event.preventDefault();
		});
	};

	NoteOnImage.prototype.restore = function(state) {
		var that = this;
		that.noteData = state[that.object.attr('id') + '-annot'];
		if (!!that.noteData) {
			document.addEventListener('deviceready', function() {
				that.bindToImage(true);
				if (that.clearButton) {
					that.clearButton.show();
				}
			}, false);
		}
	};

	NoteOnImage.prototype.save = function(state) {
		var that = this;
		state[that.object.attr('id') + '-annot'] = that.noteData;
	};

	NoteOnImage.prototype.clear = function() {
		var that = this;
		that.noteData = null;
		that.noteElem.html('');
		that.noteElem.css('outline', '');
		that.noteElem.css('height', '0px');
		that.noteElem.css('width', '0px');
		that.noteDataElem.val('');
		that.initNoteElem(false);
		
		if (that.clearButton) {
			that.clearButton.hide();
		}
	};

	/***************************************************************************
	 *  Signature
	 */
	function Signature($element) {
		var that = this;
		that.onChangeListener = null;
		that.object = $element;

		that.container = $('[role=signature]', that.object);
		that.svgDataElem = $('[role=signature-data]', that.object);

		that.sigData = null; // this is raw data, returned from record(), we
		// need for old browser support
		that.canvas = null;

		that.container.click(function() {
			var width = that.container.width();
			var height = that.container.height();

			navigator.handDrawTool.record(
			// call back
			function(data) {
				that.sigData = data;
				that.svgDataElem.val(navigator.handDrawTool.getSVG(data, width, height));
				that.draw();
			}, { // options
				mode : 'signature',
				width : width,
				height : height
			});

		});

	}

	Signature.init = function ($element) {
		$('[role="cotg.Signature"]', $element).each(function() {
			$("[role='signature']", $(this)).html('');
			widgets.push(new Signature($(this)));
		});
	};

	// You have to make sure that this method is invoked AFTER 'deviceready'.
	Signature.prototype.draw = function() {
		var that = this;
		if (!!that.sigData) {
			var width = that.container.width();
			var height = that.container.height();
			if (browserSupportsSvg) {
				that.container.html(navigator.handDrawTool.getSVG(that.sigData, width, height));
			} else {
				that.container.html('');
				var canvas = document.createElement('canvas');
				canvas.setAttribute('width', width);
				canvas.setAttribute('height', height);
				that.container.append(canvas);
				navigator.handDrawTool.drawInContext(canvas.getContext('2d'), that.sigData, width, height);
			}
		}
	};

	Signature.prototype.restore = function(state) {
		var that = this;
		that.sigData = state[that.object.attr('id')];
		if (!!that.sigData) {
			document.addEventListener('deviceready', function() {
				that.draw();
			}, false);
		}
	};

	Signature.prototype.save = function(state) {
		var that = this;
		state[that.object.attr('id')] = that.sigData;
	};

	Signature.prototype.clear = function() {
		var that = this;
		that.sigData = null;
		that.svgDataElem.val('');
		that.container.html('');
	};
	
	/***************************************************************************
	 * Barcode scanning (version 5.3+ only)
	 * For supported symbologies see: https://github.com/wildabeast/BarcodeScanner
	 */
	function Barcode($element) {
		var that = this;
		that.object = $element;
		that.dataElm = $('[role=barcode-data]', that.object);
		that.scanButton = $('[role=scan-button]', that.object);
		
		that.scanButton.click(function() {
		
			navigator.barcodeScanner.scan(function(result){
				if (!result.cancelled) {
					delete result.cancelled;
					that.dataElm.val(JSON.stringify(result));
				}
			}, function() {
				that.dataElm.val('Error scanning barcode!');
			});
			
		});
		
	}
	
	Barcode.init = function($element) {
		$('[role="cotg.Barcode"]', $element).each(function() {
			widgets.push(new Barcode($(this)));
		});
	};
	
	/***************************************************************************
	 * Get the current COTG loginIdentifier (user account)
	 */
	function UserAccount($element) {
		var that = this;
		that.object = $element;

		document.addEventListener("deviceready", function() {
			that.object.val(navigator.cotgHost.loginIdentifier);
		});
		
	}

	UserAccount.init = function($element) {
		$('[role="cotg.UserAccount"]', $element).each(function() {
			widgets.push(new UserAccount($(this)));
		});
	};
	
	
	/*****************************************************************************************************************************************
	* Fetch device info
	* See https://github.com/apache/cordova-plugin-device/blob/master/doc/index.md
	**/
	function DeviceInfo($element) {
		var that = this;
		that.object = $element;

		document.addEventListener("deviceready", function() {
			that.object.val(JSON.stringify(device));
		}, false);
		
	}

	DeviceInfo.init = function($element) {
		$('[role="cotg.DeviceInfo"]', $element).each(function() {
			widgets.push(new DeviceInfo($(this)));
		});
	};
	

	/***************************************************************************
	 * Localization info See
	 * https://github.com/apache/cordova-plugin-globalization/blob/master/doc/index.md
	 */
	function Locale($element) {
		var that = this;
		that.object = $element;
		
		document.addEventListener("deviceready", function() {
			navigator.globalization.getLocaleName(function(locale) {
				that.object.val(locale.value);
			}, function() {
				that.object.val('Error getting locale!');
			});
		});
	}

	Locale.init = function ($element) {
		$('[role="cotg.Locale"]', $element).each(function() {
			widgets.push(new Locale($(this)));
		});
	};

	/***************************************************************************
	 * Geolocation info See
	 * https://github.com/apache/cordova-plugin-globalization/blob/master/doc/index.md
	 */
	function Geolocation($element) {
		var that = this;
		that.object = $element;
		that.infoElm = $('[role=geolocation-info]', that.object);
		that.dataElm = $('[role=geolocation-data]', that.object);
		that.getButton = $('[role=get-button]', that.object);
		that.enableHighAccuracy = false;

		if (that.object.attr('data-params')) {
			that.params = JSON.parse(that.object.attr('data-params'));
			if (that.params.enableHighAccuracy === true) {
				that.enableHighAccuracy = true;
			}
		}

		function showPosition(position) {
			that.dataElm.val(createJSON(position));
			that.showinfo();
		}

		/**
		 * The object returned by the browser geolocation API can have non-enumerable properties.
		 * Objects with non-enumerable properties are not converted to JSON by JSON.stringify();
		 * 
		 * Some platforms and some browser version return object that have this problem others don't.
		 * Newer android versions and desktop browsers return an object which can't be passed directly to JSON.stringify().
		 * For those situations we copy the properties to a normal object and then pass that to
		 * JSON.stringify() to get the proper results.
		 * 
		 * See SHARED-46831 for more details.
		 */
		function createJSON(position) {
			var positionObject = {};

			if ('coords' in position) {
				positionObject.coords = {};
				copyProperties(position.coords, positionObject.coords, ['latitude', 'longitude', 'accuracy', 'altitude', 'altitudeAccuracy', 'heading', 'speed']);
			}

			copyProperties(position, positionObject, ['timestamp']);
			
			return JSON.stringify(positionObject)
		}
		
		function copyProperties(source, destination, properties) {
			for (var i = 0 ; i < properties.length; i++) {
				var property = properties[i];
				if (property in source) {
					destination[property] = source[property];
				}
			}
		}
		
		function showError(err) {
			that.dataElm.html('Error ' + err.code + ': ' + err.message);

			if (that.infoElm.length) {
				that.infoElm.html('Error ' + err.code + ': ' + err.message);
			}
		}

		var options = {
			enableHighAccuracy : that.enableHighAccuracy, // default is false
			maximumAge : 30000, // Accept a cached position whose age is no
			// greater than the specified time in
			// milliseconds
			timeout : 27000
		// The maximum length of time (milliseconds) that is allowed to wait for
		// result
		};

		that.getButton.click(function() {
			navigator.geolocation.getCurrentPosition(showPosition, showError, options);
		});
	}

	Geolocation.init = function($element) {
		$('[role="geolocation-info"]', $element).html('');
		
		$('[role="cotg.Geolocation"]', $element).each(function() {
			widgets.push(new Geolocation($(this)));
		});
		$('[role="cotg.Geolocation"]', $element).parents("label").click(function(event) {
			event.preventDefault();
		});
	};
	
	Geolocation.prototype.showinfo = function() {
		var that = this;

		function degToDms(deg) {
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
			return ('' + d + '&deg; ' + m + "' " + s + '"');
		}
		if (that.dataElm.val().length > 0) {
			var position = JSON.parse(that.dataElm.val());
	
			if (that.infoElm.length) {
				var geo = '<p><strong>Latitude:</strong> ' + degToDms(position.coords.latitude) + ' ('
						+ position.coords.latitude + ')<br />' + '<strong>Longitude:</strong> '
						+ degToDms(position.coords.longitude) + ' (' + position.coords.longitude + ')<br />'
						+ '<strong>Timestamp:</strong> ' + position.timestamp + '</p>';
				that.infoElm.html(geo);
			}
		}
	};

	Geolocation.prototype.restore = function(state) {
		var that = this;
		if (that.infoElm.length) {
			that.showinfo();
		}
	};

	/**
	 * DEBUGGING (version 5.3+ only) There are many ways you can debug your
	 * code:
	 * 
	 * 1) Remote Debugging is by far the most convenient method. It allows you
	 * to debug your code on the device directly from your browser on your
	 * desktop with all developer tools available as usual. - To debug on an
	 * Android device, see instructions here:
	 * https://developer.chrome.com/devtools/docs/remote-debugging It's only
	 * available on devices with Android KitKat (4.4) or more recent only. On
	 * Android, in plus of enabling USB debugging as described in the link
	 * above, remote debugging is possible only if the app allows so.
	 * CaptureOnTheGo allows remote debugging only if you put it in Debug Mode.
	 * Follow instructions below to enable this mode. - To debug on an iOS
	 * device, see instructions here:
	 * http://moduscreate.com/enable-remote-web-inspector-in-ios-6/ You need
	 * access to a Mac with OSX to do so.
	 * 
	 * 2) Use an emulator. <deprecated> There is emulator for Cordova (PhoneGap)
	 * to debug your html file in Chrome directly on your desktop, see the
	 * description here:
	 * http://www.tricedesigns.com/2012/07/31/emulating-phonegapcordova-apps-in-the-browser/
	 * </deprecated>
	 * 
	 * Update: it seems that the version at emulate.phonegap.com is out-of-date
	 * and works with Cordova 2.0 only. Check update here:
	 * http://ripple.incubator.apache.org/ but it's more complex to set up
	 * 
	 * 3) Come as the last rescue, CaptureOnTheGo is (now) able to show web
	 * console, JavaScript errors will be printed there. You need to enable
	 * Debug Mode in CaptureOnTheGo in order to access to the console. Once the
	 * Debug Mode is enabled, the console can be opened with menu "Web Console"
	 * in viewer on Android. On iOS, coming soon...
	 * 
	 * To enable Debug Mode: - On Android, press-n-hold the User Guide title
	 * (it's where you do triple taps to switch server, but this time just press
	 * and hold) until a dialog will show up (after about 3 seconds) and prompt
	 * you to type in commands. Type "iamdebugman" to turn on it on. Type the
	 * same thing will turn it off. - On iOS, coming soon...
	 */

	/**
	 * EVENTS The event 'deviceready' on 'window' is fired by cordova when it's
	 * fully loaded and ready to be used. More on events:
	 * http://cordova.apache.org/docs/en/4.0.0/cordova_events_events.md.html#Events
	 * 
	 * Capture OnTheGo add two other events: 'savestate' fired when user is
	 * about to leave the form and 'restorestate' when the form is opened
	 * (including the first time). Look further below for examples.
	 */

	var widgets = [];

	registerWidgets($('body'));

	/***************************************************************************
	 * Form state save/restore. 'input', 'select' and 'textarea' elements are
	 * persistent: their values are saved when document is closed and are
	 * restored when document is reopened. To support custom data, Nu-book fires
	 * two event on 'window' object, 'savestate' and 'restorestate' at
	 * appropriate times. In these event, the 'event' parameter is a CustomEvent
	 * with 'detail' is an object containing 'state' where you can read/write
	 * your data.
	 * 
	 * IMPORTANT: 1) You must add your listeners as soon as possible, i.e. on
	 * 'ready' signal, not on 'deviceready' since, contrary to 'deviceready'
	 * which is emitted again if you add a listener after the first event,
	 * 'savestate' and 'restorestate' will NOT emit again if you miss the first
	 * shot. 2) 'savestate' may be emitted multiple times, but 'restorestate'
	 * will normally emitted exactly once, even if the form is opened for the
	 * first time.
	 */
	window.addEventListener('savestate', function(event) {
		saveClones(event.detail.state);
		for ( var i = 0; i < widgets.length; ++i) {
			if (typeof widgets[i].save === 'function') {
				widgets[i].save(event.detail.state);
			}
		}
		
		window.dispatchEvent(new CustomEvent("olcotgsavestate", {"detail" : event.detail}));
	}, false);

	window.addEventListener('restorestate', function(event) {
		recreateClones(event.detail.state);
		for ( var i = 0; i < widgets.length; ++i) {
			if (typeof widgets[i].restore === 'function') {
				widgets[i].restore(event.detail.state);
			}
		}
		
		window.dispatchEvent(new CustomEvent("olcotgrestorestate", {"detail" : event.detail}));
	}, false);
	
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
			state['data-cotg-clones'][id] = { 'numberOfClones' : numberOfClones};
			
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
		if (clonesState == undefined)
			return;
			
		for (var id in clonesState) {
			$('#' + id).attr('data-cotg-clones', clonesState[id].numberOfClones);
		}
		
		$('[data-cotg-clones]').each(function () {
			var numberOfClones = parseInt($(this).attr('data-cotg-clones'));
			if (isNaN(numberOfClones)) {
				return;
			}
			
			for (var i = 0 ; i < numberOfClones; i++) {
				cloneRow($(this), false);
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
	
	/**
	 * Clones a row form a table, gives the cloned inputs unique id's
	 * Registers all the cotg widgets for the cloned row.
	 * 
	 * @param $table to clone a row of we will use the first TR element
	 * @param restoreDefaults boolean indicates if defaults should be restored or not
	 */
	function cloneRow($table, restoreDefaults) {
		var $tbody = $table.find('tbody');
		var $newRow = $tbody.children("tr").first().clone();
		
		$newRow.find('input, textarea').not(':input[type=checkbox]').not(':input[type=radio]').val("");
		$newRow.find('input[type=checkbox]').prop("checked", false);

		var newRowIndex = $tbody.children("tr").length;
		updateCloneIds($newRow, $table.attr('id'), newRowIndex);
		
		$tbody.append($newRow);
		
		if (restoreDefaults) {
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
			$newRow.find('select').each(function() {
				var optionValue = $(this).find('option[selected]').val();
				if (optionValue !== undefined) {
					$(this).val(optionValue);
				}
			});
		}
		
		registerWidgets($newRow);
	}
	
	function updateCloneIds($row, tableId, rowIndex) {
		$("label, input, textarea, select, [role^='cotg.']", $row).each(function () {
			makeIdAndNameUnique($(this), tableId, rowIndex);
		});
	}
	
	function addSuffixToAttr($element, attr, tableId, rowIdx, useArrayNotation) {
		var value = $element.attr(attr);
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
			$element.attr(attr, newValue);
		}
	}
	
	function makeIdAndNameUnique($element, tableId, rowIdx) {
		addSuffixToAttr($element, 'id', tableId, rowIdx, false);
		addSuffixToAttr($element, 'name', tableId, rowIdx, true);
		addSuffixToAttr($element, 'for', tableId, rowIdx, false);
	}
	
	/**
	 * Calls the init method of each COTG object, the init method will search for
	 * all widgets of that type within the given $context and adds them to the widgets
	 * array. The widgets array is used in the save and restore state event listeners
	 * 
	 */
	function registerWidgets($context) {
		Signature.init($context);
		DatePicker.init($context);
		TimePicker.init($context);
		Geolocation.init($context);
		Locale.init($context);
		PhotoWidget.init($context);
		Barcode.init($context);
		UserAccount.init($context);
		DeviceInfo.init($context);
		NoteOnImage.init($context);
	}
	
	/**
	 * When a cloned row is deleted by the user we must unregister any COTG widgets
	 * that the row contained.
	 * 
	 * @param $row
	 */
	function unregisterWidgets($row) {
		$("[role^='cotg.']", $row).each(function() {
			if (widgets === undefined || widgets.length === undefined) {
				return;
			}
			
			var toBeRemoved = [];
			for (var i = 0; i < widgets.length; i++) {
				if (widgets[i].object === undefined) {
					continue;
				}
				if ($(this).is(widgets[i].object)) {
					toBeRemoved.push(widgets[i]);
					break;
				}
			}
			
			for (var i = 0; i < toBeRemoved.length; i++) {
				var index = widgets.indexOf(toBeRemoved[i]);
				if (index != -1) {
					widgets.splice(index, 1);
				}
			}
		});
	}
	
	function getWidget(widgetElement) {
		if (widgets === undefined || widgets.length === undefined) {
			return null;
		}
		
		for (var i = 0; i < widgets.length; i++) {
			if (widgets[i].object === undefined) {
				continue;
			}
			if ($(widgetElement).is(widgets[i].object)) {
				return widgets[i];
			}
		}
		
		return null;
	}
	
	// Add the on click handler for adding (cloning) of table rows
	$("table [role=cotg-add-row-button]").on("click", function(event){
		var $table = $(this).closest('table');
		cloneRow($table, true);
		
		var clones = parseInt($table.attr('data-cotg-clones'));
		if (isNaN(clones)) {
			clones = 1;
		} else {
			clones++;
		}
		$table.attr('data-cotg-clones', clones);
	});
	
	// Add the on click handler for deleting of cloned table rows
	$("table").on("click", "[role=cotg-delete-row-button]", function(event){
		var $table = $(this).closest('table');
		var rowCount = $table.find( "tbody tr").length;
		if (rowCount > 1) {
		
 	 		$removeRow = $(this).closest('tr');
 	 		unregisterWidgets($removeRow);
 	 		$removeRow.remove();
 	 		
 			var clones = parseInt($table.attr('data-cotg-clones'));
			if (!isNaN(clones)) {
				clones--;
				$table.attr('data-cotg-clones', clones);
			}
			$table.find("tbody tr").each(function (rowIndex) {
				updateCloneIds($(this), $table.attr('id'), rowIndex);
			});

 		}
	});

	// note table[role=cotg-table] needs to be kept for backwards compatibility SHARED-40369
	$('form table[role="cotg.FieldsTable"], form table[role=cotg-table], form table[data-detail]').each(function() {
		$("tbody tr", $(this)).each(function(rowIndex) {
			var $table = $(this).closest('table');
			updateCloneIds($(this), $table.attr('id'), rowIndex);
		});
	});
	
} // initCOTG

var hasCordova = typeof cordova !== 'undefined'; // 'cordova' is
// automatically injected in
// every form in
// CaptureOnTheGo

if (!hasCordova) {
	// Use alternative libs on desktop
	// Coming soon...
}

jQuery(document).ready(function() {
	initCOTG(jQuery);
});