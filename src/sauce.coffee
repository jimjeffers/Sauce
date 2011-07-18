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
    
    # Custom CSS allows the user to pass in standard 
    # CSS properties.
    @customCSS  = null
  
  setRule: (property,value) ->
    @customCSS = {} unless @customCSS?
    @customCSS[property] = value
    
  css: ->
    # We'll use string concatenation since it's more performant
    # then Array.join()
    css = ""
    
    # Handle explicit CSS:
    if @customCSS?
      for property,value of @customCSS
        css += "#{property}: #{value};"
      
    # If no transforms were available we only support
    # animating the top and left properties of the object.
    # But to be honest.. it's doubtful CSS Animation will
    # even be available on any browsers that don't support
    # transformations.
    if !Sauce.TRANSFORMS?
      css += "left:#{@x};" if @x?
      css += "top:#{@y};" if @y?
    else
      css += "-#{Sauce.BROWSER_PREFIX}-transform: #{transform};" if (transform = @transformRule())?
      
    # Assemble any explicit CSS... coming soon. For now just return.
    # TODO: Implement a method for setting and building any other 
    # CSS properties on the object.
    css
    
  transformRule: ->
    # Let's do the hard stuff. If the user didn't use any settings
    # requiring a transform we bypass this.
    if @x? or @y? or @z? or @scale? or @rotate?
      transform = ""
      # 3D Transforms:
      # The preferred method even if all of our transforms are actually 2D.
      # We use 3D transforms to gain GPU accelerated animations.
      if Sauce.TRANSFORMS3D?
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
      else if Sauce.TRANSFORMS?
        if @x? or @y?
          transform += "translate(#{(@x || 0)}px,#{(@y || 0)}px)"
        if @scale?
          transform += "scale(#{@scale},#{@scale})"
        if @rotate?
          transform += "rotate(#{@rotate}deg)"
    
    transform || false
      
class @Flavor
  constructor: (name,params={}) ->
    @name       = name
    @from       = params.from       || 0
    @to         = params.to         || 0
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

