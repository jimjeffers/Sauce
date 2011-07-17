(function() {
  describe("Sauce", function() {
    var sauce;
    sauce = null;
    beforeEach(function() {
      return sauce = new Sauce();
    });
    describe("initializing a new instance", function() {
      it("should autogenerate a name if none is assigned", function() {
        return expect(sauce.name).not.toEqual(null);
      });
      it("should let me create flavors", function() {
        sauce = new Sauce({
          flavors: {
            redHotChiliPepper: {
              equation: Easie.elasticOut,
              from: -400,
              to: 0,
              period: 15
            },
            blueSourGrass: {
              equation: Easie.backInOut,
              from: 100,
              to: 200
            }
          }
        });
        expect(sauce.flavors().redHotChiliPepper).toBeAFlavor();
        return expect(sauce.flavors().blueSourGrass).toBeAFlavor();
      });
      it("should let me pass in a spoon", function() {
        var spoon;
        spoon = function(flavors, ingredient) {
          return ingredient.x = flavors.chili.value;
        };
        sauce = new Sauce({
          spoon: spoon
        });
        return expect(sauce.spoon === spoon).toBeTruthy();
      });
      it("should let me pass in an onComplete handler", function() {
        var complete;
        complete = function(element, browser, flavors) {
          if (element.className === "hideOnComplete") {
            return element.style.visibility = "hidden";
          }
        };
        sauce = new Sauce({
          complete: complete
        });
        return expect(sauce._complete === complete).toBeTruthy();
      });
      return it("should let me set the amount of keyframes", function() {
        sauce = new Sauce({
          keyframes: 10
        });
        return expect(sauce.interval() === 10).toBeTruthy();
      });
    });
    describe("convenience methods", function() {
      return it("should add a flavor called chili if I use addFlavor", function() {
        sauce.addFlavor("chili", {
          equation: Easie.elasticOut,
          from: -400,
          to: 0,
          period: 15
        });
        return expect(sauce.flavors().chili).toBeAFlavor();
      });
    });
    return describe("method chaining", function() {
      it("should allow me to chain flavors if I use addFlavor() in a sequence", function() {
        sauce.addFlavor("chili", {
          equation: Easie.elasticOut,
          from: -400,
          to: 0,
          period: 15
        }).addFlavor("pepper", {
          equation: Easie.elasticIn,
          from: 400,
          to: 0,
          period: 15
        });
        expect(sauce.flavors().chili).toBeAFlavor();
        return expect(sauce.flavors().pepper).toBeAFlavor();
      });
      return it("should allow me to chain flavors if I use addFlavor() in a sequence", function() {
        sauce.addFlavor("chili", {
          equation: Easie.elasticOut,
          from: -400,
          to: 0,
          period: 15
        }).addFlavor("pepper", {
          equation: Easie.elasticIn,
          from: 400,
          to: 0,
          period: 15
        });
        expect(sauce.flavors().chili).toBeAFlavor();
        return expect(sauce.flavors().pepper).toBeAFlavor();
      });
    });
  });
}).call(this);
