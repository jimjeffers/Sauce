describe("Sauce", ->
  sauce = null
  
  beforeEach( ->
    sauce = new Sauce()
  )
  
  describe("initializing a new instance", ->
    it("should let me pass in an onComplete handler", ->
      complete = (element,browser,flavors) ->
        element.style.visibility = "hidden" if element.className == "hideOnComplete"
      sauce = new Sauce(
        complete: complete
      )
      expect(sauce._complete == complete).toBeTruthy()
    )
    
    it("should let me pass a complete handler via the convenience method", ->
      sauce.onComplete((element) ->
        
      )
    )
  )
  
)