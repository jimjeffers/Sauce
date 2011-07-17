(function() {
  /*
  Sauce.coffee (https://github.com/jimjeffers/Sauce)
  Project created by J. Jeffers
  
  DISCLAIMER: Software provided as is with no warranty of any type. 
  Don't do bad things with this :)
  */
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.Ingredient = (function() {
    function Ingredient(params) {
      if (params == null) {
        params = {};
      }
      this.x = params.x || null;
      this.y = params.y || null;
      this.z = params.z || null;
      this.scale = params.scale || null;
      this.scaleX = params.scaleX || null;
      this.scaleY = params.scaleY || null;
      this.scaleZ = params.scaleZ || null;
      this.rotate = params.rotate || null;
      this.rotateX = params.rotate || null;
      this.rotateY = params.rotate || null;
      this.rotateZ = params.rotate || null;
      this.opacity = params.opacity || null;
    }
    Ingredient.prototype.css = function() {
      var css, transform;
      css = "";
      if (!(Sauce.TRANSFORMS != null)) {
        if (this.x != null) {
          css += "left:" + this.x + ";";
        }
        if (this.y != null) {
          css += "top:" + this.y + ";";
        }
      } else {
        if ((transform = this.transformRule()) != null) {
          css += "-" + Sauce.BROWSER_PREFIX + "-transform: " + transform + ";";
        }
      }
      return css;
    };
    Ingredient.prototype.transformRule = function() {
      var transform;
      if ((this.x != null) || (this.y != null) || (this.z != null) || (this.scale != null) || (this.rotate != null)) {
        transform = "";
        if (Sauce.TRANSFORMS3D != null) {
          if ((this.x != null) || (this.y != null) || (this.z != null)) {
            transform += "translate3d(" + (this.x || 0) + "px," + (this.y || 0) + "px," + (this.z || 0) + "px)";
          }
          if ((this.scaleX != null) || (this.scaleY != null) || this.scaleZ) {
            transform += "scale3d(" + (this.scaleX || 1) + "," + (this.scaleY || 1) + "," + (this.scaleZ || 0) + ")";
          } else if (this.scale != null) {
            transform += "scale3d(" + this.scale + "," + this.scale + "," + this.scale + ")";
          }
          if ((this.rotateX != null) || (this.rotateY != null) || (this.rotateZ != null)) {
            transform += "rotate3d(" + (this.x || 0) + "px," + (this.y || 0) + "px," + (this.z || 0) + "px," + this.rotate + "deg)";
          } else if (this.rotate != null) {
            transform += "rotate(" + this.rotate + "deg)";
          }
        } else if (Sauce.TRANSFORMS != null) {
          if ((this.x != null) || (this.y != null)) {
            transform += "translate(" + (this.x || 0) + "px," + (this.y || 0) + "px)";
          }
          if (this.scale != null) {
            transform += "scale(" + this.scale + "," + this.scale + ")";
          }
          if (this.rotate != null) {
            transform += "rotate(" + this.rotate + "deg)";
          }
        }
        return transform || false;
      }
    };
    return Ingredient;
  })();
  this.Flavor = (function() {
    function Flavor(params) {
      if (params == null) {
        params = {};
      }
      this.name = params.name || null;
      this.from = params.from || 0;
      this.to = params.to || 100;
      this.equation = params.equation || null;
      this.startFrame = params.startFrame || 0;
      this.endFrame = params.endFrame || 100;
      this.amplitude = params.amplitude || null;
      this.period = params.period || null;
      this.velocity = 0;
      this.lastResult = 0;
      this.value = 0;
    }
    Flavor.prototype.compute = function(keyframe) {
      if (keyframe < this.startFrame) {
        keyframe = this.startFrame;
      } else if (keyframe > this.endFrame) {
        keyframe = this.endFrame;
      }
      if ((this.period != null) || (this.amplitude != null)) {
        this.value = this.equation(keyframe - this.startFrame, this.from, this.to - this.from, this.endFrame - this.startFrame, this.amplitude, this.period);
      } else {
        this.value = this.equation(keyframe - this.startFrame, this.from, this.to - this.from, this.endFrame - this.startFrame);
      }
      this.velocity = Math.abs(this.value - this.lastResult);
      return this.lastResult = this.value;
    };
    return Flavor;
  })();
  this.Sauce = (function() {
    function Sauce(params) {
      var name, _ref;
      if (params == null) {
        params = {};
      }
      if (Sauce.BROWSER_PREFIX == null) {
        Sauce.getBrowserCapabilities();
      }
      this.name = params.name || ("ease_" + (new Date().getTime()));
      this.stylesheet = params.stylesheet || document.styleSheets[document.styleSheets.length - 1];
      this.spoon = params.spoon || function(flavors) {
        return 0;
      };
      this.keyframes = params.keyframes || 60;
      this.animationCSS = null;
      this._complete = params.complete || function(element, flavors, browser) {
        return false;
      };
      this._ingredient = new Ingredient();
      this._flavors = {};
      if (params.flavors != null) {
        _ref = params.flavors;
        for (name in _ref) {
          params = _ref[name];
          this.addFlavor(name, params);
        }
      }
    }
    Sauce.prototype.addFlavor = function(flavor, params) {
      if (params == null) {
        params = {};
      }
      if (flavor instanceof Flavor && (flavor.name != null)) {
        this._flavors[flavor.name] = flavor;
      }
      this._flavors[flavor] = new Flavor(params);
      return this;
    };
    Sauce.prototype.flavors = function() {
      return this._flavors;
    };
    Sauce.prototype.interval = function() {
      return 100 / this.keyframes;
    };
    Sauce.prototype.create = function(keyframes) {
      var cssFrames, currentFrame, flavor, frameLabel, keyframe, name, _ref;
      this.keyframes = keyframes != null ? keyframes : 60;
      currentFrame = 0;
      cssFrames = "";
      while (currentFrame <= keyframes) {
        keyframe = currentFrame * this.interval();
        frameLabel = "" + keyframe + "%";
        if (currentFrame < 1) {
          frameLabel = "from";
        } else if (currentFrame === this.keyframes) {
          frameLabel = "to";
        }
        _ref = this._flavors;
        for (name in _ref) {
          flavor = _ref[name];
          flavor.compute(keyframe);
        }
        this.spoon(this._flavors, this._ingredient);
        cssFrames += " " + frameLabel + " {" + (this._ingredient.css()) + "}";
        currentFrame++;
      }
      this.animationCSS = "@-" + Sauce.BROWSER_PREFIX + "-keyframes " + this.name + " {" + cssFrames + "}";
      this.index = this.stylesheet.cssRules.length;
      this.stylesheet.insertRule(this.animationCSS, this.index);
      return this;
    };
    Sauce.prototype.onComplete = function(complete) {
      this._complete = complete;
      return this;
    };
    Sauce.prototype.applyTo = function(id, duration) {
      this.duration = duration != null ? duration : 2;
      this.create(this.keyframes);
      this.element = document.getElementById(id);
      this.element.style[Sauce.CURRENT_PROPS.animationName] = this.name;
      this.element.style[Sauce.CURRENT_PROPS.animationDuration] = "" + this.duration + "s";
      this.element.addEventListener(Sauce.CURRENT_PROPS.animationEnd, (__bind(function() {
        return this._completeHandler();
      }, this)), false);
      return this;
    };
    Sauce.prototype._completeHandler = function() {
      this.element.style.css += this._ingredient.css();
      if (Sauce.TRANSFORMS != null) {
        this.element.style[Sauce.CURRENT_PROPS.transform] = this._ingredient.transformRule();
      }
      return this._complete(this.element, this.flavors, this.browser);
    };
    Sauce.BROWSER_PREFIX = null;
    Sauce.TRANSFORMS3D = null;
    Sauce.TRANSFORMS = null;
    Sauce.CURRENT_PROPS = null;
    Sauce.BROWSER_PROPS = {
      webkit: {
        animationEnd: 'webkitAnimationEnd',
        animationName: 'webkitAnimationName',
        animationDuration: 'webkitAnimationDuration',
        transform: 'WebkitTransform'
      },
      moz: {
        animationEnd: 'animationend',
        animationName: 'MozAnimationName',
        animationDuration: 'MozAnimationDuration',
        transform: 'MozTransform'
      },
      o: {
        animationEnd: null,
        animationName: null,
        animationDuration: null,
        transform: 'OTransform'
      },
      msie: {
        animationEnd: null,
        animationName: null,
        animationDuration: null,
        transform: 'msTransform'
      }
    };
    Sauce.getBrowserCapabilities = function() {
      var features, name, options, prefix, prefixes, properties, property, style, userAgent, _results;
      prefixes = {
        webkit: {
          condition: /webkit/
        },
        o: {
          condition: /opera/
        },
        ie: {
          condition: /msie/,
          negator: /opera/
        },
        moz: {
          condition: /mozilla/,
          negator: /(compatible|webkit)/
        }
      };
      userAgent = navigator.userAgent.toLowerCase();
      for (prefix in prefixes) {
        options = prefixes[prefix];
        if (options.condition.test(userAgent)) {
          if (!((options.negator != null) && options.negator.test(userAgent))) {
            this.BROWSER_PREFIX = prefix;
          }
        }
      }
      this.CURRENT_PROPS = this.BROWSER_PROPS[this.BROWSER_PREFIX];
      style = document.createElement('test').style;
      features = {
        transform3d: ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'],
        transform: ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']
      };
      _results = [];
      for (name in features) {
        properties = features[name];
        _results.push((function() {
          var _i, _len, _results2;
          _results2 = [];
          for (_i = 0, _len = properties.length; _i < _len; _i++) {
            property = properties[_i];
            _results2.push(style[property] !== void 0 ? (name === "transform3d" ? this.TRANSFORMS3D = true : void 0, name === "transform" ? this.TRANSFORMS = true : void 0) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    return Sauce;
  })();
}).call(this);
