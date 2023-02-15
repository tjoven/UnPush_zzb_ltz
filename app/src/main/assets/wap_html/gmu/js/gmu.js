/* Zepto v1.0 - polyfill zepto detect event ajax form fx - zeptojs.com/license */
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function(undefined){
  if (String.prototype.trim === undefined) // fix for iOS 3.2
    String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, '') ;}

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  if (Array.prototype.reduce === undefined)
    Array.prototype.reduce = function(fun){
      if(this === void 0 || this === null) throw new TypeError()
      var t = Object(this), len = t.length >>> 0, k = 0, accumulator
      if(typeof fun != 'function') throw new TypeError()
      if(len == 0 && arguments.length == 1) throw new TypeError()

      if(arguments.length >= 2)
       accumulator = arguments[1]
      else
        do{
          if(k in t){
            accumulator = t[k++]
            break
          }
          if(++k >= len) throw new TypeError()
        } while (true)

      while (k < len){
        if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
        k++
      }
      return accumulator
    }

})()

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    classSelectorRE = /^\.([\w-]+)$/,
    idSelectorRE = /^#([\w-]*)$/,
    tagSelectorRE = /^[\w-]+$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div')

  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype
  }
  function isArray(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    if (!(name in containers)) name = '*'

    var nodes, dom, container = containers[name]
    container.innerHTML = '' + html
    dom = $.each(slice.call(container.childNodes), function(){
      container.removeChild(this)
    })
    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }
    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, juts return it
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes. If a plain object is given, duplicate it.
      else if (isObject(selector))
        dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
      // create a new Zepto collection from the nodes found
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found
    return (isDocument(element) && idSelectorRE.test(selector)) ?
      ( (found = element.getElementById(RegExp.$1)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
        tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
        element.querySelectorAll(selector)
      )
  }

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) { return str.trim() }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = null)
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        })
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text })
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && value === undefined) ?
        (this.length == 0 || this[0].nodeType !== 1 ? undefined :
          (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      return (value === undefined) ?
        (this[0] && this[0][name]) :
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        })
    },
    data: function(name, value){
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return (value === undefined) ?
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(o){ return this.selected }).pluck('value') :
           this[0].value)
        ) :
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (this.length==0) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2 && typeof property == 'string')
        return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(){
      if (!this.length) return
      return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    $.fn[dimension] = function(value){
      var offset, el = this[0],
        Dimension = dimension.replace(/./, function(m){ return m[0].toUpperCase() })
      if (value === undefined) return isWindow(el) ? el['inner' + Dimension] :
        isDocument(el) ? el.documentElement['offset' + Dimension] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          traverseNode(parent.insertBefore(node, target), function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

// If `$` is not yet defined, point it to `Zepto`
window.Zepto = Zepto
'$' in window || (window.$ = Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  function detect(ua){
    var os = this.os = {}, browser = this.browser = {},
      webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/)

    // Todo: clean this up with a better OS/browser seperation:
    // - discern (more) between multiple browsers on android
    // - decide if kindle fire in silk mode is android or not
    // - Firefox on Android doesn't specify the Android version
    // - possibly devide in os, device and browser hashes

    if (browser.webkit = !!webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]

    os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)))
    os.phone  = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 ||
      (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var $$ = $.zepto.qsa, handlers = {}, _zid = 1, specialEvents={},
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eachEvent(events, fn, iterator){
    if ($.type(events) != "string") $.each(events, iterator)
    else events.split(/\s/).forEach(function(type){ iterator(type, fn) })
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (handler.e == 'focus' || handler.e == 'blur') ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || type
  }

  function add(element, events, fn, selector, getDelegate, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    eachEvent(events, fn, function(event, fn){
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = getDelegate && getDelegate(fn, event)
      var callback  = handler.del || fn
      handler.proxy = function (e) {
        var result = callback.apply(element, [e].concat(e.data))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback)
    })
  }
  $.fn.one = function(event, callback){
    return this.each(function(i, element){
      add(this, event, callback, null, function(fn, type){
        return function(){
          var result = fn.apply(element, arguments)
          remove(element, type, fn)
          return result
        }
      })
    })
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue
        return event[name].apply(event, arguments)
      }
      proxy[predicate] = returnFalse
    })
    return proxy
  }

  // emulates the 'defaultPrevented' property for browsers that have none
  function fix(event) {
    if (!('defaultPrevented' in event)) {
      event.defaultPrevented = false
      var prevent = event.preventDefault
      event.preventDefault = function() {
        this.defaultPrevented = true
        prevent.call(this)
      }
    }
  }

  $.fn.delegate = function(selector, event, callback){
    return this.each(function(i, element){
      add(element, event, callback, selector, function(fn){
        return function(e){
          var evt, match = $(e.target).closest(selector, element).get(0)
          if (match) {
            evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
            return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
          }
        }
      })
    })
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, callback){
    return !selector || $.isFunction(selector) ?
      this.bind(event, selector || callback) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback){
    return !selector || $.isFunction(selector) ?
      this.unbind(event, selector || callback) : this.undelegate(selector, event, callback)
  }

  $.fn.trigger = function(event, data){
    if (typeof event == 'string' || $.isPlainObject(event)) event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function(){
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (typeof type != 'string') props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    event.isDefaultPrevented = function(){ return this.defaultPrevented }
    return event
  }

})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.defaultPrevented
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options){
    if (!('type' in options)) return $.ajax(options)

    var callbackName = 'jsonp' + (++jsonpID),
      script = document.createElement('script'),
      cleanup = function() {
        clearTimeout(abortTimeout)
        $(script).remove()
        delete window[callbackName]
      },
      abort = function(type){
        cleanup()
        // In case of manual abort or timeout, keep an empty function as callback
        // so that the SCRIPT tag that eventually loads won't result in an error.
        if (!type || type == 'timeout') window[callbackName] = empty
        ajaxError(null, type || 'abort', xhr, options)
      },
      xhr = { abort: abort }, abortTimeout

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return false
    }

    window[callbackName] = function(data){
      cleanup()
      ajaxSuccess(data, xhr, options)
    }

    script.onerror = function() { abort('error') }

    script.src = options.url.replace(/=\?/, '=' + callbackName)
    $('head').append(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    accepts: {
      script: 'text/javascript, application/javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {})
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
    if (dataType == 'jsonp' || hasPlaceholder) {
      if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
      return $.ajaxJSONP(settings)
    }

    var mime = settings.accepts[dataType],
        baseHeaders = { },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(), abortTimeout

    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty;
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings)
          else ajaxSuccess(result, xhr, settings)
        } else {
          ajaxError(null, xhr.status ? 'error' : 'abort', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)

    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data)
    return {
      url:      url,
      data:     hasData  ? data : undefined,
      success:  !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData  ? dataType || success : success
    }
  }

  $.get = function(url, data, success, dataType){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(url, data, success, dataType){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(url, data, success){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function ($) {
  $.fn.serializeArray = function () {
    var result = [], el
    $( Array.prototype.slice.call(this.get(0).elements) ).each(function () {
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function () {
    var result = []
    this.serializeArray().forEach(function (elm) {
      result.push( encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value) )
    })
    return result.join('&')
  }

  $.fn.submit = function (callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)

//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($, undefined){
  var prefix = '', eventPrefix, endEventName, endAnimationName,
    vendors = { Webkit: 'webkit', Moz: '', O: 'o', ms: 'MS' },
    document = window.document, testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming,
    animationName, animationDuration, animationTiming,
    cssReset = {}

  function dasherize(str) { return downcase(str.replace(/([a-z])([A-Z])/, '$1-$2')) }
  function downcase(str) { return str.toLowerCase() }
  function normalizeEvent(name) { return eventPrefix ? eventPrefix + name : downcase(name) }

  $.each(vendors, function(vendor, event){
    if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
      prefix = '-' + downcase(vendor) + '-'
      eventPrefix = event
      return false
    }
  })

  transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] =
  cssReset[transitionDuration = prefix + 'transition-duration'] =
  cssReset[transitionTiming   = prefix + 'transition-timing-function'] =
  cssReset[animationName      = prefix + 'animation-name'] =
  cssReset[animationDuration  = prefix + 'animation-duration'] =
  cssReset[animationTiming    = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: { _default: 400, fast: 200, slow: 600 },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback){
    if ($.isPlainObject(duration))
      ease = duration.easing, callback = duration.complete, duration = duration.duration
    if (duration) duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback){
    var key, cssValues = {}, cssProperties, transforms = '',
        that = this, wrappedCallback, endEvent = $.fx.transitionEnd

    if (duration === undefined) duration = 0.4
    if ($.fx.off) duration = 0

    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
        if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
        else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event){
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      }
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    this.css(cssValues)

    if (duration <= 0) setTimeout(function() {
      that.each(function(){ wrappedCallback.call(this) })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)


//==================================zepto/touch.js==========================
/**
 * @file 来自zepto/touch.js, zepto自1.0后，已不默认打包此文件。
 * @import zepto.js
 */
//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout,
    longTapDelay = 750, longTapTimeout

  function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode
  }

  function swipeDirection(x1, x2, y1, y2) {
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  $(document).ready(function(){
    var now, delta

    $(document.body)
      .bind('touchstart', function(e){
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $(parentIfText(e.touches[0].target))
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = e.touches[0].pageX
        touch.y1 = e.touches[0].pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
      })
      .bind('touchmove', function(e){
        cancelLongTap()
        touch.x2 = e.touches[0].pageX
        touch.y2 = e.touches[0].pageY
        if (Math.abs(touch.x1 - touch.x2) > 10)
          e.preventDefault()
      })
      .bind('touchend', function(e){
         cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)

          // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
          // ('tap' fires before 'scroll')
          tapTimeout = setTimeout(function() {

            // trigger universal 'tap' with the option to cancelTouch()
            // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
            var event = $.Event('tap')
            event.cancelTouch = cancelAll
            touch.el.trigger(event)

            // trigger double tap immediately
            if (touch.isDoubleTap) {
              touch.el.trigger('doubleTap')
              touch = {}
            }

            // trigger single tap after 250ms of inactivity
            else {
              touchTimeout = setTimeout(function(){
                touchTimeout = null
                touch.el.trigger('singleTap')
                touch = {}
              }, 250)
            }

          }, 0)

      })
      .bind('touchcancel', cancelAll)

    $(window).bind('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto);

/**
 * @file 模板解析
 * @import zepto.js
 * @module GMU
 */
(function( $, undefined ) {
    
    /**
     * 解析模版tpl。当data未传入时返回编译结果函数；当某个template需要多次解析时，建议保存编译结果函数，然后调用此函数来得到结果。
     * 
     * @method $.parseTpl
     * @grammar $.parseTpl(str, data)  ⇒ string
     * @grammar $.parseTpl(str)  ⇒ Function
     * @param {String} str 模板
     * @param {Object} data 数据
     * @example var str = "<p><%=name%></p>",
     * obj = {name: 'ajean'};
     * console.log($.parseTpl(str, data)); // => <p>ajean</p>
     */
    $.parseTpl = function( str, data ) {
        var tmpl = 'var __p=[];' + 'with(obj||{}){__p.push(\'' +
                str.replace( /\\/g, '\\\\' )
                .replace( /'/g, '\\\'' )
                .replace( /<%=([\s\S]+?)%>/g, function( match, code ) {
                    return '\',' + code.replace( /\\'/, '\'' ) + ',\'';
                } )
                .replace( /<%([\s\S]+?)%>/g, function( match, code ) {
                    return '\');' + code.replace( /\\'/, '\'' )
                            .replace( /[\r\n\t]/g, ' ' ) + '__p.push(\'';
                } )
                .replace( /\r/g, '\\r' )
                .replace( /\n/g, '\\n' )
                .replace( /\t/g, '\\t' ) +
                '\');}return __p.join("");',

            /* jsbint evil:true */
            func = new Function( 'obj', tmpl );
        
        return data ? func( data ) : func;
    };
})( Zepto );

// Copyright (c) 2013, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://gmu.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @file 声明gmu命名空间
 * @namespace gmu
 * @import zepto.js
*/

/**
 * GMU是基于zepto的轻量级mobile UI组件库，符合jquery ui使用规范，提供webapp、pad端简单易用的UI组件。为了减小代码量，提高性能，组件再插件化，兼容iOS3+ / android2.1+，支持国内主流移动端浏览器，如safari, chrome, UC, qq等。
 * GMU由百度GMU小组开发，基于开源BSD协议，支持商业和非商业用户的免费使用和任意修改，您可以通过[get started](http://gmu.baidu.com/getstarted)快速了解。
 *
 * ###Quick Start###
 * + **官网：**http://gmu.baidu.com/
 * + **API：**http://gmu.baidu.com/doc
 *
 * ###历史版本###
 *
 * ### 2.0.5 ###
 * + **DEMO: ** http://gmu.baidu.com/demo/2.0.5
 * + **API：** http://gmu.baidu.com/doc/2.0.5
 * + **下载：** http://gmu.baidu.com/download/2.0.5
 *
 * @module GMU
 * @title GMU API 文档
 */
var gmu = gmu || {
    version: '@version',
    $: window.Zepto,

    /**
     * 调用此方法，可以减小重复实例化Zepto的开销。所有通过此方法调用的，都将公用一个Zepto实例，
     * 如果想减少Zepto实例创建的开销，就用此方法。
     * @method staticCall
     * @grammar gmu.staticCall( dom, fnName, args... )
     * @param  {DOM} elem Dom对象
     * @param  {String} fn Zepto方法名。
     * @param {*} * zepto中对应的方法参数。
     * @example
     * // 复制dom的className给dom2, 调用的是zepto的方法，但是只会实例化一次Zepto类。
     * var dom = document.getElementById( '#test' );
     *
     * var className = gmu.staticCall( dom, 'attr', 'class' );
     * console.log( className );
     *
     * var dom2 = document.getElementById( '#test2' );
     * gmu.staticCall( dom, 'addClass', className );
     */
    staticCall: (function( $ ) {
        var proto = $.fn,
            slice = [].slice,

            // 公用此zepto实例
            instance = $();

        instance.length = 1;

        return function( item, fn ) {
            instance[ 0 ] = item;
            return proto[ fn ].apply( instance, slice.call( arguments, 2 ) );
        };
    })( Zepto )
};/**
 * @file Event相关, 给widget提供事件行为。也可以给其他对象提供事件行为。
 * @import core/gmu.js
 * @module GMU
 */
(function( gmu, $ ) {
    var slice = [].slice,
        separator = /\s+/,

        returnFalse = function() {
            return false;
        },

        returnTrue = function() {
            return true;
        };

    function eachEvent( events, callback, iterator ) {

        // 不支持对象，只支持多个event用空格隔开
        (events || '').split( separator ).forEach(function( type ) {
            iterator( type, callback );
        });
    }

    // 生成匹配namespace正则
    function matcherFor( ns ) {
        return new RegExp( '(?:^| )' + ns.replace( ' ', ' .* ?' ) + '(?: |$)' );
    }

    // 分离event name和event namespace
    function parse( name ) {
        var parts = ('' + name).split( '.' );

        return {
            e: parts[ 0 ],
            ns: parts.slice( 1 ).sort().join( ' ' )
        };
    }

    function findHandlers( arr, name, callback, context ) {
        var matcher,
            obj;

        obj = parse( name );
        obj.ns && (matcher = matcherFor( obj.ns ));
        return arr.filter(function( handler ) {
            return handler &&
                    (!obj.e || handler.e === obj.e) &&
                    (!obj.ns || matcher.test( handler.ns )) &&
                    (!callback || handler.cb === callback ||
                    handler.cb._cb === callback) &&
                    (!context || handler.ctx === context);
        });
    }

    /**
     * Event类，结合gmu.event一起使用, 可以使任何对象具有事件行为。包含基本`preventDefault()`, `stopPropagation()`方法。
     * 考虑到此事件没有Dom冒泡概念，所以没有`stopImmediatePropagation()`方法。而`stopProgapation()`的作用就是
     * 让之后的handler都不执行。
     *
     * @class Event
     * @constructor
     * ```javascript
     * var obj = {};
     *
     * $.extend( obj, gmu.event );
     *
     * var etv = gmu.Event( 'beforeshow' );
     * obj.trigger( etv );
     *
     * if ( etv.isDefaultPrevented() ) {
     *     console.log( 'before show has been prevented!' );
     * }
     * ```
     * @grammar new gmu.Event( name[, props]) => instance
     * @param {String} type 事件名字
     * @param {Object} [props] 属性对象，将被复制进event对象。
     */
    function Event( type, props ) {
        if ( !(this instanceof Event) ) {
            return new Event( type, props );
        }

        props && $.extend( this, props );
        this.type = type;

        return this;
    }

    Event.prototype = {

        /**
         * @method isDefaultPrevented
         * @grammar e.isDefaultPrevented() => Boolean
         * @desc 判断此事件是否被阻止
         */
        isDefaultPrevented: returnFalse,

        /**
         * @method isPropagationStopped
         * @grammar e.isPropagationStopped() => Boolean
         * @desc 判断此事件是否被停止蔓延
         */
        isPropagationStopped: returnFalse,

        /**
         * @method preventDefault
         * @grammar e.preventDefault() => undefined
         * @desc 阻止事件默认行为
         */
        preventDefault: function() {
            this.isDefaultPrevented = returnTrue;
        },

        /**
         * @method stopPropagation
         * @grammar e.stopPropagation() => undefined
         * @desc 阻止事件蔓延
         */
        stopPropagation: function() {
            this.isPropagationStopped = returnTrue;
        }
    };

    /**
     * @class event
     * @static
     * @description event对象，包含一套event操作方法。可以将此对象扩张到任意对象，来增加事件行为。
     *
     * ```javascript
     * var myobj = {};
     *
     * $.extend( myobj, gmu.event );
     *
     * myobj.on( 'eventname', function( e, var1, var2, var3 ) {
     *     console.log( 'event handler' );
     *     console.log( var1, var2, var3 );    // =>1 2 3
     * } );
     *
     * myobj.trigger( 'eventname', 1, 2, 3 );
     * ```
     */
    gmu.event = {

        /**
         * 绑定事件。
         * @method on
         * @grammar on( name, fn[, context] ) => self
         * @param  {String}   name     事件名
         * @param  {Function} callback 事件处理器
         * @param  {Object}   context  事件处理器的上下文。
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        on: function( name, callback, context ) {
            var me = this,
                set;

            if ( !callback ) {
                return this;
            }

            set = this._events || (this._events = []);

            eachEvent( name, callback, function( name, callback ) {
                var handler = parse( name );

                handler.cb = callback;
                handler.ctx = context;
                handler.ctx2 = context || me;
                handler.id = set.length;
                set.push( handler );
            } );

            return this;
        },

        /**
         * 绑定事件，且当handler执行完后，自动解除绑定。
         * @method one
         * @grammar one( name, fn[, context] ) => self
         * @param  {String}   name     事件名
         * @param  {Function} callback 事件处理器
         * @param  {Object}   context  事件处理器的上下文。
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        one: function( name, callback, context ) {
            var me = this;

            if ( !callback ) {
                return this;
            }

            eachEvent( name, callback, function( name, callback ) {
                var once = function() {
                        me.off( name, once );
                        return callback.apply( context || me, arguments );
                    };

                once._cb = callback;
                me.on( name, once, context );
            } );

            return this;
        },

        /**
         * 解除事件绑定
         * @method off
         * @grammar off( name[, fn[, context] ] ) => self
         * @param  {String}   name     事件名
         * @param  {Function} callback 事件处理器
         * @param  {Object}   context  事件处理器的上下文。
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        off: function( name, callback, context ) {
            var events = this._events;

            if ( !events ) {
                return this;
            }

            if ( !name && !callback && !context ) {
                this._events = [];
                return this;
            }

            eachEvent( name, callback, function( name, callback ) {
                findHandlers( events, name, callback, context )
                        .forEach(function( handler ) {
                            delete events[ handler.id ];
                        });
            } );

            return this;
        },

        /**
         * 触发事件
         * @method trigger
         * @grammar trigger( name[, ...] ) => self
         * @param  {String | Event }   evt     事件名或gmu.Event对象实例
         * @param  {*} * 任意参数
         * @return {self} 返回自身，方便链式
         * @chainable
         */
        trigger: function( evt ) {
            var i = -1,
                args,
                events,
                stoped,
                len,
                ev;

            if ( !this._events || !evt ) {
                return this;
            }

            typeof evt === 'string' && (evt = new Event( evt ));

            args = slice.call( arguments, 1 );
            evt.args = args;    // handler中可以直接通过e.args获取trigger数据
            args.unshift( evt );

            events = findHandlers( this._events, evt.type );

            if ( events ) {
                len = events.length;

                while ( ++i < len ) {
                    if ( (stoped = evt.isPropagationStopped()) ||  false ===
                            (ev = events[ i ]).cb.apply( ev.ctx2, args )
                            ) {

                        // 如果return false则相当于stopPropagation()和preventDefault();
                        stoped || (evt.stopPropagation(), evt.preventDefault());
                        break;
                    }
                }
            }

            return this;
        }
    };

    // expose
    gmu.Event = Event;
})( gmu, gmu.$ );/**
 * @file gmu底层，定义了创建gmu组件的方法
 * @import core/gmu.js, core/event.js, extend/parseTpl.js
 * @module GMU
 */

(function( gmu, $, undefined ) {
    var slice = [].slice,
        toString = Object.prototype.toString,
        blankFn = function() {},

        // 挂到组件类上的属性、方法
        staticlist = [ 'options', 'template', 'tpl2html' ],

        // 存储和读取数据到指定对象，任何对象包括dom对象
        // 注意：数据不直接存储在object上，而是存在内部闭包中，通过_gid关联
        // record( object, key ) 获取object对应的key值
        // record( object, key, value ) 设置object对应的key值
        // record( object, key, null ) 删除数据
        record = (function() {
            var data = {},
                id = 0,
                ikey = '_gid';    // internal key.

            return function( obj, key, val ) {
                var dkey = obj[ ikey ] || (obj[ ikey ] = ++id),
                    store = data[ dkey ] || (data[ dkey ] = {});

                val !== undefined && (store[ key ] = val);
                val === null && delete store[ key ];

                return store[ key ];
            };
        })(),

        event = gmu.event;

    function isPlainObject( obj ) {
        return toString.call( obj ) === '[object Object]';
    }

    // 遍历对象
    function eachObject( obj, iterator ) {
        obj && Object.keys( obj ).forEach(function( key ) {
            iterator( key, obj[ key ] );
        });
    }

    // 从某个元素上读取某个属性。
    function parseData( data ) {
        try {    // JSON.parse可能报错

            // 当data===null表示，没有此属性
            data = data === 'true' ? true :
                    data === 'false' ? false : data === 'null' ? null :

                    // 如果是数字类型，则将字符串类型转成数字类型
                    +data + '' === data ? +data :
                    /(?:\{[\s\S]*\}|\[[\s\S]*\])$/.test( data ) ?
                    JSON.parse( data ) : data;
        } catch ( ex ) {
            data = undefined;
        }

        return data;
    }

    // 从DOM节点上获取配置项
    function getDomOptions( el ) {
        var ret = {},
            attrs = el && el.attributes,
            len = attrs && attrs.length,
            key,
            data;

        while ( len-- ) {
            data = attrs[ len ];
            key = data.name;

            if ( key.substring(0, 5) !== 'data-' ) {
                continue;
            }

            key = key.substring( 5 );
            data = parseData( data.value );

            data === undefined || (ret[ key ] = data);
        }

        return ret;
    }

    // 在$.fn上挂对应的组件方法呢
    // $('#btn').button( options );实例化组件
    // $('#btn').button( 'select' ); 调用实例方法
    // $('#btn').button( 'this' ); 取组件实例
    // 此方法遵循get first set all原则
    function zeptolize( name ) {
        var key = name.substring( 0, 1 ).toLowerCase() + name.substring( 1 ),
            old = $.fn[ key ];

        $.fn[ key ] = function( opts ) {
            var args = slice.call( arguments, 1 ),
                method = typeof opts === 'string' && opts,
                ret,
                obj;

            $.each( this, function( i, el ) {

                // 从缓存中取，没有则创建一个
                obj = record( el, name ) || new gmu[ name ]( el,
                        isPlainObject( opts ) ? opts : undefined );

                // 取实例
                if ( method === 'this' ) {
                    ret = obj;
                    return false;    // 断开each循环
                } else if ( method ) {

                    // 当取的方法不存在时，抛出错误信息
                    if ( !$.isFunction( obj[ method ] ) ) {
                        throw new Error( '组件没有此方法：' + method );
                    }

                    ret = obj[ method ].apply( obj, args );

                    // 断定它是getter性质的方法，所以需要断开each循环，把结果返回
                    if ( ret !== undefined && ret !== obj ) {
                        return false;
                    }

                    // ret为obj时为无效值，为了不影响后面的返回
                    ret = undefined;
                }
            } );

            return ret !== undefined ? ret : this;
        };

        /*
         * NO CONFLICT
         * var gmuPanel = $.fn.panel.noConflict();
         * gmuPanel.call(test, 'fnname');
         */
        $.fn[ key ].noConflict = function() {
            $.fn[ key ] = old;
            return this;
        };
    }

    // 加载注册的option
    function loadOption( klass, opts ) {
        var me = this;

        // 先加载父级的
        if ( klass.superClass ) {
            loadOption.call( me, klass.superClass, opts );
        }

        eachObject( record( klass, 'options' ), function( key, option ) {
            option.forEach(function( item ) {
                var condition = item[ 0 ],
                    fn = item[ 1 ];

                if ( condition === '*' ||
                        ($.isFunction( condition ) &&
                        condition.call( me, opts[ key ] )) ||
                        condition === opts[ key ] ) {

                    fn.call( me );
                }
            });
        } );
    }

    // 加载注册的插件
    function loadPlugins( klass, opts ) {
        var me = this;

        // 先加载父级的
        if ( klass.superClass ) {
            loadPlugins.call( me, klass.superClass, opts );
        }

        eachObject( record( klass, 'plugins' ), function( opt, plugin ) {

            // 如果配置项关闭了，则不启用此插件
            if ( opts[ opt ] === false ) {
                return;
            }

            eachObject( plugin, function( key, val ) {
                var oringFn;

                if ( $.isFunction( val ) && (oringFn = me[ key ]) ) {
                    me[ key ] = function() {
                        var origin = me.origin,
                            ret;

                        me.origin = oringFn;
                        ret = val.apply( me, arguments );
                        origin === undefined ? delete me.origin :
                                (me.origin = origin);

                        return ret;
                    };
                } else {
                    me[ key ] = val;
                }
            } );

            plugin._init.call( me );
        } );
    }

    // 合并对象
    function mergeObj() {
        var args = slice.call( arguments ),
            i = args.length,
            last;

        while ( i-- ) {
            last = last || args[ i ];
            isPlainObject( args[ i ] ) || args.splice( i, 1 );
        }

        return args.length ?
                $.extend.apply( null, [ true, {} ].concat( args ) ) : last; // 深拷贝，options中某项为object时，用例中不能用==判断
    }

    // 初始化widget. 隐藏具体细节，因为如果放在构造器中的话，是可以看到方法体内容的
    // 同时此方法可以公用。
    function bootstrap( name, klass, uid, el, options ) {
        var me = this,
            opts;

        if ( isPlainObject( el ) ) {
            options = el;
            el = undefined;
        }

        // options中存在el时，覆盖el
        options && options.el && (el = $( options.el ));
        el && (me.$el = $( el ), el = me.$el[ 0 ]);

        opts = me._options = mergeObj( klass.options,
                getDomOptions( el ), options );

        me.template = mergeObj( klass.template, opts.template );

        me.tpl2html = mergeObj( klass.tpl2html, opts.tpl2html );

        // 生成eventNs widgetName
        me.widgetName = name.toLowerCase();
        me.eventNs = '.' + me.widgetName + uid;

        me._init( opts );

        // 设置setup参数，只有传入的$el在DOM中，才认为是setup模式
        me._options.setup = (me.$el && me.$el.parent()[ 0 ]) ? true: false;

        loadOption.call( me, klass, opts );
        loadPlugins.call( me, klass, opts );

        // 进行创建DOM等操作
        me._create();
        me.trigger( 'ready' );

        el && record( el, name, me ) && me.on( 'destroy', function() {
            record( el, name, null );
        } );

        return me;
    }

    /**
     * @desc 创建一个类，构造函数默认为init方法, superClass默认为Base
     * @name createClass
     * @grammar createClass(object[, superClass]) => fn
     */
    function createClass( name, object, superClass ) {
        if ( typeof superClass !== 'function' ) {
            superClass = gmu.Base;
        }

        var uuid = 1,
            suid = 1;

        function klass( el, options ) {
            if ( name === 'Base' ) {
                throw new Error( 'Base类不能直接实例化' );
            }

            if ( !(this instanceof klass) ) {
                return new klass( el, options );
            }

            return bootstrap.call( this, name, klass, uuid++, el, options );
        }

        $.extend( klass, {

            /**
             * @name register
             * @grammar klass.register({})
             * @desc 注册插件
             */
            register: function( name, obj ) {
                var plugins = record( klass, 'plugins' ) ||
                        record( klass, 'plugins', {} );

                obj._init = obj._init || blankFn;

                plugins[ name ] = obj;
                return klass;
            },

            /**
             * @name option
             * @grammar klass.option(option, value, method)
             * @desc 扩充组件的配置项
             */
            option: function( option, value, method ) {
                var options = record( klass, 'options' ) ||
                        record( klass, 'options', {} );

                options[ option ] || (options[ option ] = []);
                options[ option ].push([ value, method ]);

                return klass;
            },

            /**
             * @name inherits
             * @grammar klass.inherits({})
             * @desc 从该类继承出一个子类，不会被挂到gmu命名空间
             */
            inherits: function( obj ) {

                // 生成 Sub class
                return createClass( name + 'Sub' + suid++, obj, klass );
            },

            /**
             * @name extend
             * @grammar klass.extend({})
             * @desc 扩充现有组件
             */
            extend: function( obj ) {
                var proto = klass.prototype,
                    superProto = superClass.prototype;

                staticlist.forEach(function( item ) {
                    obj[ item ] = mergeObj( superClass[ item ], obj[ item ] );
                    obj[ item ] && (klass[ item ] = obj[ item ]);
                    delete obj[ item ];
                });

                // todo 跟plugin的origin逻辑，公用一下
                eachObject( obj, function( key, val ) {
                    if ( typeof val === 'function' && superProto[ key ] ) {
                        proto[ key ] = function() {
                            var $super = this.$super,
                                ret;

                            // todo 直接让this.$super = superProto[ key ];
                            this.$super = function() {
                                var args = slice.call( arguments, 1 );
                                return superProto[ key ].apply( this, args );
                            };

                            ret = val.apply( this, arguments );

                            $super === undefined ? (delete this.$super) :
                                    (this.$super = $super);
                            return ret;
                        };
                    } else {
                        proto[ key ] = val;
                    }
                } );
            }
        } );

        klass.superClass = superClass;
        klass.prototype = Object.create( superClass.prototype );


        /*// 可以在方法中通过this.$super(name)方法调用父级方法。如：this.$super('enable');
        object.$super = function( name ) {
            var fn = superClass.prototype[ name ];
            return $.isFunction( fn ) && fn.apply( this,
                    slice.call( arguments, 1 ) );
        };*/

        klass.extend( object );

        return klass;
    }

    /**
     * @method define
     * @grammar gmu.define( name, object[, superClass] )
     * @class
     * @param {String} name 组件名字标识符。
     * @param {Object} object
     * @desc 定义一个gmu组件
     * @example
     * ####组件定义
     * ```javascript
     * gmu.define( 'Button', {
     *     _create: function() {
     *         var $el = this.getEl();
     *
     *         $el.addClass( 'ui-btn' );
     *     },
     *
     *     show: function() {
     *         console.log( 'show' );
     *     }
     * } );
     * ```
     *
     * ####组件使用
     * html部分
     * ```html
     * <a id='btn'>按钮</a>
     * ```
     *
     * javascript部分
     * ```javascript
     * var btn = $('#btn').button();
     *
     * btn.show();    // => show
     * ```
     *
     */
    gmu.define = function( name, object, superClass ) {
        gmu[ name ] = createClass( name, object, superClass );
        zeptolize( name );
    };

    /**
     * @desc 判断object是不是 widget实例, klass不传时，默认为Base基类
     * @method isWidget
     * @grammar gmu.isWidget( anything[, klass] ) => Boolean
     * @param {*} anything 需要判断的对象
     * @param {String|Class} klass 字符串或者类。
     * @example
     * var a = new gmu.Button();
     *
     * console.log( gmu.isWidget( a ) );    // => true
     * console.log( gmu.isWidget( a, 'Dropmenu' ) );    // => false
     */
    gmu.isWidget = function( obj, klass ) {

        // 处理字符串的case
        klass = typeof klass === 'string' ? gmu[ klass ] || blankFn : klass;
        klass = klass || gmu.Base;
        return obj instanceof klass;
    };

    /**
     * @class Base
     * @description widget基类。不能直接使用。
     */
    gmu.Base = createClass( 'Base', {

        /**
         * @method _init
         * @grammar instance._init() => instance
         * @desc 组件的初始化方法，子类需要重写该方法
         */
        _init: blankFn,

        /**
         * @override
         * @method _create
         * @grammar instance._create() => instance
         * @desc 组件创建DOM的方法，子类需要重写该方法
         */
        _create: blankFn,


        /**
         * @method getEl
         * @grammar instance.getEl() => $el
         * @desc 返回组件的$el
         */
        getEl: function() {
            return this.$el;
        },

        /**
         * @method on
         * @grammar instance.on(name, callback, context) => self
         * @desc 订阅事件
         */
        on: event.on,

        /**
         * @method one
         * @grammar instance.one(name, callback, context) => self
         * @desc 订阅事件（只执行一次）
         */
        one: event.one,

        /**
         * @method off
         * @grammar instance.off(name, callback, context) => self
         * @desc 解除订阅事件
         */
        off: event.off,

        /**
         * @method trigger
         * @grammar instance.trigger( name ) => self
         * @desc 派发事件, 此trigger会优先把options上的事件回调函数先执行
         * options上回调函数可以通过调用event.stopPropagation()来阻止事件系统继续派发,
         * 或者调用event.preventDefault()阻止后续事件执行
         */
        trigger: function( name ) {
            var evt = typeof name === 'string' ? new gmu.Event( name ) : name,
                args = [ evt ].concat( slice.call( arguments, 1 ) ),
                opEvent = this._options[ evt.type ],

                // 先存起来，否则在下面使用的时候，可能已经被destory给删除了。
                $el = this.getEl();

            if ( opEvent && $.isFunction( opEvent ) ) {

                // 如果返回值是false,相当于执行stopPropagation()和preventDefault();
                false === opEvent.apply( this, args ) &&
                        (evt.stopPropagation(), evt.preventDefault());
            }

            event.trigger.apply( this, args );

            // triggerHandler不冒泡
            $el && $el.triggerHandler( evt, (args.shift(), args) );

            return this;
        },

        /**
         * @method tpl2html
         * @grammar instance.tpl2html() => String
         * @grammar instance.tpl2html( data ) => String
         * @grammar instance.tpl2html( subpart, data ) => String
         * @desc 将template输出成html字符串，当传入 data 时，html将通过$.parseTpl渲染。
         * template支持指定subpart, 当无subpart时，template本身将为模板，当有subpart时，
         * template[subpart]将作为模板输出。
         */
        tpl2html: function( subpart, data ) {
            var tpl = this.template;

            tpl =  typeof subpart === 'string' ? tpl[ subpart ] :
                    ((data = subpart), tpl);

            return data || ~tpl.indexOf( '<%' ) ? $.parseTpl( tpl, data ) : tpl;
        },

        /**
         * @method destroy
         * @grammar instance.destroy()
         * @desc 注销组件
         */
        destroy: function() {

            // 解绑element上的事件
            this.$el && this.$el.off( this.eventNs );

            this.trigger( 'destroy' );
            // 解绑所有自定义事件
            this.off();


            this.destroyed = true;
        }

    }, Object );

    // 向下兼容
    $.ui = gmu;
})( gmu, gmu.$ );/**
 * @file 媒体查询
 * @import zepto.js
 * @module GMU
 */

(function ($) {

    /**
     * 是原生的window.matchMedia方法的polyfill，对于不支持matchMedia的方法系统和浏览器，按照[w3c window.matchMedia](http://www.w3.org/TR/cssom-view/#dom-window-matchmedia)的接口
     * 定义，对matchMedia方法进行了封装。原理是用css media query及transitionEnd事件来完成的。在页面中插入media query样式及元素，当query条件满足时改变该元素样式，同时这个样式是transition作用的属性，
     * 满足条件后即会触发transitionEnd，由此创建MediaQueryList的事件监听。由于transition的duration time为0.001ms，故若直接使用MediaQueryList对象的matches去判断当前是否与query匹配，会有部分延迟，
     * 建议注册addListener的方式去监听query的改变。$.matchMedia的详细实现原理及采用该方法实现的转屏统一解决方案详见
     * [GMU Pages: 转屏解决方案($.matchMedia)](https://github.com/gmuteam/GMU/wiki/%E8%BD%AC%E5%B1%8F%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88$.matchMedia)
     *
     * 返回值MediaQueryList对象包含的属性<br />
     * - ***matches*** 是否满足query<br />
     * - ***query*** 查询的css query，类似\'screen and (orientation: portrait)\'<br />
     * - ***addListener*** 添加MediaQueryList对象监听器，接收回调函数，回调参数为MediaQueryList对象<br />
     * - ***removeListener*** 移除MediaQueryList对象监听器<br />
     *
     *
     * @method $.matchMedia
     * @grammar $.matchMedia(query)  ⇒ MediaQueryList
     * @param {String} query 查询的css query，类似\'screen and (orientation: portrait)\'
     * @return {Object} MediaQueryList
     * @example
     * $.matchMedia('screen and (orientation: portrait)').addListener(fn);
     */
    $.matchMedia = (function() {
        var mediaId = 0,
            cls = 'gmu-media-detect',
            transitionEnd = $.fx.transitionEnd,
            cssPrefix = $.fx.cssPrefix,
            $style = $('<style></style>').append('.' + cls + '{' + cssPrefix + 'transition: width 0.001ms; width: 0; position: absolute; clip: rect(1px, 1px, 1px, 1px);}\n').appendTo('head');

        return function (query) {
            var id = cls + mediaId++,
                $mediaElem,
                listeners = [],
                ret;

            $style.append('@media ' + query + ' { #' + id + ' { width: 1px; } }\n') ;   //原生matchMedia也需要添加对应的@media才能生效

            // 统一用模拟的，时机更好。
            // if ('matchMedia' in window) {
            //     return window.matchMedia(query);
            // }

            $mediaElem = $('<div class="' + cls + '" id="' + id + '"></div>')
                .appendTo('body')
                .on(transitionEnd, function() {
                    ret.matches = $mediaElem.width() === 1;
                    $.each(listeners, function (i,fn) {
                        $.isFunction(fn) && fn.call(ret, ret);
                    });
                });

            ret = {
                matches: $mediaElem.width() === 1 ,
                media: query,
                addListener: function (callback) {
                    listeners.push(callback);
                    return this;
                },
                removeListener: function (callback) {
                    var index = listeners.indexOf(callback);
                    ~index && listeners.splice(index, 1);
                    return this;
                }
            };

            return ret;
        };
    }());
})(Zepto);

/**
 * @file 减少对方法、事件的执行频率，多次调用，在指定的时间内只会执行一次
 * @import zepto.js
 * @module GMU
 */

(function ($) {
    /**
     * 减少执行频率, 多次调用，在指定的时间内，只会执行一次。
     * ```
     * ||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
     * X    X    X    X    X    X      X    X    X    X    X    X
     * ```
     * 
     * @method $.throttle
     * @grammar $.throttle(delay, fn) ⇒ function
     * @param {Number} [delay=250] 延时时间
     * @param {Function} fn 被稀释的方法
     * @param {Boolean} [debounce_mode=false] 是否开启防震动模式, true:start, false:end
     * @example var touchmoveHander = function(){
     *     //....
     * }
     * //绑定事件
     * $(document).bind('touchmove', $.throttle(250, touchmoveHander));//频繁滚动，每250ms，执行一次touchmoveHandler
     *
     * //解绑事件
     * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.throttle返回的function, 当然unbind那个也是一样的效果
     *
     */
    $.extend($, {
        throttle: function(delay, fn, debounce_mode) {
            var last = 0,
                timeId;

            if (typeof fn !== 'function') {
                debounce_mode = fn;
                fn = delay;
                delay = 250;
            }

            function wrapper() {
                var that = this,
                    period = Date.now() - last,
                    args = arguments;

                function exec() {
                    last = Date.now();
                    fn.apply(that, args);
                };

                function clear() {
                    timeId = undefined;
                };

                if (debounce_mode && !timeId) {
                    // debounce模式 && 第一次调用
                    exec();
                }

                timeId && clearTimeout(timeId);
                if (debounce_mode === undefined && period > delay) {
                    // throttle, 执行到了delay时间
                    exec();
                } else {
                    // debounce, 如果是start就clearTimeout
                    timeId = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - period : delay);
                }
            };
            // for event bind | unbind
            wrapper._zid = fn._zid = fn._zid || $.proxy(fn)._zid;
            return wrapper;
        },

        /**
         * @desc 减少执行频率, 在指定的时间内, 多次调用，只会执行一次。
         * **options:**
         * - ***delay***: 延时时间
         * - ***fn***: 被稀释的方法
         * - ***t***: 指定是在开始处执行，还是结束是执行, true:start, false:end
         *
         * 非at_begin模式
         * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
         *                         X                                X</code>
         * at_begin模式
         * <code type="text">||||||||||||||||||||||||| (空闲) |||||||||||||||||||||||||
         * X                                X                        </code>
         *
         * @grammar $.debounce(delay, fn[, at_begin]) ⇒ function
         * @name $.debounce
         * @example var touchmoveHander = function(){
         *     //....
         * }
         * //绑定事件
         * $(document).bind('touchmove', $.debounce(250, touchmoveHander));//频繁滚动，只要间隔时间不大于250ms, 在一系列移动后，只会执行一次
         *
         * //解绑事件
         * $(document).unbind('touchmove', touchmoveHander);//注意这里面unbind还是touchmoveHander,而不是$.debounce返回的function, 当然unbind那个也是一样的效果
         */
        debounce: function(delay, fn, t) {
            return fn === undefined ? $.throttle(250, delay, false) : $.throttle(delay, fn, t === undefined ? false : t !== false);
        }
    });
})(Zepto);/**
 * @file 平台特性检测
 * @name detect
 * @short detect
 * @desc 扩展zepto中对browser的检测
 * @import zepto.js
 */

(function( $, navigator ) {
    
    /**
     * @name $.browser
     * @desc 扩展zepto中对browser的检测
     *
     * **可用属性**
     * - ***qq*** 检测qq浏览器
     * - ***uc*** 检测uc浏览器, 有些老版本的uc浏览器，不带userAgent和appVersion标记，无法检测出来
     * - ***baidu*** 检测baidu浏览器
     * - ***version*** 浏览器版本
     *
     * @example
     * if ($.browser.qq) {      //在qq浏览器上打出此log
     *     console.log('this is qq browser');
     * }
     */
    var ua = navigator.userAgent,
        br = $.browser,
        detects = {
            qq: /MQQBrowser\/([\d.]+)/i,
            uc: /UCBrowser\/([\d.]+)/i,
            baidu: /baidubrowser\/.*?([\d.]+)/i
        },
        ret;

    $.each( detects, function( i, re ) {
        
        if ( (ret = ua.match( re )) ) {
            br[ i ] = true;
            br.version = ret[ 1 ];

            // 终端循环
            return false;
        }
    } );

    // uc还有一种规则，就是appVersion中带 Uc字符
    if ( !br.uc && /Uc/i.test( navigator.appVersion ) ) {
        br.uc = true;
    }

})( Zepto, navigator );
/**
 * @file 扩展转屏事件
 * @name ortchange
 * @short ortchange
 * @desc 扩展转屏事件orientation，解决原生转屏事件的兼容性问题
 * @import zepto.js, extend/matchMedia.js
 */

$(function () {
    /**
     * @name ortchange
     * @desc 扩展转屏事件orientation，解决原生转屏事件的兼容性问题
     * - ***ortchange*** : 当转屏的时候触发，兼容uc和其他不支持orientationchange的设备，利用css media query实现，解决了转屏延时及orientation事件的兼容性问题
     * $(window).on('ortchange', function () {        //当转屏的时候触发
     *     console.log('ortchange');
     * });
     */
    //扩展常用media query
    $.mediaQuery = {
        ortchange: 'screen and (width: ' + window.innerWidth + 'px)'
    };
    //通过matchMedia派生转屏事件
    $.matchMedia($.mediaQuery.ortchange).addListener(function () {
        $(window).trigger('ortchange');
    });
});/**
 * @file 滚动停止事件
 * @name scrollStop
 * @short scrollStop
 * @desc 滚动停止事件
 * @import zepto.js, extend/throttle.js
 */
(function ($, win) {
    /**
     * @name scrollStop
     * @desc 扩展的事件，滚动停止事件
     * - ***scrollStop*** : 在document上派生的scrollStop事件上，scroll停下来时触发, 考虑前进或者后退后scroll事件不触发情况。
     * @example $(document).on('scrollStop', function () {        //scroll停下来时显示scrollStop
     *     console.log('scrollStop');
     * });
     */

    function registerScrollStop() {
        $(win).on('scroll', $.debounce(80, function () {
            $(win).trigger('scrollStop');
        }, false));
    }

    function backEventOffHandler() {
        //在离开页面，前进或后退回到页面后，重新绑定scroll, 需要off掉所有的scroll，否则scroll时间不触发
        $(win).off('scroll');
        registerScrollStop();
    }
    registerScrollStop();

    //todo 待统一解决后退事件触发问题
    $(win).on('pageshow', function (e) {
        //如果是从bfcache中加载页面，为了防止多次注册，需要先off掉
        e.persisted && $(win).off('touchstart', backEventOffHandler).one('touchstart', backEventOffHandler);
    });

})(Zepto, window);/**
 * @file 实现了通用fix方法。
 * @name Fix
 * @import zepto.js, extend/event.scrollStop.js, extend/event.ortchange.js
 */

/**
 * @name fix
 * @grammar fix(options) => self
 * @desc 固顶fix方法，对不支持position:fixed的设备上将元素position设为absolute，
 * 在每次scrollstop时根据opts参数设置当前显示的位置，类似fix效果。
 *
 * Options:
 * - ''top'' {Number}: 距离顶部的px值
 * - ''left'' {Number}: 距离左侧的px值
 * - ''bottom'' {Number}: 距离底部的px值
 * - ''right'' {Number}: 距离右侧的px值
 * @example
 * var div = $('div');
 * div.fix({top:0, left:0}); //将div固顶在左上角
 * div.fix({top:0, right:0}); //将div固顶在右上角
 * div.fix({bottom:0, left:0}); //将div固顶在左下角
 * div.fix({bottom:0, right:0}); //将div固顶在右下角
 *
 */

(function ($, undefined) {
    $.extend($.fn, {
        fix: function(opts) {
            var me = this;                      //如果一个集合中的第一元素已fix，则认为这个集合的所有元素已fix，
            if(me.attr('isFixed')) return me;   //这样在操作时就可以针对集合进行操作，不必单独绑事件去操作
            me.css(opts).css('position', 'fixed').attr('isFixed', true);
            var buff = $('<div style="position:fixed;top:10px;"></div>').appendTo('body'),
                top = buff[0].getBoundingClientRect().top,
                checkFixed = function() {
                    if(window.pageYOffset > 0) {
                        if(buff[0].getBoundingClientRect().top !== top) {
                            me.css('position', 'absolute');
                            doFixed();
                            $(window).on('scrollStop', doFixed);
                            $(window).on('ortchange', doFixed);
                        }
                        $(window).off('scrollStop', checkFixed);
                        buff.remove();
                    }
                },
                doFixed = function() {
                    me.css({
                        top: window.pageYOffset + (opts.bottom !== undefined ? window.innerHeight - me.height() - opts.bottom : (opts.top ||0)),
                        left: opts.right !== undefined ? document.body.offsetWidth - me.width() - opts.right : (opts.left || 0)
                    });
                    opts.width == '100%' && me.css('width', document.body.offsetWidth);
                };

            $(window).on('scrollStop', checkFixed);

            return me;
        }
    });
}(Zepto));/**
 *  @file 实现了通用highlight方法。
 *  @name Highlight
 *  @desc 点击高亮效果
 *  @import zepto.js
 */
(function( $ ) {
    var $doc = $( document ),
        $el,    // 当前按下的元素
        timer;    // 考虑到滚动操作时不能高亮，所以用到了100ms延时

    // 负责移除className.
    function dismiss() {
        var cls = $el.attr( 'hl-cls' );

        clearTimeout( timer );
        $el.removeClass( cls ).removeAttr( 'hl-cls' );
        $el = null;
        $doc.off( 'touchend touchmove touchcancel', dismiss );
    }

    /**
     * @name highlight
     * @desc 禁用掉系统的高亮，当手指移动到元素上时添加指定class，手指移开时，移除该class.
     * 当不传入className是，此操作将解除事件绑定。
     * 
     * 此方法支持传入selector, 此方式将用到事件代理，允许dom后加载。
     * @grammar  highlight(className, selector )   ⇒ self
     * @grammar  highlight(className )   ⇒ self
     * @grammar  highlight()   ⇒ self
     * @example var div = $('div');
     * div.highlight('div-hover');
     *
     * $('a').highlight();// 把所有a的自带的高亮效果去掉。
     */
    $.fn.highlight = function( className, selector ) {
        return this.each(function() {
            var $this = $( this );

            $this.css( '-webkit-tap-highlight-color', 'rgba(255,255,255,0)' )
                    .off( 'touchstart.hl' );

            className && $this.on( 'touchstart.hl', function( e ) {
                var match;

                $el = selector ? (match = $( e.target ).closest( selector,
                        this )) && match.length && match : $this;

                // selctor可能找不到元素。
                if ( $el ) {
                    $el.attr( 'hl-cls', className );
                    timer = setTimeout( function() {
                        $el.addClass( className );
                    }, 100 );
                    $doc.on( 'touchend touchmove touchcancel', dismiss );
                }
            } );
        });
    };
})( Zepto );
/**
 *  @file 基于Zepto的图片延迟加载插件
 *  @name Imglazyload
 *  @desc 图片延迟加载
 *  @import zepto.js, extend/event.scrollStop.js, extend/event.ortchange.js
 */
(function ($) {
    /**
     * @name imglazyload
     * @grammar  imglazyload(opts) => self
     * @desc 图片延迟加载
     * **Options**
     * - ''placeHolder''     {String}:              (可选, 默认值:\'\')图片显示前的占位符
     * - ''container''       {Array|Selector}:      (可选, 默认值:window)图片延迟加载容器，若innerScroll为true，则传外层wrapper容器即可
     * - ''threshold''       {Array|Selector}:      (可选, 默认值:0)阀值，为正值则提前加载
     * - ''urlName''         {String}:              (可选, 默认值:data-url)图片url名称
     * - ''eventName''       {String}:              (可选, 默认值:scrollStop)绑定事件方式
     * - --''refresh''--     {Boolean}              --(可选, 默认值:false)是否是更新操作，若是页面追加图片，可以将该参数设为true--（该参数已经删除，无需使用该参数，可以同样为追加的图片增加延迟加载）
     * - ''innerScroll''     {Boolean}              (可选, 默认值:false)是否是内滚，若内滚，则不绑定eventName事件，用户需在外部绑定相应的事件，可调$.fn.imglazyload.detect去检测图片是否出现在container中
     * - ''isVertical''      {Boolean}              (可选, 默认值:true)是否竖滚
     *
     * **events**
     * - ''startload'' 开始加载图片
     * - ''loadcomplete'' 加载完成
     * - ''error'' 加载失败
     *
     * 使用img标签作为初始标签时，placeHolder无效，可考虑在img上添加class来完成placeHolder效果，加载完成后移除。使用其他元素作为初始标签时，placeHolder将添加到标签内部，并在图片加载完成后替换。
     * 原始标签中以\"data-\"开头的属性会自动添加到加载后的图片中，故有自定义属性需要放在图片中的可以考虑以data-开头
     * @example $('.lazy-load').imglazyload();
     * $('.lazy-load').imglazyload().on('error', function (e) {
     *     e.preventDefault();      //该图片不再加载
     * });
     */
    var pedding = [];
    $.fn.imglazyload = function (opts) {
        var splice = Array.prototype.splice,
            opts = $.extend({
                threshold:0,
                container:window,
                urlName:'data-url',
                placeHolder:'',
                eventName:'scrollStop',
                innerScroll: false,
                isVertical: true
            }, opts),
            $viewPort = $(opts.container),
            isVertical = opts.isVertical,
            isWindow = $.isWindow($viewPort.get(0)),
            OFFSET = {
                win: [isVertical ? 'scrollY' : 'scrollX', isVertical ? 'innerHeight' : 'innerWidth'],
                img: [isVertical ? 'top' : 'left', isVertical ? 'height' : 'width']
            },
            $plsHolder = $(opts.placeHolder).length ? $(opts.placeHolder) : null,
            isImg = $(this).is('img');

        !isWindow && (OFFSET['win'] = OFFSET['img']);   //若container不是window，则OFFSET中取值同img

        function isInViewport(offset) {      //图片出现在可视区的条件
            var viewOffset = isWindow ? window : $viewPort.offset(),
                viewTop = viewOffset[OFFSET.win[0]],
                viewHeight = viewOffset[OFFSET.win[1]];
            return viewTop >= offset[OFFSET.img[0]] - opts.threshold - viewHeight && viewTop <= offset[OFFSET.img[0]] + offset[OFFSET.img[1]];
        }

        pedding = Array.prototype.slice.call($(pedding.reverse()).add(this), 0).reverse();    //更新pedding值，用于在页面追加图片
        if ($.isFunction($.fn.imglazyload.detect)) {    //若是增加图片，则处理placeHolder
            _addPlsHolder();
            return this;
        };

        function _load(div) {     //加载图片，并派生事件
            var $div = $(div),
                attrObj = {},
                $img = $div;

            if (!isImg) {
                $.each($div.get(0).attributes, function () {   //若不是img作为容器，则将属性名中含有data-的均增加到图片上
                    ~this.name.indexOf('data-') && (attrObj[this.name] = this.value);
                });
                $img = $('<img />').attr(attrObj);
            }
            $div.trigger('startload');
            $img.on('load',function () {
                !isImg && $div.replaceWith($img);     //若不是img，则将原来的容器替换，若是img，则直接将src替换
                $div.trigger('loadcomplete');
                $img.off('load');
            }).on('error',function () {     //图片加载失败处理
                var errorEvent = $.Event('error');       //派生错误处理的事件
                $div.trigger(errorEvent);
                errorEvent.defaultPrevented || pedding.push(div);
                $img.off('error').remove();
            }).attr('src', $div.attr(opts.urlName));
        }

        function _detect() {     //检测图片是否出现在可视区，并对满足条件的开始加载
            var i, $image, offset, div;
            for (i = pedding.length; i--;) {
                $image = $(div = pedding[i]);
                offset = $image.offset();
                isInViewport(offset) && (splice.call(pedding, i, 1), _load(div));
            }
        }

        function _addPlsHolder () {
            !isImg && $plsHolder && $(pedding).append($plsHolder);   //若是不是img，则直接append
        }

        $(document).ready(function () {    //页面加载时条件检测
            _addPlsHolder();     //初化时将placeHolder存入
            _detect();
        });

        !opts.innerScroll && $(window).on(opts.eventName + ' ortchange', function () {    //不是内滚时，在window上绑定事件
            _detect();
        });

        $.fn.imglazyload.detect = _detect;    //暴露检测方法，供外部调用

        return this;
    };

})(Zepto);
/*!
 * iScroll v4.2.2 ~ Copyright (c) 2012 Matteo Spinelli, http://cubiq.org
 * Released under MIT license, http://cubiq.org/license
 */
(function(window, doc){
    var m = Math,_bindArr = [],
        dummyStyle = doc.createElement('div').style,
        vendor = (function () {
            var vendors = 'webkitT,MozT,msT,OT,t'.split(','),
                t,
                i = 0,
                l = vendors.length;

            for ( ; i < l; i++ ) {
                t = vendors[i] + 'ransform';
                if ( t in dummyStyle ) {
                    return vendors[i].substr(0, vendors[i].length - 1);
                }
            }

            return false;
        })(),
        cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',


    // Style properties
        transform = prefixStyle('transform'),
        transitionProperty = prefixStyle('transitionProperty'),
        transitionDuration = prefixStyle('transitionDuration'),
        transformOrigin = prefixStyle('transformOrigin'),
        transitionTimingFunction = prefixStyle('transitionTimingFunction'),
        transitionDelay = prefixStyle('transitionDelay'),

    // Browser capabilities
        isAndroid = (/android/gi).test(navigator.appVersion),
        isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),

        has3d = prefixStyle('perspective') in dummyStyle,
        hasTouch = 'ontouchstart' in window && !isTouchPad,
        hasTransform = !!vendor,
        hasTransitionEnd = prefixStyle('transition') in dummyStyle,

        RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
        START_EV = hasTouch ? 'touchstart' : 'mousedown',
        MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
        END_EV = hasTouch ? 'touchend' : 'mouseup',
        CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
        TRNEND_EV = (function () {
            if ( vendor === false ) return false;

            var transitionEnd = {
                ''			: 'transitionend',
                'webkit'	: 'webkitTransitionEnd',
                'Moz'		: 'transitionend',
                'O'			: 'otransitionend',
                'ms'		: 'MSTransitionEnd'
            };

            return transitionEnd[vendor];
        })(),

        nextFrame = (function() {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function(callback) { return setTimeout(callback, 1); };
        })(),
        cancelFrame = (function () {
            return window.cancelRequestAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.webkitCancelRequestAnimationFrame ||
                window.mozCancelRequestAnimationFrame ||
                window.oCancelRequestAnimationFrame ||
                window.msCancelRequestAnimationFrame ||
                clearTimeout;
        })(),

    // Helpers
        translateZ = has3d ? ' translateZ(0)' : '',

    // Constructor
        iScroll = function (el, options) {
            var that = this,
                i;

            that.wrapper = typeof el == 'object' ? el : doc.getElementById(el);
            that.wrapper.style.overflow = 'hidden';
            that.scroller = that.wrapper.children[0];

            that.translateZ = translateZ;
            // Default options
            that.options = {
                hScroll: true,
                vScroll: true,
                x: 0,
                y: 0,
                bounce: true,
                bounceLock: false,
                momentum: true,
                lockDirection: true,
                useTransform: true,
                useTransition: false,
                topOffset: 0,
                checkDOMChanges: false,		// Experimental
                handleClick: true,


                // Events
                onRefresh: null,
                onBeforeScrollStart: function (e) {
					/*
					var target = e.target; 
					while (target.nodeType != 1) target = target.parentNode; 
					if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA'){ 
						e.preventDefault(); 
					} 
					*/
				},
                onScrollStart: null,
                onBeforeScrollMove: function(e){
					e.preventDefault(); 
				},
                onScrollMove: null,
                onBeforeScrollEnd: null,
                onScrollEnd: null,
                onTouchEnd: null,
                onDestroy: null

            };

            // User defined options
            for (i in options) that.options[i] = options[i];

            // Set starting position
            that.x = that.options.x;
            that.y = that.options.y;

            // Normalize options
            that.options.useTransform = hasTransform && that.options.useTransform;

            that.options.useTransition = hasTransitionEnd && that.options.useTransition;



            // Set some default styles
            that.scroller.style[transitionProperty] = that.options.useTransform ? cssVendor + 'transform' : 'top left';
            that.scroller.style[transitionDuration] = '0';
            that.scroller.style[transformOrigin] = '0 0';
            if (that.options.useTransition) that.scroller.style[transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';

            if (that.options.useTransform) that.scroller.style[transform] = 'translate(' + that.x + 'px,' + that.y + 'px)' + translateZ;
            else that.scroller.style.cssText += ';position:absolute;top:' + that.y + 'px;left:' + that.x + 'px';



            that.refresh();

            that._bind(RESIZE_EV, window);
            that._bind(START_EV);


            if (that.options.checkDOMChanges) that.checkDOMTime = setInterval(function () {
                that._checkDOMChanges();
            }, 500);
        };

// Prototype
    iScroll.prototype = {
        enabled: true,
        x: 0,
        y: 0,
        steps: [],
        scale: 1,
        currPageX: 0, currPageY: 0,
        pagesX: [], pagesY: [],
        aniTime: null,
        isStopScrollAction:false,

        handleEvent: function (e) {
            var that = this;
            switch(e.type) {
                case START_EV:
                    if (!hasTouch && e.button !== 0) return;
                    that._start(e);
                    break;
                case MOVE_EV: that._move(e); break;
                case END_EV:
                case CANCEL_EV: that._end(e); break;
                case RESIZE_EV: that._resize(); break;
                case TRNEND_EV: that._transitionEnd(e); break;
            }
        },

        _checkDOMChanges: function () {
            if (this.moved ||  this.animating ||
                (this.scrollerW == this.scroller.offsetWidth * this.scale && this.scrollerH == this.scroller.offsetHeight * this.scale)) return;

            this.refresh();
        },

        _resize: function () {
            var that = this;
            setTimeout(function () { that.refresh(); }, isAndroid ? 200 : 0);
        },

        _pos: function (x, y) {
            x = this.hScroll ? x : 0;
            y = this.vScroll ? y : 0;

            if (this.options.useTransform) {
                this.scroller.style[transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ')' + translateZ;
            } else {
                x = m.round(x);
                y = m.round(y);
                this.scroller.style.left = x + 'px';
                this.scroller.style.top = y + 'px';
            }

            this.x = x;
            this.y = y;

        },



        _start: function (e) {
            var that = this,
                point = hasTouch ? e.touches[0] : e,
                matrix, x, y,
                c1, c2;

            if (!that.enabled) return;

            if (that.options.onBeforeScrollStart) that.options.onBeforeScrollStart.call(that, e);

            if (that.options.useTransition ) that._transitionTime(0);

            that.moved = false;
            that.animating = false;

            that.distX = 0;
            that.distY = 0;
            that.absDistX = 0;
            that.absDistY = 0;
            that.dirX = 0;
            that.dirY = 0;
            that.isStopScrollAction = false;

            if (that.options.momentum) {
                if (that.options.useTransform) {
                    // Very lame general purpose alternative to CSSMatrix
                    matrix = getComputedStyle(that.scroller, null)[transform].replace(/[^0-9\-.,]/g, '').split(',');
                    x = +matrix[4];
                    y = +matrix[5];
                } else {
                    x = +getComputedStyle(that.scroller, null).left.replace(/[^0-9-]/g, '');
                    y = +getComputedStyle(that.scroller, null).top.replace(/[^0-9-]/g, '');
                }

                if (m.round(x) != m.round(that.x) || m.round(y) != m.round(that.y)) {
                    that.isStopScrollAction = true;
                    if (that.options.useTransition) that._unbind(TRNEND_EV);
                    else cancelFrame(that.aniTime);
                    that.steps = [];
                    that._pos(x, y);
                    if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);
                }
            }



            that.startX = that.x;
            that.startY = that.y;
            that.pointX = point.pageX;
            that.pointY = point.pageY;

            that.startTime = e.timeStamp || Date.now();

            if (that.options.onScrollStart) that.options.onScrollStart.call(that, e);

            that._bind(MOVE_EV, window);
            that._bind(END_EV, window);
            that._bind(CANCEL_EV, window);
        },

        _move: function (e) {
            var that = this,
                point = hasTouch ? e.touches[0] : e,
                deltaX = point.pageX - that.pointX,
                deltaY = point.pageY - that.pointY,
                newX = that.x + deltaX,
                newY = that.y + deltaY,

                timestamp = e.timeStamp || Date.now();

            if (that.options.onBeforeScrollMove) that.options.onBeforeScrollMove.call(that, e);

            that.pointX = point.pageX;
            that.pointY = point.pageY;

            // Slow down if outside of the boundaries
            if (newX > 0 || newX < that.maxScrollX) {
                newX = that.options.bounce ? that.x + (deltaX / 2) : newX >= 0 || that.maxScrollX >= 0 ? 0 : that.maxScrollX;
            }
            if (newY > that.minScrollY || newY < that.maxScrollY) {
                newY = that.options.bounce ? that.y + (deltaY / 2) : newY >= that.minScrollY || that.maxScrollY >= 0 ? that.minScrollY : that.maxScrollY;
            }

            that.distX += deltaX;
            that.distY += deltaY;
            that.absDistX = m.abs(that.distX);
            that.absDistY = m.abs(that.distY);

            if (that.absDistX < 6 && that.absDistY < 6) {
                return;
            }

            // Lock direction
            if (that.options.lockDirection) {
                if (that.absDistX > that.absDistY + 5) {
                    newY = that.y;
                    deltaY = 0;
                } else if (that.absDistY > that.absDistX + 5) {
                    newX = that.x;
                    deltaX = 0;
                }
            }

            that.moved = true;

            // internal for header scroll

            that._beforePos ? that._beforePos(newY, deltaY) && that._pos(newX, newY) : that._pos(newX, newY);

            that.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            that.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

            if (timestamp - that.startTime > 300) {
                that.startTime = timestamp;
                that.startX = that.x;
                that.startY = that.y;
            }

            if (that.options.onScrollMove) that.options.onScrollMove.call(that, e);
        },

        _end: function (e) {
            if (hasTouch && e.touches.length !== 0) return;

            var that = this,
                point = hasTouch ? e.changedTouches[0] : e,
                target, ev,
                momentumX = { dist:0, time:0 },
                momentumY = { dist:0, time:0 },
                duration = (e.timeStamp || Date.now()) - that.startTime,
                newPosX = that.x,
                newPosY = that.y,
                newDuration;


            that._unbind(MOVE_EV, window);
            that._unbind(END_EV, window);
            that._unbind(CANCEL_EV, window);

            if (that.options.onBeforeScrollEnd) that.options.onBeforeScrollEnd.call(that, e);


            if (!that.moved) {

                if (hasTouch && this.options.handleClick && !that.isStopScrollAction) {
                    that.doubleTapTimer = setTimeout(function () {
                        that.doubleTapTimer = null;

                        // Find the last touched element
                        target = point.target;
                        while (target.nodeType != 1) target = target.parentNode;
						/*
                        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA') {
                            ev = doc.createEvent('MouseEvents');
                            ev.initMouseEvent('click', true, true, e.view, 1,
                                point.screenX, point.screenY, point.clientX, point.clientY,
                                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                                0, null);
                            ev._fake = true;
                            target.dispatchEvent(ev);
                        }
						*/
                    },  0);
                }


                that._resetPos(400);

                if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
                return;
            }

            if (duration < 300 && that.options.momentum) {
                momentumX = newPosX ? that._momentum(newPosX - that.startX, duration, -that.x, that.scrollerW - that.wrapperW + that.x, that.options.bounce ? that.wrapperW : 0) : momentumX;
                momentumY = newPosY ? that._momentum(newPosY - that.startY, duration, -that.y, (that.maxScrollY < 0 ? that.scrollerH - that.wrapperH + that.y - that.minScrollY : 0), that.options.bounce ? that.wrapperH : 0) : momentumY;

                newPosX = that.x + momentumX.dist;
                newPosY = that.y + momentumY.dist;

                if ((that.x > 0 && newPosX > 0) || (that.x < that.maxScrollX && newPosX < that.maxScrollX)) momentumX = { dist:0, time:0 };
                if ((that.y > that.minScrollY && newPosY > that.minScrollY) || (that.y < that.maxScrollY && newPosY < that.maxScrollY)) momentumY = { dist:0, time:0 };
            }

            if (momentumX.dist || momentumY.dist) {
                newDuration = m.max(m.max(momentumX.time, momentumY.time), 10);



                that.scrollTo(m.round(newPosX), m.round(newPosY), newDuration);

                if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
                return;
            }



            that._resetPos(200);
            if (that.options.onTouchEnd) that.options.onTouchEnd.call(that, e);
        },

        _resetPos: function (time) {
            var that = this,
                resetX = that.x >= 0 ? 0 : that.x < that.maxScrollX ? that.maxScrollX : that.x,
                resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

            if (resetX == that.x && resetY == that.y) {
                if (that.moved) {
                    that.moved = false;
                    if (that.options.onScrollEnd) that.options.onScrollEnd.call(that);		// Execute custom code on scroll end
                    if (that._afterPos) that._afterPos();
                }

                return;
            }

            that.scrollTo(resetX, resetY, time || 0);
        },



        _transitionEnd: function (e) {
            var that = this;

            if (e.target != that.scroller) return;

            that._unbind(TRNEND_EV);

            that._startAni();
        },


        /**
         *
         * Utilities
         *
         */
        _startAni: function () {
            var that = this,
                startX = that.x, startY = that.y,
                startTime = Date.now(),
                step, easeOut,
                animate;

            if (that.animating) return;

            if (!that.steps.length) {
                that._resetPos(400);
                return;
            }

            step = that.steps.shift();

            if (step.x == startX && step.y == startY) step.time = 0;

            that.animating = true;
            that.moved = true;

            if (that.options.useTransition) {
                that._transitionTime(step.time);
                that._pos(step.x, step.y);
                that.animating = false;
                if (step.time) that._bind(TRNEND_EV);
                else that._resetPos(0);
                return;
            }

            animate = function () {
                var now = Date.now(),
                    newX, newY;

                if (now >= startTime + step.time) {
                    that._pos(step.x, step.y);
                    that.animating = false;
                    if (that.options.onAnimationEnd) that.options.onAnimationEnd.call(that);			// Execute custom code on animation end
                    that._startAni();
                    return;
                }

                now = (now - startTime) / step.time - 1;
                easeOut = m.sqrt(1 - now * now);
                newX = (step.x - startX) * easeOut + startX;
                newY = (step.y - startY) * easeOut + startY;
                that._pos(newX, newY);
                if (that.animating) that.aniTime = nextFrame(animate);
            };

            animate();
        },

        _transitionTime: function (time) {
            time += 'ms';
            this.scroller.style[transitionDuration] = time;

        },

        _momentum: function (dist, time, maxDistUpper, maxDistLower, size) {
            var deceleration = 0.0006,
                speed = m.abs(dist) * (this.options.speedScale||1) / time,
                newDist = (speed * speed) / (2 * deceleration),
                newTime = 0, outsideDist = 0;

            // Proportinally reduce speed if we are outside of the boundaries
            if (dist > 0 && newDist > maxDistUpper) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistUpper = maxDistUpper + outsideDist;
                speed = speed * maxDistUpper / newDist;
                newDist = maxDistUpper;
            } else if (dist < 0 && newDist > maxDistLower) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistLower = maxDistLower + outsideDist;
                speed = speed * maxDistLower / newDist;
                newDist = maxDistLower;
            }

            newDist = newDist * (dist < 0 ? -1 : 1);
            newTime = speed / deceleration;

            return { dist: newDist, time: m.round(newTime) };
        },

        _offset: function (el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;

            while (el = el.offsetParent) {
                left -= el.offsetLeft;
                top -= el.offsetTop;
            }

            if (el != this.wrapper) {
                left *= this.scale;
                top *= this.scale;
            }

            return { left: left, top: top };
        },



        _bind: function (type, el, bubble) {
            _bindArr.concat([el || this.scroller, type, this]);
            (el || this.scroller).addEventListener(type, this, !!bubble);
        },

        _unbind: function (type, el, bubble) {
            (el || this.scroller).removeEventListener(type, this, !!bubble);
        },


        /**
         *
         * Public methods
         *
         */
        destroy: function () {
            var that = this;

            that.scroller.style[transform] = '';



            // Remove the event listeners
            that._unbind(RESIZE_EV, window);
            that._unbind(START_EV);
            that._unbind(MOVE_EV, window);
            that._unbind(END_EV, window);
            that._unbind(CANCEL_EV, window);



            if (that.options.useTransition) that._unbind(TRNEND_EV);

            if (that.options.checkDOMChanges) clearInterval(that.checkDOMTime);

            if (that.options.onDestroy) that.options.onDestroy.call(that);

            //清除所有绑定的事件
            for (var i = 0, l = _bindArr.length; i < l;) {
                _bindArr[i].removeEventListener(_bindArr[i + 1], _bindArr[i + 2]);
                _bindArr[i] = null;
                i = i + 3
            }
            _bindArr = [];

            //干掉外边的容器内容
            /*var div = doc.createElement('div');
            div.appendChild(this.wrapper);
            div.innerHTML = '';
            that.wrapper = that.scroller = div = null;*/
        },

        refresh: function () {
            var that = this,
                offset;



            that.wrapperW = that.wrapper.clientWidth || 1;
            that.wrapperH = that.wrapper.clientHeight || 1;

            that.minScrollY = -that.options.topOffset || 0;
            that.scrollerW = m.round(that.scroller.offsetWidth * that.scale);
            that.scrollerH = m.round((that.scroller.offsetHeight + that.minScrollY) * that.scale);
            that.maxScrollX = that.wrapperW - that.scrollerW;
            that.maxScrollY = that.wrapperH - that.scrollerH + that.minScrollY;
            that.dirX = 0;
            that.dirY = 0;

            if (that.options.onRefresh) that.options.onRefresh.call(that);

            that.hScroll = that.options.hScroll && that.maxScrollX < 0;
            that.vScroll = that.options.vScroll && (!that.options.bounceLock && !that.hScroll || that.scrollerH > that.wrapperH);


            offset = that._offset(that.wrapper);
            that.wrapperOffsetLeft = -offset.left;
            that.wrapperOffsetTop = -offset.top;


            that.scroller.style[transitionDuration] = '0';
            that._resetPos(400);
        },

        scrollTo: function (x, y, time, relative) {
            var that = this,
                step = x,
                i, l;

            that.stop();

            if (!step.length) step = [{ x: x, y: y, time: time, relative: relative }];

            for (i=0, l=step.length; i<l; i++) {
                if (step[i].relative) { step[i].x = that.x - step[i].x; step[i].y = that.y - step[i].y; }
                that.steps.push({ x: step[i].x, y: step[i].y, time: step[i].time || 0 });
            }

            that._startAni();
        },

        scrollToElement: function (el, time) {
            var that = this, pos;
            el = el.nodeType ? el : that.scroller.querySelector(el);
            if (!el) return;

            pos = that._offset(el);
            pos.left += that.wrapperOffsetLeft;
            pos.top += that.wrapperOffsetTop;

            pos.left = pos.left > 0 ? 0 : pos.left < that.maxScrollX ? that.maxScrollX : pos.left;
            pos.top = pos.top > that.minScrollY ? that.minScrollY : pos.top < that.maxScrollY ? that.maxScrollY : pos.top;
            time = time === undefined ? m.max(m.abs(pos.left)*2, m.abs(pos.top)*2) : time;

            that.scrollTo(pos.left, pos.top, time);
        },

        scrollToPage: function (pageX, pageY, time) {
            var that = this, x, y;

            time = time === undefined ? 400 : time;

            if (that.options.onScrollStart) that.options.onScrollStart.call(that);


            x = -that.wrapperW * pageX;
            y = -that.wrapperH * pageY;
            if (x < that.maxScrollX) x = that.maxScrollX;
            if (y < that.maxScrollY) y = that.maxScrollY;


            that.scrollTo(x, y, time);
        },

        disable: function () {
            this.stop();
            this._resetPos(0);
            this.enabled = false;

            // If disabled after touchstart we make sure that there are no left over events
            this._unbind(MOVE_EV, window);
            this._unbind(END_EV, window);
            this._unbind(CANCEL_EV, window);
        },

        enable: function () {
            this.enabled = true;
        },

        stop: function () {
            if (this.options.useTransition) this._unbind(TRNEND_EV);
            else cancelFrame(this.aniTime);
            this.steps = [];
            this.moved = false;
            this.animating = false;
        },

        isReady: function () {
            return !this.moved &&  !this.animating;
        }
    };

    function prefixStyle (style) {
        if ( vendor === '' ) return style;

        style = style.charAt(0).toUpperCase() + style.substr(1);
        return vendor + style;
    }

    dummyStyle = null;	// for the sake of it

    if (typeof exports !== 'undefined') exports.iScroll = iScroll;
    else window.iScroll = iScroll;

    // 给$.fn上挂iScroll方法
    (function( $, ns, undefined ){
        if(!$)return;

        var _iScroll = ns.iScroll,

            slice = [].slice,
            
            record = (function() {
                var data = {},
                    id = 0,
                    ikey = '_sid';    // internal key.

                return function( obj, val ) {
                    var key = obj[ ikey ] || (obj[ ikey ] = ++id);

                    val !== undefined && (data[ key ] = val);
                    val === null && delete data[ key ];

                    return data[ key ];
                };
            })(),

            iScroll;

        ns.iScroll = iScroll = function( el, options ){
            var args = [].slice.call( arguments, 0 ),
                ins = new _iScroll( el, options );

            record( el, ins );
            return ins;
        };
        iScroll.prototype = _iScroll.prototype;


        $.fn.iScroll = function( opts ) {
            var args = slice.call( arguments, 1 ),
                method = typeof opts === 'string' && opts,
                ret,
                obj;

            $.each( this, function( i, el ) {

                // 从缓存中取，没有则创建一个
                obj = record( el ) || iScroll( el, $.isPlainObject( opts ) ?
                        opts : undefined );

                // 取实例
                if ( method === 'this' ) {
                    ret = obj;
                    return false;    // 断开each循环
                } else if ( method ) {

                    // 当取的方法不存在时，抛出错误信息
                    if ( !$.isFunction( obj[ method ] ) ) {
                        throw new Error( 'iScroll没有此方法：' + method );
                    }

                    ret = obj[ method ].apply( obj, args );

                    // 断定它是getter性质的方法，所以需要断开each循环，把结果返回
                    if ( ret !== undefined && ret !== obj ) {
                        return false;
                    }

                    // ret为obj时为无效值，为了不影响后面的返回
                    ret = undefined;
                }
            } );

            return ret !== undefined ? ret : this;
        };

    })( window.Zepto || null, window );
})(window, document);
/**
 * Change list
 * 修改记录
 *
 * 1. 2012-08-14 解决滑动中按住停止滚动，松开后被点元素触发点击事件。
 *
 * 具体修改:
 * a. 202行 添加isStopScrollAction: false 给iScroll的原型上添加变量
 * b. 365行 _start方法里面添加that.isStopScrollAction = false; 默认让这个值为false
 * c. 390行 if (x != that.x || y != that.y)条件语句里面 添加了  that.isStopScrollAction = true; 当目标值与实际值不一致，说明还在滚动动画中
 * d. 554行 that.isStopScrollAction || (that.doubleTapTimer = setTimeout(function () {
 *          ......
 *          ......
 *          }, that.options.zoom ? 250 : 0));
 *   如果isStopScrollAction为true就不派送click事件
 *
 *
 * 2. 2012-08-14 给options里面添加speedScale属性，提供外部控制冲量滚动速度
 *
 * 具体修改
 * a. 108行 添加speedScale: 1, 给options里面添加speedScale属性，默认为1
 * b. 798行 speed = m.abs(dist) * this.options.speedScale / time, 在原来速度的基础上*speedScale来改变速度
 *
 * 3. 2012-08-21 修改部分代码，给iscroll_plugin墙用的
 *
 * 具体修改
 * a. 517行  在_pos之前，调用_beforePos,如果里面不返回true,  将不会调用_pos
 *  // internal for header scroll
 *  if (that._beforePos)
 *      that._beforePos(newY, deltaY) && that._pos(newX, newY);
 *  else
 *      that._pos(newX, newY);
 *
 * b. 680行 在滚动结束后调用 _afterPos.
 * // internal for header scroll
 * if (that._afterPos) that._afterPos();
 *
 * c. 106行构造器里面添加以下代码
 * // add var to this for header scroll
 * that.translateZ = translateZ;
 *
 * 为处理溢出
 * _bind 方法
 * destroy 方法
 * 最开头的 _bindArr = []
 *
 */
/**
 * @file GMU定制版iscroll，基于[iScroll 4.2.2](http://cubiq.org/iscroll-4), 去除zoom, pc兼容，snap, scrollbar等功能。同时把iscroll扩展到了Zepto的原型中。
 * @name iScroll
 * @import zepto.js
 * @desc GMU定制版iscroll，基于{@link[http://cubiq.org/iscroll-4] iScroll 4.2.2}, 去除zoom, pc兼容，snap, scrollbar等功能。同时把iscroll扩展到了***Zepto***的原型中。
 */

/**
 * @name iScroll
 * @grammar new iScroll(el,[options])  ⇒ self
 * @grammar $('selecotr').iScroll([options])  ⇒ zepto实例
 * @desc 将iScroll加入到了***$.fn***中，方便用Zepto的方式调用iScroll。
 * **el**
 * - ***el {String/ElementNode}*** iscroll容器节点
 *
 * **Options**
 * - ***hScroll*** {Boolean}: (可选, 默认: true)横向是否可以滚动
 * - ***vScroll*** {Boolean}: (可选, 默认: true)竖向是否可以滚动
 * - ***momentum*** {Boolean}: (可选, 默认: true)是否带有滚动效果
 * - ***checkDOMChanges*** {Boolean, 默认: false}: (可选)每个500毫秒判断一下滚动区域的容器是否有新追加的内容，如果有就调用refresh重新渲染一次
 * - ***useTransition*** {Boolean, 默认: false}: (可选)是否使用css3来来实现动画，默认是false,建议开启
 * - ***topOffset*** {Number}: (可选, 默认: 0)可滚动区域头部缩紧多少高度，默认是0， ***主要用于头部下拉加载更多时，收起头部的提示按钮***
 * @example
 * $('div').iscroll().find('selector').atrr({'name':'aaa'}) //保持链式调用
 * $('div').iScroll('refresh');//调用iScroll的方法
 * $('div').iScroll('scrollTo', 0, 0, 200);//调用iScroll的方法, 200ms内滚动到顶部
 */


/**
 * @name destroy
 * @desc 销毁iScroll实例，在原iScroll的destroy的基础上对创建的dom元素进行了销毁
 * @grammar destroy()  ⇒ undefined
 */

/**
 * @name refresh
 * @desc 更新iScroll实例，在滚动的内容增减时，或者可滚动区域发生变化时需要调用***refresh***方法来纠正。
 * @grammar refresh()  ⇒ undefined
 */

/**
 * @name scrollTo
 * @desc 使iScroll实例，在指定时间内滚动到指定的位置， 如果relative为true, 说明x, y的值是相对与当前位置的。
 * @grammar scrollTo(x, y, time, relative)  ⇒ undefined
 */
/**
 * @name scrollToElement
 * @desc 滚动到指定内部元素
 * @grammar scrollToElement(element, time)  ⇒ undefined
 * @grammar scrollToElement(selector, time)  ⇒ undefined
 */
/**
 * @name scrollToPage
 * @desc 跟scrollTo很像，这里传入的是百分比。
 * @grammar scrollToPage(pageX, pageY, time)  ⇒ undefined
 */
/**
 * @name disable
 * @desc 禁用iScroll
 * @grammar disable()  ⇒ undefined
 */
/**
 * @name enable
 * @desc 启用iScroll
 * @grammar enable()  ⇒ undefined
 */
/**
 * @name stop
 * @desc 定制iscroll滚动
 * @grammar stop()  ⇒ undefined
 */

/**
 * @file 修复Zepto中offset setter bug
 * 比如 被定位元素满足以下条件时，会定位不正确
 * 1. 被定位元素不是第一个节点，且prev兄弟节点中有非absolute或者fixed定位的元素
 * 2. 被定位元素为非absolute或者fixed定位。
 * issue: https://github.com/gmuteam/GMU/issues/101
 * @import zepto.js
 * @module GMU
 */

(function( $ ) {
    var _offset = $.fn.offset,
        round = Math.round;

    // zepto的offset bug的主要问题是当position:relative的时候，没有考虑元素的初始值。
    // 初始值，是指positon:relative; top: 0; left: 0; bottom:0; right:0; 的时候
    // 该元素的位置，zepto中的offset是假定了这个值就是{left:0, top: 0}; 实际上前面有兄弟
    // 节点且不为postion: absolute|fixed 定位时时，该元素的初始位置并不是{left:0, top: 0}
    // 会根据前面兄弟节点的内容大小而不一样。
    function setter( coord ) {
        return this.each(function( idx ) {
            var $el = $( this ),
                coords = $.isFunction( coord ) ? coord.call( this, idx,
                    $el.offset() ) : coord,

                position = $el.css( 'position' ),

                // position为absolute或者fixed定位的元素，跟元素的初始位置没有关系
                // 所以不需要取初始位置
                pos = position === 'absolute' || position === 'fixed' ||
                    $el.position();

            // 如果是position为relative, 且存在 top, right, bottom, left值
            // position值还不能代表初始值，需要还原一下
            // 比如 top: 1px, 那要让position取得的值减去1px才是该元素的初始位置
            // 但是如果是top:auto, bottom: 1px; 则是要加1px, 所以下面的代码要乘以个-1
            if ( position === 'relative' ) {
                pos.top -= parseFloat( $el.css( 'top' ) ) ||
                        parseFloat( $el.css( 'bottom' ) ) * -1 || 0;
                pos.left -= parseFloat( $el.css( 'left' ) ) ||
                        parseFloat( $el.css( 'right' ) ) * -1 || 0;
            }

            parentOffset = $el.offsetParent().offset(),

            // 迫于无赖，chrome下如果offset设置的top,left不是整型，会导致popOver中arrow样式有问题。
            props = {
              top:  round( coords.top - (pos.top || 0)  - parentOffset.top ),
              left: round( coords.left - (pos.left || 0) - parentOffset.left )
            }

            if ( position == 'static' ){
                props['position'] = 'relative';
            }

            // 可以考虑改用animate方法。
            if ( coords.using ) {
                coords.using.call( this, props, idx );
            } else {
                $el.css( props );
            }
        });
    }

    $.fn.offset = function( corrd ) {
        return corrd ? setter.call( this, corrd ): _offset.call( this );
    }
})( Zepto );



/**
 * @file 基于Zepto的位置设置获取组件
 * @import zepto.js, extend/offset.js
 * @module GMU
 */

(function ($, undefined) {
    var _position = $.fn.position,
        round = Math.round,
        rhorizontal = /^(left|center|right)([\+\-]\d+%?)?$/,
        rvertical = /^(top|center|bottom)([\+\-]\d+%?)?$/,
        rpercent = /%$/;

    function str2int( persent, totol ) {
        return (parseInt( persent, 10 ) || 0) * (rpercent.test( persent ) ?
                totol / 100 : 1);
    }

    function getOffsets( pos, offset, width, height ) {
        return [
            pos[ 0 ] === 'right' ? width : pos[ 0 ] === 'center' ?
                    width / 2 : 0,

            pos[ 1 ] === 'bottom' ? height : pos[ 1 ] === 'center' ?
                    height / 2 : 0,

            str2int( offset[ 0 ], width ),

            str2int( offset[ 1 ], height )
        ];
    }

    function getDimensions( elem ) {
        var raw = elem[ 0 ],
            isEvent = raw.preventDefault;

        raw = raw.touches && raw.touches[ 0 ] || raw;

        // 特殊处理document, window和event对象
        if ( raw.nodeType === 9 || raw === window || isEvent ) {
            return {
                width: isEvent ? 0 : elem.width(),
                height: isEvent ? 0 : elem.height(),
                top: raw.pageYOffset || raw.pageY ||  0,
                left: raw.pageXOffset || raw.pageX || 0
            };
        }

        return elem.offset();
    }

    function getWithinInfo( el ) {
        var $el = $( el = (el || window) ),
            dim = getDimensions( $el );

        el = $el[ 0 ];

        return {
            $el: $el,
            width: dim.width,
            height: dim.height,
            scrollLeft: el.pageXOffset || el.scrollLeft,
            scrollTop: el.pageYOffset || el.scrollTop
        };
    }

    // 参数检测纠错
    function filterOpts( opts, offsets ) {
        [ 'my', 'at' ].forEach(function( key ) {
            var pos = ( opts[ key ] || '' ).split( ' ' ),
                opt = opts[ key ] = [ 'center', 'center' ],
                offset = offsets[ key ] = [ 0, 0 ];

            pos.length === 1 && pos[ rvertical.test( pos[ 0 ] ) ? 'unshift' :
                    'push' ]( 'center' );

            rhorizontal.test( pos[ 0 ] ) && (opt[ 0 ] = RegExp.$1) &&
                    (offset[ 0 ] = RegExp.$2);

            rvertical.test( pos[ 1 ] ) && (opt[ 1 ] = RegExp.$1) &&
                    (offset[ 1 ] = RegExp.$2);
        });
    }

    /**
     * 获取元素相对于相对父级元素（父级最近为position为relative｜abosolute｜fixed的元素）的坐标位置。
     * @method $.fn.position
     * @grammar position()  ⇒ array
     * @grammar position(opts)  ⇒ self
     * @param {String} [my=center] 设置中心点。可以为'left top', 'center bottom', 'right center'...同时还可以设置偏移量；如 'left+5 center-20%'
     * @param {String} [at=center] 设置定位到目标元素的什么位置。参数格式同my参数一致
     * @param {Object} [of=null] 设置目标元素
     * @param {Function} [collision=null] 碰撞检测回调方法
     * @param {Object} [within=window] 碰撞检测对象
     * @example
     * var position = $('#target').position();
     * $('#target').position({
     *                          my: 'center',
     *                          at: 'center',
     *                          of: document.body
     *                      });
     */
    $.fn.position = function ( opts ) {
        if ( !opts || !opts.of ) {
            return _position.call( this );
        }

        opts = $.extend( {}, opts );

        var target = $( opts.of ),
            collision = opts.collision,
            within = collision && getWithinInfo( opts.within ),
            ofses = {},
            dim = getDimensions( target ),
            bPos = {
                left: dim.left,
                top: dim.top
            },
            atOfs;

        target[ 0 ].preventDefault && (opts.at = 'left top');
        filterOpts( opts, ofses );    // 参数检测纠错

        atOfs = getOffsets( opts.at, ofses.at, dim.width, dim.height );
        bPos.left += atOfs[ 0 ] + atOfs[ 2 ];
        bPos.top += atOfs[ 1 ] + atOfs[ 3 ];

        return this.each(function() {
            var $el = $( this ),
                ofs = $el.offset(),
                pos = $.extend( {}, bPos ),
                myOfs = getOffsets( opts.my, ofses.my, ofs.width, ofs.height );

            pos.left = round( pos.left + myOfs[ 2 ] - myOfs[ 0 ] );
            pos.top = round( pos.top + myOfs[ 3 ] - myOfs[ 1 ] );

            collision && collision.call( this, pos, {
                of: dim,
                offset: ofs,
                my: opts.my,
                at: opts.at,
                within: within,
                $el : $el
            } );

            pos.using = opts.using;
            $el.offset( pos );
        });
    }
})( Zepto );/**
 * @file 常用方法、属性支持性检测
 * @import zepto.js
 * @module GMU
 */

(function($, undefined) {
    
    /**
     * 检测设备对某些属性或方法的支持情况
     * @method $.support
     * @grammar $.support.orientation ⇒ Boolean
     * @param {Boolean} orientation 检测是否支持转屏事件，UC中存在orientaion，但转屏不会触发该事件，故UC属于不支持转屏事件(iOS 4上qq, chrome都有这个现象)
     * @param {Boolean} touch 检测是否支持touch相关事件
     * @param {Boolean} cssTransitions 检测是否支持css3的transition
     * @param {Boolean} has3d 检测是否支持translate3d的硬件加速
     * @example
     * if ($.support.has3d) {      //在支持3d的设备上使用
     *     console.log('you can use transtion3d');
     * }
     */

    // TODO检测是否支持position: fixed
    function detectPosFixed () {

    }

    var br = $.browser;

    $.support = $.extend($.support || {}, {
        orientation: !(br.uc || (parseFloat($.os.version)<5 && (br.qq || br.chrome))) && !($.os.android && parseFloat($.os.version) > 3) && "orientation" in window && "onorientationchange" in window,
        touch: "ontouchend" in document,
        cssTransitions: "WebKitTransitionEvent" in window,
        has3d: 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
        // fix: detectPosFixed,
        pushState: "pushState" in history && "replaceState" in history,
        scrolling: '',
        requestAnimationFrame: 'webkitRequestAnimationFrame' in window
    });

})(Zepto);


//======================Add2desktop  widget======================
/**
 * @file 在iOS中将页面添加为桌面图标(不支持Android系统)
 * @import core/widget.js, extend/fix.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    /**
     * 在iOS中将页面添加为桌面图标(不支持Android系统)
     * @class Add2desktop
     * @constructor Html部分
     *
     * javascript部分
     * ```javascript
     * gmu.Add2desktop({icon:'../../../examples/assets/icon.png'});
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化工具栏的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Toolbar:options)
     * @grammar  gmu.Add2desktop([el [,options]]) =>instance
     * @grammar  $(el).add2desktop(options) => zepto
     */
    gmu.define('Add2desktop', {
        options: {
            /**
             * @property {String} icon 产品线ICON的URL
             * @namespace options
             */
            icon: '',
            /**
             * @property {selector} [container=document.body] 组件容器
             * @namespace options
             */
            container:  '',
            /**
             * @property {String} [key='_gmu_adddesktop_key'] LocalStorage的key值
             * @namespace options
             */
            key:'_gmu_adddesktop_key',
            /**
             * @property {Boolean} [useFix=true] 是否使用fix固顶效果
             * @namespace options
             */
            useFix: true,
            /**
             * @property {Object} [position={bottom:12,left:50%}] 固顶时使用的位置参数
             * @namespace options
             */
            position: {
                bottom: 12,
                left: '50%'
            },
            /**
             * @property {Function} [beforeshow=fn}] 显示前触发的事件，调用e.preventDefault()可以阻止显示
             * @namespace options
             */
            beforeshow : function(e){
                this.key() && e.preventDefault()
            },
            /**
             * @property {Function} [afterhide=fn}] 隐藏后触发的事件，可以在这里写LocalStorage的值
             * @namespace options
             */
            afterhide : function(){
                this.key(1)
            },
            _isShow:false
        },

        _init: function() {
            var me = this;

            me.on( 'ready', function(){
                me.$el.find('.ui-add2desktop-close').on('click',function () {
                    me.hide();
                });
                me._options['useFix'] && me.$el.fix(me._options['position']);

                me.show();
            } );

            me.on( 'destroy', function(){
                me.$el.remove();
            } );
        },

        _create: function() {
            var me = this,
                $el,
                version = ($.os.version && $.os.version.substr(0, 3) > 4.1 ? 'new' :'old');

            if($.os.version && $.os.version.substr(0, 3) >= 7.0) {
                version = 'iOS7';
            }

            if( me._options.setup ) {
                var src = me.$el.children('img').attr('src');
                src && (me._options['icon'] = src);
            }
            $el = me.$el || (me.$el = $('<div></div>'));
            $el.addClass('ui-add2desktop').appendTo(me._options['container'] || (me.$el.parent().length ? '' : document.body)),

            $el.html('<img src="' + me._options['icon'] + '"/><p>先点击<span class="ui-add2desktop-icon-' + version +'"></span>，<br />再"添加到主屏幕"</p><span class="ui-add2desktop-close"><b></b></span><div class="ui-add2desktop-arrow"><b></b></div>');
        },

        /**
         * 存储/获取LocalStorage的键值
         * @method key
         * @param {String} [value] LocalStorage的键值，不传表示取值
         * @return {self} LocalStorage的值
         */
        key : function(value){
            var ls = window.localStorage;
            return value !== undefined ? ls.setItem(this._options['key'], value) : ls.getItem(this._options['key']);
        },

        /**
         * 显示add2desktop
         * @method show
         * @return {self} 返回本身。
         */

        /**
         * @event beforeshow
         * @param {Event} e gmu.Event对象
         * @description add2desktop显示前触发
         */
        show: function() {
            var me = this;

            if( !me._options['_isShow'] ) {
                if(!$.os.ios || $.browser.uc || $.browser.qq || $.browser.chrome) return me; //todo 添加iOS原生浏览器的判断
                var event = new gmu.Event('beforeshow');
                me.trigger(event);
                if(event.isDefaultPrevented()) return me;
                me.$el.css('display', 'block');
                me._options['_isShow'] = true;
            }

            return me;
        },

        /**
         * 隐藏add2desktop
         * @method hide
         * @return {self} 返回本身。
         */

        /**
         * @event afterhide
         * @param {Event} e gmu.Event对象
         * @description add2desktop显示后触发
         */
        hide: function() {
            var me = this;

            if(me._options['_isShow']) {
                me.$el.css('display', 'none');
                me._options['_isShow'] = false;
                me.trigger('afterhide');
            }

            return me;
        }
        
        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    });

})( gmu, gmu.$ );

//======================button widget==========================

/**
 * @file Button组件。
 * @module GMU
 * @import core/widget.js, extend/highlight.js
 * @importCss icons.css
 */
(function( gmu, $, undefined ) {

    /**
     * Button组件。支持icon, icon位置设置。
     *
     * [![Live Demo](qrcode:http://gmu.baidu.com/demo/widget/button/button.html)](http://gmu.baidu.com/demo/widget/button/button.html "Live Demo")
     *
     * @class Button
     * @constructor
     * html部分, 可以是以下任意dom实例化button
     * ```html
     * <a class="btn">按钮</a>
     * <span class="btn">按钮</span>
     * <button class="btn">按钮</button>
     * <input class="btn" type="button" value="按钮" />
     * <input class="btn" type="reset" value="按钮" />
     * <input class="btn" type="button" value="按钮" />
     * ```
     *
     * Javascript部分
     * ```javascript
     * $( '.btn' ).button();
     * ```
     *
     * 如果希望支持checkbox radio按钮，请查看[input插件](#GMU:Button.input)。
     * @grammar new gmu.Button( el[, options]) => instance
     * @grammar $( el ).button([ options ]) => zepto
     */
    gmu.define( 'Button', {
        options: {

            /**
             * @property {String} [label] 按钮文字。
             * @namespace options
             */

            /**
             * @property {String} [icon] 图标名称。系统提供以下图标。home, delete, plus, arrow-u, arrow-d, check, gear, grid, star, arrow-r, arrow-l, minus, refresh, forward, back, alert, info, search,
             * @namespace options
             */

            /**
             * @property {String} [iconpos] 图片位置。支持：left, right, top, bottom, notext.
             * @namespace options
             */
            iconpos: 'left'

            /**
             * @property {String} [state]
             * @description 设置初始状态。如果状态值为`disbaled`，按钮将不可点击。
             * @namespace options
             */

            /**
             * @property {String} [{$state}Text]
             * @description 设置对应状态文字，当button进入此状态时，按钮将显示对应的文字。
             * @namespace options
             */
        },

        template: {
            icon: '<span class="ui-icon ui-icon-<%= name %>"></span>',
            text: '<span class="ui-btn-text"><%= text %></span>'
        },

        _getWrap: function( $el ) {
            return $el;
        },

        _init: function(){
            var me = this;

            me.$el = me.$el === undefined ? $('<span/>').appendTo( document.body ) : me.$el;
        },

        _create: function() {
            var me = this,
                opts = me._options,
                $wrap = me.$wrap = me._getWrap( me.getEl() ),
                input = $wrap.is( 'input' ),
                $label = $wrap.find( '.ui-btn-text' ),
                $icon = $wrap.find( '.ui-icon' );

            // 处理label
            // 如果是空字符串，则表示dom中写了data-label=""
            opts.label = opts.label === undefined ? $wrap[ input ? 'val' : 'text' ]() : opts.label;
            input || opts.label === undefined || !$label.length && ($label = $( me.tpl2html( 'text', {
                text: opts.label
            } ) )).appendTo( $wrap.empty() );
            me.$label = $label.length && $label;
            opts.resetText = opts.resetText || opts.label;

            // 如果传入了icon而dom中没有，则创建
            input || opts.icon && !$icon.length && ($icon = $( me.tpl2html( 'icon', {
                name: opts.icon
            } ) )).appendTo( $wrap );
            me.$icon = $icon.length && $icon;

            $wrap.addClass( 'ui-btn ' + (opts.label && opts.icon ?
                    'ui-btn-icon-' + opts.iconpos : opts.label ?
                    'ui-btn-text-only' : 'ui-btn-icon-only') );

            opts.state && setTimeout( function(){
                me.state( opts.state );
            }, 0 );
        },

        /**
         * 设置或者获取按钮状态值。
         *
         * 如果传入的state为"disabled", 此按钮将变成不可点击状态。
         *
         * ```javascript
         * // 初始化的时候可以给diabled状态设置Text
         * var btn = $( '#btn' ).button({
         *     disabledText: '不可点'
         * });
         *
         * // 按钮将变成不可点击状态。同时文字也变成了”不可点“
         * btn.button( 'state', 'disabled' );
         *
         * // 还原按钮状态
         * // 文字也还原。
         * btn.button( 'state', 'reset' );
         *
         * ```
         * @method state
         * @grammar state( value ) => self
         * @grammar state() => String
         * @param  {String} [state] 状态值。
         * @return {String} 当没有传入state值时，此方法行为为getter, 返回当前state值。
         * @return {self} 当传入了state值时，此方法行为为setter, 返回实例本身，方便链式调用。
         */
        state: function( state ) {

            // getter
            if ( state === undefined ) {
                return this._state;
            }

            // setter
            var me = this,
                $wrap = me.$wrap,
                input = $wrap.is( 'input' ),
                text = me._options[ state + 'Text' ];

            me.$wrap.removeClass( 'ui-state-' + me._state )
                    .addClass( 'ui-state-' + state );

            text === undefined || (input ? $wrap : me.$label)[ input ?
                    'val' : 'text' ]( text );

            me._state !== state && me.trigger( 'statechange', state, me._state );
            me._state = state;
            return me;
        },

        /**
         * 切换按钮选中状态
         * @method toggle
         * @grammar toggle() => self
         * @example
         * var btn = $( '#btn' );
         *
         * btn.on( 'click', function() {
         *     btn.button( 'toggle' );
         * } );
         */
        toggle: function() {
            this.state( this._state === 'active' ? 'reset' : 'active' );
            return this;
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event statechange
         * @param {Event} e gmu.Event对象
         * @param {String} state 当前state值
         * @param {String} preState 前一次state的值
         * @description 当组件状态变化时触发。
         */

        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 当组件被销毁的时候触发。
         */
    } );

    // dom ready
    $(function() {

        // 按下态。
        $( document.body ).highlight( 'ui-state-hover', '.ui-btn:not(.ui-state-disabled)' );
    });
})( gmu, gmu.$ );

/**
 * @file Button input插件
 * @module GMU
 * @import widget/button/button.js
 */
(function( gmu, $ ) {
    var uid = 0;

    /**
     * Button input插件，让button支持checkbox和radio来实例化。
     *
     * 如:
     * ```html
     * <input type="checkbox" data-label="按钮" />
     * <input type="radio" data-label="按钮" />
     * ```
     *
     * 且此类按钮，点击的时候回自动切换active状态，对应的input的checked值也会变化。
     *
     * @class input
     * @namespace Button
     * @pluginfor Button
     */
    gmu.Button.register( 'input', {
        _getWrap: function( $el ) {
            var id, el, $wrap;

            // 如果是表单元素。
            if ( $el.is( 'input[type="checkbox"], input[type="radio"]' ) ) {
                el = $el.addClass( 'ui-hidden' )[ 0 ];
                (id = el.id) || (el.id = id = 'input_btn_' + uid++);
                $wrap = $( 'label[for=' + id + ']', el.form || el.ownerDocument || undefined );
                $wrap.length || ($wrap = $( '<label for="' + id + '"></label>' ).insertBefore( $el ));

                $el.prop( 'checked' ) && (this._options.state = 'active');
                return $wrap;
            }

            return $el;
        },

        toggle: function() {
            var $el = this.$el;

            if ( $el.is( 'input[type="radio"]' ) ) {
                $radios = $( "[name='" + $el.attr('name') + "']", $el[ 0 ].form
                        || $el[ 0 ].ownerDocument || undefined );

                $radios.button( 'state', 'reset' );
            }
            return this.origin.apply( this, arguments );
        },

        state: function( state ) {
            var $el = this.$el;

            // 设置disabled状态
            if ( $el.is( 'input[type="checkbox"], input[type="radio"]' ) ) {
                $el.prop( 'disabled', state === 'disabled' );
                $el.prop( 'checked', state === 'checked' );
            }

            return this.origin.apply( this, arguments );
        }
    } );


    // dom ready
    $(function() {
        $( document.body ).on( 'click.button',
                'label.ui-btn:not(.ui-state-disabled)', function() {

            $( '#' + this.getAttribute( 'for' ) ).button( 'toggle' );
        });
    });
})( gmu, gmu.$ );


//======================calendar widget==========================

/**
 * @file 日历组件
 * @import extend/touch.js, core/widget.js, extend/highlight.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    var monthNames = ["01月", "02月", "03月", "04月", "05月", "06月",
        "07月", "08月", "09月", "10月", "11月", "12月"],

        dayNames = ["日", "一", "二", "三", "四", "五", "六"],
        offsetRE = /^(\+|\-)?(\d+)(M|Y)$/i,

        //获取月份的天数
        getDaysInMonth = function(year, month) {
            return 32 - new Date(year, month, 32).getDate();
        },

        //获取月份中的第一天是所在星期的第几天
        getFirstDayOfMonth = function(year, month) {
            return new Date(year, month, 1).getDay();
        },

        //格式化数字，不足补零.
        formatNumber = function(val, len) {
            var num = "" + val;
            while (num.length < len) {
                num = "0" + num;
            }
            return num;
        },

        getVal = function(elem) {
            return elem.is('select, input') ? elem.val() : elem.attr('data-value');
        },

        prototype;

    /**
     * 日历组件
     *
     * @class Calendar
     * @constructor Html部分
     * ```html
     * <div id="calendar"></div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#calendar').calendar({
     *    swipeable: true
     * });
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化日历的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Calendar:options)
     * @grammar $( el ).calendar( options ) => zepto
     * @grammar new gmu.Calendar( el, options ) => instance
     */
    gmu.define( 'Calendar', {
        options: {
            /**
             * @property {Date|String} [date=null] 初始化日期，默认今天
             * @namespace options
             */
            date: null,
            /**
             * @property {Number} [firstDay=1] 设置新的一周从星期几开始，星期天用0表示, 星期一用1表示, 以此类推.
             * @namespace options
             */
            firstDay: 1,
            /**
             * @property {Date|String} [maxDate=null] 设置可以选择的最大日期
             * @namespace options
             */
            maxDate: null,
            /**
             * @property {Date|String} [minDate=null] 设置可以选择的最小日期
             * @namespace options
             */
            minDate: null,
            /**
             * @property {Boolean} [swipeable=false] 设置是否可以通过左右滑动手势来切换日历
             * @namespace options
             */
            swipeable: false,
            /**
             * @property {Boolean} [monthChangeable=false] 设置是否让月份可选择
             * @namespace options
             */
            monthChangeable: false,
            /**
             * @property {Boolean} [yearChangeable=false] 设置是否让年份可选择
             * @namespace options
             */
            yearChangeable: false
        },

        _init: function() {
            this.on('ready', function(){
                var opts = this._options,
                    el = this._container || this.$el,
                    eventHandler = $.proxy(this._eventHandler, this);

                this.minDate(opts.minDate)
                    .maxDate(opts.maxDate)
                    .date(opts.date || new Date())
                    .refresh();

                el.addClass('ui-calendar')
                    .on('click', eventHandler)
                    .highlight();

                opts.swipeable && el.on('swipeLeft swipeRight', eventHandler);
            });
        },

        _create: function() {
            var $el = this.$el;

            //如果没有指定el, 则创建一个空div
            if( !$el ) {
                $el = this.$el = $('<div>');
            }
            $el.appendTo(this._options['container'] || ($el.parent().length ? '' : document.body));
        },

        _eventHandler: function(e) {
            var opts = this._options,
                root = (this._container || this.$el).get(0),
                match,
                target,
                cell,
                date,
                elems;

            switch (e.type) {
                case 'swipeLeft':
                case 'swipeRight':
                    return this.switchMonthTo((e.type == 'swipeRight' ? '-' : '+') + '1M');

                case 'change':
                    elems = $('.ui-calendar-header .ui-calendar-year, ' +
                        '.ui-calendar-header .ui-calendar-month', this._el);

                    return this.switchMonthTo(getVal(elems.eq(1)), getVal(elems.eq(0)));

                default:
                    //click

                    target = e.target;

                    if ((match = $(target).closest('.ui-calendar-calendar tbody a', root)) && match.length) {

                        e.preventDefault();
                        cell = match.parent();

                        this._option('selectedDate',
                        date = new Date(cell.attr('data-year'), cell.attr('data-month'), match.text()));

                        this.trigger('select', date, $.calendar.formatDate(date), this);
                        this.refresh();
                    } else if ((match = $(target).closest('.ui-calendar-prev, .ui-calendar-next', root)) && match.length) {

                        e.preventDefault();
                        this.switchMonthTo((match.is('.ui-calendar-prev') ? '-' : '+') + '1M');
                    }
            }
        },

        /**
         * @ignore
         * @name option
         * @grammar option(key[, value]) ⇒ instance
         * @desc 设置或获取Option，如果想要Option生效需要调用[Refresh](#calendar_refresh)方法。
         */
        _option: function(key, val) {
            var opts = this._options,
                date, minDate, maxDate;

            //如果是setter
            if (val !== undefined) {

                switch (key) {
                    case 'minDate':
                    case 'maxDate':
                        opts[key] = val ? $.calendar.parseDate(val) : null;
                        break;

                    case 'selectedDate':
                        minDate = opts.minDate;
                        maxDate = opts.maxDate;
                        val = $.calendar.parseDate(val);
                        val = minDate && minDate > val ? minDate : maxDate && maxDate < val ? maxDate : val;
                        opts._selectedYear = opts._drawYear = val.getFullYear();
                        opts._selectedMonth = opts._drawMonth = val.getMonth();
                        opts._selectedDay = val.getDate();
                        break;

                    case 'date':
                        this._option('selectedDate', val);
                        opts[key] = this._option('selectedDate');
                        break;

                    default:
                        opts[key] = val;
                }

                //标记为true, 则表示下次refresh的时候要重绘所有内容。
                opts._invalid = true;

                //如果是setter则要返回instance
                return this;
            }

            return key == 'selectedDate' ? new Date(opts._selectedYear, opts._selectedMonth, opts._selectedDay) : opts[key];
        },

        /**
         * 切换到今天所在月份
         * @method switchToToday
         */
        switchToToday: function() {
            var today = new Date();
            return this.switchMonthTo(today.getMonth(), today.getFullYear());
        },


        /**
         * 切换月份
         * @method switchMonthTo
         * @param {String|Number} month 目标月份，值可以为+1M, +4M, -5Y, +1Y等等。+1M表示在显示的月的基础上显示下一个月，+4m表示下4个月，-5Y表示5年前
         * @param {String|Number} year 目标年份
         * @return {self} 返回本身
         */
        switchMonthTo: function(month, year) {
            var opts = this._options,
                minDate = this.minDate(),
                maxDate = this.maxDate(),
                offset,
                period,
                tmpDate;

            if (Object.prototype.toString.call(month) === '[object String]' && offsetRE.test(month)) {
                offset = RegExp.$1 == '-' ? -parseInt(RegExp.$2, 10) : parseInt(RegExp.$2, 10);
                period = RegExp.$3.toLowerCase();
                month = opts._drawMonth + (period == 'm' ? offset : 0);
                year = opts._drawYear + (period == 'y' ? offset : 0);
            } else {
                month = parseInt(month, 10);
                year = parseInt(year, 10);
            }

            //Date有一定的容错能力，如果传入2012年13月，它会变成2013年1月
            tmpDate = new Date(year, month, 1);

            //不能跳到不可选的月份
            tmpDate = minDate && minDate > tmpDate ? minDate : maxDate && maxDate < tmpDate ? maxDate : tmpDate;

            month = tmpDate.getMonth();
            year = tmpDate.getFullYear();

            if (month != opts._drawMonth || year != opts._drawYear) {
                this.trigger('monthchange', opts._drawMonth = month, opts._drawYear = year, this);

                opts._invalid = true;
                this.refresh();
            }

            return this;
        },

        /**
         * 刷新日历，当修改option后需要调用此方法
         * @method refresh
         * @return {self} 返回本身
         */
        refresh: function() {
            var opts = this._options,
                el = this._container || this.$el,
                eventHandler = $.proxy(this._eventHandler, this);

            //如果数据没有变化厕不重绘了
            if (!opts._invalid) {
                return;
            }

            $('.ui-calendar-calendar td:not(.ui-state-disabled), .ui-calendar-header a', el).highlight();
            $('.ui-calendar-header select', el).off('change', eventHandler);
            el.empty().append(this._generateHTML());
            $('.ui-calendar-calendar td:not(.ui-state-disabled), .ui-calendar-header a', el).highlight('ui-state-hover');
            $('.ui-calendar-header select', el).on('change', eventHandler);
            opts._invalid = false;
            return this;
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            var el = this._container || this.$el,
                eventHandler = this._eventHandler;

            $('.ui-calendar-calendar td:not(.ui-state-disabled)', el).highlight();
            $('.ui-calendar-header select', el).off('change', eventHandler);
            el.remove();
            return this.$super('destroy');
        },

        /**
         * 重绘表格
         */
        _generateHTML: function() {
            var opts = this._options,
                drawYear = opts._drawYear,
                drawMonth = opts._drawMonth,
                tempDate = new Date(),
                today = new Date(tempDate.getFullYear(), tempDate.getMonth(),
                tempDate.getDate()),

                minDate = this.minDate(),
                maxDate = this.maxDate(),
                selectedDate = this.selectedDate(),
                html = '',
                i,
                j,
                firstDay,
                day,
                leadDays,
                daysInMonth,
                rows,
                printDate;

            firstDay = (isNaN(firstDay = parseInt(opts.firstDay, 10)) ? 0 : firstDay);

            html += this._renderHead(opts, drawYear, drawMonth, minDate, maxDate) +
                '<table  class="ui-calendar-calendar"><thead><tr>';

            for (i = 0; i < 7; i++) {
                day = (i + firstDay) % 7;

                html += '<th' + ((i + firstDay + 6) % 7 >= 5 ?

                //如果是周末则加上ui-calendar-week-end的class给th
                ' class="ui-calendar-week-end"' : '') + '>' +
                    '<span>' + dayNames[day] + '</span></th>';
            }

            //添加一个间隙，样式需求
            html += '</thead></tr><tbody><tr class="ui-calendar-gap">' +
                '<td colspan="7">&#xa0;</td></tr>';

            daysInMonth = getDaysInMonth(drawYear, drawMonth);
            leadDays = (getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
            rows = Math.ceil((leadDays + daysInMonth) / 7);
            printDate = new Date(drawYear, drawMonth, 1 - leadDays);

            for (i = 0; i < rows; i++) {
                html += '<tr>';

                for (j = 0; j < 7; j++) {
                    html += this._renderDay(j, printDate, firstDay, drawMonth, selectedDate, today, minDate, maxDate);
                    printDate.setDate(printDate.getDate() + 1);
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
            return html;
        },

        _renderHead: function(data, drawYear, drawMonth, minDate, maxDate) {
            var html = '<div class="ui-calendar-header">',

                //上一个月的最后一天
                lpd = new Date(drawYear, drawMonth, -1),

                //下一个月的第一天
                fnd = new Date(drawYear, drawMonth + 1, 1),
                i,
                max;

            html += '<a class="ui-calendar-prev' + (minDate && minDate > lpd ?
                ' ui-state-disable' : '') + '" href="#">&lt;&lt;</a><div class="ui-calendar-title">';

            if (data.yearChangeable) {
                html += '<select class="ui-calendar-year">';

                for (i = Math.max(1970, drawYear - 10), max = i + 20; i < max; i++) {
                    html += '<option value="' + i + '" ' + (i == drawYear ?
                        'selected="selected"' : '') + '>' + i + '年</option>';
                }
                html += '</select>';
            } else {
                html += '<span class="ui-calendar-year" data-value="' + drawYear + '">' + drawYear + '年' + '</span>';
            }

            if (data.monthChangeable) {
                html += '<select class="ui-calendar-month">';

                for (i = 0; i < 12; i++) {
                    html += '<option value="' + i + '" ' + (i == drawMonth ?
                        'selected="selected"' : '') + '>' + monthNames[i] + '</option>';
                }
                html += '</select>';
            } else {
                html += '<span class="ui-calendar-month" data-value="' + drawMonth + '">' + monthNames[drawMonth] + '</span>';
            }

            html += '</div><a class="ui-calendar-next' + (maxDate && maxDate < fnd ?
                ' ui-state-disable' : '') + '" href="#">&gt;&gt;</a></div>';
            return html;
        },

        _renderDay: function(j, printDate, firstDay, drawMonth, selectedDate, today, minDate, maxDate) {

            var otherMonth = (printDate.getMonth() !== drawMonth),
                unSelectable;

            unSelectable = otherMonth || (minDate && printDate < minDate) || (maxDate && printDate > maxDate);

            return "<td class='" + ((j + firstDay + 6) % 7 >= 5 ? "ui-calendar-week-end" : "") + // 标记周末

            (unSelectable ? " ui-calendar-unSelectable ui-state-disabled" : "") + //标记不可点的天

            (otherMonth || unSelectable ? '' : (printDate.getTime() === selectedDate.getTime() ? " ui-calendar-current-day" : "") + //标记当前选择
            (printDate.getTime() === today.getTime() ? " ui-calendar-today" : "") //标记今天
            ) + "'" +

            (unSelectable ? "" : " data-month='" + printDate.getMonth() + "' data-year='" + printDate.getFullYear() + "'") + ">" +

            (otherMonth ? "&#xa0;" : (unSelectable ? "<span class='ui-state-default'>" + printDate.getDate() + "</span>" :
                "<a class='ui-state-default" + (printDate.getTime() === today.getTime() ? " ui-state-highlight" : "") + (printDate.getTime() === selectedDate.getTime() ? " ui-state-active" : "") +
                "' href='#'>" + printDate.getDate() + "</a>")) + "</td>";
        }
    });

    prototype = gmu.Calendar.prototype;

    //添加更直接的option修改接口
    $.each(['maxDate', 'minDate', 'date', 'selectedDate'], function(i, name) {
        prototype[name] = function(val) {
            return this._option(name, val);
        }
    });

    //补充注释

    /**
     * 设置或获取maxDate，如果想要Option生效需要调用[Refresh](#calendar_refresh)方法
     * @method maxDate
     * @param {String|Date} value 最大日期的值
     * @return {self} 返回本身
     */

    /**
     * 设置或获取minDate，如果想要Option生效需要调用[Refresh](#calendar_refresh)方法
     * @method minDate
     * @param {String|Date} value 最小日期的值
     * @return {self} 返回本身
     */

    /**
     * 设置或获取当前日期，如果想要Option生效需要调用[Refresh](#calendar_refresh)方法
     * @method date
     * @param {String|Date} value 当前日期
     * @return {self} 返回本身
     */

    /**
     * 设置或获取当前选中的日期，如果想要Option生效需要调用[Refresh](#calendar_refresh)方法
     * @method selectedDate
     * @param {String|Date} value 当前日期
     * @return {self} 返回本身
     */


    //@todo 支持各种格式
    //开放接口，如果现有格式不能满足需求，外部可以通过覆写一下两个方法
    $.calendar = {

        /**
         * 解析字符串成日期格式对象。目前支持yyyy-mm-dd格式和yyyy/mm/dd格式。
         * @name $.calendar.parseDate
         * @grammar $.calendar.parseDate( str ) ⇒ Date
         */
        parseDate: function(obj) {
            var dateRE = /^(\d{4})(?:\-|\/)(\d{1,2})(?:\-|\/)(\d{1,2})$/;
            return Object.prototype.toString.call(obj) === '[object Date]' ? obj : dateRE.test(obj) ? new Date(parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10) - 1, parseInt(RegExp.$3, 10)) : null;
        },

        /**
         * 格式化日期对象为字符串, 输出格式为yyy-mm-dd
         * @name $.calendar.formatDate
         * @grammar $.calendar.formatDate( date ) ⇒ String
         */
        formatDate: function(date) {
            return date.getFullYear() + '-' + formatNumber(date.getMonth() + 1, 2) + '-' + formatNumber(date.getDate(), 2);
        }
    }

    /**
     * @event ready
     * @param {Event} e gmu.Event对象
     * @description 当组件初始化完后触发。
     */

    /**
     * @event select
     * @param {Event} e gmu.Event对象
     * @param {Date} date 当前选中的日期
     * @param {String} dateStr 当前选中日期的格式化字符串
     * @param {Instance} instance 当前日历的实例
     * @description 选中日期的时候触发
     */
    
    /**
     * @event monthchange
     * @param {Event} e gmu.Event对象
     * @param {Date} month 当前月份
     * @param {String} year 当前年份
     * @param {Instance} instance 当前日历的实例
     * @description 前现实月份发生变化时触发
     */
    
    /**
     * @event destroy
     * @param {Event} e gmu.Event对象
     * @description 组件在销毁的时候触发
     */
})( gmu, gmu.$ );

/**
 * @file Calendar Picker插件
 * @desc 默认的Calendar组件，只是在指定容器上生成日历功能，与表单元素的交互功能在此插件中体现.
 * selector将会被认为是可赋值对象，当确认按钮点击后，所选的日期会赋值给selector。
 * @module GMU
 * @import widget/calendar/calendar.js, extend/event.ortchange.js
 */
(function( gmu, $ ) {
    function SlideUp(div, cb) {
        var
            //用来记录div的原始位置的
            holder = $('<span class="ui-holder"></span>'),

            //dom
            root = $('<div class="ui-slideup-wrap">' +
                '   <div class="ui-slideup">' +
                '       <div class="header">' +
                '           <span class="ok-btn">确认</span>' +
                '           <span class="no-btn">取消</span>' +
                '       </div>' +
                '       <div class="frame"></div>' +
                '   </div>' +
                '</div>'),
            sDiv = $('.ui-slideup', root),
            frame = $('.frame', sDiv),

            //对外只公开refresh和close方法
            obj = {

                /**
                 * 刷新日历显示，当屏幕旋转的时候时候需要外部调用
                 */
                refresh: function( callback ){
                    root.css({
                        top: window.pageYOffset + 'px',
                        height: window.innerHeight + 'px'
                    });

                    sDiv.animate({
                        translateY: '-' + sDiv.height() + 'px',
                        translateZ: '0'
                    }, 400, 'ease-out', function () {
                        callback && callback.call(obj);
                    });

                },

                /**
                 * 关闭日历
                 */
                close: function( callback ){
                    var count = SlideUp.count = SlideUp.count - 1;

                    root.off('click.slideup' + id);

                    sDiv
                        .animate({
                            translateY: '0',
                            translateZ: '0'
                        }, 200, 'ease-out', function () {
                            callback && callback();

                            //还原div的位置
                            holder.replaceWith(div);

                            //销毁
                            root.remove();
                            count === 0 && $(document).off('touchmove.slideup');
                        })
                        .find('.ok-btn, .no-btn')
                        .highlight();

                    return obj;
                }
            },

            //为了解绑事件用的
            id = SlideUp.id = ( SlideUp.id >>> 0 ) + 1,

            //记录当前弹出了多少次
            count;

        frame.append( div.replaceWith( holder ) );

        count = SlideUp.count = ( SlideUp.count >>> 0 ) + 1;

        //弹出多个时，只会注册一次
        count === 1 && $(document).on('touchmove.slideup', function (e) {

            //禁用系统滚动
            e.preventDefault();
        });

        root
            .on('click.slideup' + id, '.ok-btn, .no-btn', function () {
                cb.call(obj, $(this).is('.ok-btn')) !== false && obj.close();
            })
            .appendTo(document.body)
            .find('.ok-btn, .no-btn')
            .highlight('ui-state-hover');

        obj.refresh();

        return obj;
    }

    /**
     * Calendar Picker插件
     *
     * 默认的Calendar组件，只是在指定容器上生成日历功能，与表单元素的交互功能在此插件中体现.
     * selector将会被认为是可赋值对象，当确认按钮点击后，所选的日期会赋值给selector。
     *
     * @class picker
     * @namespace Calendar
     * @pluginfor Calendar
     */
    gmu.Calendar.register( 'picker', {

        _create: function () {
            var el = this.$el;

            if( !el ) {
                throw new Error("请指定日期选择器的赋值对象");
            }
        },

        _init: function(){
            var el = this.$el,
                opts = this._options;

            this._container = $('<div></div>');

            //如果有初始值，则把此值赋值给calendar
            opts.date || (opts.date = el[el.is('select, input')?'val':'text']());

            $(window).on('ortchange', $.proxy(this._eventHandler, this));
            this.on('commit', function(e, date){
                var str = $.calendar.formatDate(date);

                el[el.is('select, input')?'val':'text'](str);
            });

            this.on('destroy', function(){
                //解绑ortchange事件
                $(window).off('ortchange', this._eventHandler);
                this._frame && this._frame.close();
            });
        },

        _eventHandler: function(e){
            if(e.type === 'ortchange') {
                this._frame && this._frame.refresh();
            }else {
                this.origin( e );
            }
        },

        /**
         * 显示组件
         * @method show
         * @grammar show() ⇒ instance
         * @param {Function} [callback] 刷新之后的回调函数
         * @for Calendar
         * @uses Calendar.picker
         */
        show: function(){
            var me = this,
                el;

            if( this._visible ) {
                return this;
            }

            el = this._container;

            this._visible = true;
            this.refresh();
            this._frame = SlideUp(el, function( confirm ){
                var date;
                if( confirm) {
                    date = me._option('selectedDate');
                    me.trigger('commit', date, $.calendar.formatDate(date), me);
                    me._option('date', date);
                } else {
                    me._option('selectedDate', me._option('date'));
                }
                me.hide();
                return false;
            });
            return this.trigger('show', this);
        },

        /**
         * 隐藏组件
         * @method hide
         * @grammar hide() ⇒ instance
         * @param {Function} [callback] 刷新之后的回调函数
         * @for Calendar
         * @uses Calendar.picker
         */
        hide: function(){
            var me = this,
                event;

            if (!this._visible) {
                return this;
            }

            event = new gmu.Event('beforehide');
            this.trigger(event, this);

            //如果外部阻止了此事件，则停止往下执行
            if(event.isDefaultPrevented()){
                return this;
            }

            this._visible = false;

            this._frame.close(function(){
                me.trigger && me.trigger('hide');
            });

            this._frame = null;

            return this;
        }

        /**
         * @event show
         * @param {Event} e gmu.Event对象
         * @param {Calendar} ui widget实例
         * @description 当组件显示后触发
         * @for Calendar
         * @uses Calendar.picker
         */

        /**
         * @event hide
         * @param {Event} e gmu.Event对象
         * @param {Calendar} ui widget实例
         * @description 当组件隐藏后触发
         * @for Calendar
         * @uses Calendar.picker
         */

        /**
         * @event beforehide
         * @param {Event} e gmu.Event对象
         * @param {Calendar} ui widget实例
         * @description 组件隐藏之前触发，可以通过e.preventDefault()来阻止
         * @for Calendar
         * @uses Calendar.picker
         */

        /**
         * @event commit
         * @param {Event} e gmu.Event对象
         * @param {Date} date 选中的日期
         * @param {String} dateStr 选中的日期字符格式
         * @param {Calendar} ui widget实例
         * @description 但确认选择某个日期的时候触发
         * @for Calendar
         * @uses Calendar.picker
         */
    } );

})( gmu, gmu.$ );

//================================dialog widget==================================

/**
 * @file 弹出框组件
 * @import core/widget.js, extend/highlight.js, extend/parseTpl.js, extend/event.ortchange.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    var tpl = {
        close: '<a class="ui-dialog-close" title="关闭"><span class="ui-icon ui-icon-delete"></span></a>',
        mask: '<div class="ui-mask"></div>',
        title: '<div class="ui-dialog-title">'+
                    '<span style="font-size:18px"><%=title%></span>'+
                '</div>',
        wrap: '<div class="ui-dialog">'+
            '<div class="ui-dialog-content"></div>'+
            '<% if(btns){ %>'+
            '<div class="ui-dialog-btns">'+
            '<% for(var i=0, length=btns.length; i<length; i++){var item = btns[i]; %>'+
            '<a class="ui-btn ui-btn-<%=item.index%>" data-key="<%=item.key%>"><%=item.text%></a>'+
            '<% } %>'+
            '</div>'+
            '<% } %>' +
            '</div> '
    };

    /**
     * 弹出框组件
     *
     * @class Dialog
     * @constructor Html部分
     * ```html
     * <div id="dialog1" title="登陆提示">
     *     <p>请使用百度账号登录后, 获得更多个性化特色功能</p>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     *  $('#dialog1').dialog({
     *      autoOpen: false,
     *      closeBtn: false,
     *      buttons: {
     *          '取消': function(){
     *              this.close();
     *          },
     *          '确定': function(){
     *              this.close();
     *              $('#dialog2').dialog('open');
     *          }
     *      }
     *  });
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化对话框的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Dialog:options)
     * @grammar $( el ).dialog( options ) => zepto
     * @grammar new gmu.Dialog( el, options ) => instance
     */
    gmu.define( 'Dialog', {
        options: {
            /**
             * @property {Boolean} [autoOpen=true] 初始化后是否自动弹出
             * @namespace options
             */
            autoOpen: true,
            /**
             * @property {Array} [buttons=null] 弹出框上的按钮
             * @namespace options
             */
            buttons: null,
            /**
             * @property {Boolean} [closeBtn=true] 是否显示关闭按钮
             * @namespace options
             */
            closeBtn: true,
            /**
             * @property {Boolean} [mask=true] 是否有遮罩层
             * @namespace options
             */
            mask: true,
            /**
             * @property {Number} [width=300] 弹出框宽度
             * @namespace options
             */
            width: 300,
            /**
             * @property {Number|String} [height='auto'] 弹出框高度
             * @namespace options
             */
            height: 'auto',
            /**
             * @property {String} [title=null] 弹出框标题
             * @namespace options
             */
            title: null,
            /**
             * @property {String} [content=null] 弹出框内容
             * @namespace options
             */
            content: null,
            /**
             * @property {Boolean} [scrollMove=true] 是否禁用掉scroll，在弹出的时候
             * @namespace options
             */
            scrollMove: true,
            /**
             * @property {Element} [container=null] 弹出框容器
             * @namespace options
             */
            container: null,
            /**
             * @property {Function} [maskClick=null] 在遮罩上点击时触发的事件
             * @namespace options
             */
            maskClick: null,
            position: null //需要dialog.position插件才能用
        },

        /**
         * 获取最外层的节点
         * @method getWrap
         * @return {Element} 最外层的节点
         */
        getWrap: function(){
            return this._options._wrap;
        },

        _init: function(){
            var me = this, opts = me._options, btns,
                i= 0, eventHanlder = $.proxy(me._eventHandler, me), vars = {};

            me.on( 'ready', function() {
                opts._container = $(opts.container || document.body);
                (opts._cIsBody = opts._container.is('body')) || opts._container.addClass('ui-dialog-container');
                vars.btns = btns= [];
                opts.buttons && $.each(opts.buttons, function(key){
                    btns.push({
                        index: ++i,
                        text: key,
                        key: key
                    });
                });
                opts._mask = opts.mask ? $(tpl.mask).appendTo(opts._container) : null;
                opts._wrap = $($.parseTpl(tpl.wrap, vars)).appendTo(opts._container);
                opts._content = $('.ui-dialog-content', opts._wrap);

                opts._title = $(tpl.title);
                opts._close = opts.closeBtn && $(tpl.close).highlight('ui-dialog-close-hover');
                me.$el = me.$el || opts._content;//如果不需要支持render模式，此句要删除

                me.title(opts.title);
                me.content(opts.content);

                btns.length && $('.ui-dialog-btns .ui-btn', opts._wrap).highlight('ui-state-hover');
                opts._wrap.css({
                    width: opts.width,
                    height: opts.height
                });

                //bind events绑定事件
                $(window).on('ortchange', eventHanlder);
                opts._wrap.on('click', eventHanlder);
                opts._mask && opts._mask.on('click', eventHanlder);
                opts.autoOpen && me.open();
            } );
        },

        _create: function(){
            var opts = this._options;

            if( this._options.setup ){
                opts.content = opts.content || this.$el.show();
                opts.title = opts.title || this.$el.attr('title');
            }
        },

        _eventHandler: function(e){
            var me = this, match, wrap, opts = me._options, fn;
            switch(e.type){
                case 'ortchange':
                    this.refresh();
                    break;
                case 'touchmove':
                    opts.scrollMove && e.preventDefault();
                    break;
                case 'click':
                    if(opts._mask && ($.contains(opts._mask[0], e.target) || opts._mask[0] === e.target )){
                        return me.trigger('maskClick');
                    }
                    wrap = opts._wrap.get(0);
                    if( (match = $(e.target).closest('.ui-dialog-close', wrap)) && match.length ){
                        me.close();
                    } else if( (match = $(e.target).closest('.ui-dialog-btns .ui-btn', wrap)) && match.length ) {
                        fn = opts.buttons[match.attr('data-key')];
                        fn && fn.apply(me, arguments);
                    }
            }
        },

        _calculate: function(){
            var me = this, opts = me._options, size, $win, root = document.body,
                ret = {}, isBody = opts._cIsBody, round = Math.round;

            opts.mask && (ret.mask = isBody ? {
                width:  '100%',
                height: Math.max(root.scrollHeight, root.clientHeight)-1//不减1的话uc浏览器再旋转的时候不触发resize.奇葩！
            }:{
                width: '100%',
                height: '100%'
            });

            size = opts._wrap.offset();
            $win = $(window);
            ret.wrap = {
                left: '50%',
                marginLeft: -round(size.width/2) +'px',
                top: isBody?round($win.height() / 2) + window.pageYOffset:'50%',
                marginTop: -round(size.height/2) +'px'
            }
            return ret;
        },

        /**
         * 用来更新弹出框位置和mask大小。如父容器大小发生变化时，可能弹出框位置不对，可以外部调用refresh来修正。
         * @method refresh
         * @return {self} 返回本身
         */
        refresh: function(){
            var me = this, opts = me._options, ret, action;
            if(opts._isOpen) {

                action = function(){
                    ret = me._calculate();
                    ret.mask && opts._mask.css(ret.mask);
                    opts._wrap.css(ret.wrap);
                }

                //如果有键盘在，需要多加延时
                if( $.os.ios &&
                    document.activeElement &&
                    /input|textarea|select/i.test(document.activeElement.tagName)){

                    document.body.scrollLeft = 0;
                    $.later(action, 200);//do it later in 200ms.

                } else {
                    action();//do it now
                }
            }
            return me;
        },

        /**
         * 弹出弹出框，如果设置了位置，内部会数值转给[position](widget/dialog.js#position)来处理。
         * @method open
         * @param {String|Number} [x] X轴位置
         * @param {String|Number} [y] Y轴位置
         * @return {self} 返回本身
         */
        open: function(x, y){
            var opts = this._options;
            opts._isOpen = true;

            opts._wrap.css('display', 'block');
            opts._mask && opts._mask.css('display', 'block');

            x !== undefined && this.position ? this.position(x, y) : this.refresh();

            $(document).on('touchmove', $.proxy(this._eventHandler, this));
            return this.trigger('open');
        },

        /**
         * 关闭弹出框
         * @method close
         * @return {self} 返回本身
         */
        close: function(){
            var eventData, opts = this._options;

            eventData = $.Event('beforeClose');
            this.trigger(eventData);
            if(eventData.defaultPrevented)return this;

            opts._isOpen = false;
            opts._wrap.css('display', 'none');
            opts._mask && opts._mask.css('display', 'none');

            $(document).off('touchmove', this._eventHandler);
            return this.trigger('close');
        },

        /**
         * 设置或者获取弹出框标题。value接受带html标签字符串
         * @method title
         * @param {String} [value] 弹出框标题
         * @return {self} 返回本身
         */
        title: function(value) {
            var opts = this._options, setter = value !== undefined;
            if(setter){
                value = (opts.title = value) ? '<span>'+value+'</span>' : value;
                opts._title.html(value)[value?'prependTo':'remove'](opts._wrap);
                opts._close && opts._close.prependTo(opts.title? opts._title : opts._wrap);
            }
            return setter ? this : opts.title;
        },

        /**
         * 设置或者获取弹出框内容。value接受带html标签字符串和zepto对象。
         * @method content
         * @param {String|Element} [val] 弹出框内容
         * @return {self} 返回本身
         */
        content: function(val) {
            var opts = this._options, setter = val!==undefined;
            setter && opts._content.empty().append(opts.content = val);
            return setter ? this: opts.content;
        },

        /**
         * @desc 销毁组件。
         * @name destroy
         */
        destroy: function(){
            var opts = this._options, _eventHander = this._eventHandler;
            $(window).off('ortchange', _eventHander);
            $(document).off('touchmove', _eventHander);
            opts._wrap.off('click', _eventHander).remove();
            opts._mask && opts._mask.off('click', _eventHander).remove();
            opts._close && opts._close.highlight();
            return this.$super('destroy');
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event open
         * @param {Event} e gmu.Event对象
         * @description 当弹出框弹出后触发
         */

        /**
         * @event beforeClose
         * @param {Event} e gmu.Event对象
         * @description 在弹出框关闭之前触发，可以通过e.preventDefault()来阻止
         */

        /**
         * @event close
         * @param {Event} e gmu.Event对象
         * @description 在弹出框关闭之后触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    });
})( gmu, gmu.$ );

/**
 * @file Dialog － 父容器插件
 * @module GMU
 * @import widget/dialog/dialog.js, extend/position.js
 */
(function( gmu, $, undefined ) {
    /**
     * @name dialog.position
     * @desc 用zepto.position来定位dialog
     */
    /**
     * 用zepto.position来定位dialog
     *
     * @class position
     * @namespace Dialog
     * @pluginfor Dialog
     */
    gmu.Dialog.register( 'position', {

        _init: function(){
            var opts = this._options;

            opts.position = opts.position || {of: opts.container || window, at: 'center', my: 'center'};
        },

        /**
         * 用来设置弹出框的位置，如果不另外设置，组件默认为上下左右居中对齐。位置参数接受，数值，百分比，带单位的数值，或者'center'。
         * 如: 100， 100px, 100em, 10%, center;暂时不支持 left, right, top, bottom.
         * @method position
         * @param {String|Number} [x] X轴位置
         * @param {String|Number} [y] Y轴位置
         * @for Dialog
         * @uses Dialog.position
         * @return {self} 返回本身。
         */
        position: function(x, y){
            var opts = this._options;
            if(!$.isPlainObject(x)){//兼容老格式！
                opts.position.at = 'left'+(x>0?'+'+x: x)+' top'+(y>0?'+'+y: y);
            } else $.extend(opts.position, x);
            return this.refresh();
        },

        _calculate:function () {
            var me = this,
                opts = me._options,
                position = opts.position,
                ret = me.origin();

            opts._wrap.position($.extend(position, {
                using: function(position){
                    ret.wrap = position;
                }
            }));

            return ret;
        }
    } );
})( gmu, gmu.$);

//==================================popover  widget=============================
//包含arrow.js 
/**
 * @file 弹出层组件, 基础版本。
 * @import core/widget.js
 * @module GMU
 */
(function( gmu, $, undefined ) {

    /**
     * 弹出层组件，具有点击按钮在周围弹出层的交互效果。至于弹出层内容，可以通过`content`直接设置内容，
     * 也可以通过`container`设置容器节点。按钮和弹出层之间没有位置依赖。
     *
     * 基础版本只有简单的点击显示，再点击隐藏功能。像用更多的功能请参看[插件介绍](#GMU:Popover:plugins)部分.
     *
     * @class Popover
     * @constructor Html部分
     * ```html
     * <a id="btn">按钮<a/>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#btn').popover({
     *     content: 'Hello world'
     * });
     * ```
     * @param {dom | zepto | selector} [el] 按钮节点
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Popover:options)
     * @grammar $( el ).popover( options ) => zepto
     * @grammar new gmu.Popover( el, options ) => instance
     */
    gmu.define( 'Popover', {

        // 默认配置项。
        options: {

            /**
             * @property {Zepto | Selector} [container] 指定容器，如果不传入，组件将在el的后面自动创建一个。
             * @namespace options
             */
            container: null,

            /**
             * @property {String | Zepto | Selector } [content] 弹出框的内容。
             * @namespace options
             */
            content: null,

            /**
             * @property {String} [event="click"] 交互事件名, 可能你会设置成tap。
             * @namespace options
             */
            event: 'click'
        },

        template: {
            frame: '<div>'
        },

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

         // 负责dom的创建。
        _create: function() {
            var me = this,
                opts = me._options,
                $el = opts.target && $( opts.target ) || me.getEl(),
                $root = opts.container && $( opts.container );

            // 没传 或者 就算传入了选择器，但是没有找到节点，还是得创建一个。
            $root && $root.length || ($root = $( me.tpl2html( 'frame' ) )
                    .addClass( 'ui-mark-temp' ));
            me.$root = $root;

            // 如果传入了content, 则作为内容插入到container中
            opts.content && me.setContent( opts.content );
            me.trigger( 'done.dom', $root.addClass( 'ui-' + me.widgetName ),
                    opts );

            // 如果节点是动态创建的，则不在文档树中，就把节点插入到$el后面。
            $root.parent().length || $el.after( $root );

            me.target( $el );
        },

        // 删除标记为组件临时的dom
        _checkTemp: function( $el ) {
            $el.is( '.ui-mark-temp' ) && $el.off( this.eventNs ) &&
                    $el.remove();
        },

        /**
         * @event beforeshow
         * @param {Event} e gmu.Event对象
         * @description 但弹出层打算显示时触发，可以通过`e.preventDefault()`来阻止。
         */


        /**
         * @event show
         * @param {Event} e gmu.Event对象
         * @description 当弹出层显示后触发。
         */


        /**
         * 显示弹出层。
         * @method show
         * @chainable
         * @return {self} 返回本身。
         */
        show: function() {
            var me = this,
                evt = gmu.Event( 'beforeshow' );

            me.trigger( evt );

            // 如果外部阻止了关闭，则什么也不做。
            if ( evt.isDefaultPrevented() ) {
                return;
            }

            me.trigger( 'placement', me.$root.addClass( 'ui-in' ), me.$target );
            me._visible = true;
            return me.trigger( 'show' );
        },

        /**
         * @event beforehide
         * @param {Event} e gmu.Event对象
         * @description 但弹出层打算隐藏时触发，可以通过`e.preventDefault()`来阻止。
         */


        /**
         * @event hide
         * @param {Event} e gmu.Event对象
         * @description 当弹出层隐藏后触发。
         */

        /**
         * 隐藏弹出层。
         * @method hide
         * @chainable
         * @return {self} 返回本身。
         */
        hide: function() {
            var me = this,
                evt = new gmu.Event( 'beforehide' );

            me.trigger( evt );

            // 如果外部阻止了关闭，则什么也不做。
            if ( evt.isDefaultPrevented() ) {
                return;
            }

            me.$root.removeClass( 'ui-in' );
            me._visible = false;
            return me.trigger( 'hide' );
        },

        /**
         * 切换弹出层的显示和隐藏。
         * @method toggle
         * @chainable
         * @return {self} 返回本身。
         */
        toggle: function() {
            var me = this;
            return me[ me._visible ? 'hide' : 'show' ].apply( me, arguments );
        },

        /**
         * 设置或者获取当前`按钮`(被点击的对象)。
         * @method target
         * @param {dom | selector | zepto} [el] target新值。
         * @chainable
         * @return {self} 当传入了el时，此方法为setter, 返回值为self.
         * @return {dom} 当没有传入el时，为getter, 返回当前target值。
         */
        target: function( el ) {

            // getter
            if ( el === undefined ) {
                return this.$target;
            }

            // setter
            var me = this,
                $el = $( el ),
                orig = me.$target,
                click = me._options.event + me.eventNs;

            orig && orig.off( click );

            // 绑定事件
            me.$target = $el.on( click, function( e ) {
                e.preventDefault();
                me.toggle();
            } );

            return me;
        },

        /**
         * 设置当前容器内容。
         * @method setContent
         * @param {dom | selector | zepto} [value] 容器内容
         * @chainable
         * @return {self} 组件本身。
         */
        setContent: function( val ) {
            var container = this.$root;
            container.empty().append( val );
            return this;
        },

        /**
         * 销毁组件，包括事件销毁和删除自动创建的dom.
         * @method destroy
         * @chainable
         * @return {self} 组件本身。
         */
        destroy: function() {
            var me = this;

            me.$target.off( me.eventNs );
            me._checkTemp( me.$root );
            return me.$super( 'destroy' );
        }
    } );
})( gmu, gmu.$ );


/**
 * @file 是否现实剪头
 * @import widget/popover/popover.js
 */
(function( gmu ) {
    var Popover = gmu.Popover;

    Popover.template.arrow = '<span class="ui-arrow"></span>';

    /**
     * @property {Boolean} [arrow=true] 是否显示剪头
     * @namespace options
     * @for Popover
     * @uses Popover.arrow
     */
    Popover.options.arrow = true;    // 默认开启arrow

    /**
     * 扩展Popover显示剪头功能。当此文件引入后，Popover实例将自动开启显示剪头。
     * 剪头的位置会根据不同的placement显示在不同的位置。
     * @class arrow
     * @namespace Popover
     * @pluginfor Popover
     */
    Popover.option( 'arrow', true, function() {
        var me = this,
            opts = me._options;

        // 在没有传入offset的时候，默认有arrow就会多10px偏移
        opts.offset = opts.offset || function( coord, placement ) {
            placement = placement.split( '_' )[ 0 ];
            return {
                left: (placement === 'left' ? -1 :
                        placement === 'right' ? 1 : 0) * 15,
                top: (placement === 'top' ? -1 :
                        placement === 'bottom' ? 1 : 0) * 15
            };
        };

        me.on( 'done.dom', function( e, $root ) {
            $root.append( me.tpl2html( 'arrow' ) ).addClass( 'ui-pos-default' );
        } );

        me.on( 'after.placement', function( e, coord, info ) {
            var root = this.$root[ 0 ],
                cls = root.className,
                placement = info.placement,
                align = info.align || '';

            root.className = cls.replace( /(?:\s|^)ui-pos-[^\s$]+/g, '' ) +
                ' ui-pos-' + placement + (align ? '-' + align : '');
        } );
    } );
})( gmu );



/**
 * @file 简单版定位
 * @import widget/popover/popover.js, extend/offset.js
 */
(function( gmu, $ ) {

    /**
     * @property {String} [placement="bottom"] 设置定位位置。
     * @namespace options
     * @uses Popover.placement
     * @for Popover
     */

    /**
     * @property {Object|Function} [offset=null] 设置偏移量。
     * @namespace options
     * @for Popover
     * @uses Popover.placement
     */
    $.extend( gmu.Popover.options, {
        placement: 'bottom',    // 默认让其在下方显示
        offset: null
    } );

    /**
     * 支持弹出层相对于按钮上下左右定位。
     * @class placement
     * @namespace Popover
     * @pluginfor Popover
     */
    gmu.Popover.option( 'placement', function( val ) {
        return ~[ 'top', 'bottom', 'left', 'right' ].indexOf( val );
    }, function() {

        var me = this,

            // 第一个值：相对于目标位置的水平位置
            // 第二个值：相对于目标位置的垂直位置
            // 第三个值：中心点的水平位置
            // 第四个值：中心点的垂直位置
            config = {
                'top': 'center top center bottom',
                'right': 'right center left center',
                'bottom': 'center bottom center top',
                'left': 'left center right center'
            },
            presets = {},    // 支持的定位方式。

            info;

        // 根据配置项生成方法。
        $.each( config, function( preset, args ) {
            args = args.split( /\s/g );
            args.unshift( preset );
            presets[ preset ] = function() {
                return placement.apply( null, args );
            };
        } );

        function getPos( pos, len ) {
            return pos === 'right' || pos === 'bottom' ? len :
                        pos === 'center' ? len / 2 : 0;
        }

        // 暂时用简单的方式实现，以后考虑采用position.js
        function placement( preset, atH, atV, myH, myV ) {
            var of = info.of,
                coord = info.coord,
                offset = info.offset,
                top = of.top,
                left = of.left;

            left += getPos( atH, of.width ) - getPos( myH, coord.width );
            top += getPos( atV, of.height ) - getPos( myV, coord.height );

            // offset可以是fn
            offset = typeof offset === 'function' ? offset.call( null, {
                left: left,
                top: top
            }, preset ) : offset || {};

            return {
                left: left + (offset.left || 0),
                top: top + (offset.top || 0)
            };
        }

        // 此事件在
        this.on( 'placement', function( e, $el, $of ) {
            var me = this,
                opts = me._options,
                placement = opts.placement,
                coord;

            info = {
                coord: $el.offset(),
                of: $of.offset(),
                placement: placement,
                $el: $el,
                $of: $of,
                offset: opts.offset
            };

            // 设置初始值
            coord = presets[ placement ]();

            // 提供机会在设置之前修改位置
            me.trigger( 'before.placement', coord, info, presets );
            info.preset && (info.placement = info.preset);
            $el.offset( coord );

            // 提供给arrow位置定位用
            me.trigger( 'after.placement', coord, info );
        } );

        // 当屏幕旋转的时候需要需要重新计算。
        $( window ).on( 'ortchange', function() {
            me._visible && me.trigger( 'placement', me.$target, me.$root );
        } );
    } );
})( gmu, gmu.$ );
//=================================dropmenu widget ===============================
/**
 * @file 附近弹出组件
 * @import core/widget.js, widget/popover/popover.js, extend/highlight.js
 * @module GMU
 */
(function( gmu, $ ) {

    /**
     * 附近弹出组件
     *
     * @class Dropmenu
     * @constructor Html部分
     * ```html
     * <a id="btn1" class="btn">Dropmenu</a>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#btn1').dropmenu({
     *  content: [
     *      
     *      'Action',
     *  
     *      'Another Action',
     *  
     *      'Someone else here',
     *  
     *      'divider',
     *  
     *      {
     *          text: 'Open Baidu',
     *          icon: 'grid',
     *          href: 'http://www.baidu.com'
     *      },
     *  ]
     * })
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化组件的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Dropmenu:options)
     * @grammar $( el ).dropmenu( options ) => zepto
     * @grammar new gmu.Dropmenu( el, options ) => instance
     */
    gmu.define( 'Dropmenu', {
        options: {

            // 注意: 以前是叫items, 为了与其他组件统一，所以改名叫content
            /**
             * @property {Array} [content=null] 弹出的内容，每条记录为一个Object，属性有 {text:'', icon: '', href:'' }
             * @namespace options
             */
            content: null
        },

        template: {

            item: '<li><a <% if ( href ) { %>href="<%= href %>"<% } %>>' +
                    '<% if ( icon ) { %><span class="ui-icon ui-icon-' +
                    '<%= icon %>"></span><% } %><%= text %></a></li>',

            divider: '<li class="divider"></li>',

            wrap: '<ul>'
        },

        _init: function() {
            var me = this;

            // 存储ul
            me.on( 'done.dom', function( e, $root ) {
                me.$list = $root.find( 'ul' ).first()
                        .addClass( 'ui-dropmenu-items' )
                        .highlight( 'ui-state-hover',
                                '.ui-dropmenu-items>li:not(.divider)' );
            } );
        },

        _create: function() {
            var me = this,
                opts = me._options,
                content = '';

            // 根据opts.content创建ul>li
            if ( $.type( opts.content ) === 'array' ) {
                
                opts.content.forEach(function( item ) {
                    
                    item = $.extend( {
                        href: '',
                        icon: '',
                        text: ''
                    }, typeof item === 'string' ? {
                        text: item
                    } : item );

                    content += me.tpl2html( item.text === 'divider' ?
                            'divider' : 'item', item );
                });
                opts.content = $( me.tpl2html( 'wrap' ) ).append( content );
            }

            me.$super( '_create' );
            me.$list.on( 'click' + me.eventNs, '.ui-dropmenu-items>li:not(' +
                    '.ui-state-disable):not(.divider)', function( e ) {

                var evt = gmu.Event( 'itemclick', e );
                me.trigger( evt, this );

                if ( evt.isDefaultPrevented() ) {
                    return;
                }
                
                me.hide();
            } );
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event itemclick
         * @param {Event} e gmu.Event对象
         * @param {Element} item 当前点击的条目
         * @description 某个条目被点击时触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    }, gmu.Popover );

})( gmu, gmu.$ );




/**
 * @file Dropmenu 简单版定位
 * @module GMU
 * @import widget/dropmenu/dropmenu.js, extend/offset.js
 */
(function( gmu, $ ) {

    // 设置默认Options
    $.extend( gmu.Dropmenu.options, {
        /**
         * @property {String} [placement='bottom'] 默认让其在下方显示
         * @namespace options
         * @for Dropmenu
         * @uses Dropmenu.placement
         */
        placement: 'bottom',

        /**
         * @property {String} [align='center'] 默认居中对齐
         * @namespace options
         * @for Dropmenu
         * @uses Dropmenu.placement
         */
        align: 'center',

        /**
         * @property {Object} [offset=null] 偏移量
         * @namespace options
         * @for Dropmenu
         * @uses Dropmenu.placement
         */
        offset: null
    } );

    /**
     * Dropmenu 简单版定位
     *
     * @class placement
     * @namespace Dropmenu
     * @pluginfor Dropmenu
     */
    gmu.Dropmenu.option( 'placement', function( val ) {
        return ~[ 'top', 'bottom' ].indexOf( val );
    }, function() {
        var config = {
                'top_center': 'center top center bottom',
                'top_left': 'left top left bottom',
                'top_right': 'right top right bottom',
                'bottom_center': 'center bottom center top',
                'bottom_right': 'right bottom right top',
                'bottom_left': 'left bottom left top'
            },
            presets = {},    // 支持的定位方式。

            info;

        $.each( config, function( preset, args ) {
            args = args.split( /\s/g );
            args.unshift( preset );
            presets[ preset ] = function() {
                return placement.apply( null, args );
            };
        } );

        function getPos( pos, len ) {
            return pos === 'right' || pos === 'bottom' ? len :
                        pos === 'center' ? len / 2 : 0;
        }

        // 暂时用简单的方式实现，以后考虑采用position.js
        function placement( preset, atH, atV, myH, myV ) {
            var of = info.of,
                coord = info.coord,
                offset = info.offset,
                top = of.top,
                left = of.left;

            left += getPos( atH, of.width ) - getPos( myH, coord.width );
            top += getPos( atV, of.height ) - getPos( myV, coord.height );

            // offset可以是fn
            offset = typeof offset === 'function' ? offset.call( null, {
                left: left,
                top: top
            }, preset ) : offset || {};

            return {
                left: left + (offset.left || 0),
                top: top + (offset.top || 0)
            };
        }

        this.on( 'placement', function( e, $el, $of ) {
            var me = this,
                opts = me._options,
                placement = opts.placement,
                align = opts.align,
                coord;

            info = {
                coord: $el.offset(),
                of: $of.offset(),
                placement: placement,
                align: align,
                $el: $el,
                $of: $of,
                offset: opts.offset
            };

            // 设置初始值
            coord = presets[ placement + '_' + align ]();

            // 提供机会在设置之前修改位置
            me.trigger( 'before.placement', coord, info, presets );
            
            if ( /^(\w+)_(\w+)$/.test( info.preset ) ) {
                info.placement = RegExp.$1;
                info.align = RegExp.$2;
            }

            $el.offset( coord );

            // 提供给arrow位置定位用
            me.trigger( 'after.placement', coord, info );
        } );
    } );
})( gmu, gmu.$ );

//=========================gotop widget================

/**
 * @file 返回顶部组件
 * @import core/widget.js, extend/fix.js, extend/throttle.js, extend/event.scrollStop.js, extend/event.ortchange.js
 * @module GMU
 */
(function( gmu, $, undefined ) {

    /**
     * 返回顶部组件
     *
     * @class Gotop
     * @constructor Html部分
     * ```html
     * <div id="gotop"></div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#gotop').gotop();
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化组件的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Gotop:options)
     * @grammar $( el ).gotop( options ) => zepto
     * @grammar new gmu.Gotop( el, options ) => instance
     */
    gmu.define( 'Gotop', {
        options: {
            /**
             * @property {selector} [container=document.body] 组件容器
             * @namespace options
             */
            container:          '',
            /**
             * @property {Boolean} [useFix=true] 是否使用固顶效果
             * @namespace options
             */
            useFix:             true,
            /**
             * @property {Boolean} [useHide=true] 是否在touchmove的时候隐藏gotop图标
             * @namespace options
             */
            useHide:            true,
            /**
             * @property {Boolean} [useAnimation=false] 返回顶部时是否使用动画,在使用iScroll时,返回顶部的动作由iScroll实例执行,此参数无效
             * @namespace options
             */
            useAnimation:       false,
            /**
             * @property {Object} [position={bottom:10,right:10}] 使用fix效果时，要用的位置参数
             * @namespace options
             */
            position:           {bottom: 10, right: 10},
            /**
             * @property {Function} [afterScroll=null] 返回顶部后执行的回调函数
             * @namespace options
             */
        	afterScroll:        null
        },

        _init: function() {
            var me = this,
                $el,
                _opts = me._options,
                _eventHandler;

            if($.os.version && $.os.version.substr(0, 3) >= 7.0) {
                _opts.position.bottom = 40;
            }

            me.on( 'ready', function(){
                $el = me.$el;
                _eventHandler = $.proxy(me._eventHandler, me);

                _opts['useHide'] && $(document).on('touchmove', _eventHandler);
                $(window).on('touchend touchcancel scrollStop', _eventHandler);
                $(window).on('scroll ortchange', _eventHandler);
                $el.on('click', _eventHandler);
                me.on('destroy', function() {
                    $(window).off('touchend touchcancel scrollStop', _eventHandler);
                    $(document).off('touchmove', _eventHandler);
                    $(window).off('scroll ortchange', _eventHandler);
                });
                _opts['useFix'] && $el.fix(_opts['position']);
                _opts['root'] = $el[0];
            } );

            // 不管是哪种模式创建的，destroy时都将元素移除
            me.on( 'destroy', function() {
                me.$el.remove();
            } );
        },

        _create: function() {
            var me = this;

            if( !me.$el ) {
                me.$el = $('<div></div>');
            }
            me.$el.addClass('ui-gotop').append('<div></div>').appendTo(me._options['container'] || (me.$el.parent().length ? '' : document.body));

            return me;
        },

        /**
         * 事件处理中心
         */
        _eventHandler: function(e) {
            var me = this;

            switch (e.type) {
                case 'touchmove':
                    me.hide();
                    break;
                case 'scroll':
                    clearTimeout(me._options['_TID']);
                    break;
                case 'touchend':
                case 'touchcancel':
                    clearTimeout(me._options['_TID']);
                    me._options['_TID'] = setTimeout(function(){
                        me._check.call(me);
                    }, 300);
                    break;
                case 'scrollStop':
                    me._check();
                    break;
                case 'ortchange':
                    me._check.call(me);
                    break;
                case 'click':
                    me._scrollTo();
                    break;
            }
        },

        /**
         * 判断是否显示gotop
         */
        _check: function(position) {
            var me = this;

            (position !== undefined ? position : window.pageYOffset) > document.documentElement.clientHeight ? me.show() : me.hide();
            
            return  me;
        },

		/**
         * 滚动到顶部或指定节点位置
         */
		_scrollTo: function() {
            var me = this,
                from = window.pageYOffset;

            me.hide();
            clearTimeout(me._options['_TID']);
            if (!me._options['useAnimation']) {
                window.scrollTo(0, 1);
                me.trigger('afterScroll');
            } else {
                me._options['moveToTop'] = setInterval(function() {
                    if (from > 1) {
                        window.scrollBy(0, -Math.min(150,from - 1));
                        from -= 150;
                    } else {
                        clearInterval(me._options['moveToTop']);
                        me.trigger('afterScroll');
                    }
                }, 25, true);
            }
            return me;
		},

        /**
         * 显示gotop
         * @method show
         * @return {self} 返回本身
         */
        show: function() {
            this._options.root.style.display = 'block';

            return this;
        },

        /**
         * 隐藏gotop
         * @method hide
         * @chainable
         * @return {self} 返回本身
         */
        hide: function() {
            this._options.root.style.display = 'none';
            
            return this;
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发
         */

        /**
         * @event afterScroll
         * @param {Event} e gmu.Event对象
         * @description 返回顶部后触发的事件
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    });
})( gmu, gmu.$ );

//============================historylist widget==============================

/**
 * @file 历史记录组件
 * @import core/widget.js, extend/touch.js, widget/dialog.js
 * @module GMU
 */

 // TODO 列表区域支持iScroll
(function( gmu, $ ) {
    
    /**
     * 历史记录组件
     *
     * @class Historylist
     * @constructor Html部分
     * ```html
     * <div>
     *     <p><input type="text" class="input-text" id="J_input" /><input type="button" value="取消" class="input-button" /></p>
     *     <div id="J_historyWrap"></div>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * var instance = new gmu.Historylist({
     *     container: $('#J_historyWrap'), // 页面上需要有一个已经存在的容器来存放组件
     *     items: [
     *             {'value': 'global', 'context': '<b>global</b> adj. 全球的；综合的'},
     *             'google',
     *             {'value': 'visual', 'context': '<b>visual</b> adj. 视觉的'},
     *             'alibaba',
     *             'taobao'
     *            ],   // 历史记录的列表
     *     itemTouch: function(e, data) {  // 某条记录被点击后的响应事件
     *         console.log( 'item touched: ' + data.item );   // data.item是某条记录的内容
     *         $('#J_input').val(data.item);
     *     },
     *     itemDelete: function(e, data) { // 某条记录被删除后的响应事件
     *         console.log( 'item delete:' + data.item );   // data.item是某条记录的内容
     *     },
     *     clear: function() {  // 用户确认清空搜索历史后的响应事件
     *         // 在这里删除localstorage里面存的历史数据
     *         console.log( 'clear triggered' );
     *     }
     * });
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化组件的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Historylist:options)
     * @grammar $( el ).historylist( options ) => zepto
     * @grammar new gmu.Historylist( el, options ) => instance
     */
    gmu.define( 'Historylist', {

        options: {

            /**
             * @property {Zepto | Selector | Element} [container=document.body] 容器，默认为 document.body 
             * @namespace options
             */
            container: document.body,

            /**
             * @property {Boolean} [deleteSupport=true] 是否支持滑动删除记录，默认支持
             * @namespace options
             */
            deleteSupport: true,

            /**
             * @property {Array} [items=Array()] 历史记录的数据
             * @namespace options
             */
            items: []
        },

        template: {
            wrap: '<ul class="ui-historylist">',
            item: '<li data-id="<%=id%>"><p class="ui-historylist-itemwrap"><span class="ui-historylist-item"><%=context%></span></p></li>',
            clear: '<p class="ui-historylist-clear">清空搜索历史</p>'
        },

        _init: function() {
            var me = this,
                opts = me._options;

            // js不一定放在页面尾部，所以在init中要重新赋值
            me.$el = opts.container = opts.container || document.body;

            me.items = [];

            me.on( 'ready', function() {
                me._bindUI();
            } );

            me.on( 'itemDelete', function() {
                // 历史记录为空时，隐藏
                if( me.items.length === 0 ) {
                    me.hide();
                }
            } );
        },

        _create: function() {
            var me = this,
                opts = me._options;

            me.$el.hide();
            me.$wrap = $( me.tpl2html( 'wrap' ) ).appendTo( opts.container );

            me.$clear = $( me.tpl2html( 'clear' ) ).appendTo( opts.container );
            !me._options.deleteSupport && me.$clear.hide();

            me.addItems( opts.items );

            me.show();
        },

        _filterItemsById: function( id, callback ) {
            var me = this;

            me.items.forEach( function( _item, index ) {
                if ( _item.id === id ) {
                    callback.call( me, _item, index );

                    return;
                }
            } );
        },

        _bindUI: function() {
            var me = this,
                touch,
                $target,
                itemId,
                startTimestamp,
                endTimestamp,
                wantDelete = false,
                timeout,
                touchstartX,
                currentX,
                touchstartY,
                currentY,
                velocity,
                movedPercentage,
                moved,
                movedDistance;

            me.$clear.on( 'tap' + me.eventNs, function( ev ) {
                // 防止穿透
                setTimeout( function() {
                    gmu.Dialog({
                        closeBtn: false,
                        buttons: {
                            '清空': function(){
                                me.clear();
                                this.destroy();
                            },
                            '取消': function(){
                                this.destroy();
                            }
                        },
                        title: '清空历史',
                        content: '<p>是否清空搜索历史？</p>',
                        open: function(){
                            this._options._wrap.addClass( 'ui-historylist-dialog' );
                        }
                    });
                }, 10 );

                ev.preventDefault();
                ev.stopPropagation();
            } );

            me.$wrap.on( 'tap' + me.eventNs, function(ev) {
                if( me._options.deleteSupport ) {
                    return;
                }

                $target = $( ev.target );

                if( !$target.hasClass( 'ui-historylist-itemwrap' ) && 
                    !($target = $target.parents( '.ui-historylist-itemwrap' )).length ) {
                    $target = null;
                    return;
                }

                itemId = $target.parent().attr( 'data-id' );
                me._filterItemsById( itemId, function( _item ) {
                    me.trigger( 'itemTouch', {'item': _item.value} );
                });

            } );

            me.$wrap.on( 'touchstart' + me.eventNs, function(ev) {

                if( !me._options.deleteSupport ) {
                    return;
                }
                touch = ev.touches[0];
                $target = $( touch.target );
                startTimestamp = ev.timeStamp;
                currentX = touchstartX = parseInt( touch.pageX );
                currentY = touchstartY = parseInt( touch.pageY );
                moved = false;
                wantDelete = false;

                if( !$target.hasClass( 'ui-historylist-itemwrap' ) && 
                    !($target = $target.parents( '.ui-historylist-itemwrap' )).length ) {
                    $target = null;
                    return;
                }

                $target.addClass( 'ui-historylist-ontap' );

                // TODO 用了-webkit-box，就不需要去动态设置width了
                $target.css( 'width',  $target.width() - parseInt( $target.css( 'border-left-width' ) ) - parseInt( $target.css( 'border-right-width' ) ));
            } );

            me.$wrap.on( 'touchmove' + me.eventNs, function(ev) {
                if( !$target ) {
                    return;
                }

                currentX = ev.touches[0].pageX;
                currentY = ev.touches[0].pageY;
                timeout === undefined && (timeout = setTimeout( function() {
                    // 竖向移动的距离大于横向移动距离的一半时，认为用户是企图滚动，而不是删除
                    if( Math.abs( currentY - touchstartY ) > Math.abs (currentX - touchstartX )/2 ){
                        wantDelete = false;
                    }else{
                        wantDelete = true;
                    }

                }, 10 ));
                
                moved = moved || ((currentX - touchstartX >= 3 || currentY - touchstartY >= 3) ? true : false);
                if( !wantDelete ) {
                    setTimeout( function() {
                        $target && $target.removeClass( 'ui-historylist-ontap' );
                    }, 150 );   // 延时长一点，这样不会因为class改变太快，导致闪
                    return;
                }

                movedPercentage = (currentX - touchstartX)/me.$wrap.width();

                // TODO 有些设备上有点卡，需要优化
                $target.addClass( 'ui-historylist-itemmoving' );
                $target.removeClass( 'ui-historylist-ontap' );
                $target.css( '-webkit-transform', 'translate3d(' + (currentX - touchstartX) + 'px, 0, 0)' );
                $target.css( 'opacity', 1 - movedPercentage );
                
                ev.preventDefault();
                ev.stopPropagation();
            } );

            me.$wrap.on( 'touchend' + me.eventNs + ' touchcancel' + me.eventNs, function(ev) {
                if( !$target) {
                    return;
                }

                clearTimeout(timeout);
                timeout = undefined;

                itemId = $target.parent().attr( 'data-id' );
                endTimestamp = ev.timeStamp;
                velocity = (currentX - touchstartX) / (endTimestamp - startTimestamp);
                movedDistance = Math.abs( currentX - touchstartX );

                $target.removeClass( 'ui-historylist-ontap' );
                $target.removeClass( 'ui-historylist-itemmoving' );

                // 当移动的距离小于 1/3 时，速度快则删除，速度慢则还原
                if( ((movedDistance < me.$wrap.width()/3 && Math.abs( velocity ) > 0.1) && wantDelete) ||
                     (movedDistance >= me.$wrap.width()/3 && wantDelete) ) {
                        me.removeItem( itemId, $target );
                } else {
                    $target.css( 'width', 'auto' );
                    $target.css( '-webkit-transform', 'translate3d(0, 0, 0)' );
                    $target.css( 'opacity', 1 );

                    // 移动小于3个像素时，则认为是点击，派发 itemTouch 事件
                    // 如果移出3像素外，再移到3像素内，认为不是点击
                    !moved && movedDistance < 3 && me._filterItemsById( itemId, function( _item ) {
                        me.trigger( 'itemTouch', {'item': _item.value} );
                    });
                }

                $target = null;
            } );
        },

        /**
         * 显示Historylist
         * @method show
         * @return {self} 返回本身。
         */
        show: function() {
            var me = this;

            // 没有历史记录时，不显示
            if( me.items.length === 0 ) {
                return;
            }

            if( me.sync === false ) {
                me.$wrap.html( '' );
                me.addItems( me.syncitems );
                me.sync = true;
            }
            me.$el.show();
            me.isShow = true;

            return me;
        },

        /**
         * 隐藏Historylist
         * @method hide
         * @return {self} 返回本身。
         */
        hide: function() {
            var me = this;

            me.$el.hide();
            me.isShow = false;

            return me;
        },

        _getItemId: function() {
            var me = this;

            me._itemId === undefined ? (me._itemId = 1) : ++me._itemId;

            return '__dd__' + me._itemId;
        },

        _getFormatItem: function( item ) {
            var me = this;

            if( Object.prototype.toString.call( item ) === '[object String]' ) {
                return {
                    'context': item,
                    'value': item,
                    'id': me._getItemId()
                }
            } else {
                return {
                    'context': item.context || item.value,
                    'value': item.value || item.context,
                    'id': me._getItemId()
                }
            }
        },

        /**
         * 添加一条历史记录
         * @method addBtns
         * @param {String|Object} item 历史记录，可以是字符串，也可以是标准格式的对象（包含context和value）
         * @return {self} 返回本身
         */
        addItem: function( item ) {
            var me = this,
                item = me._getFormatItem( item );

            // 检查me.items中是否已存在该项
            me.items.forEach( function( _item, index ) {
                if ( _item.value === item.value ) {
                    me.items.splice( index, 1);
                    $( me.$wrap.children()[index] ).remove();

                    return;
                }
            } );

            me.$wrap.children().length === 0 ? 
                me.$wrap.append( me.tpl2html( 'item', item ) ) : 
                $( me.tpl2html( 'item', item ) ).insertBefore( me.$wrap.children()[0] );
            
            me.items.unshift( item );

            return me;
        },

        /**
         * 添加多条历史记录
         * @method addBtns
         * @param {Array} item 历史记录
         * @return {self} 返回本身
         */
        addItems: function( items ) {
            var me = this;

            items.forEach( function( item ) {
                me.addItem( item );
            } );

            return me;
        },

        /**
         * 更新数据，重新渲染列表
         * @method update
         * @param {Array} item 新的历史记录
         * @return {self} 返回本身
         */
        update: function( items ) {
            var me = this;


            if( me.isShow ) {
                me.$wrap.html( '' );
                me.addItems( items );
                me.sync = true;
            } else {
                me.syncitems = items;
                me.sync = false;
            }

            return me;
        },

        removeItem: function( itemId, $itemTarget ) {
            var me = this,
                distance,
                transform,
                x;

            // 根据当前位移的正负，判断是从右滑出还是从左滑出
            transform = $itemTarget.css( '-webkit-transform');
            x = /translate3d\((.*?),.*/.test(transform) ? RegExp.$1: 0;
            distance = parseInt( x, 10) >= 0 ? $itemTarget.width() : -$itemTarget.width();
            $itemTarget.css( '-webkit-transform', 'translate3d(' + distance + 'px, 0, 0)' );

            // TODO 根据位移改变透明度，感觉不出来，没必要加

            $itemTarget.on( 'transitionEnd' + me.eventNs +  ' webkitTransitionEnd' + me.eventNs, function() {
                $itemTarget.parent().remove();

                me._filterItemsById( itemId, function( _item, index ) {
                    me.items.splice( index, 1);
                    me.trigger( 'itemDelete', {'item': _item.value} );
                });
            } );

        },

        /**
         * 清空历史记录
         * @method clear
         * @return {self} 返回本身
         */
        clear: function() {
            var me = this;

            me.$wrap.html( '' );
            me.items = [];
            me.sync = true;
            me.hide();
            me.trigger( 'clear' );

            return me;
        },

        /**
         * 禁用删除功能
         * @method disableDelete
         * @return {self} 返回本身
         */
        disableDelete: function() {
            var me = this;

            me._options.deleteSupport = false;
            me.$clear.hide();

            return me;
        },

        /**
         * 启用删除功能
         * @method enableDelete
         * @return {self} 返回本身
         */
        enableDelete: function() {
            var me = this;

            me._options.deleteSupport = true;
            me.$clear.show();

            return me;
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            var me = this;

            me.$wrap.off( me.eventNs );
            me.$clear.off( me.eventNs );

            me.$wrap.remove();
            me.$clear.remove();

            return me.$super( 'destroy' );
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event itemTouch
         * @param {Event} e gmu.Event对象
         * @param {String} item 被点击的记录的value
         * @description 点击某条历史记录时触发
         */

        /**
         * @event itemDelete
         * @param {Event} e gmu.Event对象
         * @param {String} item 被删除的记录的value
         * @description 删除某条历史记录时触发
         */

        /**
         * @event clear
         * @param {Event} e gmu.Event对象
         * @description 清除历史记录时触发
         */

        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );
})( gmu, gmu.$ );

//==============================navigator widget=========================
//仅包含$scrollable.js

/**
 * @file 导航栏组件
 * @import core/widget.js, extend/highlight.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    
    /**
     * 导航栏组件
     *
     * @class Navigator
     * @constructor Html部分
     * ```html
     * 
     * ```
     *
     * javascript部分
     * ```javascript
     * 
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化导航栏的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Navigator:options)
     * @grammar $( el ).navigator( options ) => zepto
     * @grammar new gmu.Navigator( el, options ) => instance
     */
    gmu.define( 'Navigator', {
        options: {

            /**
             * @property {Array} [content=null] 菜单数组
             * @namespace options
             */
            content: null,

            /**
             * @property {String} [event='click'] 交互事件名
             * @namespace options
             */
            event: 'click'
        },

        template: {
            list: '<ul>',
            item: '<li><a<% if( href ) { %> href="<%= href %>"<% } %>>' +
                    '<%= text %></a></li>'
        },

        _create: function() {
            var me = this,
                opts = me._options,
                $el = me.getEl(),
                $list = $el.find( 'ul' ).first(),
                name = 'ui-' + me.widgetName,
                renderer,
                html;

            // 如果没有包含ul节点，则说明通过指定content来create
            // 建议把create模式给拆出去。很多时候都是先写好在dom中了。
            if ( !$list.length && opts.content ) {
                $list = $( me.tpl2html( 'list' ) );
                renderer = me.tpl2html( 'item' );

                html = '';
                opts.content.forEach(function( item ) {

                    // 如果不提供默认值，然后同时某些key没有传值，parseTpl会报错
                    item = $.extend( {
                        href: '',
                        text: ''
                    }, typeof item === 'string' ? {
                        text: item
                    } : item );

                    html += renderer( item );
                });

                $list.append( html ).appendTo( $el );
            } else {
                
                // 处理直接通过ul初始化的情况
                if ( $el.is( 'ul, ol' ) ) {
                    $list = $el.wrap( '<div>' );
                    $el = $el.parent();
                }

                if ( opts.index === undefined ) {

                    // 如果opts中没有指定index, 则尝试从dom中查看是否有比较为ui-state-active的
                    opts.index = $list.find( '.ui-state-active' ).index();
                    
                    // 没找到还是赋值为0
                    ~opts.index || (opts.index = 0);
                }
            }

            me.$list = $list.addClass( name + '-list' );
            me.trigger( 'done.dom', $el.addClass( name ), opts );

            // bind Events
            $list.highlight( 'ui-state-hover', 'li' );
            $list.on( opts.event + me.eventNs,
                    'li:not(.ui-state-disable)>a', function( e ) {
                me._switchTo( $( this ).parent().index(), e );
            } );

            me.index = -1;
            me.switchTo( opts.index );
        },

        _switchTo: function( to, e ) {
            if ( to === this.index ) {
                return;
            }

            var me = this,
                list = me.$list.children(),
                evt = gmu.Event( 'beforeselect', e ),
                cur;
                
            me.trigger( evt, list.get( to ) );
            
            if ( evt.isDefaultPrevented() ) {
                return;
            }

            cur = list.removeClass( 'ui-state-active' )
                    .eq( to )
                    .addClass( 'ui-state-active' );

            me.index = to;
            return me.trigger( 'select', to, cur[ 0 ] );
        },

        /**
         * 切换到导航栏的某一项
         * @param {Number} to 序号
         * @method switchTo
         */
        switchTo: function( to ) {
            return this._switchTo( ~~to );
        },

        /**
         * 取消选择
         * @method unselect
         */
        unselect: function() {
            this.index = -1;
            this.$list.children().removeClass( 'ui-state-active' );
        },

        /**
         * 获取当前选中的序号
         * @method getIndex
         */
        getIndex: function() {
            return this.index;
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event beforeselect
         * @param {Event} e gmu.Event对象
         * @param {Element} 目标元素
         * @description 当选择的序号发生切换前触发
         */
        
        /**
         * @event select
         * @param {Event} e gmu.Event对象
         * @param {Event} 当前选择的序号
         * @param {Element} 上一次选择的元素
         * @description 当选择的序号发生切换后触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );
})( gmu, gmu.$ );


/**
 * @file Navigator的可滚插件， 采用iScroll来实现。
 * @module GMU
 * @import widget/navigator/navigator.js, extend/iscroll.js, extend/event.ortchange.js
 */
(function( gmu, $, undefined ) {

    /**
     * @property {Object} [iScroll={}] iScroll配置
     * @namespace options
     * @for Navigator
     * @uses Navigator.scrollable
     */
    gmu.Navigator.options.iScroll = {
        hScroll: true,
        vScroll: false,
        hScrollbar: false,
        vScrollbar: false
    };

    /**
     * Navigator的可滚插件， 采用iScroll来实现。
     *
     * @class scrollable
     * @namespace Navigator
     * @pluginfor Navigator
     */
    gmu.Navigator.register( 'scrollable', {

        _init: function() {
            var me = this,
                opts = me._options;

            me.on( 'done.dom', function() {
                me.$list.wrap( '<div class="ui-scroller"></div>' );

                me.trigger( 'init.iScroll' );
                me.$el.iScroll( $.extend( {}, opts.iScroll ) );
            } );

            $( window ).on( 'ortchange' + me.eventNs,
                    $.proxy( me.refresh, me ) );

            me.on('destroy', function(){
                me.$el.iScroll( 'destroy' );
                $( window ).off( 'ortchange' + me.eventNs );
            } );
        },

        /**
         * 刷新iscroll
         * @method refresh
         * @for Navigator
         * @uses Navigator.scrollable
         */
        refresh: function() {
            this.trigger( 'refresh.iScroll' ).$el.iScroll( 'refresh' );
        }

        /**
         * @event refresh.iScroll
         * @param {Event} e gmu.Event对象
         * @description iscroll刷新前触发
         */
    } );
})( gmu, gmu.$ );

//=============================panel widget=====================

/**
 * @file panel组件
 * @import extend/touch.js, core/widget.js, extend/throttle.js, extend/event.scrollStop.js, extend/event.ortchange.js
 * @module GMU
 */
(function( gmu, $, undefined ) {

    var cssPrefix = $.fx.cssPrefix,
        transitionEnd = $.fx.transitionEnd;
    /**
     * panel组件
     *
     * @class Panel
     * @constructor Html部分
     * ```html
     * <div id="page">
     *     <div class="cont">panel内容</div>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('.panel').panel({
     *     contentWrap: $('.cont')
     * });
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Panel的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Panel:options)
     * @grammar $( el ).panel( options ) => zepto
     * @grammar new gmu.Panel( el, options ) => instance
     */
    
    gmu.define( 'Panel', {
        options: {

            /**
             * @property {Dom | Zepto | selector} [contentWrap=''] 主体内容dom，若不传，则默认为panel的next节点
             * @namespace options
             */
            contentWrap: '',

            /**
             * @property {String} [scrollMode='follow'] Panel滑动方式，follow表示跟随页面滑动，hide表示页面滑动时panel消失, fix表示panel固定在页面中
             * @namespace options
             */
            scrollMode: 'follow',

            /**
             * @property {String} [display='push'] 可选值：('overlay' | 'reveal' | 'push') Panel出现模式，overlay表示浮层reveal表示在content下边展示，push表示panel将content推出
             * @namespace options
             */
            display: 'push',

            /**
             * @property {String} [position='right'] 可选值：('left' | 'right'） 在右边或左边
             * @namespace options
             */
            position: 'right',

            /**
             * @property {Boolean} [dismissible=true] (render模式下必填)是否在内容区域点击后，panel消失
             * @namespace options
             */
            dismissible: true,

            /**
             * @property {Boolean} [swipeClose=true] 在panel上滑动，panel是否关闭
             * @namespace options
             */
            swipeClose: true
        },

        _init: function () {
            var me = this,
                opts = me._options;

            me.on( 'ready', function(){
                me.displayFn = me._setDisplay();
                me.$contentWrap.addClass('ui-panel-animate');
                me.$el.on(transitionEnd, $.proxy(me._eventHandler, me)).hide();  //初始状态隐藏panel
                opts.dismissible && me.$panelMask.hide().on('click', $.proxy(me._eventHandler, me));    //绑定mask上的关闭事件
                opts.scrollMode !== 'follow' && $(window).on('scrollStop', $.proxy(me._eventHandler, me));
                $(window).on('ortchange', $.proxy(me._eventHandler, me));
            } );
        },

        _create: function () {
            if(this._options.setup){
                var me = this,
                    opts = me._options,
                    $el = me.$el.addClass('ui-panel ui-panel-'+ opts.position);

                me.panelWidth = $el.width() || 0;
                me.$contentWrap = $(opts.contentWrap || $el.next());
                opts.dismissible && ( me.$panelMask = $('<div class="ui-panel-dismiss"></div>').width(document.body.clientWidth - $el.width()).appendTo('body') || null);
            }else{
                throw new Error('panel组件不支持create模式，请使用setup模式');
            }
        },
        
        /**
         * 生成display模式函数
         * */
        _setDisplay: function () {
            var me = this,
                $panel = me.$el,
                $contentWrap = me.$contentWrap,
                transform = cssPrefix + 'transform',
                posData = me._transDisplayToPos(),
                obj = {}, panelPos, contPos;

            $.each(['push', 'overlay', 'reveal'], function (i,display) {
                obj[display] = function (isOpen, pos, isClear) {   //isOpen:是打开还是关闭操作，pos:从右或从左打开关闭，isClear:是否是初始化操作
                    panelPos = posData[display].panel, contPos = posData[display].cont;
                    $panel.css(transform, 'translate3d(' + me._transDirectionToPos(pos, panelPos[isOpen]) + 'px,0,0)');
                    if (!isClear) {
                        $contentWrap.css(transform, 'translate3d(' + me._transDirectionToPos(pos, contPos[isOpen]) + 'px,0,0)');
                        me.maskTimer = setTimeout(function () {      //防止外界注册tap穿透，故做了延迟
                            me.$panelMask && me.$panelMask.css(pos, $panel.width()).toggle(isOpen);
                        }, 400);    //改变mask left/right值
                    }
                    return me;
                }
            });
            return obj;
        },
        /**
         * 初始化panel位置，每次打开之前由于位置可能不同，所以均需重置
         * */
        _initPanelPos: function (dis, pos) {
            this.displayFn[dis](0, pos, true);
            this.$el.get(0).clientLeft;    //触发页面reflow，使得ui-panel-animate样式不生效
            return this;
        },
        /**
         * 将位置（左或右）转化为数值
         * */
        _transDirectionToPos: function (pos, val) {
            return pos === 'left' ? val : -val;
        },
        /**
         * 将打开模式（push,overlay,reveal）转化为数值
         * */
        _transDisplayToPos: function () {
            var me = this,
                panelWidth = me.panelWidth;
            return {
                push: {
                    panel: [-panelWidth, 0],    //[from, to] for panel
                    cont: [0, panelWidth]       //[from, to] for contentWrap
                },
                overlay: {
                    panel: [-panelWidth, 0],
                    cont: [0, 0]
                },
                reveal: {
                    panel: [0, 0],
                    cont: [0, panelWidth]
                }
            }
        },
        /**
         * 设置显示或关闭，关闭时的操作，包括模式、方向与需与打开时相同
         * */
        _setShow: function (isOpen, dis, pos) {
            var me = this,
                opts = me._options,
                eventName = isOpen ? 'open' : 'close',
                beforeEvent = $.Event('before' + eventName),
                changed = isOpen !== me.state(),
                _eventBinder = isOpen ? 'on' : 'off',
                _eventHandler = isOpen ? $.proxy(me._eventHandler, me) : me._eventHandler,
                _dis = dis || opts.display,
                _pos = pos || opts.position;

            me.trigger(beforeEvent, [dis, pos]);
            if (beforeEvent.isDefaultPrevented()) return me;
            if (changed) {
                me._dealState(isOpen, _dis, _pos);    //关闭或显示时，重置状态
                me.displayFn[_dis](me.isOpen = Number(isOpen), _pos);   //根据模式和打开方向，操作panel
                opts.swipeClose && me.$el[_eventBinder]($.camelCase('swipe-' + _pos), _eventHandler);     //滑动panel关闭
                opts.display = _dis, opts.position = _pos;
            }
            return me;
        },
        /**
         * 打开或关闭前的状态重置操作，包括样式，位置等
         * */
        _dealState: function (isOpen, dis, pos) {
            var me = this,
                opts = me._options,
                $panel = me.$el,
                $contentWrap = me.$contentWrap,
                addCls = 'ui-panel-' + dis + ' ui-panel-' + pos,
                removeCls = 'ui-panel-' + opts.display + ' ui-panel-' + opts.position + ' ui-panel-animate';

            if (isOpen) {
                $panel.removeClass(removeCls).addClass(addCls).show();
                opts.scrollMode === 'fix' && $panel.css('top', $(window).scrollTop());    //fix模式下
                me._initPanelPos(dis, pos);      //panel及contentWrap位置初始化
                if (dis === 'reveal') {
                    $contentWrap.addClass('ui-panel-contentWrap').on(transitionEnd, $.proxy(me._eventHandler, me));    //reveal模式下panel不触发transitionEnd;
                } else {
                    $contentWrap.removeClass('ui-panel-contentWrap').off(transitionEnd, $.proxy(me._eventHandler, me));
                    $panel.addClass('ui-panel-animate');
                }
                me.$panelMask && me.$panelMask.css({     //panel mask状态初始化
                    'left': 'auto',
                    'right': 'auto',
                    'height': document.body.clientHeight
                });
            }
            return me;
        },

        _eventHandler: function (e) {
            var me = this,
                opts = me._options,
                scrollMode = opts.scrollMode,
                eventName = me.state() ? 'open' : 'close';

            switch (e.type) {
                case 'click':
                case 'swipeLeft':
                case 'swipeRight':
                    me.close();
                    break;
                case 'scrollStop':
                    scrollMode === 'fix' ? me.$el.css('top', $(window).scrollTop()) : me.close();
                    break;
                case transitionEnd:
                    me.trigger(eventName, [opts.display, opts.position]);
                    break;
                case 'ortchange':   //增加转屏时对mask的处理
                    me.$panelMask && me.$panelMask.css('height', document.body.clientHeight);
                    scrollMode === 'fix' && me.$el.css('top', $(window).scrollTop());     //转并重设top值
                    break;
            }
        },
        
        /**
         * 打开panel
         * @method open
         * @param {String} [display] 可选值：('overlay' | 'reveal' | 'push')，默认为初始化时设置的值，Panel出现模式，overlay表示浮层reveal表示在content下边展示，push表示panel将content推出
         * @param {String} position 可选值：('left' | 'right'），默认为初始化时设置的值，在右边或左边
         * @chainable
         * @return {self} 返回本身。
         */
        open: function (display, position) {
            return this._setShow(true, display, position);
        },
        
        /**
         * 关闭panel
         * @method close
         * @chainable
         * @return {self} 返回本身。
         */
        close: function () {
            return this._setShow(false);
        },
        
        /**
         * 切换panel的打开或关闭状态
         * @method toggle
         * @param {String} [display] 可选值：('overlay' | 'reveal' | 'push')，默认为初始化时设置的值，Panel出现模式，overlay表示浮层reveal表示在content下边展示，push表示panel将content推出
         * @param {String} position 可选值：('left' | 'right'），默认为初始化时设置的值，在右边或左边
         * @chainable
         * @return {self} 返回本身。
         */
        toggle: function (display, position) {
            return this[this.isOpen ? 'close' : 'open'](display, position);
        },
        
        /**
         * 获取当前panel状态，打开为true,关闭为false
         * @method state
         * @chainable
         * @return {self} 返回本身。
         */
        state: function () {
            return !!this.isOpen;
        },
        
        /**
         * 销毁组件
         * @method destroy
         */
        destroy:function () {
            this.$panelMask && this.$panelMask.off().remove();
            this.maskTimer && clearTimeout(this.maskTimer);
            this.$contentWrap.removeClass('ui-panel-animate');
            $(window).off('scrollStop', this._eventHandler);
            $(window).off('ortchange', this._eventHandler);
            return this.$super('destroy');
        }
        
        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */
        
        /**
         * @event beforeopen
         * @param {Event} e gmu.Event对象
         * @description panel打开前触发，可以通过e.preventDefault()来阻止
         */
        
        /**
         * @event open
         * @param {Event} e gmu.Event对象
         * @description panel打开后触发
         */
        
        /**
         * @event beforeclose
         * @param {Event} e gmu.Event对象
         * @description panel关闭前触发，可以通过e.preventDefault()来阻止
         */
        
        /**
         * @event close
         * @param {Event} e gmu.Event对象
         * @description panel关闭后触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    });

})( gmu, gmu.$ );



//============================progressbar widget=====================

/**
 * @file 进度条组件
 * @import extend/touch.js, core/widget.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    
    /**
     * 进度条组件
     *
     * @class Progressbar
     * @constructor Html部分
     * ```html
     * <div id="progressbar"></div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#progressbar').progressbar();
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化进度条的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Progressbar:options)
     * @grammar $( el ).progressbar( options ) => zepto
     * @grammar new gmu.Progressbar( el, options ) => instance
     */
    gmu.define('Progressbar', {

        options: {

            /**
             * @property {Nubmer} [initValue=0] 初始时进度的百分比，不要百分号
             * @namespace options
             */
            initValue:          0,

            /**
             * @property {Boolean} [horizontal=true] 组件是否为横向(若设为false,则为竖向)
             * @namespace options
             */
            horizontal:         true,

            /**
             * @property {Number} [transitionDuration=300] 按钮滑动时动画效果持续的时间,单位为ms,设为0则无动画
             * @namespace options
             */
            transitionDuration: 300,
            _isShow:            true,
            _current:           0,
            _percent:           0
        },

        _init: function() {
            var me = this,
                $el,
                _eventHandler,
                _button,
                _background,
                _offset;

            me.on( 'ready', function(){
                $el = me.$el,
                _eventHandler = $.proxy(me._eventHandler, me),
                _button = $el.find('.ui-progressbar-button'),
                _background = $el.find('.ui-progressbar-bg'),
                _offset = $el.offset();

                _button.on('touchstart touchmove touchend touchcancel', _eventHandler);
                _background.on('touchstart', _eventHandler);
                $.extend( me._options, {
                    _button:        _button[0],
                    $_background:    _background,
                    _filled:        $el.find('.ui-progressbar-filled')[0],
                    _width:         _offset.width,
                    _height:        _offset.height
                });
                me._options['horizontal'] && _offset.width && $el.width(_offset.width);
                me._options['initValue'] > 0 && me.value( me._options['initValue']);
            } );

            me.on( 'destroy', function() {
                if ( !me._options.setup ) {
                    me.$el.remove();
                }
            } );
        },

        _create: function() {
            var me = this,
                direction = me._options['horizontal'] ? 'h' : 'v';

            if ( !me.$el ) {
                me.$el = $('<div></div>');
            }
            me.$el.addClass('ui-progressbar-' + direction).appendTo(me._options['container'] || (me.$el.parent().length ? '' : document.body)).html(
                ('<div class="ui-progressbar-bg"><div class="ui-progressbar-filled"></div><div class="ui-progressbar-button"><div><b></b></div></div></div>'));
        },

        _eventHandler: function(e) {
            var me = this;

            switch (e.type) {
                case 'touchmove':
                    me._touchMove(e);
                    break;
                case 'touchstart':
                    $(e.target).hasClass('ui-progressbar-bg') ? me._click(e) : me._touchStart(e);
                    break;
                case 'touchcancel':
                case 'touchend':
                    me._touchEnd();
                    break;
                case 'tap':
                    me._click(e);
                    break;
            }
        },

        _touchStart: function(e) {
            var me = this,
                opts = me._options;

            $.extend( me._options, {
                pageX:      e.touches[0].pageX,
                pageY:      e.touches[0].pageY,
                S:          false,      //isScrolling
                T:          false,      //isTested
                X:          0,          //horizontal moved
                Y:          0           //vertical moved
            });

            opts._button.style.webkitTransitionDuration = '0ms';
            opts._filled.style.webkitTransitionDuration = '0ms';
            $(opts._button).addClass('ui-progressbar-button-pressed');
            me.trigger('dragStart');
        },

        _touchMove: function(e) {
            var me = this,
                opts = me._options,
                touch = e.touches[0],
                X = touch.pageX - opts.pageX,
                Y = touch.pageY - opts.pageY,
                _percent;

            if(!opts.T) {
                var S = Math.abs(X) < Math.abs(touch.pageY - opts.pageY);
                opts.T = true;
                opts.S = S;
            }
            if(opts.horizontal) {
                if(!opts.S) {
                    e.stopPropagation();
                    e.preventDefault();
                    _percent =  (X + opts._current) / opts._width * 100;
                    if(_percent <= 100 && _percent >= 0) {
                        opts._percent = _percent;
                        opts.X = X;
                        opts._button.style.webkitTransform = 'translate3d(' + (opts.X + opts._current) + 'px,0,0)';
                        opts._filled.style.width = _percent + '%';
                        me.trigger('valueChange');
                    }
                    me.trigger('dragMove');
                }
            } else {
                if(opts.S) {
                    e.stopPropagation();
                    e.preventDefault();
                    _percent = -(opts._current + Y) / opts._height * 100;
                    if(_percent <= 100 && _percent >= 0) {
                        opts._percent = _percent;
                        opts.Y = Y;
                        opts._button.style.webkitTransform = 'translate3d(0,' + (Y + opts._current) + 'px,0)';
                        opts._filled.style.cssText += 'height:' + _percent + '%;top:' + (opts._height + Y + opts._current) + 'px';
                        me.trigger('valueChange');
                    }
                    me.trigger('dragMove');
                }
            }
        },

        _touchEnd: function() {
            var me = this,
                opts = me._options;

            opts._current += opts.horizontal ? opts.X : opts.Y;
            $(opts._button).removeClass('ui-progressbar-button-pressed');
            me.trigger('dragEnd');
        },

        _click: function(e) {
            var me = this,
                opts = me._options,
                rect = opts.$_background.offset(),
                touch = e.touches[0];

            opts.horizontal ?
                me.value((touch.pageX - rect.left) / opts._width * 100) :
                me.value((opts._height - touch.pageY + rect.top) / opts._height * 100);
        },

        /**
         * 获取/设置progressbar的值
         * @method value
         * @param {Number} [opts] 要设置的值，不传表示取值
         * @chainable
         * @return {self} 返回本身。
         */
        value: function(value) {
            var me = this,
                opts = me._options,
                _current, duration;

            if(value === undefined) {
                return opts._percent;
            } else {
                value = parseFloat(value);
                if(isNaN(value)) return me;
                value = value > 100 ? 100 : value < 0 ? 0 : value;
                opts._percent = value;
                duration = ';-webkit-transition-duration:' + opts.transitionDuration + 'ms';
                if(opts.horizontal) {
                    _current = opts._current = opts._width * value / 100;
                    opts._button.style.cssText += '-webkit-transform:translate3d(' + _current + 'px,0,0)' + duration;
                    opts._filled.style.cssText += 'width:'+ value + '%' + duration;
                } else {
                    _current = opts._current = opts._height * value / -100;
                    opts._button.style.cssText += '-webkit-transform:translate3d(0,' + _current + 'px,0)' + duration;
                    opts._filled.style.cssText += 'height:' + value + '%;top:' + (opts._height + _current) + 'px' + duration;
                }
                me.trigger('valueChange');
                return me;
            }
        },

        /**
         * 显示progressbar
         * @method show
         * @chainable
         * @return {self} 返回本身。
         */
        show: function() {
            var me = this;

            if(!me._options['_isShow']){
                me.$el.css('display', 'block');
                me._options['_isShow'] = true;
            }

            return me;
        },

        /**
         * 隐藏progressbar
         * @method hide
         * @chainable
         * @return {self} 返回本身。
         */
        hide: function() {
            var me = this;

            if(me._options['_isShow']) {
                me.$el.css('display', 'none');
                me._options['_isShow'] = false;
            }

            return me;
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */
        
        /**
         * @event dragStart
         * @param {Event} e gmu.Event对象
         * @description 拖动进度条开始时触发的事件
         */
        
        /**
         * @event dragMove
         * @param {Event} e gmu.Event对象
         * @description 拖动进度条过程中触发的事件
         */
        
        /**
         * @event dragEnd
         * @param {Event} e gmu.Event对象
         * @description 拖动进度条结束时触发的事件
         */
        
        /**
         * @event valueChange
         * @param {Event} e gmu.Event对象
         * @description progressbar的值有变化时触发（拖动progressbar时，值不一定会变化）
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    });
})( gmu, gmu.$ );


//==========================refresh widget=======================
//包含$iscroll.js

/**
 * @file 加载更多组件
 * @import core/widget.js
 * @importCSS loading.css
 * @module GMU
 */

(function( gmu, $, undefined ) {
    
    /**
     * 加载更多组件
     *
     * @class Refresh
     * @constructor Html部分
     * ```html
     * <div class="ui-refresh">
     *    <ul class="data-list">...</ul>
     *    <div class="ui-refresh-down"></div><!--setup方式带有class为ui-refresh-down或ui-refresh-up的元素必须加上，用于放refresh按钮-->
     * </div>

     * ```
     *
     * javascript部分
     * ```javascript
     * $('.ui-refresh').refresh({
     *      load: function (dir, type) {
     *          var me = this;
     *          $.getJSON('../../data/refresh.php', function (data) {
     *              var $list = $('.data-list'),
     *                      html = (function (data) {      //数据渲染
     *                          var liArr = [];
     *                          $.each(data, function () {
     *                              liArr.push(this.html);
     *                          });
     *                          return liArr.join('');
     *                      })(data);
     *              $list[dir == 'up' ? 'prepend' : 'append'](html);
     *              me.afterDataLoading();    //数据加载完成后改变状态
     *          });
     *      }
     *  });
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Refresh的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Refresh:options)
     * @grammar $( el ).refresh( options ) => zepto
     * @grammar new gmu.Refresh( el, options ) => instance
     */
    gmu.define( 'Refresh', {
        options: {

            /**
             * @property {Function} load 当点击按钮，或者滑动达到可加载内容条件时，此方法会被调用。需要在此方法里面进行ajax内容请求，并在请求完后，调用afterDataLoading()，通知refresh组件，改变状态。
             * @namespace options
             */
            load: null,

            /**
             * @property {Function} [statechange=null] 样式改变时触发，该事件可以被阻止，阻止后可以自定义加载样式，回调参数：event(事件对象), elem(refresh按钮元素), state(状态), dir(方向)
             * @namespace options
             */
            statechange: null
        },

        _init: function() {
            var me = this,
                opts = me._options;

            me.on( 'ready', function(){
                $.each(['up', 'down'], function (i, dir) {
                    var $elem = opts['$' + dir + 'Elem'],
                        elem = $elem.get(0);

                    if ($elem.length) {
                        me._status(dir, true);    //初始设置加载状态为可用
                        if (!elem.childNodes.length || ($elem.find('.ui-refresh-icon').length && $elem.find('.ui-refresh-label').length)) {    //若内容为空则创建，若不满足icon和label的要求，则不做处理
                            !elem.childNodes.length && me._createBtn(dir);
                            opts.refreshInfo || (opts.refreshInfo = {});
                            opts.refreshInfo[dir] = {
                                $icon: $elem.find('.ui-refresh-icon'),
                                $label: $elem.find('.ui-refresh-label'),
                                text: $elem.find('.ui-refresh-label').html()
                            }
                        }
                        $elem.on('click', function () {
                            if (!me._status(dir) || opts._actDir) return;         //检查是否处于可用状态，同一方向上的仍在加载中，或者不同方向的还未加载完成 traceID:FEBASE-569
                            me._setStyle(dir, 'loading');
                            me._loadingAction(dir, 'click');
                        });
                    }
                });
            } );

            me.on( 'destroy', function(){
                me.$el.remove();
            } );
        },

        _create: function(){
            var me = this,
                opts = me._options,
                $el = me.$el;

            if( me._options.setup ) {
                // 值支持setup模式，所以直接从DOM中取元素
                opts.$upElem = $el.find('.ui-refresh-up');
                opts.$downElem = $el.find('.ui-refresh-down');
                $el.addClass('ui-refresh');
            }
        },

        _createBtn: function (dir) {
            this._options['$' + dir + 'Elem'].html('<span class="ui-refresh-icon"></span><span class="ui-refresh-label">加载更多</span>');

            return this;
        },

        _setStyle: function (dir, state) {
            var me = this,
                stateChange = $.Event('statechange');

            me.trigger(stateChange, me._options['$' + dir + 'Elem'], state, dir);
            if ( stateChange.defaultPrevented ) {
                return me;
            }

            return me._changeStyle(dir, state);
        },

        _changeStyle: function (dir, state) {
            var opts = this._options,
                refreshInfo = opts.refreshInfo[dir];

            switch (state) {
                case 'loaded':
                    refreshInfo['$label'].html(refreshInfo['text']);
                    refreshInfo['$icon'].removeClass();
                    opts._actDir = '';
                    break;
                case 'loading':
                    refreshInfo['$label'].html('加载中...');
                    refreshInfo['$icon'].addClass('ui-loading');
                    opts._actDir = dir;
                    break;
                case 'disable':
                    refreshInfo['$label'].html('没有更多内容了');
                    break;
            }

            return this;
        },

        _loadingAction: function (dir, type) {
            var me = this,
                opts = me._options,
                loadFn = opts.load;

            $.isFunction(loadFn) && loadFn.call(me, dir, type);
            me._status(dir, false);

            return me;
        },

        /**
         * 当组件调用load，在load中通过ajax请求内容回来后，需要调用此方法，来改变refresh状态。
         * @method afterDataLoading
         * @param {String} dir 加载的方向（'up' | 'down'）
         * @chainable
         * @return {self} 返回本身。
         */
        afterDataLoading: function (dir) {
            var me = this,
                dir = dir || me._options._actDir;

            me._setStyle(dir, 'loaded');
            me._status(dir, true);

            return me;
        },

        /**
         * 用来设置加载是否可用，分方向的。
         * @param {String} dir 加载的方向（'up' | 'down'）
         * @param {String} status 状态（true | false）
         */
        _status: function(dir, status) {
            var opts = this._options;

            return status === undefined ? opts['_' + dir + 'Open'] : opts['_' + dir + 'Open'] = !!status;
        },

        _setable: function (able, dir, hide) {
            var me = this,
                opts = me._options,
                dirArr = dir ? [dir] : ['up', 'down'];

            $.each(dirArr, function (i, dir) {
                var $elem = opts['$' + dir + 'Elem'];
                if (!$elem.length) return;
                //若是enable操作，直接显示，disable则根据text是否是true来确定是否隐藏
                able ? $elem.show() : (hide ?  $elem.hide() : me._setStyle(dir, 'disable'));
                me._status(dir, able);
            });

            return me;
        },

        /**
         * 如果已无类容可加载时，可以调用此方法来，禁用Refresh。
         * @method disable
         * @param {String} dir 加载的方向（'up' | 'down'）
         * @param {Boolean} hide 是否隐藏按钮。如果此属性为false，将只有文字变化。
         * @chainable
         * @return {self} 返回本身。
         */
        disable: function (dir, hide) {
            return this._setable(false, dir, hide);
        },

        /**
         * 启用组件
         * @method enable
         * @param {String} dir 加载的方向（'up' | 'down'）
         * @chainable
         * @return {self} 返回本身。
         */
        enable: function (dir) {
            return this._setable(true, dir);
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */
        
        /**
         * @event statechange
         * @param {Event} e gmu.Event对象
         * @param {Zepto} elem 按钮元素
         * @param {String} state 当前组件的状态('loaded'：默认状态；'loading'：加载中状态；'disabled'：禁用状态，表示无内容加载了；'beforeload'：在手没有松开前满足加载的条件状态。 需要引入插件才有此状态，lite，iscroll，或者iOS5)
         * @param {String} dir 加载的方向（'up' | 'down'）
         * @description 组件发生状态变化时会触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */

    } );
})( gmu, gmu.$ );

/**
 * @file iScroll插件
 * @import extend/iscroll.js, widget/refresh/refresh.js
 */
(function( gmu, $, undefined ) {
    
    /**
     * iscroll插件，支持拉动加载，内滚采用iscroll方式，体验更加贴近native。
     * @class iscroll
     * @namespace Refresh
     * @pluginfor Refresh
     */
    /**
     * @property {Number} [threshold=5] 加载的阀值，默认向上或向下拉动距离超过5px，即可触发拉动操作，该值只能为正值，若该值是10，则需要拉动距离大于15px才可触发加载操作
     * @namespace options
     * @for Refresh
     * @uses Refresh.iscroll
     */
    /**
     * @property {Object} [iScrollOpts={}] iScroll的配置项
     * @namespace options
     * @for Refresh
     * @uses Refresh.iscroll
     */
    gmu.Refresh.register( 'iscroll', {
        _init: function () {
            var me = this,
                opts = me._options,
                $el = me.$el,
                wrapperH = $el.height();

            $.extend(opts, {
                useTransition: true,
                speedScale: 1,
                topOffset: opts['$upElem'] ? opts['$upElem'].height() : 0
            });
            opts.threshold = opts.threshold || 5;

            $el.wrapAll($('<div class="ui-refresh-wrapper"></div>').height(wrapperH)).css('height', 'auto');

            me.on( 'ready', function(){
                me._loadIscroll();
            } );
        },
        _changeStyle: function (dir, state) {
            var me = this,
                opts = me._options,
                refreshInfo = opts.refreshInfo[dir];

            me.origin(dir, state);
            switch (state) {
                case 'loaded':
                    refreshInfo['$icon'].addClass('ui-refresh-icon');
                    break;
                case 'beforeload':
                    refreshInfo['$label'].html('松开立即加载');
                    refreshInfo['$icon'].addClass('ui-refresh-flip');
                    break;
                case 'loading':
                    refreshInfo['$icon'].removeClass().addClass('ui-loading');
                    break;
            }
            return me;
        },
        _loadIscroll: function () {
            var me = this,
                opts = me._options,
                threshold = opts.threshold;

            opts.iScroll = new iScroll(me.$el.parent().get(0), opts.iScrollOpts = $.extend({
                useTransition: opts.useTransition,
                speedScale: opts.speedScale,
                topOffset: opts.topOffset
            }, opts.iScrollOpts, {
                onScrollStart: function (e) {
                    me.trigger('scrollstart', e);
                },
                onScrollMove: (function () {
                    var up = opts.$upElem && opts.$upElem.length,
                        down = opts.$downElem && opts.$downElem.length;

                    return function (e) {
                        var upRefreshed = opts['_upRefreshed'],
                            downRefreshed = opts['_downRefreshed'],
                            upStatus = me._status('up'),
                            downStatus = me._status('down');

                        if (up && !upStatus || down && !downStatus || this.maxScrollY >= 0) return;    //上下不能同时加载 trace:FEBASE-775，当wrapper > scroller时，不进行加载 trace:FEBASE-774
                        if (downStatus && down && !downRefreshed && this.y < (this.maxScrollY - threshold)) {    //下边按钮，上拉加载
                            me._setMoveState('down', 'beforeload', 'pull');
                        } else if (upStatus && up && !upRefreshed && this.y > threshold) {     //上边按钮，下拉加载
                            me._setMoveState('up', 'beforeload', 'pull');
                            this.minScrollY = 0;
                        } else if (downStatus && downRefreshed && this.y > (this.maxScrollY + threshold)) {      //下边按钮，上拉恢复
                            me._setMoveState('down', 'loaded', 'restore');
                        } else if (upStatus && upRefreshed && this.y < threshold) {      //上边按钮，下拉恢复
                            me._setMoveState('up', 'loaded', 'restore');
                            this.minScrollY = -opts.topOffset;
                        }
                        me.trigger('scrollmove', e);
                    };
                })(),
                onScrollEnd: function (e) {
                    var actDir = opts._actDir;
                    if (actDir && me._status(actDir)) {   //trace FEBASE-716
                        me._setStyle(actDir, 'loading');
                        me._loadingAction(actDir, 'pull');
                    }
                    me.trigger('scrollend', e);
                }
            }));
        },
        _setMoveState: function (dir, state, actType) {
            var me = this,
                opts = me._options;

            me._setStyle(dir, state);
            opts['_' + dir + 'Refreshed'] = actType == 'pull';
            opts['_actDir'] = actType == 'pull' ? dir : '';

            return me;
        },
        afterDataLoading: function (dir) {
            var me = this,
                opts = me._options,
                dir = dir || opts._actDir;

            opts.iScroll.refresh();
            opts['_' + dir + 'Refreshed'] = false;
            return me.origin(dir);
        }
    } );
})( gmu, gmu.$ );


//============================slider widget========================
//包含 autoplay    multiview  arrow  dots imgzoom  touch

/**
 * @file 图片轮播组件
 * @import extend/touch.js, extend/event.ortchange.js, core/widget.js
 * @module GMU
 */
(function( gmu, $, undefined ) {
    var cssPrefix = $.fx.cssPrefix,
        transitionEnd = $.fx.transitionEnd,

        // todo 检测3d是否支持。
        translateZ = ' translateZ(0)';
    
    /**
     * 图片轮播组件
     *
     * @class Slider
     * @constructor Html部分
     * ```html
     * <div id="slider">
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image1.png"></a>
     *       <p>1,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image2.png"></a>
     *       <p>2,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image3.png"></a>
     *       <p>3,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     *   <div>
     *       <a href="http://www.baidu.com/"><img lazyload="image4.png"></a>
     *       <p>4,让Coron的太阳把自己晒黑—小天</p>
     *   </div>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#slider').slider();
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Slider的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Slider:options)
     * @grammar $( el ).slider( options ) => zepto
     * @grammar new gmu.Slider( el, options ) => instance
     */
    gmu.define( 'Slider', {

        options: {

            /**
             * @property {Boolean} [loop=false] 是否连续滑动
             * @namespace options
             */
            loop: false,
            
            /**
             * @property {Number} [speed=400] 动画执行速度
             * @namespace options
             */
            speed: 400,

            /**
             * @property {Number} [index=0] 初始位置
             * @namespace options
             */
            index: 0,

            /**
             * @property {Object} [selector={container:'.ui-slider-group'}] 内部结构选择器定义
             * @namespace options
             */
            selector: {
                container: '.ui-slider-group'    // 容器的选择器
            }
        },

        template: {
            item: '<div class="ui-slider-item"><a href="<%= href %>">' +
                    '<img src="<%= pic %>" alt="" /></a>' +
                    '<% if( title ) { %><p><%= title %></p><% } %>' +
                    '</div>'
        },

        _create: function() {
            var me = this,
                $el = me.getEl(),
                opts = me._options;

            me.index = opts.index;

            // 初始dom结构
            me._initDom( $el, opts );

            // 更新width
            me._initWidth( $el, me.index );
            me._container.on( transitionEnd + me.eventNs,
                    $.proxy( me._tansitionEnd, me ) );

            // 转屏事件检测
            $( window ).on( 'ortchange' + me.eventNs, function() {
                me._initWidth( $el, me.index );
            } );
        },

        _initDom: function( $el, opts ) {
            var selector = opts.selector,
                viewNum = opts.viewNum || 1,
                items,
                container;

            // 检测容器节点是否指定
            container = $el.find( selector.container );

            // 没有指定容器则创建容器
            if ( !container.length ) {
                container = $( '<div></div>' );

                // 如果没有传入content, 则将root的孩子作为可滚动item
                if ( !opts.content ) {

                    // 特殊处理直接用ul初始化slider的case
                    if ( $el.is( 'ul' ) ) {
                        this.$el = container.insertAfter( $el );
                        container = $el;
                        $el = this.$el;
                    } else {
                        container.append( $el.children() );
                    }
                } else {
                    this._createItems( container, opts.content );
                }

                container.appendTo( $el );
            }

            // 检测是否构成循环条件
            if ( (items = container.children()).length < viewNum + 1 ) {
                opts.loop = false;
            }

            // 如果节点少了，需要复制几份
            while ( opts.loop && container.children().length < 3 * viewNum ) {
                container.append( items.clone() );
            }

            this.length = container.children().length;

            this._items = (this._container = container)
                    .addClass( 'ui-slider-group' )
                    .children()
                    .addClass( 'ui-slider-item' )
                    .toArray();

            this.trigger( 'done.dom', $el.addClass( 'ui-slider' ), opts );
        },

        // 根据items里面的数据挨个render插入到container中
        _createItems: function( container, items ) {
            var i = 0,
                len = items.length;

            for ( ; i < len; i++ ) {
                container.append( this.tpl2html( 'item', items[ i ] ) );
            }
        },

        _initWidth: function( $el, index, force ) {
            var me = this,
                width;

            // width没有变化不需要重排
            if ( !force && (width = $el.width()) === me.width ) {
                return;
            }

            me.width = width;
            me._arrange( width, index );
            me.height = $el.height();
            me.trigger( 'width.change' );
        },

        // 重排items
        _arrange: function( width, index ) {
            var items = this._items,
                i = 0,
                item,
                len;

            this._slidePos = new Array( items.length );

            for ( len = items.length; i < len; i++ ) {
                item = items[ i ];
                
                item.style.cssText += 'width:' + width + 'px;' +
                        'left:' + (i * -width) + 'px;';
                item.setAttribute( 'data-index', i );

                this._move( i, i < index ? -width : i > index ? width : 0, 0 );
            }

            this._container.css( 'width', width * len );
        },

        _move: function( index, dist, speed, immediate ) {
            var slidePos = this._slidePos,
                items = this._items;

            if ( slidePos[ index ] === dist || !items[ index ] ) {
                return;
            }

            this._translate( index, dist, speed );
            slidePos[ index ] = dist;    // 记录目标位置

            // 强制一个reflow
            immediate && items[ index ].clientLeft;
        },

        _translate: function( index, dist, speed ) {
            var slide = this._items[ index ],
                style = slide && slide.style;

            if ( !style ) {
                return false;
            }

            style.cssText += cssPrefix + 'transition-duration:' + speed + 
                    'ms;' + cssPrefix + 'transform: translate(' + 
                    dist + 'px, 0)' + translateZ + ';';
        },

        _circle: function( index, arr ) {
            var len;

            arr = arr || this._items;
            len = arr.length;

            return (index % len + len) % arr.length;
        },

        _tansitionEnd: function( e ) {

            // ~~用来类型转换，等价于parseInt( str, 10 );
            if ( ~~e.target.getAttribute( 'data-index' ) !== this.index ) {
                return;
            }
            
            this.trigger( 'slideend', this.index );
        },

        _slide: function( from, diff, dir, width, speed, opts ) {
            var me = this,
                to;

            to = me._circle( from - dir * diff );

            // 如果不是loop模式，以实际位置的方向为准
            if ( !opts.loop ) {
                dir = Math.abs( from - to ) / (from - to);
            }
            
            // 调整初始位置，如果已经在位置上不会重复处理
            this._move( to, -dir * width, 0, true );

            this._move( from, width * dir, speed );
            this._move( to, 0, speed );

            this.index = to;
            return this.trigger( 'slide', to, from );
        },

        /**
         * 切换到第几个slide
         * @method slideTo
         * @chainable
         * @param {Number} to 目标slide的序号
         * @param {Number} [speed] 切换的速度
         * @return {self} 返回本身
         */
        slideTo: function( to, speed ) {
            if ( this.index === to || this.index === this._circle( to ) ) {
                return this;
            }

            var opts = this._options,
                index = this.index,
                diff = Math.abs( index - to ),
                
                // 1向左，-1向右
                dir = diff / (index - to),
                width = this.width;

            speed = speed || opts.speed;

            return this._slide( index, diff, dir, width, speed, opts );
        },

        /**
         * 切换到上一个slide
         * @method prev
         * @chainable
         * @return {self} 返回本身
         */
        prev: function() {
            
            if ( this._options.loop || this.index > 0 ) {
                this.slideTo( this.index - 1 );
            }

            return this;
        },

        /**
         * 切换到下一个slide
         * @method next
         * @chainable
         * @return {self} 返回本身
         */
        next: function() {
            
            if ( this._options.loop || this.index + 1 < this.length ) {
                this.slideTo( this.index + 1 );
            }

            return this;
        },

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        getIndex: function() {
            return this.index;
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            this._container.off( this.eventNs );
            $( window ).off( 'ortchange' + this.eventNs );
            return this.$super( 'destroy' );
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event done.dom
         * @param {Event} e gmu.Event对象
         * @param {Zepto} $el slider元素
         * @param {Object} opts 组件初始化时的配置项
         * @description DOM创建完成后触发
         */
        
        /**
         * @event width.change
         * @param {Event} e gmu.Event对象
         * @description slider容器宽度发生变化时触发
         */
        
        /**
         * @event slideend
         * @param {Event} e gmu.Event对象
         * @param {Number} index 当前slide的序号
         * @description slide切换完成后触发
         */
        
        /**
         * @event slide
         * @param {Event} e gmu.Event对象
         * @param {Number} to 目标slide的序号
         * @param {Number} from 当前slide的序号
         * @description slide切换时触发（如果切换时有动画，此事件触发时，slide不一定已经完成切换）
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );

})( gmu, gmu.$ );

/**
 * @file 自动播放插件
 * @import widget/slider/slider.js
 */
(function( gmu, $ ) {
    $.extend( true, gmu.Slider, {
        options: {
            /**
             * @property {Boolean} [autoPlay=true] 是否开启自动播放
             * @namespace options
             * @for Slider
             * @uses Slider.autoplay
             */
            autoPlay: true,
            /**
             * @property {Number} [interval=4000] 自动播放的间隔时间（毫秒）
             * @namespace options
             * @for Slider
             * @uses Slider.autoplay
             */
            interval: 4000
        }
    } );

    /**
     * 自动播放插件
     * @class autoplay
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.register( 'autoplay', {
        _init: function() {
            var me = this;
            me.on( 'slideend ready', me.resume )

                    // 清除timer
                    .on( 'destory', me.stop );

            // 避免滑动时，自动切换
            me.getEl()
                    .on( 'touchstart' + me.eventNs, $.proxy( me.stop, me ) )
                    .on( 'touchend' + me.eventNs, $.proxy( me.resume, me ) );
        },

        /**
         * 恢复自动播放。
         * @method resume
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        resume: function() {
            var me = this,
                opts = me._options;

            if ( opts.autoPlay && !me._timer ) {
                me._timer = setTimeout( function() {
                    me.slideTo( me.index + 1 );
                    me._timer = null;
                }, opts.interval );
            }
            return me;
        },

        /**
         * 停止自动播放
         * @method stop
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        stop: function() {
            var me = this;

            if ( me._timer ) {
                clearTimeout( me._timer );
                me._timer = null;
            }
            return me;
        }
    } );
})( gmu, gmu.$ );


/**
 * @file 图片轮播显示点功能
 * @import widget/slider/slider.js
 */
(function( gmu, $, undefined ) {
    $.extend( gmu.Slider.options, {
        /**
         * @property {Number} [viewNum=2] 当slider为multiview模式时，用来指定一页显示多少个图片。
         * @namespace options
         * @for Slider
         * @uses Slider.multiview
         */
        viewNum: 2,
        /**
         * @property {Number} [travelSize=2] 用来指定当操作上下导航时，一次滑动多少个张图片，如果这个值与viewNum值一致，就是一次滑动一屏的效果。
         * @namespace options
         * @for Slider
         * @uses Slider.multiview
         */
        travelSize: 2
    } );

    /**
     * 图片轮播显示点功能
     * @class multiview
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.register( 'multiview', {
        _arrange: function( width, index ) {
            var items = this._items,
                viewNum = this._options.viewNum,
                factor = index % viewNum,
                i = 0,
                perWidth = this.perWidth = Math.ceil( width / viewNum ),
                item,
                len;

            this._slidePos = new Array( items.length );

            for ( len = items.length; i < len; i++ ) {
                item = items[ i ];

                item.style.cssText += 'width:' + perWidth + 'px;' +
                        'left:' + (i * -perWidth) + 'px;';
                item.setAttribute( 'data-index', i );

                i % viewNum === factor && this._move( i,
                        i < index ? -width : i > index ? width : 0,
                        0, Math.min( viewNum, len - i ) );
            }

            this._container.css( 'width', perWidth * len );
        },

        _move: function( index, dist, speed, immediate, count ) {
            var perWidth = this.perWidth,
                opts = this._options,
                i = 0;

            count = count || opts.viewNum;

            for ( ; i < count; i++ ) {
                this.origin( opts.loop ? this._circle( index + i ) :
                        index + i, dist + i * perWidth, speed, immediate );
            }
        },

        _slide: function( from, diff, dir, width, speed, opts, mode ) {
            var me = this,
                viewNum = opts.viewNum,
                len = this._items.length,
                offset,
                to;

            // 当不是loop时，diff不能大于实际能移动的范围
            opts.loop || (diff = Math.min( diff, dir > 0 ?
                            from : len - viewNum - from ));

            to = me._circle( from - dir * diff );

            // 如果不是loop模式，以实际位置的方向为准
            opts.loop || (dir = Math.abs( from - to ) / (from - to));

            diff %= len;    // 处理diff大于len的情况

            // 相反的距离比viewNum小，不能完成流畅的滚动。
            if ( len - diff < viewNum ) {
                diff = len - diff;
                dir = -1 * dir;
            }

            offset = Math.max( 0, viewNum - diff );

            // 调整初始位置，如果已经在位置上不会重复处理
            // touchend中执行过来的，不会执行以下代码
            if ( !mode ) {
                this._move( to, -dir * this.perWidth *
                        Math.min( diff, viewNum ), 0, true );
                this._move( from + offset * dir, offset * dir *
                        this.perWidth, 0, true );
            }

            this._move( from + offset * dir, width * dir, speed );
            this._move( to, 0, speed );

            this.index = to;
            return this.trigger( 'slide', to, from );
        },

        prev: function() {
            var opts = this._options,
                travelSize = opts.travelSize;

            if ( opts.loop || (this.index > 0, travelSize =
                    Math.min( this.index, travelSize )) ) {

                this.slideTo( this.index - travelSize );
            }

            return this;
        },

        next: function() {
            var opts = this._options,
                travelSize = opts.travelSize,
                viewNum = opts.viewNum;

            if ( opts.loop || (this.index + viewNum < this.length &&
                    (travelSize = Math.min( this.length - 1 - this.index,
                    travelSize ))) ) {

                this.slideTo( this.index + travelSize );
            }

            return this;
        }
    } );
})( gmu, gmu.$ );

/**
 * @file 图片轮播剪头按钮
 * @import widget/slider/slider.js
 */
(function( gmu, $, undefined ) {
    $.extend( true, gmu.Slider, {

        template: {
            prev: '<span class="ui-slider-pre"></span>',
            next: '<span class="ui-slider-next"></span>'
        },

        options: {
            /**
             * @property {Boolean} [arrow=true] 是否显示点
             * @namespace options
             * @for Slider
             * @uses Slider.arrow
             */
            arrow: true,

            /**
             * @property {Object} [select={prev:'.ui-slider-pre',next:'.ui-slider-next'}] 上一张和下一张按钮的选择器
             * @namespace options
             * @for Slider
             * @uses Slider.arrow
             */
            select: {
                prev: '.ui-slider-pre',    // 上一张按钮选择器
                next: '.ui-slider-next'    // 下一张按钮选择器
            }
        }
    } );

    /**
     * 图片轮播剪头按钮
     * @class arrow
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.option( 'arrow', true, function() {
        var me = this,
            arr = [ 'prev', 'next' ];

        this.on( 'done.dom', function( e, $el, opts ) {
            var selector = opts.selector;

            arr.forEach(function( name ) {
                var item = $el.find( selector[ name ] );
                item.length || $el.append( item = $( me.tpl2html( name ) ) );
                me[ '_' + name ] = item;
            });
        } );

        this.on( 'ready', function() {
            arr.forEach(function( name ) {
                me[ '_' + name ].on( 'tap' + me.eventNs, function() {
                    me[ name ].call( me );
                } );
            });
        } );

        this.on( 'destroy', function() {
            me._prev.off( me.eventNs );
            me._next.off( me.eventNs );
        } );
    } );
})( gmu, gmu.$ );

/**
 * @file 图片轮播显示点功能
 * @import widget/slider/slider.js
 */
(function( gmu, $, undefined ) {
    $.extend( true, gmu.Slider, {

        template: {
            dots: '<p class="ui-slider-dots"><%= new Array( len + 1 )' +
                    '.join("<b></b>") %></p>'
        },

        options: {

            /**
             * @property {Boolean} [dots=true] 是否显示点
             * @namespace options
             * @for Slider
             * @uses Slider.dots
             */
            dots: true,

            /**
             * @property {Object} [selector={dots:'.ui-slider-dots'}] 所有点父级的选择器
             * @namespace options
             * @for Slider
             * @uses Slider.dots
             */
            selector: {
                dots: '.ui-slider-dots'
            }
        }
    } );

    /**
     * 图片轮播显示点功能
     * @class dots
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.option( 'dots', true, function() {
        
        var updateDots = function( to, from ) {
            var dots = this._dots;

            typeof from === 'undefined' || gmu.staticCall( dots[
                from % this.length ], 'removeClass', 'ui-state-active' );
            
            gmu.staticCall( dots[ to % this.length ], 'addClass',
                    'ui-state-active' );
        };

        this.on( 'done.dom', function( e, $el, opts ) {
            var dots = $el.find( opts.selector.dots );

            if ( !dots.length ) {
                dots = this.tpl2html( 'dots', {
                    len: this.length
                } );
                
                dots = $( dots ).appendTo( $el );
            }

            this._dots = dots.children().toArray();
        } );

        this.on( 'slide', function( e, to, from ) {
            updateDots.call( this, to, from );
        } );

        this.on( 'ready', function() {
            updateDots.call( this, this.index );
        } );
    } );
})( gmu, gmu.$ );

/**
 * @file 图片自动适应功能
 * @import widget/slider/slider.js
 */
(function( gmu ) {

    /**
     * @property {Boolean} [imgZoom=true] 是否开启图片自适应
     * @namespace options
     * @for Slider
     * @uses Slider.dots
     */
    gmu.Slider.options.imgZoom = true;

    /**
     * 图片自动适应功能
     * @class imgZoom
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.option( 'imgZoom', function() {
        return !!this._options.imgZoom;
    }, function() {
        var me = this,
            selector = me._options.imgZoom,
            watches;

        selector = typeof selector === 'string' ? selector : 'img';

        function unWatch() {
            watches && watches.off( 'load' + me.eventNs, imgZoom );
        }

        function watch() {
            unWatch();
            watches = me._container.find( selector )
                    .on( 'load' + me.eventNs, imgZoom );
        }

        function imgZoom( e ) {
            var img = e.target || this,

                // 只缩放，不拉伸
                scale = Math.min( 1, me.width / img.naturalWidth,
                    me.height / img.naturalHeight );
            
            img.style.width = scale * img.naturalWidth + 'px';
        }

        me.on( 'ready dom.change', watch );
        me.on( 'width.change', function() {
            watches && watches.each( imgZoom );
        } );
        me.on( 'destroy', unWatch );
    } );
})( gmu );

/**
 * @file 图片轮播手指跟随插件
 * @import widget/slider/slider.js
 */
(function( gmu, $, undefined ) {
    
    var map = {
            touchstart: '_onStart',
            touchmove: '_onMove',
            touchend: '_onEnd',
            touchcancel: '_onEnd',
            click: '_onClick'
        },

        isScrolling,
        start,
        delta,
        moved;

    // 提供默认options
    $.extend( gmu.Slider.options, {

        /**
         * @property {Boolean} [stopPropagation=false] 是否阻止事件冒泡
         * @namespace options
         * @for Slider
         * @uses Slider.touch
         */
        stopPropagation: false,

        /**
         * @property {Boolean} [disableScroll=false] 是否阻止滚动
         * @namespace options
         * @for Slider
         * @uses Slider.touch
         */
        disableScroll: false
    } );

    /**
     * 图片轮播手指跟随插件
     * @class touch
     * @namespace Slider
     * @pluginfor Slider
     */
    gmu.Slider.register( 'touch', {
        _init: function() {
            var me = this,
                $el = me.getEl();

            me._handler = function( e ) {
                me._options.stopPropagation && e.stopPropagation();
                return map[ e.type ] && me[ map[ e.type ] ].call( me, e );
            };

            me.on( 'ready', function() {

                // 绑定手势
                $el.on( 'touchstart' + me.eventNs, me._handler );
                
                // 阻止误点击, 犹豫touchmove被preventDefault了，导致长按也会触发click
                me._container.on( 'click' + me.eventNs, me._handler );
            } );
        },

        _onClick: function() {
            return !moved;
        },

        _onStart: function( e ) {
                
            // 不处理多指
            if ( e.touches.length > 1 ) {
                return false;
            }

            var me = this,
                touche = e.touches[ 0 ],
                opts = me._options,
                eventNs = me.eventNs,
                num;

            start = {
                x: touche.pageX,
                y: touche.pageY,
                time: +new Date()
            };

            delta = {};
            moved = false;
            isScrolling = undefined;

            num = opts.viewNum || 1;
            me._move( opts.loop ? me._circle( me.index - num ) :
                    me.index - num, -me.width, 0, true );
            me._move( opts.loop ? me._circle( me.index + num ) :
                    me.index + num, me.width, 0, true );

            me.$el.on( 'touchmove' + eventNs + ' touchend' + eventNs +
                    ' touchcancel' + eventNs, me._handler );
        },

        _onMove: function( e ) {

            // 多指或缩放不处理
            if ( e.touches.length > 1 || e.scale &&
                    e.scale !== 1 ) {
                return false;
            }

            var opts = this._options,
                viewNum = opts.viewNum || 1,
                touche = e.touches[ 0 ],
                index = this.index,
                i,
                len,
                pos,
                slidePos;

            opts.disableScroll && e.preventDefault();

            delta.x = touche.pageX - start.x;
            delta.y = touche.pageY - start.y;

            if ( typeof isScrolling === 'undefined' ) {
                isScrolling = Math.abs( delta.x ) <
                        Math.abs( delta.y );
            }

            if ( !isScrolling ) {
                e.preventDefault();

                if ( !opts.loop ) {

                    // 如果左边已经到头
                    delta.x /= (!index && delta.x > 0 ||

                            // 如果右边到头
                            index === this._items.length - 1 && 
                            delta.x < 0) ?

                            // 则来一定的减速
                            (Math.abs( delta.x ) / this.width + 1) : 1;
                }

                slidePos = this._slidePos;

                for ( i = index - viewNum, len = index + 2 * viewNum;
                        i < len; i++ ) {

                    pos = opts.loop ? this._circle( i ) : i;
                    this._translate( pos, delta.x + slidePos[ pos ], 0 );
                }

                moved = true;
            }
        },

        _onEnd: function() {

            // 解除事件
            this.$el.off( 'touchmove' + this.eventNs + ' touchend' +
                    this.eventNs + ' touchcancel' + this.eventNs,
                    this._handler );

            if ( !moved ) {
                return;
            }

            var me = this,
                opts = me._options,
                viewNum = opts.viewNum || 1,
                index = me.index,
                slidePos = me._slidePos,
                duration = +new Date() - start.time,
                absDeltaX = Math.abs( delta.x ),

                // 是否滑出边界
                isPastBounds = !opts.loop && (!index && delta.x > 0 ||
                    index === slidePos.length - viewNum && delta.x < 0),

                // -1 向右 1 向左
                dir = delta.x > 0 ? 1 : -1,
                speed,
                diff,
                i,
                len,
                pos;

            if ( duration < 250 ) {

                // 如果滑动速度比较快，偏移量跟根据速度来算
                speed = absDeltaX / duration;
                diff = Math.min( Math.round( speed * viewNum * 1.2 ),
                        viewNum );
            } else {
                diff = Math.round( absDeltaX / (me.perWidth || me.width) );
            }
            
            if ( diff && !isPastBounds ) {
                me._slide( index, diff, dir, me.width, opts.speed,
                        opts, true );
                
                // 在以下情况，需要多移动一张
                if ( viewNum > 1 && duration >= 250 &&
                        Math.ceil( absDeltaX / me.perWidth ) !== diff ) {

                    me.index < index ? me._move( me.index - 1, -me.perWidth,
                            opts.speed ) : me._move( me.index + viewNum,
                            me.width, opts.speed );
                }
            } else {
                
                // 滑回去
                for ( i = index - viewNum, len = index + 2 * viewNum;
                    i < len; i++ ) {

                    pos = opts.loop ? me._circle( i ) : i;
                    me._translate( pos, slidePos[ pos ], 
                            opts.speed );
                }
            }
        }
    } );
})( gmu, gmu.$ );


//=============================suggestion widget==================
//包含sendrequest renderlist $quickdelete
/**
 * @file 搜索建议组件
 * @import core/widget.js, extend/touch.js, extend/highlight.js
 */
(function( $, win ) {

     /**
     * 搜索建议组件
     *
     * @class Suggestion
     * @constructor Html部分
     * ```html
     * <form action="http://www.baidu.com/s" method="get">
     *     <div class="search">
     *         <div class="search-input"><input type="text" id="input" name="wd"></div>
     *         <div class="search-button"><input type="submit" value="百度一下"></div>
     *     </div>
     * </form>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#input').suggestion({
     *      source: "../../data/suggestion.php"
     *  });
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Suggestion的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Suggestion:options)
     * @grammar $( el ).suggestion( options ) => zepto
     * @grammar new gmu.Suggestion( el, options ) => instance
     */
    
    var guid = 0;

    gmu.define( 'Suggestion', {

        // 默认options
        options: {

            /**
             * @property {Element | Zepto | Selector} container 父元素，若为render模式，则为必选
             * @namespace options
             */
            
            /**
             * @property {String} source 请求数据的url，若不自定义sendRequest，则为必选
             * @namespace options
             */
            
            /**
             * @property {String} [param=''] url附加参数
             * @namespace options
             */
            
            /**
             * @property {String | Element} [form] 提交搜索的表单，默认为包含input框的第一个父级form
             * @namespace options
             */
            
            /**
             * @property {Boolean | String} [historyShare=true] 多个sug之间是否共享历史记录，可传入指定的key值。若传默认传true，则使用默认key：'SUG-Sharing-History'，若传false，即表示不共享history；若传string，则为该值+'-SUG-Sharing-History'作为key值
             * @namespace options
             */
            historyShare: true,

            /**
             * @property {Boolean} [confirmClearHistory=true] 删除历史记录时是否确认
             * @namespace options
             */
            confirmClearHistory: true,

            /**
             * @property {Boolean} [autoClose=true] 点击input之外自动关闭
             * @namespace options
             */
            autoClose: false
        },

        template: {

            // ui-suggestion的class必须有
            // ontent, button, clear, close这几个div必须有，其他的可以更改
            wrapper: '<div class="ui-suggestion">' +
                '<div class="ui-suggestion-content"></div>' +
                '<div class="ui-suggestion-button">' +
                '<span class="ui-suggestion-clear">清除历史记录</span>' +
                '<span class="ui-suggestion-close">关闭</span>' +
                '</div></div>'
        },

        _initDom: function() {
            var me = this,
                $input = me.getEl().attr( 'autocomplete', 'off'),
                $parent = $input.parent('.ui-suggestion-mask');

            $parent.length ? me.$mask = $parent :
                    $input.wrap( me.$mask =
                    $( '<div class="ui-suggestion-mask"></div>' ) );

            // 考采用template的wrapper项渲染列表
            me.$mask.append( me.tpl2html( 'wrapper' ) );

            me.$wrapper = me.$mask.find( '.ui-suggestion' )
                    .prop('id', 'ui-suggestion-' + (guid++));
            me.$content = me.$wrapper
                    .css( 'top', $input.height() + (me.wrapperTop =
                    parseInt( me.$wrapper.css( 'top' ), 10 ) || 0) )
                    .find( '.ui-suggestion-content' );

            me.$btn = me.$wrapper.find( '.ui-suggestion-button' );
            me.$clearBtn = me.$btn.find( '.ui-suggestion-clear' );
            me.$closeBtn = me.$btn.find( '.ui-suggestion-close' );

            return me.trigger('initdom');
        },

        _bindEvent: function() {
            var me = this,
                $el = me.getEl(),
                ns = me.eventNs;

            me._options.autoClose && $( document ).on( 'tap' + ns, function( e ) {

                // 若点击是的sug外边则关闭sug
                !$.contains( me.$mask.get( 0 ), e.target ) && me.hide();
            } );

            $el.on( 'focus' + ns, function() {

                // 当sug已经处于显示状态时，不需要次showlist
                !me.isShow && me._showList().trigger( 'open' );
            } );

            $el.on( 'input' + ns, function() {

                // 考虑到在手机上输入比较慢，故未进行稀释处理
                me._showList();
            } );

            me.$clearBtn.on( 'click' + ns, function() {

                //清除历史记录
                me.history( null );
            } ).highlight( 'ui-suggestion-highlight' );

            me.$closeBtn.on( 'click' + ns, function() {

                // 隐藏sug
                me.getEl().blur();
                me.hide().trigger( 'close' );
            } ).highlight( 'ui-suggestion-highlight' );

            return me;
        },

        _create: function() {
            var me = this,
                opts = me._options,
                hs = opts.historyShare;

            opts.container && (me.$el = $(opts.container));

            // 若传默认传true，则使用默认key：'SUG-Sharing-History'
            // 若传false，即表示不共享history，以该sug的id作为key值
            // 若传string，则在此基础上加上'SUG-Sharing-History'
            me.key = hs ?
                    (($.type( hs ) === 'boolean' ? '' : hs + '-') +
                    'SUG-Sharing-History') :
                    me.getEl().attr( 'id' ) || ('ui-suggestion-' + (guid++));

            // localStorage中数据分隔符
            me.separator = encodeURIComponent( ',' );

            // 创建dom，绑定事件
            me._initDom()._bindEvent();

            return me;
        },

        /**
         * 展示suglist，分为query存在和不存在
         * @private
         */
        _showList: function() {
            var me = this,
                query = me.value(),
                data;

            if ( query ) {

                // 当query不为空，即input或focus时,input有值
                // 用户自己发送请求或直接本地数据处理，可以在sendrequest中处理
                me.trigger( 'sendrequest', query, $.proxy( me._render, me ),
                        $.proxy( me._cacheData, me ));

            } else {

                // query为空，即刚开始focus时，读取localstorage中的数据渲染
                (data = me._localStorage()) ?
                        me._render( query, data.split( me.separator ) ) :
                        me.hide();
            }

            return me;
        },

        _render: function( query, data ) {

            this.trigger( 'renderlist', data, query, $.proxy( this._fillWrapper, this ) );
        },

        /**
         * 根据数据填充sug wrapper
         * @listHtml 填充的sug片段，默认为'<ul><li>...</li>...</ul>'
         * @private
         */
        _fillWrapper: function( listHtml ) {

            // 数据不是来自历史记录时隐藏清除历史记录按钮
            this.$clearBtn[ this.value() ? 'hide' : 'show' ]();
            listHtml ? (this.$content.html( listHtml ), this.show()) :
                    this.hide();

            return this;
        },

        _localStorage: function( value ) {
            var me = this,
                key = me.key,
                separator = me.separator,
                localStorage,
                data;

            try {

                localStorage = win.localStorage;

                if ( value === undefined ) {    // geter
                    return localStorage[ key ];

                } else if ( value === null ) {    // setter clear
                    localStorage[ key ] = '';

                } else if ( value ) {    // setter
                    data = localStorage[ key ] ?
                            localStorage[ key ].split( separator ) : [];

                    // 数据去重处理
                    // todo 对于兼容老格式的数据中有一项会带有\u001e，暂未做判断
                    if ( !~$.inArray( value, data ) ) {
                        data.unshift( value );
                        localStorage[ key ] = data.join( separator );
                    }
                }

            } catch ( ex ) {
                console.log( ex.message );
            }

            return me;
        },

        _cacheData: function( key, value ) {
            this.cacheData || (this.cacheData = {});

            return value !== undefined ?
                this.cacheData[ key ] = value : this.cacheData[ key ];
        },

        /**
         * 获取input值
         * @method value
         * @return {String} input中的值
         */
        value: function() {
            return this.getEl().val();
        },

        /**
         * 设置|获取|清空历史记录
         * @method history
         * @param {String} [value] 不传value表示清除sug历史记录，传value表示存值
         */
        history: function( value ) {
            var me = this,
                clearHistory = value !== null || function() {
                    return me._localStorage( null).hide();
                };

            return value === null ? (me._options.confirmClearHistory ?
                win.confirm( '清除全部查询历史记录？' ) && clearHistory() :
                clearHistory()) : me._localStorage( value )
        },

        /**
         * 显示sug
         * @method show
         */
        show: function() {

            if ( !this.isShow ) {
                this.$wrapper.show();
                this.isShow = true;
                return this.trigger( 'show' );
            }else{
                return this;
            }

        },

        /**
         * 隐藏sug
         * @method hide
         */
        hide: function() {

            if ( this.isShow ) {
                this.$wrapper.hide();
                this.isShow = false;
                return this.trigger( 'hide' );
            }else{
                return this;
            }

        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            var me = this,
                $el = me.getEl(),
                ns = me.ns;

            // 先执行父级destroy，保证插件或option中的destroy先执行
            me.trigger( 'destroy' );

            $el.off( ns );
            me.$mask.replaceWith( $el );
            me.$clearBtn.off( ns );
            me.$closeBtn.off( ns );
            me.$wrapper.children().off().remove();
            me.$wrapper.remove();
            me._options.autoClose && $( document ).off( ns );

            this.destroyed = true;

            return me;
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event initdom
         * @param {Event} e gmu.Event对象
         * @param {Zepto} $el slider元素
         * @description DOM创建完成后触发
         */
        
        /**
         * @event show
         * @param {Event} e gmu.Event对象
         * @description 显示sug时触发
         */
        
        /**
         * @event hide
         * @param {Event} e gmu.Event对象
         * @param {Number} index 当前slide的序号
         * @description 隐藏sug时触发
         */
        
        /**
         * @event sendrequest
         * @param {Event} e gmu.Event对象
         * @param {String} query 用户输入查询串
         * @param {Function} render 数据请求完成后的渲染回调函数，其参数为query,data
         * @param {Function} cacheData 缓存query的回调函数，其参数为query, data
         * @description 发送请求时触发
         */
        
        /**
         * @event renderlist
         * @param {Event} e gmu.Event对象
         * @param {Array} data 渲染的数据
         * @param {String} query 用户输入的查询串
         * @param {Function} fillWrapper 列表渲染完成后的回调函数，参数为listHtml片段
         * @description 渲染sug list时触发
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );
})( gmu.$, window );

/**
 * @file sendRequest
 * @import widget/suggestion/suggestion.js
 */

(function( $, win ) {

    $.extend( gmu.Suggestion.options, {

        /**
         * @property {Boolean} [isCache=true] 发送请求返回数据后是否缓存query请求结果
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.sendrequest
         */
        isCache: true,

        /**
         * @property {String} [queryKey='wd'] 发送请求时query的key值
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.sendrequest
         */
        
        queryKey: 'wd',

        /**
         * @property {String} [cbKey='cb'] 发送请求时callback的name
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.sendrequest
         */
        cbKey: 'cb',

        /**
         * @property {Function} [sendrequest=null] 自定义发送请求函数，可以覆盖默认发送请求的方法
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.sendrequest
         */
        sendrequest: null
    } );

    /**
     * sendRequest，默认sendRequest为jsonp方式取数据，若用户自己用数据填充sug，即该option为Function类型，则不需要使用此插件<br />
     * 默认以jsonp发送请求，当用户在option中配置了sendRequest时，需要调用用e.preventDefault来阻默认请求数据方法
     * @class sendrequest
     * @namespace Suggestion
     * @pluginfor Suggestion
     */
    gmu.Suggestion.option( 'sendrequest', function() {

        // 当sendRequest不是Function类型时，该option操作生效
        return $.type( this._options.sendrequest ) !== 'function';

    }, function() {
        var me = this,
            opts = me._options,
            queryKey = opts.queryKey,
            cbKey = opts.cbKey,
            param = opts.param,
            isCache = opts.isCache,
            cdata;

        this.on( 'sendrequest', function( e, query, callback, cacheData ) {

            var url = opts.source,

            // 以date作为后缀，应该不会重复，故不作origin
                cb = 'suggestion_' + (+new Date());

            // 若缓存中存数请求的query数据，则不发送请求
            if ( isCache && (cdata = cacheData( query )) ) {
                callback( query, cdata );
                return me;

            }

            // 替换url后第一个参数的连接符?&或&为?
            url = (url + '&' + queryKey + '=' + encodeURIComponent( query ))
                    .replace( /[&?]{1,2}/, '?' );

            !~url.indexOf( '&' + cbKey ) &&  (url += '&' + cbKey + '=' + cb);

            param && (url += '&' + param);

            win[ cb ] = function( data ) {

                /*
                 * 渲染数据并缓存请求数据
                 * 返回的数据格式如下：
                 * {
                 *     q: "a",
                 *     p: false,
                 *     s: ["angelababy", "akb48", "after school",
                 *     "android", "angel beats!", "a pink", "app"]
                 * }
                 */
                callback( query, data.s );

                // 缓存请求的query
                isCache && cacheData( query, data.s );

                delete win[ cb ];
            };

            // 以jsonp形式发送请求
            $.ajax({
                url: url,
                dataType: 'jsonp'
            });

            return me;
        } );

    } );
})( gmu.$, window );

/**
 * @file renderList
 * @import widget/suggestion/suggestion.js, extend/highlight.js
 */
(function( $ ) {

    $.extend( gmu.Suggestion.options, {

        /**
         * @property {Boolean} [isHistory=true] 是否在localstorage中存储用户查询记录，相当于2.0.5以前版本中的isStorage
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.renderlist
         */
        isHistory: true,

        /**
         * @property {Boolean} [usePlus=false] 是否使用+来使sug item进入input框
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.renderlist
         */
        usePlus: false,

        /**
         * @property {Number} [listCount=5] sug列表条数
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.renderlist
         */
        listCount: 5,

        /**
         * @property {Function} [renderlist=null] 自定义渲染列表函数，可以覆盖默认渲染列表的方法
         * @namespace options
         * @for Suggestion
         * @uses Suggestion.renderlist
         */
        renderlist: null
    } );

    /**
     * renderList，提供默认列表渲染，若需要自己渲染sug列表，即renderList为Function类型，则不需要使用此插件<br />
     * 默认以jsonp发送请求，当用户在option中配置了renderList时，需要调用用e.preventDefault来阻默认请求数据方法
     * @class renderlist
     * @namespace Suggestion
     * @pluginfor Suggestion
     */
    gmu.Suggestion.option( 'renderlist', function() {

        // 当renderList不是Function类型时，该option操作生效
        return $.type( this._options.renderlist ) !== 'function';

    }, function() {

        var me = this,
            $xssElem = $( '<div></div>'),
            _xssFilter = function( str ) {
                return $xssElem.text( str ).html();
            },

            // 渲染sug list列表，返回list array
            _createList = function( query, sugs ) {
                var opts = me._options,
                    html = [],
                    str = '',
                    sug,
                    len,
                    i;

                if ( !sugs || !sugs.length ) {
                    me.hide();
                    return html;
                }

                sugs = sugs.slice( 0, opts.listCount );

                // 防止xss注入，通过text()方法转换一下
                query = _xssFilter( query || '' );

                // sug列表渲染比较频繁，故不采用模板来解析
                for ( i = 0, len = sugs.length; i < len; i++ ) {
                    str = _xssFilter( sug = sugs[ i ] );

                    // 若是query为空则不需要进行替换
                    query && (str = $.trim( sug )
                        .replace( query, '<span>' + query + '</span>' ));

                    opts.usePlus &&
                            (str += '<div class="ui-suggestion-plus" ' +
                                'data-item="' + sug + '"></div>');

                    html.push( '<li>' + str + '</li>' );
                }

                return html;
            };

        me.on( 'ready', function() {
            var me = this,
                ns = me.eventNs,
                $form = $( me._options.form || me.getEl().closest( 'form' ));

            // 绑定form的submit事件
            $form.size() && (me.$form = $form .on( 'submit' + ns,
                    function( e ) {
                        var submitEvent = gmu.Event('submit');

                        me._options.isHistory &&
                        me._localStorage( me.value() );

                        me.trigger( submitEvent );

                        // 阻止表单默认提交事件
                        submitEvent.isDefaultPrevented() && e.preventDefault();
                    }));

            // todo 待验证，新闻页面不会有该bug，待排查原因，中文输入不跳转的bug
            me.$content.on( 'touchstart' + ns, function(e) {
                e.preventDefault();
            });

            // 注册tap事件由于中文输入法时，touch事件不能submit
            me.$content.on( 'tap' + ns, function(e) {
                var $input = me.getEl(),
                    $elem = $( e.target );

                // 点击加号，input值上框
                if ( $elem.hasClass( 'ui-suggestion-plus' ) ) {
                    $input.val( $elem.attr( 'data-item' ) );
                } else if ( $.contains( me.$content.get( 0 ),
                    $elem.get( 0 ) ) ) {

                    // 点击sug item, 防止使用tap造成穿透
                    setTimeout( function() {
                        $input.val( $elem.text() );
                        me.trigger( 'select', $elem )
                            .hide().$form.submit();
                    }, 400 );
                }
            }).highlight( 'ui-suggestion-highlight' );

            me.on( 'destroy', function() {
                $form.size() && $form.off( ns );
                me.$content.off();
            } );
        } );

        me.on( 'renderlist', function( e, data, query, callback ) {
            var ret = _createList( query, data );

            // 回调渲染suglist
            return callback( ret.length ?
                        '<ul>' + ret.join( ' ' ) + '</ul>' : '' );
        } );
    } );

})( gmu.$ );
/**
 * @file quickdelete插件
 * @import widget/suggestion/suggestion.js
 */
(function( gmu, $ ) {

    /**
     * quickdelete插件
     * @class quickdelete
     * @namespace Suggestion
     * @pluginfor Suggestion
     */
    gmu.Suggestion.register( 'quickdelete', {

        _init: function() {
            var me = this,
                $input,
                ns;

            me.on( 'ready', function() {
                $input = me.getEl();
                ns = me.eventNs;

                me.$mask.append( me.$quickDel =
                    $( '<div class="ui-suggestion-quickdel"></div>' ) );

                $input.on('focus' + ns + ' input' + ns, function() {
                    me[ '_quickDel' +
                        ($.trim( $input.val() ) ? 'Show' : 'Hide') ]();
                });

                $input.on( 'blur' + ns, function() {
                    me._quickDelHide();
                });

                // 绑tap事件，touchend会失焦点，键盘收起，故绑touchstart并阻止默认行为
                me.$quickDel.on( 'touchstart' + ns, function( e ) {
                    e.preventDefault();    // 阻止默认事件，否则会触发blur，键盘收起
                    e.formDelete = true;    // suggestion解决删除问题
                    $input.val('');
                    me.trigger('delete').trigger('input')._quickDelHide();

                    // 中文输入时，focus失效 trace:FEBASE-779
                    $input.blur().focus();
                } );

                me.on( 'destroy', function() {
                    me.$quickDel.off().remove();
                } );
            } );
        },

        _quickDelShow: function() {

            if ( !this.quickDelShow ) {

                gmu.staticCall( this.$quickDel.get(0),
                        'css', 'visibility', 'visible' );

                this.quickDelShow = true
            }
        },

        _quickDelHide: function() {

            if ( this.quickDelShow ) {

                gmu.staticCall( this.$quickDel.get(0),
                    'css', 'visibility', 'hidden' );

                this.quickDelShow = false
            }
        }
    } );

})( gmu, gmu.$ );


//======================taps widget==============================
//包含$swipe $ajax
/**
 * @file 选项卡组件
 * @import extend/touch.js, core/widget.js, extend/highlight.js, extend/event.ortchange.js
 * @importCSS transitions.css, loading.css
 * @module GMU
 */

(function( gmu, $, undefined ) {
    var _uid = 1,
        uid = function(){
            return _uid++;
        },
        idRE = /^#(.+)$/;

    /**
     * 选项卡组件
     *
     * @class Tabs
     * @constructor Html部分
     * ```html
     * <div id="tabs">
     *      <ul>
     *         <li><a href="#conten1">Tab1</a></li>
     *         <li><a href="#conten2">Tab2</a></li>
     *         <li><a href="#conten3">Tab3</a></li>
     *     </ul>
     *     <div id="conten1">content1</div>
     *     <div id="conten2"><input type="checkbox" id="input1" /><label for="input1">选中我后tabs不可切换</label></div>
     *     <div id="conten3">content3</div>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#tabs').tabs();
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化Tab的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Tabs:options)
     * @grammar $( el ).tabs( options ) => zepto
     * @grammar new gmu.Tabs( el, options ) => instance
     */
    gmu.define( 'Tabs', {
        options: {

            /**
             * @property {Number} [active=0] 初始时哪个为选中状态，如果时setup模式，如果第2个li上加了ui-state-active样式时，active值为1
             * @namespace options
             */
            active: 0,

            /**
             * @property {Array} [items=null] 在render模式下需要必须设置 格式为\[{title:\'\', content:\'\', href:\'\'}\], href可以不设，可以用来设置ajax内容
             * @namespace options
             */
            items:null,

            /**
             * @property {String} [transition='slide'] 设置切换动画，目前只支持slide动画，或无动画
             * @namespace options
             */
            transition: 'slide'
        },

        template: {
            nav:'<ul class="ui-tabs-nav">'+
                '<% var item; for(var i=0, length=items.length; i<length; i++) { item=items[i]; %>'+
                    '<li<% if(i==active){ %> class="ui-state-active"<% } %>><a href="javascript:;"><%=item.title%></a></li>'+
                '<% } %></ul>',
            content:'<div class="ui-viewport ui-tabs-content">' +
                '<% var item; for(var i=0, length=items.length; i<length; i++) { item=items[i]; %>'+
                    '<div<% if(item.id){ %> id="<%=item.id%>"<% } %> class="ui-tabs-panel <%=transition%><% if(i==active){ %> ui-state-active<% } %>"><%=item.content%></div>'+
                '<% } %></div>'
        },

        _init:function () {
            var me = this, _opts = me._options, $el, eventHandler = $.proxy(me._eventHandler, me);

            me.on( 'ready', function(){
                $el = me.$el;
                $el.addClass('ui-tabs');
                _opts._nav.on('tap', eventHandler).children().highlight('ui-state-hover');
            } );

            $(window).on('ortchange', eventHandler);
        },

        _create:function () {
            var me = this, _opts = me._options;

            if( me._options.setup && me.$el.children().length > 0 ) {
                me._prepareDom('setup', _opts);
            } else {
                _opts.setup = false;
                me.$el = me.$el || $('<div></div>');
                me._prepareDom('create', _opts);
            }
        },

        _prepareDom:function (mode, _opts) {
            var me = this, content, $el = me.$el, items, nav, contents, id;
            switch (mode) {
                case 'setup':
                    _opts._nav =  me._findElement('ul').first();
                    if(_opts._nav) {
                        _opts._content = me._findElement('div.ui-tabs-content');
                        _opts._content = ((_opts._content && _opts._content.first()) || $('<div></div>').appendTo($el)).addClass('ui-viewport ui-tabs-content');
                        items = [];
                        _opts._nav.addClass('ui-tabs-nav').children().each(function(){
                            var $a = me._findElement('a', this), href = $a?$a.attr('href'):$(this).attr('data-url'), id, $content;
                            id = idRE.test(href)? RegExp.$1: 'tabs_'+uid();
                            ($content = me._findElement('#'+id) || $('<div id="'+id+'"></div>'))
                                .addClass('ui-tabs-panel'+(_opts.transition?' '+_opts.transition:''))
                                .appendTo(_opts._content);
                            items.push({
                                id: id,
                                href: href,
                                title: $a?$a.attr('href', 'javascript:;').text():$(this).text(),//如果href不删除的话，地址栏会出现，然后一会又消失。
                                content: $content
                            });
                        });
                        _opts.items = items;
                        _opts.active = Math.max(0, Math.min(items.length-1, _opts.active || $('.ui-state-active', _opts._nav).index()||0));
                        me._getPanel().add(_opts._nav.children().eq(_opts.active)).addClass('ui-state-active');
                        break;
                    } //if cannot find the ul, switch this to create mode. Doing this by remove the break centence.
                default:
                    items = _opts.items = _opts.items || [];
                    nav = [];
                    contents = [];
                    _opts.active = Math.max(0, Math.min(items.length-1, _opts.active));
                    $.each(items, function(key, val){
                        id = 'tabs_'+uid();
                        nav.push({
                            href: val.href || '#'+id,
                            title: val.title
                        });
                        contents.push({
                            content: val.content || '',
                            id: id
                        });
                        items[key].id = id;
                    });
                    _opts._nav = $( this.tpl2html( 'nav', {items: nav, active: _opts.active} ) ).prependTo($el);
                    _opts._content = $( this.tpl2html( 'content', {items: contents, active: _opts.active, transition: _opts.transition} ) ).appendTo($el);
                    _opts.container = _opts.container || ($el.parent().length ? null : 'body');
            }
            _opts.container && $el.appendTo(_opts.container);
            me._fitToContent(me._getPanel());
        },

        _getPanel: function(index){
            var _opts = this._options;
            return $('#' + _opts.items[index === undefined ? _opts.active : index].id);
        },

        _findElement:function (selector, el) {
            var ret = $(el || this.$el).find(selector);
            return ret.length ? ret : null;
        },

        _eventHandler:function (e) {
            var match, _opts = this._options;
            switch(e.type) {
                case 'ortchange':
                    this.refresh();
                    break;
                default:
                    if((match = $(e.target).closest('li', _opts._nav.get(0))) && match.length) {
                        e.preventDefault();
                        this.switchTo(match.index());
                    }
            }
        },

        _fitToContent: function(div) {
            var _opts = this._options, $content = _opts._content;
            _opts._plus === undefined && (_opts._plus = parseFloat($content.css('border-top-width'))+parseFloat($content.css('border-bottom-width')))
            $content.height( div.height() + _opts._plus);
            return this;
        },

        /**
         * 切换到某个Tab
         * @method switchTo
         * @param {Number} index Tab编号
         * @chainable
         * @return {self} 返回本身。
         */
        switchTo: function(index) {
            var me = this, _opts = me._options, items = _opts.items, eventData, to, from, reverse, endEvent;
            if(!_opts._buzy && _opts.active != (index = Math.max(0, Math.min(items.length-1, index)))) {
                to = $.extend({}, items[index]);//copy it.
                to.div = me._getPanel(index);
                to.index = index;

                from = $.extend({}, items[_opts.active]);//copy it.
                from.div = me._getPanel();
                from.index = _opts.active;

                eventData = gmu.Event('beforeActivate');
                me.trigger(eventData, to, from);
                if(eventData.isDefaultPrevented()) return me;

                _opts._content.children().removeClass('ui-state-active');
                to.div.addClass('ui-state-active');
                _opts._nav.children().removeClass('ui-state-active').eq(to.index).addClass('ui-state-active');
                if(_opts.transition) { //use transition
                    _opts._buzy = true;
                    endEvent = $.fx.animationEnd + '.tabs';
                    reverse = index>_opts.active?'':' reverse';
                    _opts._content.addClass('ui-viewport-transitioning');
                    from.div.addClass('out'+reverse);
                    to.div.addClass('in'+reverse).on(endEvent, function(e){
                        if (e.target != e.currentTarget) return //如果是冒泡上来的，则不操作
                        to.div.off(endEvent, arguments.callee);//解除绑定
                        _opts._buzy = false;
                        from.div.removeClass('out reverse');
                        to.div.removeClass('in reverse');
                        _opts._content.removeClass('ui-viewport-transitioning');
                        me.trigger('animateComplete', to, from);
                        me._fitToContent(to.div);
                    });
                }
                _opts.active = index;
                me.trigger('activate', to, from);
                _opts.transition ||  me._fitToContent(to.div);
            }
            return me;
        },

        /**
         * 当外部修改tabs内容好，需要调用refresh让tabs自动更新高度
         * @method refresh
         * @chainable
         * @return {self} 返回本身。
         */
        refresh: function(){
            return this._fitToContent(this._getPanel());
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy:function () {
            var _opts = this._options, eventHandler = this._eventHandler;
            _opts._nav.off('tap', eventHandler).children().highlight();
            _opts.swipe && _opts._content.off('swipeLeft swipeRight', eventHandler);

            if( !_opts.setup ) {
                this.$el.remove();
            }
            return this.$super('destroy');
        }

        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */

        /**
         * @event beforeActivate
         * @param {Event} e gmu.Event对象
         * @param {Object} to 包含如下属性：div(内容div), index(位置), title(标题), content(内容), href(链接)
         * @param {Object} from 包含如下属性：div(内容div), index(位置), title(标题), content(内容), href(链接)
         * @description 内容切换之前触发，可以通过e.preventDefault()来阻止
         */

        /**
         * @event activate
         * @param {Event} e gmu.Event对象
         * @param {Object} to 包含如下属性：div(内容div), index(位置), title(标题), content(内容), href(链接)
         * @param {Object} from 包含如下属性：div(内容div), index(位置), title(标题), content(内容), href(链接)
         * @description 内容切换之后触发
         */

        /**
         * @event animateComplete
         * @param {Event} e gmu.Event对象
         * @param {Object} to 包含如下属性：div(内容div), index(位置), title(标题), content(内容), href(链接)
         * @param {Object} from 包含如下属性：div(内容div), index(位置), title(标题), content(内容), href(链接)
         * @description 动画完成后执行，如果没有设置动画，此时间不会触发
         */

        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    });
})( gmu, gmu.$ );


/**
 * @file 左右滑动手势插件
 * @import widget/tabs/tabs.js
 */

(function ($, undefined) {
    var durationThreshold = 1000, // 时间大于1s就不算。
        horizontalDistanceThreshold = 30, // x方向必须大于30
        verticalDistanceThreshold = 70, // y方向上只要大于70就不算
        scrollSupressionThreshold = 30, //如果x方向移动大于这个直就禁掉滚动
        tabs = [],
        eventBinded = false,
        isFromTabs = function (target) {
            for (var i = tabs.length; i--;) {
                if ($.contains(tabs[i], target)) return true;
            }
            return false;
        }

    function tabsSwipeEvents() {
        $(document).on('touchstart.tabs', function (e) {
            var point = e.touches ? e.touches[0] : e, start, stop;

            start = {
                x:point.clientX,
                y:point.clientY,
                time:Date.now(),
                el:$(e.target)
            }

            $(document).on('touchmove.tabs',function (e) {
                var point = e.touches ? e.touches[0] : e, xDelta;
                if (!start)return;
                stop = {
                    x:point.clientX,
                    y:point.clientY,
                    time:Date.now()
                }
                if ((xDelta = Math.abs(start.x - stop.x)) > scrollSupressionThreshold ||
                    xDelta > Math.abs(start.y - stop.y)) {
                    isFromTabs(e.target) && e.preventDefault();
                } else {//如果系统滚动开始了，就不触发swipe事件
                    $(document).off('touchmove.tabs touchend.tabs');
                }
            }).one('touchend.tabs', function () {
                    $(document).off('touchmove.tabs');
                    if (start && stop) {
                        if (stop.time - start.time < durationThreshold &&
                            Math.abs(start.x - stop.x) > horizontalDistanceThreshold &&
                            Math.abs(start.y - stop.y) < verticalDistanceThreshold) {
                            start.el.trigger(start.x > stop.x ? "tabsSwipeLeft" : "tabsSwipeRight");
                        }
                    }
                    start = stop = undefined;
                });
        });
    }
    
    /**
     * 添加 swipe功能，zepto的swipeLeft, swipeRight不太准，所以在这另外实现了一套。
     * @class swipe
     * @namespace Tabs
     * @pluginfor Tabs
     */
    gmu.Tabs.register( 'swipe', {
        _init:function () {
            var _opts = this._options;

            this.on( 'ready', function(){
                tabs.push(_opts._content.get(0));
                eventBinded =  eventBinded || (tabsSwipeEvents(), true);
                this.$el.on('tabsSwipeLeft tabsSwipeRight', $.proxy(this._eventHandler, this));
            } );
        },
        _eventHandler:function (e) {
            var _opts = this._options, items, index;
            switch (e.type) {
                case 'tabsSwipeLeft':
                case 'tabsSwipeRight':
                    items = _opts.items;
                    if (e.type == 'tabsSwipeLeft' && _opts.active < items.length - 1) {
                        index = _opts.active + 1;
                    } else if (e.type == 'tabsSwipeRight' && _opts.active > 0) {
                        index = _opts.active - 1;
                    }
                    index !== undefined && (e.stopPropagation(), this.switchTo(index));
                    break;
                default://tap
                    return this.origin(e);
            }
        },
        destroy: function(){
            var _opts = this._options, idx;
            ~(idx = $.inArray(_opts._content.get(0), tabs)) && tabs.splice(idx, 1);
            this.$el.off('tabsSwipeLeft tabsSwipeRight', this._eventHandler);
            tabs.length || ($(document).off('touchstart.tabs'), eventBinded = false);
            return this.origin();
        }
    } );
})(Zepto);

/**
 * @file ajax插件
 * @import widget/tabs/tabs.js
 */
(function ($, undefined) {
    var idRE = /^#.+$/,
        loaded = {},
        tpl = {
            loading: '<div class="ui-loading">Loading</div>',
            error: '<p class="ui-load-error">内容加载失败!</p>'
        };

    /**
     * 在a上面href设置的是地址，而不是id，则组件认为这个为ajax类型的。在options上传入ajax对象可以配置[ajax选项](#$.ajax)
     * @class ajax
     * @namespace Tabs
     * @pluginfor Tabs
     */
    gmu.Tabs.register( 'ajax', {
        _init:function () {
            var _opts = this._options, items, i, length;

            this.on( 'ready', function(){
                items = _opts.items;
                for (i = 0, length = items.length; i < length; i++) {
                    items[i].href && !idRE.test(items[i].href) && (items[i].isAjax = true);
                }
                this.on('activate', this._onActivate);
                items[_opts.active].isAjax && this.load(_opts.active);//如果当前是ajax
            } );
        },

        destroy:function () {
            this.off('activate', this._onActivate);
            this.xhr && this.xhr.abort();
            return this.origin();
        },

        _fitToContent: function(div) {
            var _opts = this._options;

            if(!_opts._fitLock)return this.origin(div);
        },

        _onActivate:function (e, to) {
            to.isAjax && this.load(to.index);
        },

        /**
         * 加载内容，指定的tab必须是ajax类型。加载的内容会缓存起来，如果要强行再次加载，第二个参数传入true
         * @method load
         * @param {Number} index Tab编号
         * @param {Boolean} [force=false] 是否强制重新加载
         * @for Tabs
         * @uses Tabs.ajax
         * @return {self} 返回本身。
         */
        load:function (index, force) {
            var me = this, _opts = me._options, items = _opts.items, item, $panel, prevXHR;

            if (index < 0 ||
                index > items.length - 1 ||
                !(item = items[index]) || //如果范围错误
                !item.isAjax || //如果不是ajax类型的
                ( ( $panel = me._getPanel(index)).text() && !force && loaded[index] ) //如果没有加载过，并且tab内容为空
                )return this;

            (prevXHR = me.xhr) && setTimeout(function(){//把切出去没有加载玩的xhr abort了
                prevXHR.abort();
            }, 400);

            _opts._loadingTimer = setTimeout(function () {//如果加载在50ms内完成了，就没必要再去显示 loading了
                $panel.html(tpl.loading);
            }, 50);

            _opts._fitLock = true;

            me.xhr = $.ajax($.extend(_opts.ajax || {}, {
                url:item.href,
                context:me.$el.get(0),
                beforeSend:function (xhr, settings) {
                    var eventData = gmu.Event('beforeLoad');
                    me.trigger(eventData, xhr, settings);
                    if (eventData.isDefaultPrevented())return false;
                },
                success:function (response, xhr) {
                    var eventData = gmu.Event('beforeRender');
                    clearTimeout(_opts._loadingTimer);//清除显示loading的计时器
                    me.trigger(eventData, response, $panel, index, xhr)//外部可以修改data，或者直接把pannel修改了
                    if (!eventData.isDefaultPrevented()) {
                        $panel.html(response);
                    }
                    _opts._fitLock = false;
                    loaded[index] = true;
                    me.trigger('load', $panel);
                    delete me.xhr;
                    me._fitToContent($panel);
                },
                error:function () {
                    var eventData = gmu.Event('loadError');
                    clearTimeout(_opts._loadingTimer);//清除显示loading的计时器
                    loaded[index] = false;
                    me.trigger(eventData, $panel);
                    if(!eventData.isDefaultPrevented()){
                        $panel.html(tpl.error);
                    }
                    delete me.xhr;
                }
            }));
        }
        
        /**
         * @event beforeLoad
         * @param {Event} e gmu.Event对象
         * @param {Object} xhr xhr对象
         * @param {Object} settings ajax请求的参数
         * @description 在请求前触发，可以通过e.preventDefault()来取消此次ajax请求
         * @for Tabs
         * @uses Tabs.ajax
         */
        
        /**
         * @event beforeRender
         * @param {Event} e gmu.Event对象
         * @param {Object} response 返回值
         * @param {Object} panel 对应的Tab内容的容器
         * @param {Number} index Tab的序号
         * @param {Object} xhr xhr对象
         * @description ajax请求进来数据，在render到div上之前触发，对于json数据，可以通过此方来自行写render，然后通过e.preventDefault()来阻止，将response输出在div上
         * @for Tabs
         * @uses Tabs.ajax
         */
        
        /**
         * @event load
         * @param {Event} e gmu.Event对象
         * @param {Zepto} panel 对应的Tab内容的容器
         * @description 当ajax请求到的内容过来后，平已经Render到div上了后触发
         * @for Tabs
         * @uses Tabs.ajax
         */
        
        /**
         * @event loadError
         * @param {Event} e gmu.Event对象
         * @param {Zepto} panel 对应的Tab内容的容器
         * @description 当ajax请求内容失败时触发，如果此事件被preventDefault了，则不会把自带的错误信息Render到div上
         * @for Tabs
         * @uses Tabs.ajax
         */
    } );
})(Zepto);

//============================toolbar widget================
//包含$position
/**
 * @file 工具栏组件
 * @import core/widget.js
 * @module GMU
 */
(function( gmu, $ ) {
    /**
     * 工具栏组件
     *
     * @class Toolbar
     * @constructor Html部分
     * ```html
     * <div id="J_toolbar">
     *      <a href="../">返回</a>
     *      <h2>工具栏</h2>
     *     <span class="btn_1"><span>百科</span></span>
     *     <span class="btn_1">知道</span>
     * </div>
     * ```
     *
     * javascript部分
     * ```javascript
     * $('#J_toolbar').toolbar({});
     * ```
     * @param {dom | zepto | selector} [el] 用来初始化工具栏的元素
     * @param {Object} [options] 组件配置项。具体参数请查看[Options](#GMU:Toolbar:options)
     * @grammar $( el ).toolbar( options ) => zepto
     * @grammar new gmu.Toolbar( el, options ) => instance
     */
    gmu.define( 'Toolbar', {

        options: {

            /**
             * @property {Zepto | Selector | Element} [container=document.body] toolbar的最外层元素
             * @namespace options
             */
            container: document.body,

            /**
             * @property {String} [title='标题'] toolbar的标题
             * @namespace options
             */
            title: '标题',

            /**
             * @property {Array} [leftBtns] 标题左侧的按钮组，支持html、gmu button实例
             * @namespace options
             */
            leftBtns: [],

            /**
             * @property {Array} [rightBtns] 标题右侧的按钮组，支持html、gmu button实例
             * @namespace options
             */
            rightBtns: [],

            /**
             * @property {Boolean} [fixed=false] toolbar是否固定位置
             * @namespace options
             */
            fixed: false
        },

        _init: function() {
            var me = this,
                opts = me._options,
                $el;

            // 设置container的默认值
            if( !opts.container ) {
                opts.container = document.body;
            }

            me.on( 'ready', function() {
                $el = me.$el;

                if( opts.fixed ) {
                    // TODO 元素id的处理
                    var placeholder = $( '<div class="ui-toolbar-placeholder"></div>' ).height( $el.offset().height ).
                        insertBefore( $el ).append( $el ).append( $el.clone().css({'z-index': 1, position: 'absolute',top: 0}) ),
                        top = $el.offset().top,
                        check = function() {
                            document.body.scrollTop > top ? $el.css({position:'fixed', top: 0}) : $el.css('position', 'absolute');
                        },
                        offHandle;

                    $(window).on( 'touchmove touchend touchcancel scroll scrollStop', check );
                    $(document).on( 'touchend touchcancel', offHandle = function() {
                        setTimeout( function() {
                            check();
                        }, 200 );
                    } );
                    me.on( 'destroy', function() {
                        $(window).off('touchmove touchend touchcancel scroll scrollStop', check);
                        $(document).off('touchend touchcancel', offHandle);
                        
                        // 删除placeholder，保留原来的Toolbar节点
                        $el.insertBefore(placeholder);
                        placeholder.remove();
                        me._removeDom();
                    } );

                    check();
                }
            } );

            me.on( 'destroy', function() {
                me._removeDom();
            } );
        },

        _create: function() {
            var me = this,
                opts = me._options,
                $el = me.getEl(),
                container = $( opts.container ),
                children = [],
                btnGroups = me.btnGroups = {
                    left: [],
                    right: []
                },
                currentGroup = btnGroups['left'];

            // render方式，需要先创建Toolbar节点
            if( !opts.setup ) {
                ($el && $el.length > 0) ?
                    $el.appendTo(container) :   // 如果el是一个HTML片段，将其插入container中
                    ($el = me.$el = $('<div>').appendTo( container ));  // 否则，创建一个空div，将其插入container中
            }

            // 从DOM中取出按钮组
            children = $el.children();
            $toolbarWrap = $el.find('.ui-toolbar-wrap');
            if( $toolbarWrap.length === 0 ){
                $toolbarWrap = $('<div class="ui-toolbar-wrap"></div>').appendTo($el);
            }else{
                children = $toolbarWrap.children();
            }

            children.forEach( function( child ) {
                $toolbarWrap.append(child);

                /^[hH]/.test( child.tagName ) ? 
                    (currentGroup = btnGroups['right'], me.title = child) :
                    currentGroup.push( child );
            } );

            // 创建左侧按钮组的容器
            var leftBtnContainer = $toolbarWrap.find('.ui-toolbar-left');
            var rightBtnContainer = $toolbarWrap.find('.ui-toolbar-right');
            if( leftBtnContainer.length === 0 ) {
                leftBtnContainer = children.length ? $('<div class="ui-toolbar-left">').insertBefore(children[0]) : $('<div class="ui-toolbar-left">').appendTo($toolbarWrap);
                btnGroups['left'].forEach( function( btn ) {
                    $(btn).addClass('ui-toolbar-button');
                    leftBtnContainer.append( btn );
                } );
                
                // 没有左侧容器，则认为也没有右侧容器，不需要再判断是否存在右侧容器
                rightBtnContainer = $('<div class="ui-toolbar-right">').appendTo($toolbarWrap);
                btnGroups['right'].forEach( function( btn ) {
                    $(btn).addClass('ui-toolbar-button');
                    rightBtnContainer.append( btn );
                } );
            }

            $el.addClass( 'ui-toolbar' );
            $(me.title).length ? $(me.title).addClass( 'ui-toolbar-title' ) : $('<h1 class="ui-toolbar-title">' + opts.title + '</h1>').insertAfter(leftBtnContainer);;

            me.btnContainer = {
                'left': leftBtnContainer,
                'right': rightBtnContainer
            };

            me.addBtns( 'left', opts.leftBtns );
            me.addBtns( 'right', opts.rightBtns );
        },

        _addBtn: function( container, btn ) {
            var me = this;

            $( btn ).appendTo( container ).addClass('ui-toolbar-button');
        },

        /**
         * 添加按钮组
         * @method addBtns
         * @param {String} [position=right] 按钮添加的位置，left或者right
         * @param {Array} btns 要添加的按钮组，每个按钮可以是一个gmu Button实例，或者元素，或者HTML片段
         * @return {self} 返回本身
         */
        addBtns: function( position, btns ) {
            var me = this,
                btnContainer = me.btnContainer[position],
                toString = Object.prototype.toString;

            // 向下兼容：如果没有传position，认为在右侧添加按钮
            if( toString.call(position) != '[object String]' ) {
                btns = position;
                btnContainer = me.btnContainer['right'];
            }

            btns.forEach( function( btn, index ) {
                // 如果是gmu组件实例，取实例的$el
                if( btn instanceof gmu.Base ) {
                    btn = btn.getEl();
                }
                me._addBtn( btnContainer, btn );
            });

            return me;
        },

        /**
         * 显示Toolbar
         * @method show
         * @return {self} 返回本身。
         */
        
        /**
         * @event show
         * @param {Event} e gmu.Event对象
         * @description Toolbar显示时触发
         */
        show: function() {
            var me = this;

            me.$el.show();
            me.trigger( 'show' );
            me.isShowing = true;

            return me;
        },

        /**
         * 隐藏Toolbar
         * @method hide
         * @return {self} 返回本身。
         */
        
        /**
         * @event hide
         * @param {Event} e gmu.Event对象
         * @description Toolbar隐藏时触发
         */
        hide: function() {
            var me = this;

            me.$el.hide();
            me.trigger( 'hide' );
            me.isShowing = false;

            return me;
        },

        /**
         * 交换Toolbar（显示/隐藏）状态
         * @method toggle
         * @return {self} 返回本身。
         */
        toggle: function() {
            var me = this;

            me.isShowing === false ? 
                me.show() : me.hide();

            return me;
        },

        _removeDom: function(){
            var me = this,
                $el = me.$el;

            if( me._options.setup === false ) {   // 如果是通过render模式创建，移除节点
                $el.remove();
            } else {    // 如果是通过setup模式创建，保留节点
                $el.css('position', 'static').css('top', 'auto');
            }
        }


        /**
         * @event ready
         * @param {Event} e gmu.Event对象
         * @description 当组件初始化完后触发。
         */
        
        /**
         * @event destroy
         * @param {Event} e gmu.Event对象
         * @description 组件在销毁的时候触发
         */
    } );
})( gmu, gmu.$ );

/**
 * @file Toolbar fix插件
 * @module GMU
 * @import widget/toolbar/toolbar.js, extend/fix.js
 */
(function( gmu, $ ) {
    /**
     * Toolbar position插件，调用position方法可以将Toolbar固定在某个位置。
     *
     * @class position
     * @namespace Toolbar
     * @pluginfor Toolbar
     */
    gmu.Toolbar.register( 'position', {
        /**
         * 定位Toolbar
         * @method position
         * @param {Object} opts 定位参数，格式与$.fn.fix参数格式相同
         * @for Toolbar
         * @uses Toolbar.position
         * @return {self} 返回本身。
         */
        position: function( opts ) {
            this.$el.fix( opts );

            return this;
        }
    } );
})( gmu, gmu.$ );