# The Sauce:
# -------------------------------------------------
# The sauce is the main controller object that coordinates 
# the flavors (eases) and owns an ingredient (css abstraction).
class @Sauce
  constructor: (params={}) ->
    # Get the browser capabilities if we haven't done so yet.
    Sauce.getBrowserCapabilities() unless Sauce.BROWSER_PREFIX?
    
    @name             = params.name           || "ease_#{Sauce.animationID()}_#{new Date().getTime()}"
    @stylesheet       = params.stylesheet     || Sauce.STYLESHEET
    @spoon            = params.spoon          || (flavors) -> 0
    @keyframes        = params.keyframes      || 60
    @animationCSS     = null
    
    # The following '_xxx' properties are intended to be private.
    @_complete        = params.complete       || (element,flavors,browser) -> false
    @_ingredient      = new Ingredient()
    @_flavors         = {}
    
    if params.flavors?
      for name,params of params.flavors
        @addFlavor(name,params) 
  
  # Convenience method for adding a flavor to the sauce.
  addFlavor: (flavor,params={}) ->
    if flavor instanceof Flavor and flavor.name?
      @_flavors[flavor.name] = flavor
    else
      @_flavors[flavor] = new Flavor(flavor,params)
    this
  
  # Convenience method for adding a flavor to the sauce.
  stirWith: (spoon) ->
    @spoon = spoon
    this
  
  # Convenience method for retrieving the current flavors.
  flavors: -> @_flavors
  
  # Returns the interval. Represents an increment for percentages
  # in a @-keyframes CSS animation.
  interval: -> 100/@keyframes
  
  # Generates a CSS keyframe animation.
  create: (@keyframes=60) ->
    currentFrame = 0
    cssFrames = ""
    while currentFrame <= keyframes
      keyframe = @_computeKeyframe(currentFrame)
      frameLabel = "#{keyframe}%"
      if currentFrame < 1
        frameLabel = "from"
      else if currentFrame == @keyframes
        frameLabel = "to"
      cssFrames += " #{frameLabel} {#{@_ingredient.css()}}"
      currentFrame++
    @animationCSS = "@-#{Sauce.BROWSER_PREFIX}-keyframes #{@name} {#{cssFrames}}"
    @index = @stylesheet.cssRules.length
    @stylesheet.insertRule(@animationCSS, @index)
    this
  
  # Convenience method for applying the complete handler.
  onComplete: (complete) ->
    @_complete = complete
    this
  
  # Preps the element and generates the keyframes.
  applyTo: (id) ->
    @element = document.getElementById(id)
    @_applyCSS(0)
    @create(@keyframes)
    @element.addEventListener(Sauce.CURRENT_PROPS.animationEnd, ( =>
      @_completeHandler()
    ), false)
    this
  
  # Applies the animation to the object.
  pour: (@duration=2) ->
    @element.style[Sauce.CURRENT_PROPS.animationName] = @name
    @element.style[Sauce.CURRENT_PROPS.animationDuration] = "#{@duration}s"
  
  # The underscore denotes that this method should be considered PRIVATE
  # and is only to be called internally. Use onComplete() to bind
  _completeHandler: ->
    @_applyCSS(100)
    @_complete(@element,@flavors,@browser)
  
  _computeKeyframe: (frame) ->
    keyframe = frame * @interval()
    for name, flavor of @_flavors
      flavor.compute(keyframe)
    @spoon(@_flavors,@_ingredient)
    return keyframe
      
  _applyCSS: (frame) ->
    @_computeKeyframe(frame)
    if @_ingredient.customCSS?
      for property,value of @_ingredient.customCSS
       @element.style[property] = value
    if Sauce.TRANSFORMS?
      @element.style[Sauce.CURRENT_PROPS.transform] = @_ingredient.transformRule()
  
  # Increments Animation ID
  @_ANIMATION_ID = 0
  
  @animationID: ->
    @_ANIMATION_ID += 1
  
  # Browser Capability Testing:
  # -------------------------------------------------
  # We need to be able to determine the browser's prefix as most
  # of the features we need to perform animations are proprietary.
  # Also - we need to determine whether or not the browser supports
  # 3D or 2D transformations.
  
  @BROWSER_PREFIX: null
  @TRANSFORMS3D: null
  @TRANSFORMS: null
  @CURRENT_PROPS: null
  @STYLESHEET: null
  @BROWSER_PROPS:
    webkit:
      animationEnd:       'webkitAnimationEnd'
      animationName:      'webkitAnimationName'
      animationDuration:  'webkitAnimationDuration'
      transform:          'WebkitTransform'
    moz:
      animationEnd:       'animationend'
      animationName:      'MozAnimationName'
      animationDuration:  'MozAnimationDuration'
      transform:          'MozTransform'
    o:
      animationEnd:       null
      animationName:      null
      animationDuration:  null
      transform:          'OTransform'
    msie:
      animationEnd:       null
      animationName:      null
      animationDuration:  null
      transform:          'msTransform'
      
  @getBrowserCapabilities: ->
    
    # Browser Prefix:
    # -------------------------------------------------
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
    
    @CURRENT_PROPS = @BROWSER_PROPS[@BROWSER_PREFIX]
    
    # Get last useable stylesheet:
    document.styleSheets[document.styleSheets.length-1];
    index = document.styleSheets.length
    while index > 1 and !@STYLESHEET?
      try
        stylesheet = document.styleSheets[index-1]
        @STYLESHEET = stylesheet if stylesheet.cssRules?
      catch error
        console.log "Problem selecting stylesheet: #{error}"
      index -= 1
    
    # Transform Types:
    # -------------------------------------------------
    # Simple test for transforms or 3D transforms inspired by modernizr.
    # See: https://github.com/Modernizr/Modernizr/blob/master/modernizr.js#L594
    style = document.createElement('test').style
    features =
      transform3d: ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']
      transform: ['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']
    for name, properties of features
      for property in properties
        unless style[property] == undefined
          if name == "transform3d" then @TRANSFORMS3D = true
          if name == "transform" then @TRANSFORMS = true
    