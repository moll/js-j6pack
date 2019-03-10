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
		children = children == null ? EMPTY_ARR : children.reduce(renderChild, [])
		html += ">" + children.join("") + "</" + tagName + ">"
	}

	if (tagName == "html") html = "<!DOCTYPE html>\n" + html
	return new Html(html)
}

function renderChild(children, child) {
	if (isArray(child)) return child.reduce(renderChild, children)
	else return children.push(renderNode(child)), children
}

function renderNode(value) {
	switch (typeOf(value)) {
		case "undefined":
		case "null": return ""
		case "number": return value
		case "string": return escapeHtml(value)

		case "object":
			if (value instanceof Html) return String(value)
			return escapeHtml(String(value))

		default: throw new TypeError("Invalid Element: " + value)
	}
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
