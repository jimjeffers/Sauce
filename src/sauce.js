
/*
Sauce.coffee (https://github.com/jimjeffers/Sauce)
Project created by J. Jeffers

DISCLAIMER: Software provided as is with no warranty of any type. 
Don't do bad things with this :)
*/

(function() {

  Array.prototype.include = function(matchedItem) {
    return this.indexOf(matchedItem) >= 0;
  };

  this.ManagedElement = (function() {

    function ManagedElement(elementID) {
      this.source = document.getElementById(elementID);
      this.opacity = this.source.getAttribute("data-opacity") || 1;
      this.x = this.source.getAttribute("data-x") || 0;
      this.y = this.source.getAttribute("data-y") || 0;
      this.z = this.source.getAttribute("data-z") || 0;
      this.scaleX = this.source.getAttribute("data-scaleX") || 1;
      this.scaleY = this.source.getAttribute("data-scaleY") || 1;
      this.scaleZ = this.source.getAttribute("data-scaleZ") || 1;
      this.rotate = this.source.getAttribute("data-rotate") || 0;
      this.rotateX = this.source.getAttribute("data-rotateX") || 0;
      this.rotateY = this.source.getAttribute("data-rotateY") || 0;
      this.rotateZ = this.source.getAttribute("data-rotateZ") || 0;
      this.scale = this.source.getAttribute("data-scale") || 1;
      this;
    }

    return ManagedElement;

  })();

  this.VelocityEquation = (function() {

    function VelocityEquation(rule, equation) {
      this.rule = rule;
      this.equation = equation;
      this;
    }

    VelocityEquation.prototype.calculateForFrame = function(keyframe) {
      var x;
      x = this.equation(this.rule.velocityAtKeyFrame(keyframe));
      return x;
    };

    return VelocityEquation;

  })();

  this.Rule = (function() {

    function Rule(params) {
      if (params == null) params = {};
      this.equation = params.equation || Easie.linearNone;
      this.startFrame = 0;
      this.endFrame = 100;
      this.units = "px";
    }

    Rule.prototype.change = function(property) {
      this.property = property;
      return this;
    };

    Rule.prototype.to = function(endPoint) {
      this.endPoint = endPoint;
      this.endPoint = parseFloat(this.endPoint);
      return this;
    };

    Rule.prototype.from = function(startPoint) {
      this.startPoint = startPoint;
      this.startPoint = parseFloat(this.startPoint);
      return this;
    };

    Rule.prototype.withUnits = function(units) {
      this.units = units;
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

    Rule.prototype.velocityAtKeyFrame = function(keyframe) {
      if (keyframe === this.keyframe && keyframe !== 0 && keyframe !== 100) {
        return this.velocity;
      }
      return 0;
    };

    Rule.prototype.isVelocityRule = function() {
      return this.equation instanceof VelocityEquation;
    };

    Rule.prototype.valueAtFrameForElement = function(keyframe, element) {
      this.element = element;
      if (this.keyframe !== keyframe) {
        this.keyframe = keyframe;
        if (this.isVelocityRule()) {
          this.value = this.equation.calculateForFrame(this.keyframe);
        } else {
          this.value = this._calculateForFrame(this.keyframe);
        }
        this.velocity = Math.abs(this.value - this.lastResult);
        this.lastResult = this.value;
      }
      return this.value;
    };

    Rule.prototype._calculateForFrame = function(keyframe) {
      var endPoint, startPoint, value;
      if (this.startPoint != null) {
        startPoint = this.startPoint;
      } else {
        startPoint = this._getElementProp(this.element);
      }
      if (this.endPoint != null) {
        endPoint = this.endPoint;
      } else {
        endPoint = this._getElementProp(this.element);
      }
      if (keyframe < this.startFrame) {
        keyframe = this.startFrame;
      } else if (keyframe > this.endFrame) {
        keyframe = this.endFrame;
      }
      if ((this.period != null) || (this.amplitude != null)) {
        value = this.equation(keyframe - this.startFrame, startPoint, endPoint - startPoint, this.endFrame - this.startFrame, this.amplitude, this.period);
      } else {
        value = this.equation(keyframe - this.startFrame, startPoint, endPoint - startPoint, this.endFrame - this.startFrame);
      }
      return value;
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

    Ingredient.UNIT_PROPS = ["height", "width"];

    function Ingredient() {
      this.rules = {};
      this.element = null;
      this.keyframe = 0;
      this.utilizingVelocity = false;
    }

    Ingredient.prototype.change = function(property) {
      if (this.rules[property] == null) {
        this.rules[property] = new Rule().change(property);
      }
      return this.rules[property];
    };

    Ingredient.prototype.velocity = function(property, equationFunction) {
      return new VelocityEquation(this.rules[property], equationFunction);
    };

    Ingredient.prototype.valueOf = function(property) {
      if (((property = this.rules[property]) != null) && !(property.isVelocityRule() && !this.utilizingVelocity)) {
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
            transform += "scale3d(" + (this.valueOf("scale") || 1) + "," + (this.valueOf("scale") || 1) + "," + (this.valueOf("scale") || 0) + ")";
          }
          if (this._needsRotateIn3D()) {
            transform += "rotate3d(" + (this.valueOf("rotateX") || 0) + "px," + (this.valueOf("rotateY") || 0) + "px," + (this.valueOf("rotateZ") || 0) + "px," + (this.valueOf("rotate") || 0) + "deg)";
          } else if (this._needsRotate()) {
            transform += "rotate(" + (this.valueOf("rotate") || 0) + "deg)";
          }
        } else if (Sauce.TRANSFORMS != null) {
          if (this._needsTranslate()) {
            transform += "translate(" + (this.valueOf("x") || 0) + "px," + (this.valueOf("y") || 0) + "px)";
          }
          if (this._needsUniformScale() != null) {
            transform += "scale(" + (this.valueOf("scale") || 1) + "," + (this.valueOf("scale") || 1) + ")";
          }
          if (this._needsRotate() != null) {
            transform += "rotate(" + (this.valueOf("rotate") || 0) + "deg)";
          }
        }
      }
      return transform || false;
    };

    Ingredient.prototype.css = function(keyframe) {
      var css, property, rule, shouldGenerate, transform, units, _ref;
      this.keyframe = keyframe;
      css = "";
      if (this.rules != null) {
        _ref = this.rules;
        for (property in _ref) {
          rule = _ref[property];
          shouldGenerate = true;
          units = "";
          if (Ingredient.TRANSFORM_PROPS.include(property)) shouldGenerate = false;
          if (Ingredient.UNIT_PROPS.include(property)) units = rule.units;
          rule.valueAtFrameForElement(this.keyframe, this.element);
          if (shouldGenerate) {
            css += "" + property + ": " + rule.value + units + ";";
          }
        }
      }
      if (!(Sauce.TRANSFORMS != null)) {
        if (this.valueOf("x") != null) {
          css += "left:" + (this.valueOf("x")) + "px;";
        }
        if (this.valueOf("y") != null) css += "top:" + (this.valueOf("y")) + "px;";
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
        if (this.rules[property] != null) return true;
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

    Sauce.applyRecipe = function(recipe) {
      return new Sauce({
        recipe: recipe
      });
    };

    function Sauce(params) {
      if (params == null) params = {};
      if (Sauce.BROWSER_PREFIX == null) {
        Sauce.getBrowserCapabilities(params.force2d);
      }
      this.stylesheet = params.stylesheet || Sauce.STYLESHEET;
      this.keyframes = params.keyframes || 60;
      this.recipeFunction = params.recipe || null;
      this.animations = {};
      this.animationDelay = 0;
      this.animationDuration = 1;
      this.animaionIteration = 1;
      this.elements = {};
      this._ingredient = new Ingredient();
      this._complete = params.complete || null;
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

    Sauce.prototype.iterations = function(animationIteration) {
      this.animationIteration = animationIteration;
      return this;
    };

    Sauce.prototype.putOn = function(id) {
      var element, property, _i, _len, _ref;
      element = this._getOrCreateElementFromID(id);
      if (element.source.getAttribute("data-properties") != null) {
        _ref = element.source.getAttribute("data-properties").split(",");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          property = _ref[_i];
          this._ingredient.change(property).from(element.source.getAttribute("data-" + property)).to(element.source.getAttribute("data-" + property));
        }
      }
      this.recipeFunction(this._ingredient);
      this._createAnimation(this.keyframes, id);
      this._applyCSS(0, element);
      this._setAnimationOnElement(element);
      return this;
    };

    Sauce.prototype.on = function(id) {
      return this.putOn(id);
    };

    Sauce.prototype.withDuration = function(duration) {
      return this.duration(duration);
    };

    Sauce.prototype.andDelay = function(delay) {
      return this.delay(delay);
    };

    Sauce.prototype.times = function(iterations) {
      return this.iterations(iterations);
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
      this._ingredient.utilizingVelocity = true;
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
      this._ingredient.utilizingVelocity = false;
      if (this.stylesheet.cssRules != null) {
        this.index = this.stylesheet.cssRules.length;
      }
      return this.stylesheet.insertRule(this.animationCSS, this.index || 0);
    };

    Sauce.prototype._setAnimationOnElement = function(element) {
      var _this = this;
      element.source.style[Sauce.CURRENT_PROPS.animationName] = this.animations[this.lastUsedID];
      element.source.style[Sauce.CURRENT_PROPS.animationDelay] = "" + this.animationDelay + "s";
      element.source.style[Sauce.CURRENT_PROPS.animationDuration] = "" + this.animationDuration + "s";
      element.source.style[Sauce.CURRENT_PROPS.animationIteration] = this.animationIteration;
      return element.source.addEventListener(Sauce.CURRENT_PROPS.animationEnd, (this._handler = (function() {
        return _this._completeHandler(element);
      })), false);
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
      element.source.removeEventListener(Sauce.CURRENT_PROPS.animationEnd, this._handler);
      this._applyCSS(100, element);
      if (this._complete != null) this._complete();
      return this._complete = null;
    };

    Sauce.prototype._computeKeyframe = function(frame) {
      return frame * this.interval();
    };

    Sauce.prototype._applyCSS = function(frame, element) {
      var property, rule, trackedProperties, _ref;
      this._ingredient.css(this._computeKeyframe(frame));
      if (this._ingredient.rules != null) {
        if (element.source.getAttribute("data-properties") != null) {
          trackedProperties = element.source.getAttribute("data-properties").split(",");
        } else {
          trackedProperties = [];
        }
        _ref = this._ingredient.rules;
        for (property in _ref) {
          rule = _ref[property];
          element.source.style[property] = rule.value;
          element.source.setAttribute("data-" + property, rule.value);
          if (!trackedProperties.include(property)) {
            trackedProperties.push(property);
          }
        }
        element.source.setAttribute("data-properties", trackedProperties.join(","));
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
        animationName: 'WebkitAnimationName',
        animationDelay: 'WebkitAnimationDelay',
        animationDuration: 'WebkitAnimationDuration',
        animationIteration: 'WebkitAnimationIterationCount',
        transform: 'WebkitTransform'
      },
      moz: {
        animationEnd: 'animationend',
        animationName: 'MozAnimationName',
        animationDelay: 'webkitAnimationDelay',
        animationDuration: 'MozAnimationDuration',
        animationIteration: 'MozAnimationIterationCount',
        transform: 'MozTransform'
      },
      o: {
        animationEnd: null,
        animationName: null,
        animationDuration: null,
        animationIteration: null,
        transform: 'OTransform'
      },
      ms: {
        animationEnd: null,
        animationName: null,
        animationDuration: null,
        animationIteration: null,
        transform: 'msTransform'
      }
    };

    Sauce.getBrowserCapabilities = function(force2d) {
      var features, name, options, prefix, prefixes, properties, property, style, stylesheet, userAgent, _i, _len, _ref, _results;
      prefixes = {
        webkit: {
          condition: /webkit/
        },
        o: {
          condition: /opera/
        },
        ms: {
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
      _ref = document.styleSheets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stylesheet = _ref[_i];
        try {
          this.STYLESHEET = stylesheet;
        } catch (error) {
          console.log("Problem selecting stylesheet: " + error);
        }
      }
      if (force2d) {
        this.TRANSFORMS = true;
        return;
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
          var _j, _len2, _results2;
          _results2 = [];
          for (_j = 0, _len2 = properties.length; _j < _len2; _j++) {
            property = properties[_j];
            if (style[property] !== void 0) {
              if (name === "transform3d") this.TRANSFORMS3D = true;
              if (name === "transform") {
                _results2.push(this.TRANSFORMS = true);
              } else {
                _results2.push(void 0);
              }
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    return Sauce;

  })();

}).call(this);
