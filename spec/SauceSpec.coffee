describe("Sauce", ->
  sauce = null
  
  beforeEach( ->
    sauce = new Sauce()
  )
  
  describe("initializing a new instance", ->
    it("should autogenerate a name if none is assigned", ->
      expect(sauce.name).not.toEqual(null)
    )

    it("should let me create flavors", ->
      sauce = new Sauce(
        flavors:
          redHotChiliPepper:
            equation: Easie.elasticOut
            from: -400
            to: 0
            period: 15
          blueSourGrass:
            equation: Easie.backInOut
            from: 100
            to: 200
      )
      expect(sauce.flavors().redHotChiliPepper).toBeAFlavor()
      expect(sauce.flavors().blueSourGrass).toBeAFlavor()
    )

    it("should let me pass in a spoon", ->
      spoon = (flavors,ingredient) ->
        ingredient.x = flavors.chili.value
      sauce = new Sauce(
        spoon: spoon
      )
      expect(sauce.spoon == spoon).toBeTruthy()
    )

    it("should let me pass in an onComplete handler", ->
      complete = (element,browser,flavors) ->
        element.style.visibility = "hidden" if element.className == "hideOnComplete"
      sauce = new Sauce(
        complete: complete
      )
      expect(sauce._complete == complete).toBeTruthy()
    )

    it("should let me set the amount of keyframes", ->
      sauce = new Sauce(
        keyframes: 10
      )
      expect(sauce.interval() == 10).toBeTruthy()
    )
  )
  
  describe("convenience methods", ->
    it("should add a flavor called chili on the fly if I use addFlavor", ->
      sauce.addFlavor("chili", {
        equation: Easie.elasticOut
        from: -400
        to: 0
        period: 15
      })
      expect(sauce.flavors().chili).toBeAFlavor()
      expect(sauce.flavors().length == 1).toBeTruthy()
    )
    it("should add an existing flavor called chili if I use addFlavor", ->
      chili = new Flavor("chili", {
        equation: Easie.elasticOut
        from: -400
        to: 0
        period: 15
      })
      sauce.addFlavor(chili)
      expect(sauce.flavors().chili).toBeAFlavor()
      expect(sauce.flavors().length == 1).toBeTruthy()
    )
  )
  
  describe("method chaining", ->
    it("should allow me to chain flavors if I use addFlavor() in a sequence", ->
      sauce.addFlavor("chili", {
        equation: Easie.elasticOut
        from: -400
        to: 0
        period: 15
      }).addFlavor("pepper", {
        equation: Easie.elasticIn
        from: 400
        to: 0
        period: 15
      })
      expect(sauce.flavors().chili).toBeAFlavor()
      expect(sauce.flavors().pepper).toBeAFlavor()
    )
  )
)