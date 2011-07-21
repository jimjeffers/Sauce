(function() {
  $(document).ready(function() {
    return $.getScript('/js/mylibs/easie.js', function() {
      return $.getScript('/js/mylibs/sauce.js', function() {
        var headlineSauce, letters, taglineSauce;
        headlineSauce = new Sauce();
        headlineSauce.recipe(function(element) {
          element.change("y").from(-200).using(Easie.bounceOut);
          return element.change("scale").from(0.01).using(Easie.circOut);
        });
        letters = $("#sauce").lettering().find("span");
        console.log(letters);
        $("#sauce span").each(function(index, item) {
          console.log((item = $(item)));
          if (index < 1) {
            return headlineSauce.duration(1).putOn(item);
          } else {
            return headlineSauce.duration(1).delay(index * .25).useAgainOn(item);
          }
        });
        taglineSauce = new Sauce();
        taglineSauce.recipe(function(element) {
          element.change("x").from(-200).to(-10).using(Easie.backInOut);
          element.change("opacity").from(0).using(Easie.circOut).endingOnFrame(45);
          return element.change("scale").using(element.velocity("x", function(velocity) {
            return 1 - velocity / 100;
          }));
        });
        return taglineSauce.delay(1.25).putOn("tagline");
      });
    });
  });
}).call(this);
