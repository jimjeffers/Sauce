(function() {
  describe("Sauce", function() {
    var sauce;
    sauce = null;
    beforeEach(function() {
      return sauce = new Sauce();
    });
    return describe("initializing a new instance", function() {
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
      return it("should let me pass a complete handler via the convenience method", function() {
        return sauce.onComplete(function(element) {});
      });
    });
  });
}).call(this);
