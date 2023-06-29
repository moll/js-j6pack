var Jsx = require("./lib/markup")
var Markup = Jsx.Markup
var renderChild = Jsx.renderChild
var renderAttrs = Jsx.renderAttributes
var typeOf = Jsx.typeOf
var VOID_ELEMENTS = require("./lib/void_elements")
var VOID_ERR = "Children given to self-closing element: "
var EMPTY_ARR = Array.prototype
var DOCTYPE = "<!DOCTYPE html>\n"
exports = module.exports = Jsx.bind(null, render)
exports.Fragment = Jsx.Fragment
exports.Html = Html
exports.html = newHtml

function render(tagName, attrs, children) {
	var tag = "<" + tagName
	if (attrs && !isEmpty(attrs)) tag += " " + renderAttrs(attrs)

	if (tagName in VOID_ELEMENTS) {
		if (children && children.length) throw new RangeError(VOID_ERR + tagName)
		return new Html(tag + " />")
	}
	else {
		var renderTagChild = tagName == "script" ? renderScriptChild : renderChild
		children = (children || EMPTY_ARR).reduce(renderTagChild, [])
		return new Html(tag + ">" + children.join("") + "</" + tagName + ">")
	}
}

function renderScriptChild(children, child) {
	switch (typeOf(child)) {
		case "undefined":
		case "null": break
		case "boolean":
		case "number": children.push(child); break
		case "string": children.push(escapeScript(child)); break
		case "array": return child.reduce(renderScriptChild, children)

		case "object":
			// NOTE: This doesn't escape </script> in nested tags (which get rendered
			// to Html instances by the Jsx function) to permit using Jsx.html for
			// manually escaping </script>. The default <\script> escape may not be
			// desirable for all embedded languages in <script> tags.
			if (child instanceof Html) children.push(String(child))
			else children.push(escapeScript(String(child)))
			break

		default: throw new TypeError("Invalid element: " + child)
	}

	return children
}

function escapeScript(text) {
	// https://www.w3.org/TR/html52/semantics-scripting.html#restrictions-for-contents-of-script-elements
	text = text.replace(/<\/(script)/gi, "<\\/$1")
	text = text.replace(/<!--/g, "<\\!--")
	return text
}

function Html(html) { this.value = html }

Html.prototype = Object.create(Markup.prototype, {
	constructor: {value: Html, configurable: true, writeable: true},
	doctype: {value: DOCTYPE, configurable: true, writeable: true}
})

function isEmpty(obj) { for (var _key in obj) return false; return true }
function newHtml(html) { return new Html(html) }
