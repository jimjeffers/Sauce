# Sauce (BETA 0.0.1)
## Add some flavor to the web.

Sauce is a micro-framework (if you even can consider it that!) for building complex transitions that can't be achieved with a regular CSS transition. Let's say you want to use complex effects such as those that can only be achieved with elastic or bounce easing? Or maybe you want to animate two different properties at the same time utilizing a delay on one of the properties? Well, I've found you can get pretty far with CSS transitions but some of these things just aren't possible unless you turn to javascript to get something crazy done. Sauce is here and it makes the ridiculous easy (relatively speaking of course)!

## How it Works

Sauce relies on the easing equations I ported from Robert Penner in another project called Easie. Your first step is to include easie.js and sauce.js into your project.

## Components

Sauce works with two objects:

1. The Sauce
2. Flavors

### The Sauce

A Sauce is your actual transition. In the sauce you can add as many flavors as you want, and then apply it to an HTML element.

### The Flavors

A Flavor is a wrapper object for managing a specific easing equation.

### The Spoon (bonus!)

The spoon is an anonymous function you can pass into the sauce that allows you to build each keyframe for the animation.

## Show Me How it Works

Ok.. sauce, flavors, spoons.. it's easier just to see some javascript code eh? See the demo.html file in this project or take a look at this gist to get an idea:

https://gist.github.com/1072988

# TODOs

* Better documentation
* Better support for more than just webkit
* Maybe something to degrade to older browsers... not sure yet (just don't use sauce in old browsers!)