(function() {
  describe("Sauce", function() {
    var sauce;
    sauce = null;
    beforeEach(function() {
      return sauce = new Sauce();
    });
    describe("initializing a new instance", function() {
      return it("should let me pass in an onComplete handler", function() {
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
    });
    return describe("handling transformations", function() {
      beforeEach(function() {
        var div;
        if (document.getElementById("red") == null) {
          div = document.createElement("div");
          div.setAttribute("class", "square");
          div.setAttribute("id", "red");
          return document.body.appendChild(div);
        }
      });
      it("should move to down to 400px", function() {
        var div;
        div = document.getElementById("red");
        sauce.recipe(function(element) {
          return element.change("y").from(100).to(400).using(Easie.cubicInOut);
        });
        sauce.duration(0.5).putOn("red");
        return waitsFor((function() {
          return div.getAttribute("data-y") === "400";
        }));
      });
      it("should allow me to adjust the height and width", function() {
        var div;
        div = document.getElementById("red");
        sauce.recipe(function(element) {
          element.change("height").from(100).to(400).using(Easie.bounceOut);
          return element.change("width").from(100).to(500).using(Easie.bounceOut);
        });
        sauce.duration(0.5).putOn("red");
        waitsFor((function() {
          return div.getAttribute("data-height") === "400" && div.getAttribute("data-width") === "500";
        }));
        return runs(function() {
          expect(div.getAttribute("data-height") === "400").toBeTruthy();
          return expect(div.getAttribute("data-width") === "500").toBeTruthy();
        });
      });
      it("should chain by moving to the right 300px after moving up to 200px", function() {
        var div;
        div = document.getElementById("red");
        sauce.recipe(function(element) {
          return element.change("y").from(400).to(200).using(Easie.bounceOut);
        }).onComplete(function() {
          var sideSauce;
          sideSauce = new Sauce();
          sideSauce.recipe(function(element) {
            return element.change("x").to(300).using(Easie.elasticOut);
          });
          return sideSauce.duration(1).putOn("red");
        });
        sauce.duration(0.5).putOn("red");
        waitsFor((function() {
          return div.getAttribute("data-y") === "200" && div.getAttribute("data-x") === "300";
        }));
        return runs(function() {
          expect(div.getAttribute("data-y") === "200").toBeTruthy();
          return expect(div.getAttribute("data-x") === "300").toBeTruthy();
        });
      });
      return it("should allow me to manipulate multiple properties simultaneously", function() {
        var div;
        div = document.getElementById("red");
        sauce.recipe(function(element) {
          element.change("y").to(150).using(Easie.backOut);
          element.change("rotate").to(45).using(Easie.backOut);
          return element.change("scale").to(2).using(Easie.backOut);
        });
        sauce.duration(0.5).putOn("red");
        waitsFor((function() {
          return div.getAttribute("data-y") === "150" && div.getAttribute("data-rotate") === "45" && div.getAttribute("data-scale") === "2";
        }));
        return runs(function() {
          expect(div.getAttribute("data-y") === "150").toBeTruthy();
          return expect(div.getAttribute("data-rotate") === "45").toBeTruthy();
        });
      });
    });
  });
}).call(this);
