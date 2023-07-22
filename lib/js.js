var Walk = require("acorn-walk")
var isBlank = RegExp.prototype.test.bind(/^[ \t\v\f\r\n]*$/)
exports.compile = compile
exports.Compiler = Compiler

function compile(opts, node, jsx) {
	return new Compiler(opts).compileNode(node, jsx)
}

function Compiler(opts) {
	if (opts) {
		if (opts.factory != null) this.factory = opts.factory
		if (opts.assign != null) this.assign = opts.assign

		if (opts.fragmentFactory !== undefined)
			this.fragmentFactory = opts.fragmentFactory
		if (opts.componentFactory !== undefined)
			this.componentFactory = opts.componentFactory
	}
}

Compiler.prototype.factory = "Jsx"
Compiler.prototype.fragmentFactory = null
Compiler.prototype.componentFactory = null
Compiler.prototype.assign = "Object.assign"

// NOTE: It's safe to use String.prototype.slice everywhere as apparently V8
// optimizes the use of substrings by sharing their backing store and keeping
// offsets.
//
// https://stackoverflow.com/questions/72540410/time-complexity-of-slice-in-javascript-v8-runtime
Compiler.prototype.compileNode = function(node, jsx) {
	var self = this
	var replacements = []

	Walk.recursive(node, null, {
		JSXElement: function(node, _state, _walk) {
			var el = node.openingElement
			var name = el.name
			var attrs = el.attributes
			var children = node.children
			var isElement = isElementName(name)
			var js = []

			if (isElement)
				js.push(self.factory + "(" + renderElementName(name))
			else if (self.componentFactory)
				js.push(self.componentFactory + "(" + renderVariableName(name))
			else
				js.push(renderVariableName(name) + "(")

			if (attrs.length > 0) {
				if (isElement || self.componentFactory) js.push(",")

				// Skip over the space after the opening tag (`<foo ` ), but not if
				// there's a newline or other whitespace.
				var attrsJsx = OffsetText.slice(
					jsx,
					name.end + (jsx.charAt(name.end) == " " ? 1 : 0),
					el.end - 1
				).replace(/\/(\s*)$/, "$1")

				var attrsJs = self.compileAttributes(attrs, attrsJsx)

				js.push(
					!isElement && !self.componentFactory || /^\r?\n/.test(attrsJs)
					? attrsJs : " " + attrsJs
				)
			}
			else if (children.length > 0) {
				if (isElement || self.componentFactory) js.push(", null")
				else js.push("null")
			}

			if (children.length > 0) {
				js.push(", [")
				js.push(self.compileChildren(children, jsx))
				js.push("]")
			}

			js.push(")")

			replacements.push({start: node.start, end: node.end, text: js.join("")})
		},

		JSXFragment: function(node, _state, _walk) {
			var open = node.openingFragment
			var close = node.closingFragment
			var children = "[" + self.compileChildren(node.children, jsx) + "]"

			var js = self.fragmentFactory
				? self.fragmentFactory + "(null, " + children + ")"
				: children

			replacements.push({start: open.start, end: close.end, text: js})
		},

		JSXExpressionContainer: function(node, state, walk) {
			var expr = node.expression
			replacements.push({start: node.start, end: node.start + 1, text: ""})
			walk(expr, state)
			replacements.push({start: node.end - 1, end: node.end, text: ""})
		},

		JSXEmptyExpression: function(_node, _state, _walk) {}
	})

	return applyReplacements(jsx, replacements)
}

