(function() {
  /*
  Sauce.coffee (https://github.com/jimjeffers/Sauce)
  Project created by J. Jeffers
  
  DISCLAIMER: Software provided as is with no warranty of any type. 
  Don't do bad things with this :)
  */
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.ManagedElement = (function() {
    function ManagedElement(elementID) {
      this.source = document.getElementById(elementID);
      this.opacity = 1;
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      this.scaleZ = 1;
      this.rotate = 0;
      this.rotateX = 0;
      this.rotateY = 0;
      this.rotateZ = 0;
      this.scale = 1;
      this;
    }
    return ManagedElement;
  })();
  this.Rule = (function() {
    function Rule(params) {
      if (params == null) {
        params = {};
      }
      this.equation = params.equation || null;
      this.startFrame = 0;
      this.endFrame = 100;
    }
    Rule.prototype.change = function(property) {
      this.property = property;
      return this;
    };
    Rule.prototype.to = function(endPoint) {
      this.endPoint = endPoint;
      console.log("Set end point to " + this.endPoint);
      return this;
    };
    Rule.prototype.from = function(startPoint) {
      this.startPoint = startPoint;
      console.log("Set end point to " + this.startPoint);
      return this;
    };
    Rule.prototype.using = function(equation) {
      this.equation = equation;
      return this;
    };
    Rule.prototype.withAmplitudeOf = function(amplitude) {
      this.amplitude = amplitude;
      return this;
    };
    Rule.prototype.withPeriodOf = function(period) {
      this.period = period;
      return this;
    };
    Rule.prototype.startingOnFrame = function(startFrame) {
      this.startFrame = startFrame;
      return this;
    };
    Rule.prototype.endingOnFrame = function(endFrame) {
      this.endFrame = endFrame;
      return this;
    };
    Rule.prototype.valueAtFrameForElement = function(keyframe, element) {
      var endPoint, startPoint;
      if (this.startPoint != null) {
        startPoint = this.startPoint;
      } else {
        startPoint = this._getElementProp(element);
      }
      if (this.endPoint != null) {
        endPoint = this.endPoint;
      } else {
        endPoint = this._getElementProp(element);
      }
      if (keyframe < this.startFrame) {
        keyframe = this.startFrame;
      } else if (keyframe > this.endFrame) {
        keyframe = this.endFrame;
      }
      if ((this.period != null) || (this.amplitude != null)) {
        this.value = this.equation(keyframe - this.startFrame, startPoint, endPoint - startPoint, this.endFrame - this.startFrame, this.amplitude, this.period);
      } else {
        this.value = this.equation(keyframe - this.startFrame, startPoint, endPoint - startPoint, this.endFrame - this.startFrame);
      }
      console.log("@equation(" + keyframe + "-" + this.startFrame + "," + startPoint + "," + endPoint + "-" + startPoint + "," + this.endFrame + "-" + this.startFrame + ") returning a value of " + this.value);
      this.velocity = Math.abs(this.value - this.lastResult);
      return this.lastResult = this.value;
    };
    Rule.prototype._getElementProp = function(element) {
      return element[this.property];
    };
    return Rule;
  })();
  this.Ingredient = (function() {
    Ingredient.ROTATE_PROP = "rotate";
    Ingredient.SCALE_PROP = "scale";
    Ingredient.TRANSLATE_PROPS = ["x", "y", "z"];
    Ingredient.PRECISE_SCALE_PROPS = ["scaleX", "scaleY", "scaleZ"];
    Ingredient.PRECISE_ROTATE_PROPS = ["rotateX", "rotateY", "rotateZ"];
    Ingredient.TRANSFORM_PROPS = ("" + (Ingredient.TRANSLATE_PROPS.join(",")) + "," + ([Ingredient.SCALE_PROP, Ingredient.ROTATE_PROP].join(",")) + "," + (Ingredient.PRECISE_SCALE_PROPS.join(",")) + "," + (Ingredient.PRECISE_ROTATE_PROPS.join(","))).split(",");
    function Ingredient() {
      this.rules = {};
      this.element = null;
      this.keyframe = 0;
    }
    Ingredient.prototype.change = function(property) {
      this.rules[property] = new Rule().change(property);
      return this.rules[property];
    };
    Ingredient.prototype.valueOf = function(property) {
      if ((property = this.rules[property]) != null) {
        return property.valueAtFrameForElement(this.keyframe, this.element);
      }
      return null;
    };
    Ingredient.prototype.transformRule = function() {
      var transform;
      if (this._needsTransform() && (this.element != null) && (this.keyframe != null)) {
        transform = "";
        if (Sauce.TRANSFORMS3D != null) {
          if (this._needsTranslate()) {
            transform += "translate3d(" + (this.valueOf("x") || 0) + "px," + (this.valueOf("y") || 0) + "px," + (this.valueOf("z") || 0) + "px)";
          }
          if (this._needsPrecisionScale()) {
            transform += "scale3d(" + (this.valueOf("scaleX") || 1) + "," + (this.valueOf("scaleY") || 1) + "," + (this.valueOf("scaleZ") || 0) + ")";
          } else if (this._needsUniformScale()) {
            transform += "scale3d(" + (this.valueOf("scale")) + "," + (this.valueOf("scale")) + "," + (this.valueOf("scale")) + ")";
          }
          if (this._needsRotateIn3D()) {
            transform += "rotate3d(" + (this.valueOf("rotateX") || 0) + "px," + (this.valueOf("rotateY") || 0) + "px," + (this.valueOf("rotateZ") || 0) + "px," + (this.valueOf("rotate")) + "deg)";
          } else if (this._needsRotate()) {
            transform += "rotate(" + (this.valueOf("rotate")) + "deg)";
          }
        } else if (Sauce.TRANSFORMS != null) {
          if (this._needsTranslate()) {
            transform += "translate(" + (this.valueOf("x") || 0) + "px," + (this.valueOf("y") || 0) + "px)";
          }
          if (this._needsUniformScale() != null) {
            transform += "scale(" + (this.valueOf("scale")) + "," + (this.valueOf("scale")) + ")";
          }
          if (this._needsRotate() != null) {
            transform += "rotate(" + (this.valueOf("rotate")) + "deg)";
          }
        }
      }
      return transform || false;
    };
    Ingredient.prototype.css = function(keyframe) {
      var css, property, proprietaryProperty, rule, shouldGenerate, transform, _i, _len, _ref, _ref2;
      this.keyframe = keyframe;
      css = "";
      if (this.rules != null) {
        _ref = this.rules;
        for (property in _ref) {
          rule = _ref[property];
          shouldGenerate = true;
          _ref2 = Ingredient.TRANSFORM_PROPS;
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            proprietaryProperty = _ref2[_i];
            if (property === proprietaryProperty) {
              shouldGenerate = false;
            }
          }
          rule.valueAtFrameForElement(this.keyframe, this.element);
          if (shouldGenerate) {
            css += "" + property + ": " + value + ";";
          }
        }
      }
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
    Ingredient.prototype._needsTransform = function() {
      return this._checkProps(["x", "y", "z", "scaleX", "scaleY", "scaleZ", "scale", "rotate"]);
    };
    Ingredient.prototype._needsTranslate = function() {
      return this._checkProps(Ingredient.TRANSLATE_PROPS);
    };
    Ingredient.prototype._needsPrecisionScale = function() {
      return this._checkProps(Ingredient.PRECISE_SCALE_PROPS);
    };
    Ingredient.prototype._needsUniformScale = function() {
      return this.rules[Ingredient.SCALE_PROP] != null;
    };
    Ingredient.prototype._needsRotateIn3D = function() {
      return this._checkProps(Ingredient.PRECISE_ROTATE_PROPS);
    };
    Ingredient.prototype._needsRotate = function() {
      return this.rules[Ingredient.ROTATE_PROP] != null;
    };
    Ingredient.prototype._checkProps = function(properties) {
      var property, _i, _len;
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        property = properties[_i];
        if (this.rules[property] != null) {
          return true;
        }
      }
      return false;
    };
    return Ingredient;
  })();
  this.Sauce = (function() {
    Sauce._ANIMATION_ID = 0;
    Sauce.animationID = function() {
      return this._ANIMATION_ID += 1;
    };
    function Sauce(params) {
      if (params == null) {
        params = {};
      }
      if (Sauce.BROWSER_PREFIX == null) {
        Sauce.getBrowserCapabilities();
      }
      this.stylesheet = params.stylesheet || Sauce.STYLESHEET;
      this.spoon = params.spoon || function(flavors) {
        return 0;
      };
      this.keyframes = params.keyframes || 60;
      this.recipeFunction = params.recipe || null;
      this.animations = {};
      this.animationDelay = 0;
      this.animationDuration = 1;
      this.elements = {};
      this._ingredient = new Ingredient();
    }
    Sauce.prototype.recipe = function(recipeFunction) {
      this.recipeFunction = recipeFunction;
      return this;
    };
    Sauce.prototype.interval = function() {
      return 100 / this.keyframes;
    };
    Sauce.prototype.onComplete = function(complete) {
      this._complete = complete;
      return this;
    };
    Sauce.prototype.duration = function(animationDuration) {
      this.animationDuration = animationDuration;
      return this;
    };
    Sauce.prototype.delay = function(animationDelay) {
      this.animationDelay = animationDelay;
      return this;
    };
    Sauce.prototype.putOn = function(id) {
      var element;
      element = this._getOrCreateElementFromID(id);
      this.recipeFunction(this._ingredient);
      this._createAnimation(this.keyframes, id);
      return this._setAnimationOnElement(element);
    };
    Sauce.prototype.useAgainOn = function(id) {
      var element;
      element = this._getOrCreateElementFromID(id);
      this._setAnimationOnElement(element);
      return this;
    };
    Sauce.prototype._createAnimation = function(keyframes, id) {
      var cssFrames, currentFrame, frameLabel, keyframe;
      this.keyframes = keyframes;
      this.lastUsedID = id;
      this.animations[id] = "ease_" + (Sauce.animationID()) + "_" + (new Date().getTime());
      currentFrame = 0;
      cssFrames = "";
      while (currentFrame <= keyframes) {
        keyframe = this._computeKeyframe(currentFrame);
        frameLabel = "" + keyframe + "%";
        if (currentFrame < 1) {
          frameLabel = "from";
        } else if (currentFrame === this.keyframes) {
          frameLabel = "to";
        }
        this._ingredient.element = this._getOrCreateElementFromID(id);
        cssFrames += " " + frameLabel + " {" + (this._ingredient.css(keyframe)) + "}";
        currentFrame++;
      }
      this.animationCSS = "@-" + Sauce.BROWSER_PREFIX + "-keyframes " + this.animations[this.lastUsedID] + " {" + cssFrames + "}";
      console.log(this.animationCSS);
      this.index = this.stylesheet.cssRules.length;
      return this.stylesheet.insertRule(this.animationCSS, this.index);
    };
    Sauce.prototype._setAnimationOnElement = function(element) {
      element.source.style[Sauce.CURRENT_PROPS.animationName] = this.animations[this.lastUsedID];
      element.source.style[Sauce.CURRENT_PROPS.animationDelay] = "" + this.animationDelay + "s";
      element.source.style[Sauce.CURRENT_PROPS.animationDuration] = "" + this.animationDuration + "s";
      return element.source.addEventListener(Sauce.CURRENT_PROPS.animationEnd, (__bind(function() {
        return this._completeHandler(element);
      }, this)), false);
    };
    Sauce.prototype._getOrCreateElementFromID = function(id) {
      var element;
      if (this.elements[id] != null) {
        element = this.elements[id];
      } else {
        element = new ManagedElement(id);
        this.elements[id] = element;
      }
      return element;
    };
    Sauce.prototype._completeHandler = function(element) {
      this._applyCSS(100, element);
      if (this._complete != null) {
        return this._complete(this.element);
      }
    };
    Sauce.prototype._computeKeyframe = function(frame) {
      var flavor, keyframe, name, _ref;
      keyframe = frame * this.interval();
      _ref = this._flavors;
      for (name in _ref) {
        flavor = _ref[name];
        flavor.compute(keyframe);
      }
      this.spoon(this._flavors, this._ingredient);
      return keyframe;
    };
    Sauce.prototype._applyCSS = function(frame, element) {
      var property, value, _ref;
      this._computeKeyframe(frame);
      if (this._ingredient.customCSS != null) {
        _ref = this._ingredient.customCSS;
        for (property in _ref) {
          value = _ref[property];
          element.source.style[property] = value;
        }
      }
      if (Sauce.TRANSFORMS != null) {
        return element.source.style[Sauce.CURRENT_PROPS.transform] = this._ingredient.transformRule();
      }
    };
    Sauce.BROWSER_PREFIX = null;
    Sauce.TRANSFORMS3D = null;
    Sauce.TRANSFORMS = null;
    Sauce.CURRENT_PROPS = null;
    Sauce.STYLESHEET = null;
    Sauce.BROWSER_PROPS = {
      webkit: {
        animationEnd: 'webkitAnimationEnd',
        animationName: 'webkitAnimationName',
        animationDelay: 'webkitAnimationDelay',
        animationDuration: 'webkitAnimationDuration',
        transform: 'WebkitTransform'
      },
      moz: {
        animationEnd: 'animationend',
        animationName: 'MozAnimationName',
        animationDelay: 'webkitAnimationDelay',
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
      var features, index, name, options, prefix, prefixes, properties, property, style, stylesheet, userAgent, _results;
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
      document.styleSheets[document.styleSheets.length - 1];
      index = document.styleSheets.length;
      while (index > 1 && !(this.STYLESHEET != null)) {
        try {
          stylesheet = document.styleSheets[index - 1];
          if (stylesheet.cssRules != null) {
            this.STYLESHEET = stylesheet;
          }
        } catch (error) {
          console.log("Problem selecting stylesheet: " + error);
        }
        index -= 1;
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
