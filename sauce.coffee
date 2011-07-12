###
Sauce.coffee (https://github.com/jimjeffers/Sauce)
Project created by J. Jeffers

DISCLAIMER: Software provided as is with no warranty of any type. 
Don't do bad things with this :)
###

class @Ingredient
  constructor: (params={}) ->
    # Translating:
    # Skip any parameters you don't need to adjust.
    # translate3D used by default if available.
    @x          = params.x          || null
    @y          = params.y          || null
    @z          = params.z          || null
    
    # Scaling:
    # Just set scale if you want to do a uniform
    # scale. 3D Scaling will be used no matter what
    # if available so no need to set @scaleZ to 0.
    @scale      = params.scale      || null
    @scaleX     = params.scaleX     || null
    @scaleY     = params.scaleY     || null
    @scaleZ     = params.scaleZ     || null
    
    # Rotating:
    # Just set @rotate if you want to do a 
    # standard rotation.
    @rotate     = params.rotate     || null
    @rotateX    = params.rotate     || null
    @rotateY    = params.rotate     || null
    @rotateZ    = params.rotate     || null
    
    # Opacity:
    @opacity    = params.opacity    || null
  
  css: ->
    # We'll use string concatenation since it's more performant
    # then Array.join()
    css = ""
    # Let's do the hard stuff. If the user didn't use any settings
    # requiring a transform we bypass this.
    if @x? or @y? or @z? or @scale? or @rotate?
      # If no transforms were available we only support
      # animating the top and left properties of the object.
      # But to be honest.. it's doubtful CSS Animation will
      # even be available on any browsers that don't support
      # transformations.
      if !Sauce.TRANSFORMS?
        css += "left:#{@x};" if @x?
        css += "top:#{@y};" if @y?
      
      # Build Transforms
      else 
        transform = ""
        # 3D Transforms:
        # The preferred method even if all of our transforms are actually 2D.
        # We use 3D transforms to gain GPU accelerated animations.
        if Sauce.TRANSFORMS == "transform3d"
          if @x? or @y? or @z?
            transform += "translate3d(#{(@x || 0)}px,#{(@y || 0)}px,#{(@z || 0)}px)"
          
          if @scaleX? or @scaleY? or @scaleZ
            transform += "scale3d(#{@scaleX || 1},#{@scaleY || 1},#{@scaleZ || 0})"
          else if @scale?
            transform += "scale3d(#{@scale},#{@scale},#{@scale})"
          
          if @rotateX? or @rotateY? or @rotateZ?
            transform += "rotate3d(#{(@x || 0)}px,#{(@y || 0)}px,#{(@z || 0)}px,#{@rotate}deg)"
          else if @rotate?
            transform += "rotate(#{@rotate}deg)"
            
        # 2D Transforms:    
        # We use 2D transforms if available and 3D weren't supported.
        else if Sauce.TRANSFORMS == "transform"
          if @x? or @y?
            transform += "translate(#{(@x || 0)}px,#{(@y || 0)}px)"
          if @scale?
            transform += "scale(#{@scale},#{@scale})"
          if @rotate?
            transform += "rotate(#{@rotate}deg)"
        
        css += "-#{Sauce.BROWSER_PREFIX}-transform: #{transform};"
      
      # Assemble any explicit CSS... coming soon. For now just return.
      # TODO: Implement a method for setting and building any other 
      # CSS properties on the object.
      css
      
class @Flavor
  constructor: (params={}) ->
    @from       = params.from       || 0
    @to         = params.to         || 100
    @equation   = params.equation   || null
    @startFrame = params.startFrame || 0
    @endFrame   = params.endFrame   || 100
    @amplitude  = params.amplitude  || null
    @period     = params.period     || null
    @velocity   = 0
    @lastResult = 0
    @value      = 0
    
  compute: (keyframe) ->
    if keyframe < @startFrame
      keyframe = @startFrame
    else if keyframe > @endFrame
      keyframe = @endFrame
    if @period? || @amplitude?
      @value = @equation(keyframe-@startFrame,@from,@to-@from,@endFrame-@startFrame,@amplitude,@period)
    else
      @value = @equation(keyframe-@startFrame,@from,@to-@from,@endFrame-@startFrame)
    @velocity = Math.abs(@value-@lastResult)
    @lastResult = @value

class @Sauce
  constructor: ->
    @name = "ease_#{new Date().getTime()}"
    @stylesheet       = document.styleSheets[document.styleSheets.length-1];
    @flavors          = {}
    @spoon            = (flavors) -> 0
    @keyframes        = 60
    @complete         = (element,flavors,browser) -> false
    @ingredient       = new Ingredient()
    Sauce.getBrowserCapabilities() unless Sauce.BROWSER_PREFIX?
    
  addFlavor: (name,params) ->
    @flavors[name] = new Flavor(params)
    this
    
  create: (keyframes=60) ->
    interval = 100/keyframes
    currentFrame = 0
    cssFrames = ""
    while currentFrame <= keyframes
      keyframe = currentFrame * interval
      frameLabel = "#{keyframe}%"
      if currentFrame < 1
        frameLabel = "from"
      else if currentFrame == keyframes
        frameLabel = "to"
      for name, flavor of @flavors
        flavor.compute(keyframe)
      @spoon(@flavors,@ingredient)
      cssFrames += " #{frameLabel} {#{@ingredient.css()}}"
      currentFrame++
    animation = "@-#{Sauce.BROWSER_PREFIX}-keyframes #{@name} {#{cssFrames}}"
    @index = @stylesheet.cssRules.length
    console.log animation # Just for debugging THIS.. IS... BETA!!!
    @stylesheet.insertRule(animation, @index)
    
  onComplete: (complete) ->
    @complete = complete
    
  applyTo: (id,@duration=2) ->
    @create(@keyframes)
    @element = document.getElementById(id)
    if Sauce.BROWSER_PREFIX == "webkit"
      @element.style.webkitAnimationName = @name
      @element.style.webkitAnimationDuration = "#{@duration}s"
      @element.addEventListener('webkitAnimationEnd', ( =>
        @complete(@element,@flavors,@browser)
      ), false)
    else if Sauce.BROWSER_PREFIX == "moz"
      @element.style.MozAnimationName = @name
      @element.style.MozAnimationDuration = "#{@duration}s"
    return this
  
  # Browser Capability Testing:
  # -------------------------------------------------
  # We need to be able to determine the browser's prefix as most
  # of the features we need to perform animations are proprietary.
  # Also - we need to determine whether or not the browser supports
  # 3D or 2D transformations.
  
  @BROWSER_PREFIX: null
  @TRANSFORMS: null
  @getBrowserCapabilities: ->
    
    # Browser Prefix:
    # First we'll get the browser prefix necessary. This is done by running
    # a regex on the userAgent property. There are a few gotchas so we have
    # a 'negator' property on the JS object that runs to cancel out any
    # false positives.
    prefixes =
      webkit:   
        condition:  /webkit/
      o:    
        condition:  /opera/
      ie:
        condition:  /msie/
        negator:    /opera/
      moz:  
        condition:  /mozilla/
        negator:    /(compatible|webkit)/
    userAgent = navigator.userAgent.toLowerCase()
    for prefix, options of prefixes
       if options.condition.test(userAgent)
         @BROWSER_PREFIX = prefix unless options.negator? and options.negator.test(userAgent)
    
    # Simple test for transforms or 3D transforms inspired by modernizr.
    # See: https://github.com/Modernizr/Modernizr/blob/master/modernizr.js#L594
    style = document.createElement('test').style
    features =
      transform3d: ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
      transform: ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']
    for name, properties of features
      for property in properties
        @TRANSFORMS or= name unless style[property] == undefined
    