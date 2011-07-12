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
      if ((this.x != null) || (this.y != null) || (this.z != null) || (this.scale != null) || (this.rotate != null)) {
        if (!(Sauce.TRANSFORMS != null)) {
          if (this.x != null) {
            css += "left:" + this.x + ";";
          }
          if (this.y != null) {
            css += "top:" + this.y + ";";
          }
        } else {
          transform = "";
          if (Sauce.TRANSFORMS === "transform3d") {
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
          } else if (Sauce.TRANSFORMS === "transform") {
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
          css += "-" + Sauce.BROWSER_PREFIX + "-transform: " + transform + ";";
        }
        return css;
      }
    };
    return Ingredient;
  })();
  this.Flavor = (function() {
    function Flavor(params) {
      if (params == null) {
        params = {};
      }
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
    function Sauce() {
      this.name = "ease_" + (new Date().getTime());
      this.stylesheet = document.styleSheets[document.styleSheets.length - 1];
      this.flavors = {};
      this.spoon = function(flavors) {
        return 0;
      };
      this.keyframes = 60;
      this.complete = function(element, flavors, browser) {
        return false;
      };
      this.ingredient = new Ingredient();
      if (Sauce.BROWSER_PREFIX == null) {
        Sauce.getBrowserCapabilities();
      }
    }
    Sauce.prototype.addFlavor = function(name, params) {
      this.flavors[name] = new Flavor(params);
      return this;
    };
    Sauce.prototype.create = function(keyframes) {
      var animation, cssFrames, currentFrame, flavor, frameLabel, interval, keyframe, name, _ref;
      if (keyframes == null) {
        keyframes = 60;
      }
      interval = 100 / keyframes;
      currentFrame = 0;
      cssFrames = "";
      while (currentFrame <= keyframes) {
        keyframe = currentFrame * interval;
        frameLabel = "" + keyframe + "%";
        if (currentFrame < 1) {
          frameLabel = "from";
        } else if (currentFrame === keyframes) {
          frameLabel = "to";
        }
        _ref = this.flavors;
        for (name in _ref) {
          flavor = _ref[name];
          flavor.compute(keyframe);
        }
        this.spoon(this.flavors, this.ingredient);
        cssFrames += " " + frameLabel + " {" + (this.ingredient.css()) + "}";
        currentFrame++;
      }
      animation = "@-" + Sauce.BROWSER_PREFIX + "-keyframes " + this.name + " {" + cssFrames + "}";
      this.index = this.stylesheet.cssRules.length;
      console.log(animation);
      return this.stylesheet.insertRule(animation, this.index);
    };
    Sauce.prototype.onComplete = function(complete) {
      return this.complete = complete;
    };
    Sauce.prototype.applyTo = function(id, duration) {
      this.duration = duration != null ? duration : 2;
      this.create(this.keyframes);
      this.element = document.getElementById(id);
      if (Sauce.BROWSER_PREFIX === "webkit") {
        this.element.style.webkitAnimationName = this.name;
        this.element.style.webkitAnimationDuration = "" + this.duration + "s";
        this.element.addEventListener('webkitAnimationEnd', (__bind(function() {
          return this.complete(this.element, this.flavors, this.browser);
        }, this)), false);
      } else if (Sauce.BROWSER_PREFIX === "moz") {
        this.element.style.MozAnimationName = this.name;
        this.element.style.MozAnimationDuration = "" + this.duration + "s";
      }
      return this;
    };
    Sauce.BROWSER_PREFIX = null;
    Sauce.TRANSFORMS = null;
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
            _results2.push(style[property] !== void 0 ? this.TRANSFORMS || (this.TRANSFORMS = name) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    return Sauce;
  })();
}).call(this);