Compiler.prototype.compileAttributes = function(attrs, jsx) {
	if (attrs.length == 0) return jsx + "null"

	var groups = []

	attrs.forEach(function(attr) {
		switch (attr.type) {
			case "JSXAttribute":
				var group = last(groups)
				if (group instanceof Array) group.push(attr)
				else groups.push([attr])
				break

			case "JSXSpreadAttribute": groups.push(attr); break
			default: throw new Error("Invalid attribute node: " + attr.type)
		}
	})

	var js = []

	if (groups.length > 1) {
		js.push(this.assign + "(")

		if (!(groups[0] instanceof Array)) {
			js.push("{},")
			if (!/^\s*?\n/.test(jsx)) js.push(" ")
		}
	}

	var whitespaceOffset = 0

	groups.forEach(function(group, groupIndex) {
		if (groupIndex > 0) js.push(",")

		if (group instanceof Array) {
			var whitespace = jsx.slice(whitespaceOffset, group[0].start)
			var m = /^(\s*?)(\r?\n\s*)/.exec(whitespace)

			if (m) {
				js.push(m[1] || (groupIndex > 0 ? " " : ""))
				whitespaceOffset = group[0].start - m[2].length
			}
			else {
				js.push(whitespace)
				whitespaceOffset += group[0].start
			}

			js.push("{")

			group.forEach(function(attr, i) {
				if (i > 0) js.push(",")
				js.push(jsx.slice(whitespaceOffset, attr.start))
				whitespaceOffset = attr.end

				var value = attr.value
				js.push(renderAttributeName(attr.name) + ": ")

				if (value) js.push(this.compileNode(
					value,
					OffsetText.slice(jsx, value.start, value.end)
				))
				else js.push("true")
			}, this)

			var lastEnd = last(group).end

			var whitespaceOffsetAfter = groupIndex < groups.length - 1
				? groups[groupIndex + 1].start
				: undefined

			js.push(jsx.slice(
				jsx.charAt(lastEnd) == " " ? lastEnd + 1 : lastEnd,
				whitespaceOffsetAfter
			))

			if (whitespaceOffsetAfter) whitespaceOffset = whitespaceOffsetAfter
			js.push("}")
		}
		else {
			if (groupIndex > 0 && whitespaceOffset == group.start) js.push(" ")
			var expr = group.argument
			js.push(jsx.slice(whitespaceOffset, group.start))
			whitespaceOffset = group.end
			js.push(jsx.slice(group.start + 1, expr.start).replace("...", ""))

			js.push(
				this.compileNode(expr),
				OffsetText.slice(jsx, expr.start, expr.end)
			)

			js.push(jsx.slice(expr.end, group.end - 1))

			if (groupIndex == groups.length - 1) {
				var after = jsx.slice(group.end)
				if (/\n/.test(after)) js.push(after)
			}
		}
	}, this)

	if (groups.length > 1) js.push(")")

	return js.join("")
}

// JSX whitespace rules: https://github.com/facebook/react/pull/480
//
// In summary:
// - All leading and trailing whitespace is removed.
// - Leading and trailing spaces and tabs are removed from every line.
// - Spaces between text are preserved.
// - Tabs and newlines between text are replaced with single spaces.
// - Whitespace between tags, text and tags, is ignored entirely.
Compiler.prototype.compileChildren = function(children, jsx) {
	if (children.length == 0) return "[]"

	var js = []

	children.forEach(function(child, i) {
		var isFirstChild = i == 0
		var isLastChild = i == children.length - 1

		switch (child.type) {
			case "JSXText":
				var text = child.value

				if (isBlank(text)) {
					if (isFirstChild || isLastChild || /\n/.test(text)) js.push(text)
					else js.push(quote(text))
					break
				}

				var lines = text.split(/\n/g)
				var lastNonBlankLineIndex = findLastIndex(lines, isNonBlank)

				lines = lines.map(function(line, lineIndex, lines) {
					if (isBlank(line)) return line

					var isFirstLine = lineIndex == 0
					var isLastLine = lineIndex == lines.length - 1
					var isLastNonBlankLine = lastNonBlankLineIndex == lineIndex

					var m = /^([ \t\v\f]*)(.*?)([ \t\v\f]*)$/.exec(line)

					if (isFirstLine && !isFirstChild) {
						if (isLastLine) return quote(m[1] + m[2] + m[3])
						if (isLastNonBlankLine) return quote(m[1] + m[2])
						return quote(m[1] + m[2] + " ") + " +"
					}

					if (isLastLine && !isLastChild) return m[1] + quote(m[2] + m[3])
					if (isLastNonBlankLine) return m[1] + quote(m[2])
					return m[1] + quote(m[2] + " ") + " +"
				})

				js.push(lines.join("\n"))
				break

			case "JSXElement":
			case "JSXExpressionContainer":
				js.push(this.compileNode(
					child,
					OffsetText.slice(jsx, child.start, child.end)
				))
				break

			default: throw new Error("Invalid child node: " + child.type)
		}
	}, this)

	return js.map(function(el, i, els) {
		if (i == els.length - 1) return el
		if (isBlank(el)) return el
		if (i == els.length - 2 && isBlank(els[i + 1])) return el
		el = el.replace(/(\s*)$/, ",$1")
		return el + (/\n\s*$/.test(el) || /^\s*\n/.test(els[i + 1]) ? "" : " ")
	}).join("")
}

