beforeEach( ->
   this.addMatchers(
      toHaveElement: (element) ->
        sauce = this.actual
        sauce.element == element
      toBeAFlavor: ->
        flavor = this.actual
        flavor instanceof Flavor
   )
)