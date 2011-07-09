(function() {
  /*
  Sauce.coffee (https://github.com/jimjeffers/Sauce)
  Project created by J. Jeffers
  
  DISCLAIMER: Software provided as is with no warranty of any type. 
  Don't do bad things with this :)
  */
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.Flavor = (function() {
    function Flavor(params) {
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
      this.spoon = function(flavors, browser) {
        return 0;
      };
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
      this.browser = "webkit";
      this.keyframes = 60;
      this.complete = function(element, flavors, browser) {
        return false;
      };
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
        keyframe = Math.floor(currentFrame * interval);
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
        cssFrames += " " + frameLabel + " {" + (this.spoon(this.flavors, this.browser)) + "}";
        currentFrame++;
      }
      animation = "@-" + this.browser + "-keyframes " + this.name + " {" + cssFrames + "}";
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
      if (this.browser === "webkit") {
        this.element.style.webkitAnimationName = this.name;
        this.element.style.webkitAnimationDuration = "" + this.duration + "s";
        this.element.addEventListener('webkitAnimationEnd', (__bind(function() {
          return this.complete(this.element, this.flavors, this.browser);
        }, this)), false);
      }
      return this;
    };
    return Sauce;
  })();
}).call(this);
