var isArray = Array.isArray
var VOID_ELEMENTS = require("void-elements")
var VOID_ERR = "Children given to self-closing element: "
var EMPTY_ARR = Array.prototype
exports = module.exports = jsx
exports.Fragment = Fragment
exports.Html = Html
exports.html = newHtml

function jsx(tagName, attrs, children) {
	switch (typeof tagName) {
		case "function": return tagName(attrs, children)
		case "string": return render(tagName, attrs, children)
		default: throw new TypeError("Tag must be a function or string: " + tagName)
	}
}

function render(tagName, attrs, children) {
	var html = "<" + tagName
	if (attrs && !isEmpty(attrs)) html += " " + renderAttrs(attrs)

	if (tagName in VOID_ELEMENTS) {
		if (children && children.length) throw new RangeError(VOID_ERR + tagName)
		html += " />"
	}
	else {
		var renderTagChild = tagName == "script" ? renderScriptChild : renderChild
		children = (children || EMPTY_ARR).reduce(renderTagChild, [])
		html += ">" + children.join("") + "</" + tagName + ">"
	}

	if (tagName == "html") html = "<!DOCTYPE html>\n" + html
	return new Html(html)
}

function renderChild(children, child) {
	switch (typeOf(child)) {
		case "undefined":
		case "null": break
		case "boolean":
		case "number": children.push(child); break
		case "string": children.push(escapeHtml(child)); break
		case "array": return child.reduce(renderChild, children)

		case "object":
			if (child instanceof Html) children.push(String(child))
			else children.push(escapeHtml(String(child)))
			break

		default: throw new TypeError("Invalid element: " + child)
	}

	return children
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

function renderAttrs(attrs) {
	var html = [], value

	for (var name in attrs) switch (typeOf(value = attrs[name])) {
		case "undefined": break;
		case "null": break;
		case "boolean": if (value) html.push(name); break
		case "number": html.push(name + "=\"" + value + "\""); break
		case "object": value = String(value) // Fall through.
		case "string": html.push(name + "=\"" + escapeAttr(value) + "\""); break
		default: throw new TypeError("Invalid attribute value: " + value)
	}

	return html.join(" ")
}

function escapeHtml(text) {
	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	return text
}

function escapeScript(text) {
	// https://www.w3.org/TR/html52/semantics-scripting.html#restrictions-for-contents-of-script-elements
	text = text.replace(/<\/(script)/gi, "<\\/$1")
	text = text.replace(/<!--/g, "<\\!--")
	return text
}

function typeOf(value) {
	return value === null ? "null" : isArray(value) ? "array" : typeof value
}

function Fragment(_attrs, children) { return children }

function Html(html) { this.value = html }
Html.prototype.valueOf = function() { return this.value }
Html.prototype.toString = Html.prototype.valueOf

function escapeAttr(attr) { return attr.replace(/"/g, "&quot;") }
function isEmpty(obj) { for (var _key in obj) return false; return true }
function newHtml(html) { return new Html(html) }
