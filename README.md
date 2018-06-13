# Sauce (BETA 0.3.0)
## Add some flavor to the web.

Sauce is a micro-framework (if you even can consider it that!) for building complex transitions that can't be achieved with a regular CSS transition. Let's say you want to use complex effects such as those that can only be achieved with elastic or bounce easing? Or maybe you want to animate two different properties at the same time utilizing a delay on one of the properties? Well, I've found you can get pretty far with CSS transitions but some of these things just aren't possible unless you turn to javascript to get something crazy done. Sauce is here and it makes the ridiculous easy (relatively speaking of course)!

## Dependencies

Sauce relies on the easing equations I ported from Robert Penner in another project called [Easie](https://github.com/jimjeffers/Easie). Your first step is to include easie.js and sauce.js into your project.


### The Sauce

A Sauce is your actual transition. You pass in a recipe and then apply it to an HTML element.

```coffeescript
hotSauce = new Sauce()
hotSauce.recipe( (element) ->
   element.change("y").from(-200).using(Easie.bounceOut)
   element.change("scale").from(0).using(Easie.circOut)
)

hotSauce.duration(2).delay(0.5).putOn("element_with_this_id")
```

The code above would generate a CSS animation with 60 keyframes. _"keyframes"_ is a property you can change on the instance. Each frame generated uses the correct browser proprietary CSS for the current browser. In addition we default to 3D transitions whenever possible to take advantage of the GPU. In webkit you will see frames generated like this:

```css
25% {
   -webkit-transform: translate3d(0px,144.19417382415918px,0px) scale3d(0.8726779962499649,0.8726779962499649,0.8726779962499649);
}
28% { ... } /* etc. */
```

and in firefox:

```css
25% {
   -moz-transform: translate(0px,144.19417382415918px)scale(0.8726779962499649,0.8726779962499649);
}
28% { ... } /* etc. */
```

You can even perform calculations based on the velocity of a given properties tween. Check this out:

```coffeescript
hotSauce.recipe( (element) ->
   element.change("y").from(-200).using(Easie.circInOut)
   element.change("scale").from(0).using(element.velocity("y", (velocity) ->
      1+velocity/100
   ))
)
```

With this ease in and out equation we'll see the object scale to a larger size in a fluid fashion as it speeds up and returns back to its original size as it slows down and eventually comes to a stop.

### Applying the Sauce

This part is simple but likely to change. At the moment there's a simple method that was also creatively named 'applyTo':

```coffeescript
hotSauce.applyTo("test",2) # Apply transition to element with ID 'test' for a duration of 2 seconds.
```

### Event Listening

At the moment you can bind an event listener to handle the completion of a transition. You must accept the ingredient
as a parameter which will let you manipulate the CSS that will be bound to the element.

```coffeescript
hotSauce.onComplete((ingredient) ->
  alert "Completed!"
)
```

# Test Suite

A test suite is now provided using [Jasmine.js](https://jasmine.github.io/)
