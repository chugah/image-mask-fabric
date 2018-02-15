(function (global) {    
    'use strict';
    var fabric = global.fabric || (global.fabric = {}),
        extend = fabric.util.object.extend;
    if (fabric.Maskedimage) {
        fabric.warn('fabric.Maskedimage is already defined');
        return;
    }
    var stateProperties = fabric.Object.prototype.stateProperties.concat();
    stateProperties.push('rx', 'ry');
    var cacheProperties = fabric.Object.prototype.cacheProperties.concat();
    cacheProperties.push('rx', 'ry');
  fabric.Maskedimage = fabric.util.createClass(fabric.Object, {
    initialize: function(element, options, callback) {
      options || (options = { });
      this.filters = [];
      this.resizeFilters = [];
      this.callSuper('initialize', options);
      this._initElement(element, options, callback);
      if (this.itemId == null) {
        this.itemId = Math.uuid();
        this.type='maskedimage';
        this.itemType='maskedimage';
        this.maskId = 'a65c6bd6-a33b-4c9c-8d3c-811c6aae17d6';
      }
    },
    getElement: function() {
      return this._element;
    },
    setElement: function(element, callback, options) {
      var _callback, _this;
      this._element = element;
      this._originalElement = element;
      this._initConfig(options);
      if (this.resizeFilters.length === 0) {
        _callback = callback;
      }
      else {
        _this = this;
        _callback = function() {
          _this.applyFilters(callback, _this.resizeFilters, _this._filteredEl || _this._originalElement, true);
        };
      }
      if (this.filters.length !== 0) {
        this.applyFilters(_callback);
      }
      else if (_callback) {
        _callback(this);
      }
      return this;
    },
    getOriginalSize: function() {
      var element = this.getElement();
      return {
        width: element.width,
        height: element.height
      };
    },
    _stroke: function(ctx) {
      if (!this.stroke || this.strokeWidth === 0) {
        return;
      }
      var w = this.width / 2, h = this.height / 2;
      ctx.beginPath();
      ctx.moveTo(-w, -h);
      ctx.lineTo(w, -h);
      ctx.lineTo(w, h);
      ctx.lineTo(-w, h);
      ctx.lineTo(-w, -h);
      ctx.closePath();
    },
    _applyMask: function(imgElement) {  
      if(!this.maskId){
        return;
      }
      var newCanvasEl    = fabric.util.createCanvasElement();
      newCanvasEl.width  = imgElement.width;
      newCanvasEl.height = imgElement.height;
      newCanvasEl.getContext('2d').drawImage(imgElement, 0, 0, imgElement.width, imgElement.height); //????????
      var overlapRegionRect = getUnionRect( mainImage.left, 
        mainImage.top, 
        mainImage.width,
        mainImage.height, 
        maskImage.left, 
        maskImage.top, 
        maskImage.width, 
        maskImage.height);
      if( overlapRegionRect.width > 0 &&  overlapRegionRect.height > 0){
        console.log('overlap region width ', overlapRegionRect.width);
        console.log('overlap region height ', overlapRegionRect.height);
        var entireCanvasCtx = mycanvas.getContext('2d');
        entireCanvasCtx.globalCompositeOperation = "lighten";
        var angle = mainImage.getAngle();
        console.log('angle ', angle);
      }
      var newCanvasElCtx   = newCanvasEl.getContext('2d');   
      var newCanvasElImageData = newCanvasElCtx.getImageData(0, 0, newCanvasEl.width, newCanvasEl.height);
      var currentPixelLeft = this.left;
      var currentPixelTop  = this.top;
      var py;
      var px;
      console.log("currentPixelLeft["+currentPixelLeft+"] currentPixelTop["+currentPixelTop+"]");
      for (var i = 0, len = newCanvasElImageData.data.length; i < len; i += 4) {         
        px = parseInt((i / 4) % newCanvasElImageData.width);
        py = Math.floor((i/4)/newCanvasElImageData.width)
      }
      newCanvasElCtx.putImageData(newCanvasElImageData, 0, 0);
      return newCanvasEl;    
    },
    _render: function(ctx, noTransform) {
      var x, y, imageMargins = this._findMargins(), elementToDraw;
      x = (noTransform ? this.left : -this.width / 2);
      y = (noTransform ? this.top : -this.height / 2);
      if (this.meetOrSlice === 'slice') {
        ctx.beginPath();
        ctx.rect(x, y, this.width, this.height);
        ctx.clip();
      }
      if (this.isMoving === false && this.resizeFilters.length && this._needsResize()) {
        this._lastScaleX = this.scaleX;
        this._lastScaleY = this.scaleY;
        elementToDraw = this.applyFilters(null, this.resizeFilters, this._filteredEl || this._originalElement, true);
      } else {
        elementToDraw = this._element;
      }
      elementToDraw = this._applyMask( this._filteredEl || this._originalElement );  
      elementToDraw && ctx.drawImage(elementToDraw,
        x + imageMargins.marginX,
        y + imageMargins.marginY,
        imageMargins.width,
        imageMargins.height
      );
      this._stroke(ctx);
      this._renderStroke(ctx);
    },
    _needsResize: function() {
      return (this.scaleX !== this._lastScaleX || this.scaleY !== this._lastScaleY);
    },
    _findMargins: function() {
      var width = this.width, height = this.height, scales,
          scale, marginX = 0, marginY = 0;
      if (this.alignX !== 'none' || this.alignY !== 'none') {
        scales = [this.width / this._element.width, this.height / this._element.height];
        scale = this.meetOrSlice === 'meet'
                ? Math.min.apply(null, scales) : Math.max.apply(null, scales);
        width = this._element.width * scale;
        height = this._element.height * scale;
        if (this.alignX === 'Mid') {
          marginX = (this.width - width) / 2;
        }
        if (this.alignX === 'Max') {
          marginX = this.width - width;
        }
        if (this.alignY === 'Mid') {
          marginY = (this.height - height) / 2;
        }
        if (this.alignY === 'Max') {
          marginY = this.height - height;
        }
      }
      return {
        width:  width,
        height: height,
        marginX: marginX,
        marginY: marginY
      };
    },
    _resetWidthHeight: function() {
      var element = this.getElement();
      this.set('width', element.width);
      this.set('height', element.height);
    },
    _initElement: function(element, options, callback) {
      this.setElement(fabric.util.getById(element), callback, options);
      fabric.util.addClass(this.getElement(), fabric.Maskedimage.CSS_CANVAS);
    },
    _initConfig: function(options) {
      options || (options = { });
      this.setOptions(options);
      this._setWidthHeight(options);
      if (this._element && this.crossOrigin) {
        this._element.crossOrigin = this.crossOrigin;
      }
    },
    _initFilters: function(filters, callback) {
      if (filters && filters.length) {
        fabric.util.enlivenObjects(filters, function(enlivenedObjects) {
          callback && callback(enlivenedObjects);
        }, 'fabric.Maskedimage.filters');
      }
      else {
        callback && callback();
      }
    },
    _setWidthHeight: function(options) {
      this.width = 'width' in options
        ? options.width
        : (this.getElement()
            ? this.getElement().width || 0
            : 0);

      this.height = 'height' in options
        ? options.height
        : (this.getElement()
            ? this.getElement().height || 0
            : 0);
    },
  });
  fabric.Maskedimage.CSS_CANVAS = 'canvas-img';
  fabric.Maskedimage.prototype.getSvgSrc = fabric.Maskedimage.prototype.getSrc;
  fabric.Maskedimage.fromObject = function(object, callback) {
    fabric.util.loadImage(object.src, function(img, error) {
      if (error) {
        callback && callback(null, error);
        return;
      }
    }, null, object.crossOrigin);
  };
  fabric.Maskedimage.fromURL = function(url, callback, imgOptions) {
    fabric.util.loadImage(url, function(img) {
      callback && callback(new fabric.Maskedimage(img, imgOptions));
    }, null, imgOptions && imgOptions.crossOrigin);
  };
  fabric.Maskedimage.ATTRIBUTE_NAMES =
    fabric.SHARED_ATTRIBUTES.concat('x y width height preserveAspectRatio xlink:href crossOrigin'.split(' '));
  fabric.Maskedimage.fromElement = function(element, callback, options) {
    var parsedAttributes = fabric.parseAttributes(element, fabric.Maskedimage.ATTRIBUTE_NAMES),
      preserveAR;
    if (parsedAttributes.preserveAspectRatio) {
      preserveAR = fabric.util.parsePreserveAspectRatioAttribute(parsedAttributes.preserveAspectRatio);
      extend(parsedAttributes, preserveAR);
    }
    fabric.Maskedimage.fromURL(parsedAttributes['xlink:href'], callback,
      extend((options ? fabric.util.object.clone(options) : { }), parsedAttributes));
  };
  fabric.Maskedimage.async = true;
  fabric.Maskedimage.pngCompression = 1;

})(typeof exports !== 'undefined' ? exports : this);