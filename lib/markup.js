var isArray = Array.isArray
exports = module.exports = jsx
exports.Markup = Markup
exports.Fragment = Fragment
exports.renderChild = renderChild
exports.renderAttributes = renderAttributes
exports.typeOf = typeOf

function Markup(markup) { this.value = markup }
Markup.prototype.doctype = ""
Markup.prototype.valueOf = function() { return this.doctype + this.value }

Markup.prototype.toString = function(fmt) {
	switch (fmt) {
		case undefined: return this.value
		case "doctype": return this.doctype + this.value
		default: throw new RangeError("Invalid format: " + fmt)
	}
}

function jsx(render, tagName, attrs, children) {
	switch (typeof tagName) {
		case "function": return tagName(attrs, children)
		case "string": return render(tagName, attrs, children)
		default: throw new TypeError("Tag must be a function or string: " + tagName)
	}
}

function renderChild(children, child) {
	switch (typeOf(child)) {
		case "undefined":
		case "null": break
		case "boolean":
		case "number": children.push(child); break
		case "string": children.push(escape(child)); break
		case "array": return child.reduce(renderChild, children)

		case "object":
			if (child instanceof Markup) children.push(String(child))
			else children.push(escape(String(child)))
			break

		default: throw new TypeError("Invalid element: " + child)
	}

	return children
}

function renderAttributes(attrs) {
	var markup = [], value

	for (var name in attrs) switch (typeOf(value = attrs[name])) {
		case "undefined": break;
		case "null": break;
		case "boolean": if (value) markup.push(name); break
		case "number": markup.push(kv(name, value)); break
		case "string": markup.push(kv(name, escapeAttr(value))); break

		case "object":
			if (value instanceof Markup) markup.push(kv(name, String(value)))
			else markup.push(kv(name, escapeAttr(String(value))))
			break

		default: throw new TypeError("Invalid attribute value: " + value)
	}

	return markup.join(" ")
}

function escape(text) {
	// https://www.w3.org/TR/REC-xml/#NT-CharData
	// https://www.w3.org/TR/REC-xml/#sec-line-ends
	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	text = text.replace(/\r/g, "&#xD;")
	return text
}

function escapeAttr(text) {
	// https://www.w3.org/TR/REC-xml/#NT-AttValue
	// https://www.w3.org/TR/REC-xml/#AVNormalize
	//
	// Escaping "<" is not necessary for HTML
	// (https://html.spec.whatwg.org/#attributes-2), but is necessary for XML.
	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/"/g, "&quot;")
	text = text.replace(/\t/g, "&#x9;")
	text = text.replace(/\n/g, "&#xA;")
	text = text.replace(/\r/g, "&#xD;")
	return text
}

function typeOf(value) {
	return value === null ? "null" : isArray(value) ? "array" : typeof value
}

function Fragment(_attrs, children) { return children }
function kv(name, value) { return name + "=\"" + value + "\"" }
