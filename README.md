# Sauce (BETA 0.0.1)
## Add some flavor to the web.

Sauce is a micro-framework (if you even can consider it that!) for building complex transitions that can't be achieved with a regular CSS transition. Let's say you want to use complex effects such as those that can only be achieved with elastic or bounce easing? Or maybe you want to animate two different properties at the same time utilizing a delay on one of the properties? Well, I've found you can get pretty far with CSS transitions but some of these things just aren't possible unless you turn to javascript to get something crazy done. Sauce is here and it makes the ridiculous easy (relatively speaking of course)!

## How it Works

Sauce relies on the easing equations I ported from Robert Penner in another project called Easie. Your first step is to include easie.js and sauce.js into your project.

## Components

Sauce works with two objects:

1. Sauces
2. Flavors

### The Sauce

A Sauce is your actual transition. In the sauce you can add as many flavors as you want, and then apply it to an HTML element.

```coffeescript
hotSauce = new Sauce()
```

### The Flavors

A Flavor is a wrapper object for managing a specific easing equation.

```coffeescript
chili = new Flavor({
   equation:   Easie.elasticOut
   from:       -400
   to:         0
   amplitude:  600   # optional
   period:     15    # optional
   startFrame: 0     # optional
   endFrame:   100   # optional
})
```

And to get the calculated position from the easing equation you simply run compute on the specified keyframe. Which would be any number between 0 and 100.

```coffeescript
chili.value       # => 0
chili.compute(25) # => 93.41893379518444
chili.value       # => 93.41893379518444
```

All of the parameters are properties that you can modify at any point in time:

```coffeescript
chili.from  = $("#element").position().left; # Sauce is framework agnostic, use what ever you'd like.
chili.to    = e.pageX
```

## Adding the Flavors to Your Sauce

The Sauce object has a convenience method creatively named "addFlavor" which allows you to pass a string identifier and the Flavor parameters hash.

```coffeescript
hotSauce.addFlavor("chili", {
  equation: Easie.elasticOut
  from:     -400
  to:       0
  period:   15
})
```

This method always returns the Sauce object so it's totally chainable!

```coffeescript
hotSauce.addFlavor("chili", {
  equation: Easie.elasticOut
  from:     -400
  to:       0
  period:   15
}).addFlavor("pepper", {
  equation: Easie.circOut
  from:     0.5
  to:       1
  endFrame: 75
})
```

The flavors are stored in a hash property:

```coffeescript
hotSauce.flavors.chili
hotSauce.flavors.pepper
```

### The Spoon (bonus!)

The spoon is an anonymous function you can pass into the sauce that allows you to build each keyframe for the animation. It requires two important parameters:

1. flavors: access to the sauce's flavors hash.
2. browser: a string that you can use for prefix properties. (the Sauce will give you 'webkit','moz','o'... but right now it just returns 'webkit' as this is beta!)

```coffeescript
hotSauce.spoon = (flavors,browser) ->
  css = "-#{browser}-transform: translate3d(0px,#{flavors.chili.value}px,0) "
  css += "scale3d(#{flavors.pepper.value},#{flavors.pepper.value},0)"
```

It's important that you always return a string containing valid CSS properties that you want to set on the element. The value of each flavor should be considered computed as the sauce will call the spoon when it has computed the flavors for the current keyframe it's stepping through.

### Applying the Sauce

This part is simple but likely to change. At the moment there's a simple method that was also creatively named 'applyTo':

```coffeescript
hotSauce.applyTo("test",2) # Apply transition to element with ID 'test' for a duration of 2 seconds.
```

But wait.. once the transition is complete the object will return back to its pre-animation state. How can we get it to stick? At the moment it's not so nice.. the sauce is a little sloppy here. We have an 'onComplete' handler that allows you to do whatever you'd want to the element once the animation finishes.

```coffeescript
hotSauce.onComplete((element,flavors,browser) ->
  css = "-#{browser}-transform: translate3d(0px,#{flavors.chili.value}px,0) "
  css += "scale3d(#{flavors.pepper.value},#{flavors.pepper.value},0)"
  element.style.webkitTransform = css;
)
```

Again.. these methods are chainable so you could do it like this as well:

```coffeescript
hotSauce.applyTo("test",2).onComplete((element,flavors,browser) ->
  css = "-#{browser}-transform: translate3d(0px,#{flavors.chili.value}px,0) "
  css += "scale3d(#{flavors.pepper.value},#{flavors.pepper.value},0)"
  element.style.webkitTransform = css;
)
```

## Show Me How it Works

Ok.. sauce, flavors, spoons.. it's easier just to see some javascript code eh? See the demo.html file in this project or take a look at this gist to get an idea of how the JS implementation of the API looks like in action:

https://gist.github.com/1072988

# TODOs

* Better documentation
* Better support for more than just webkit
* Maybe something to degrade to older browsers... not sure yet (just don't use sauce in old browsers!)