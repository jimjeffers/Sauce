###
Sauce.coffee (https://github.com/jimjeffers/Sauce)
Project created by J. Jeffers

DISCLAIMER: Software provided as is with no warranty of any type. 
Don't do bad things with this :)
###

# Managed Element:
# -------------------------------------------------
# Serves as an abstracted object so that it's simple to store
# some proprietary values on the element.
class @ManagedElement
  constructor: (elementID) ->
    console.log elementID
    if elementID instanceof Element
      @source = elementID
    else
      @source   = document.getElementById(elementID)
    @opacity  = 1
    @x        = 0
    @y        = 0
    @z        = 0
    @scaleX   = 1
    @scaleY   = 1
    @scaleZ   = 1
    @rotate   = 0
    @rotateX  = 0
    @rotateY  = 0
    @rotateZ  = 0
    @scale    = 1
    this


# Velocity:
# -------------------------------------------------
class @VelocityEquation
  constructor: (@rule,@equation) -> this
  
  calculateForFrame: (keyframe) ->
    x = @equation(@rule.velocityAtKeyFrame(keyframe))
    x
    
# Rules:
# -------------------------------------------------
# A rule is an abstraction of a CSS property and a tween.
# Calling valueAtElement calculates the rules proposed value
# in the animation as well as its velocity.
class @Rule
  constructor: (params={}) ->
    @equation   = params.equation   || null
    @startFrame = 0
    @endFrame   = 100
    
  change: (@property) ->
    this
  
  to: (@endPoint) ->
    this
  
  from: (@startPoint) ->
    this
  
  using: (@equation) ->
    this
  
  withAmplitudeOf: (@amplitude) ->
    this
  
  withPeriodOf: (@period) ->
    this
  
  startingOnFrame: (@startFrame) ->
    this
  
  endingOnFrame: (@endFrame) ->
    this
  
  velocityAtKeyFrame: (keyframe) ->
    if keyframe == @keyframe and keyframe != 0 and keyframe != 100
      return @velocity
    0
  
  isVelocityRule: ->
    @equation instanceof VelocityEquation
  
  valueAtFrameForElement: (keyframe,@element) ->
    if @keyframe != keyframe
      @keyframe = keyframe
      if @isVelocityRule()
        @value = @equation.calculateForFrame(@keyframe)
      else
        @value = @_calculateForFrame(@keyframe)
    
      @velocity = Math.abs(@value-@lastResult)
      @lastResult = @value
    @value
  
  # Private 
  # ===================================
  
  _calculateForFrame: (keyframe) ->
    if @startPoint?
      startPoint  = @startPoint
    else 
      startPoint = @_getElementProp(@element) 
    
    if @endPoint?
      endPoint  = @endPoint
    else 
      endPoint = @_getElementProp(@element)
  
    if keyframe < @startFrame
      keyframe = @startFrame
    else if keyframe > @endFrame
      keyframe = @endFrame
    if @period? || @amplitude?
      value = @equation(keyframe-@startFrame,startPoint,endPoint-startPoint,@endFrame-@startFrame,@amplitude,@period)
    else
      value = @equation(keyframe-@startFrame,startPoint,endPoint-startPoint,@endFrame-@startFrame)
    value
    
  _getElementProp: (element) ->
    element[@property]

# Ingredient:
# -------------------------------------------------
# Serves as a controller for generating CSS from configured
# rules.
class @Ingredient
  @ROTATE_PROP            = "rotate"
  @SCALE_PROP             = "scale"
  @TRANSLATE_PROPS        = ["x","y","z"]
  @PRECISE_SCALE_PROPS    = ["scaleX","scaleY","scaleZ"]
  @PRECISE_ROTATE_PROPS   = ["rotateX","rotateY","rotateZ"]
  @TRANSFORM_PROPS        = "#{@TRANSLATE_PROPS.join(",")},#{[@SCALE_PROP,@ROTATE_PROP].join(",")},#{@PRECISE_SCALE_PROPS.join(",")},#{@PRECISE_ROTATE_PROPS.join(",")}".split(",")
  
  constructor: ->
    @rules              = {}
    @element            = null
    @keyframe           = 0
    @utilizingVelocity  = false
    
  change: (property) ->
    @rules[property] = new Rule().change(property)
    @rules[property]
  
  velocity: (property, equationFunction) ->
    new VelocityEquation(@rules[property],equationFunction)
    
  valueOf: (property) ->
    if (property = @rules[property])? and !(property.isVelocityRule() and !@utilizingVelocity)
      return property.valueAtFrameForElement(@keyframe,@element)
    null
  
  transformRule: ->
    # Let's do the hard stuff. If the user didn't use any settings
    # requiring a transform we bypass this.
    if @_needsTransform() and @element? and @keyframe?
      transform = ""
      # 3D Transforms:
      # The preferred method even if all of our transforms are actually 2D.
      # We use 3D transforms to gain GPU accelerated animations.
      if Sauce.TRANSFORMS3D?
        if @_needsTranslate()
          transform += "translate3d(#{(@valueOf("x") || 0)}px,#{(@valueOf("y") || 0)}px,#{(@valueOf("z") || 0)}px)"
      
        if @_needsPrecisionScale()
          transform += "scale3d(#{@valueOf("scaleX") || 1},#{@valueOf("scaleY") || 1},#{@valueOf("scaleZ") || 0})"
        else if @_needsUniformScale()
          transform += "scale3d(#{@valueOf("scale") || 1},#{@valueOf("scale") || 1},#{@valueOf("scale") || 0})"
      
        if @_needsRotateIn3D()
          transform += "rotate3d(#{(@valueOf("rotateX") || 0)}px,#{(@valueOf("rotateY") || 0)}px,#{(@valueOf("rotateZ") || 0)}px,#{@valueOf("rotate") || 0}deg)"
        else if @_needsRotate()
          transform += "rotate(#{@valueOf("rotate") || 0}deg)"
        
      # 2D Transforms:    
      # We use 2D transforms if available and 3D weren't supported.
      else if Sauce.TRANSFORMS?
        if @_needsTranslate()
          transform += "translate(#{(@valueOf("x") || 0)}px,#{(@valueOf("y") || 0)}px)"
        if @_needsUniformScale()?
          transform += "scale(#{@valueOf("scale") || 1},#{@valueOf("scale") || 1})"
        if @_needsRotate()?
          transform += "rotate(#{@valueOf("rotate") || 0}deg)"
    
    transform || false
  
  css: (@keyframe) ->
    # We'll use string concatenation since it's more performant
    # then Array.join()
    css = ""

    # Handle explicit CSS:
    if @rules?
      for property,rule of @rules
        shouldGenerate = true
        for proprietaryProperty in Ingredient.TRANSFORM_PROPS
          shouldGenerate = false if property == proprietaryProperty
        rule.valueAtFrameForElement(@keyframe,@element)
        if shouldGenerate
          css += "#{property}: #{rule.value};"

    # If no transforms were available we only support
    # animating the top and left properties of the object.
    # But to be honest.. it's doubtful CSS Animation will
    # even be available on any browsers that don't support
    # transformations.
    if !Sauce.TRANSFORMS?
      css += "left:#{@valueOf("x")}px;" if @valueOf("x")?
      css += "top:#{@valueOf("y")}px;" if @valueOf("y")?
    else
      css += "-#{Sauce.BROWSER_PREFIX}-transform: #{transform};" if (transform = @transformRule())?
      
    css
 
  # Private 
  # ===================================
    
  _needsTransform: ->
    @_checkProps ["x","y","z","scaleX","scaleY","scaleZ","scale","rotate"]

  _needsTranslate: ->
    @_checkProps Ingredient.TRANSLATE_PROPS

  _needsPrecisionScale: ->
    @_checkProps Ingredient.PRECISE_SCALE_PROPS

  _needsUniformScale: ->
    @rules[Ingredient.SCALE_PROP]?

  _needsRotateIn3D: ->
    @_checkProps Ingredient.PRECISE_ROTATE_PROPS

  _needsRotate: ->
    @rules[Ingredient.ROTATE_PROP]?

  _checkProps: (properties) ->
    for property in properties
      return true if @rules[property]?
    false

# The Sauce:
# -------------------------------------------------
# The sauce is the main controller object that coordinates 
# the flavors (eases) and owns an ingredient (css abstraction).
class @Sauce
  # Every animation we generate will need a unique ID.
  @_ANIMATION_ID = 0
  # Increments the private Animation ID constant.
  @animationID: ->
    @_ANIMATION_ID += 1
    
  constructor: (params={}) ->
    # Get the browser capabilities if we haven't done so yet.
    Sauce.getBrowserCapabilities() unless Sauce.BROWSER_PREFIX?
    
    @stylesheet         = params.stylesheet     || Sauce.STYLESHEET
    @keyframes          = params.keyframes      || 60
    @recipeFunction     = params.recipe         || null
    @animations         = {}
    @animationDelay     = 0
    @animationDuration  = 1
    @elements           = {}
    
    # The following '_xxx' properties are intended to be private.
    @_ingredient      = new Ingredient()
    @_complete        = params.complete         || null
    @_jq_count        = 0
  
  recipe: (@recipeFunction) ->
    this
  
  # Returns the interval. Represents an increment for percentages
  # in a @-keyframes CSS animation.
  interval: -> 100/@keyframes
  
  # Convenience method for applying the complete handler.
  onComplete: (complete) ->
    @_complete = complete
    this
  
  duration: (@animationDuration) ->
    this
  
  delay: (@animationDelay) ->
    this
  
  # Preps the element and generates the keyframes.
  putOn: (id) ->
    element = @_getOrCreateElementFromID(id)
    if element? and element.source?
      @recipeFunction(@_ingredient)
      @_createAnimation(@keyframes,id)
      @_applyCSS(0,element)
      @_setAnimationOnElement(element)
    this
  
  useAgainOn: (id) ->
    element = @_getOrCreateElementFromID(id)
    if element? and element.source?
      @_applyCSS(0,element)
      @_setAnimationOnElement(element)
    this
  
  # Private 
  # ===================================
  
  # Generates a CSS keyframe animation.
  _createAnimation: (@keyframes,id) ->
    @lastUsedID = id
    @animations[id] = "ease_#{Sauce.animationID()}_#{new Date().getTime()}"
    currentFrame = 0
    cssFrames = ""
    @_ingredient.utilizingVelocity = true
    while currentFrame <= keyframes
      keyframe = @_computeKeyframe(currentFrame)
      frameLabel = "#{keyframe}%"
      if currentFrame < 1
        frameLabel = "from"
      else if currentFrame == @keyframes
        frameLabel = "to"
      @_ingredient.element = @_getOrCreateElementFromID(id)
      cssFrames += " #{frameLabel} {#{@_ingredient.css(keyframe)}}"
      currentFrame++
    @animationCSS = "@-#{Sauce.BROWSER_PREFIX}-keyframes #{@animations[@lastUsedID]} {#{cssFrames}}"
    @_ingredient.utilizingVelocity = false
    @index = @stylesheet.cssRules.length
    @stylesheet.insertRule(@animationCSS, @index)
    
  _setAnimationOnElement: (element) ->
    element.source.style[Sauce.CURRENT_PROPS.animationName] = @animations[@lastUsedID]
    element.source.style[Sauce.CURRENT_PROPS.animationDelay] = "#{@animationDelay}s"
    element.source.style[Sauce.CURRENT_PROPS.animationDuration] = "#{@animationDuration}s"
    element.source.addEventListener(Sauce.CURRENT_PROPS.animationEnd, ( =>
      @_completeHandler(element)
    ), false)
  
  _getOrCreateElementFromID: (id) ->
    if @elements[id]?
      element = @elements[id]
    else
      if id.get? and id.get instanceof Function and id.get(0)?
        element = id
        if element.attr("data-sauce-index")?
          index = element.attr("data-sauce-index")
          element = @elements[index]
        else
          index = "jq_#{@_jq_count}"
          element.attr("data-sauce-index",index)
          element = new ManagedElement(element.get(0))
          @elements[index] = element
        @_jq_count++
      else
        element = new ManagedElement(id)
        @elements[id] = element
    element
  
  # The underscore denotes that this method should be considered PRIVATE
  # and is only to be called internally. Use onComplete() to bind
  _completeHandler: (element) ->
    @_applyCSS(100,element)
    @_complete(@element) if @_complete?
  
  _computeKeyframe: (frame) ->
    frame * @interval()
  
  _applyCSS: (frame,element) ->
    @_ingredient.css(@_computeKeyframe(frame))
    if @_ingredient.rules?
      for property,rule of @_ingredient.rules
       element.source.style[property] = rule.value
    if Sauce.TRANSFORMS?
      element.source.style[Sauce.CURRENT_PROPS.transform] = @_ingredient.transformRule()
  
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
      animationDelay:     'webkitAnimationDelay'
      animationDuration:  'webkitAnimationDuration'
      transform:          'WebkitTransform'
    moz:
      animationEnd:       'animationend'
      animationName:      'MozAnimationName'
      animationDelay:     'webkitAnimationDelay'
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
