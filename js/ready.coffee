$(document).ready( ->
  $.getScript('/js/mylibs/easie.js', ->
    $.getScript('/js/mylibs/sauce.js', ->
      headlineSauce = new Sauce()
      headlineSauce.recipe((element) ->
        element.change("y").from(-200).using(Easie.bounceOut)
        element.change("scale").from(0.01).using(Easie.circOut)
      )
      
      letters = $("#sauce").lettering().find("span")
      console.log letters
      $("#sauce span").each((index,item) ->
        console.log (item = $(item))
        if index < 1
          headlineSauce.duration(1).putOn(item)
        else
          headlineSauce.duration(1).delay(index*.25).useAgainOn(item)
      )
      

      taglineSauce = new Sauce()
      taglineSauce.recipe((element) ->
        element.change("x").from(-200).to(-10).using(Easie.backInOut)
        element.change("opacity").from(0).using(Easie.circOut).endingOnFrame(45)
        element.change("scale").using(element.velocity("x", (velocity) -> 1-velocity/100))
      )
      taglineSauce.delay(1.25).putOn("tagline")
    )
  )
)