// OffsetText comes in handy to not have to adjust the the start and end
// positions of node locations at call sites every time when slicing into the
// JSX source.
function OffsetText(text, offset) {
	this.text = text
	this.offset = offset || 0
}

Object.defineProperty(OffsetText.prototype, "length", {
	get: function() { return this.text.length },
	configurable: true,
	enumerable: true
})

OffsetText.prototype.slice = function(start, end) {
	return new OffsetText(this.text.slice(
		Math.max(start - this.offset, 0),
		end == null ? undefined : end < 0 ? end : Math.max(end - this.offset, 0)
	), Math.max(this.offset, start))
}

OffsetText.prototype.replace = function(pat, sub) {
	return new OffsetText(this.text.replace(pat, sub), this.offset)
}

OffsetText.prototype.charAt = function(i) {
	return this.text.charAt(Math.max(i - this.offset, 0))
}

OffsetText.prototype.toString = function() { return this.text }

OffsetText.slice = function(text, start, end) {
	if (text instanceof OffsetText) return text.slice(start, end)
	else return new OffsetText(text.slice(start, end), start)
}

function isElementName(name) {
	return (
		name.type == "JSXIdentifier" && /^[a-z]/.test(name.name) ||
		name.type == "JSXNamespacedName"
	)
}

function renderName(name) {
	if (name.type == "JSXIdentifier") return name.name
	throw new Error("Unsupported name node: " + name.type)
}

function renderElementName(name) {
	switch (name.type) {
		case "JSXIdentifier": return quote(name.name)

		case "JSXNamespacedName":
			return quote(renderName(name.namespace) + ":" + renderName(name.name))

		default: throw new Error("Unsupported name node: " + name.type)
	}
}

function renderAttributeName(name) {
	switch (name.type) {
		case "JSXIdentifier": return keyify(name.name)

		case "JSXNamespacedName":
			return quote(renderName(name.namespace) + ":" + renderName(name.name))

		default: throw new Error("Unsupported name node: " + name.type)
	}
}

function renderVariableName(name) {
	switch (name.type) {
		case "JSXIdentifier": return renderName(name)

		case "JSXMemberExpression":
			return renderName(name.object) + "." + renderName(name.property)

		default: throw new Error("Unsupported name node: " + name.type)
	}
}

function applyReplacements(replacee, replacements) {
	var added = 0
	var offset = 0

	if (replacee instanceof OffsetText) {
		offset = replacee.offset
		replacee = replacee.text
	}

	return replacements.reduce(function(replacee, replacement) {
		var start = replacement.start - offset
		var end = replacement.end - offset
		var text = replacement.text

		replacee = splice(replacee, start + added, end + added, text)
		added += text.length - (end - start)
		return replacee
	}, replacee)
}

function splice(string, start, end, replaced) {
	return string.slice(0, start) + replaced + string.slice(end)
}

function keyify(name) {
  if (/^[$_a-zA-Z][$_0-9a-zA-Z]*$/.test(name)) return name
	else return quote(name)
}

function quote(string) {
	return "\"" + string.replace(/[\\\r\n"]/g, function(char) {
		switch (char) {
			case "\n": return "\\n"
			case "\r": return "\\r"
			default: return "\\" + char
		}
	}) + "\""
}

function findLastIndex(arr, fn) {
	for (var i = arr.length - 1; i >= 0; --i) if (fn(arr[i], i, arr)) return i
	return -1
}

function last(array) { return array[array.length - 1] }
function isNonBlank(text) { return !isBlank(text) }
