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
  )
  
  describe("handling transformations", ->
    beforeEach( ->
      unless document.getElementById("red")?
        div = document.createElement("div")
        div.setAttribute("class","square")
        div.setAttribute("id","red")
        document.body.appendChild(div)
    )
    
    it("should move to down to 400px", ->
      div = document.getElementById("red")
      sauce.recipe((element) ->
        element.change("y").from(100).to(400).using(Easie.cubicInOut)
      )
      sauce.duration(0.5).putOn("red")
      waitsFor((->
        div.getAttribute("data-y") == "400"
      ))
    )
    
    it("should allow me to adjust the height and width", ->
      div = document.getElementById("red")
      sauce.recipe((element) ->
        element.change("height").from(100).to(400).using(Easie.bounceOut)
        element.change("width").from(100).to(500).using(Easie.bounceOut)
      )
      sauce.duration(0.5).putOn("red")
      waitsFor((->
        div.getAttribute("data-height") == "400" and div.getAttribute("data-width") == "500"
      ))
      
      runs( ->
        expect(div.getAttribute("data-height") == "400").toBeTruthy()
        expect(div.getAttribute("data-width") == "500").toBeTruthy()
      )
    )
    
    it("should chain by moving to the right 300px after moving up to 200px", ->
      div = document.getElementById("red")
      sauce.recipe((element) ->
        element.change("y").from(400).to(200).using(Easie.bounceOut)
      ).onComplete( ->
        sideSauce = new Sauce()
        sideSauce.recipe( (element) ->
          element.change("x").to(300).using(Easie.elasticOut)
        )
        sideSauce.duration(1).putOn("red")
      )
      sauce.duration(0.5).putOn("red")
      waitsFor((->
        div.getAttribute("data-y") == "200" and div.getAttribute("data-x") == "300"
      ))
      
      runs( ->
        expect(div.getAttribute("data-y") == "200").toBeTruthy()
        expect(div.getAttribute("data-x") == "300").toBeTruthy()
      )
    )
    
    it("should allow me to manipulate multiple properties simultaneously", ->
      div = document.getElementById("red")
      sauce.recipe((element) ->
        element.change("y").to(150).using(Easie.backOut)
        element.change("rotate").to(45).using(Easie.backOut)
        element.change("scale").to(2).using(Easie.backOut)
      )
      sauce.duration(0.5).putOn("red")
      waitsFor(( ->
        div.getAttribute("data-y") == "150" and div.getAttribute("data-rotate") == "45" and div.getAttribute("data-scale") == "2"
      ))
      
      runs( ->
        expect(div.getAttribute("data-y") == "150").toBeTruthy()
        expect(div.getAttribute("data-rotate") == "45").toBeTruthy()
      )
    )
  )
)