# Sauce (BETA 0.1.0)
## Add some flavor to the web.

Sauce is a micro-framework (if you even can consider it that!) for building complex transitions that can't be achieved with a regular CSS transition. Let's say you want to use complex effects such as those that can only be achieved with elastic or bounce easing? Or maybe you want to animate two different properties at the same time utilizing a delay on one of the properties? Well, I've found you can get pretty far with CSS transitions but some of these things just aren't possible unless you turn to javascript to get something crazy done. Sauce is here and it makes the ridiculous easy (relatively speaking of course)!

## How it Works

Sauce relies on the easing equations I ported from Robert Penner in another project called Easie. Your first step is to include easie.js and sauce.js into your project.

## Components

Sauce works with two objects:

1. Sauces
2. Flavors
3. Ingredients

### The Sauce

A Sauce is your actual transition. In the sauce you can add as many flavors as you want, and then apply it to an HTML element.

```coffeescript
hotSauce = new Sauce()
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

1. flavors: the sauce's flavors hash so you can utilize your easing functions.
2. ingredient: the sauce's ingredient object which allows you to set CSS properties to an object - the ingredient automatically converts properties to prefixed properties when necessary for the current browser and degrades from 3d transforms to 2d transforms if they're not supported. 

```coffeescript
# Apply the chili flavor's equation to the element's Y property 
# and the pepper flavor's equation to the element's scale.
hotSauce.spoon = (flavors,ingredient) ->
  ingredient.y = flavors.chili.value;
  ingredient.scale = flavors.pepper.value;
```

The keyframe animation output would look like this when the sauce is applied in Safari or Chrome:

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

### Applying the Sauce

This part is simple but likely to change. At the moment there's a simple method that was also creatively named 'applyTo':

```coffeescript
hotSauce.applyTo("test",2) # Apply transition to element with ID 'test' for a duration of 2 seconds.
```
### Cleaning Up (Soon to be degraded w/ Ingredients)

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

### The Ingredients

The ingredient is an intelligent object that allows you to set CSS properties such as x, y, z, scale, rotation and soon any other explicit CSS properties. There are two reasons I created ingredients:

1. It's cleaner to setup your animation in code by setting attributes on a javascript object rather than trying to build a CSS string for each keyframe on the fly.
2. Using the ingredient object allows us to abstract the cross-browser CSS problems away from the user. 

So all you need to do is set the 'x' property on an object. The ingredient will then generate the CSS for a 3D translation with a -webkit prefix in Chrome and a 2D translation with a -moz prefix in firefox. This makes life a lot easier!

# TODOs

* -Better documentation-
* -Better support for more than just webkit-
* On complete handler should be automated and made cross-browser.
* Maybe something to degrade to older browsers... not sure yet (just don't use sauce in old browsers!)