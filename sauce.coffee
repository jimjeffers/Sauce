class @Flavor
  constructor: (params) ->
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
    @spoon      = (flavors,browser) -> 0
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
    @browser          = "webkit"
    @keyframes        = 60
    @complete   = (element,flavors,browser) -> false
  addFlavor: (name,params) ->
    @flavors[name] = new Flavor(params)
    return this
  create: (keyframes=60) ->
    interval = 100/keyframes
    currentFrame = 0
    cssFrames = ""
    while currentFrame <= keyframes
      keyframe = Math.floor(currentFrame * interval)
      frameLabel = "#{keyframe}%"
      if currentFrame < 1
        frameLabel = "from"
      else if currentFrame == keyframes
        frameLabel = "to"
      for name, flavor of @flavors
        flavor.compute(keyframe)
      cssFrames += " #{frameLabel} {#{@spoon(@flavors,@browser)}}"
      currentFrame++
    animation = "@-#{@browser}-keyframes #{@name} {#{cssFrames}}"
    @index = @stylesheet.cssRules.length
    console.log animation
    @stylesheet.insertRule(animation, @index)
  onComplete: (complete) ->
    @complete = complete
  applyTo: (id,@duration=2) ->
    @create(@keyframes)
    @element = document.getElementById(id)
    if @browser == "webkit"
      @element.style.webkitAnimationName = @name
      @element.style.webkitAnimationDuration = "#{@duration}s"
      @element.addEventListener('webkitAnimationEnd', ( =>
        @complete(@element,@flavors,@browser)
      ), false)
    return this