(function() {

  beforeEach(function() {
    return this.addMatchers({
      toHaveElement: function(element) {
        var sauce;
        sauce = this.actual;
        return sauce.element === element;
      },
      toBeAFlavor: function() {
        var flavor;
        flavor = this.actual;
        return flavor instanceof Flavor;
      }
    });
  });

}).call(this);
