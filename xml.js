var Jsx = require("./lib/markup")
var Markup = Jsx.Markup
var renderChild = Jsx.renderChild
var renderAttrs = Jsx.renderAttributes
var EMPTY_ARR = Array.prototype
var DOCTYPE = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n"
exports = module.exports = Jsx.bind(null, render)
exports.Fragment = Jsx.Fragment
exports.Xml = Xml
exports.xml = newXml
exports.assign = require("./lib").assign

function render(tagName, attrs, children) {
	var tag = "<" + tagName
	if (attrs && !isEmpty(attrs)) tag += " " + renderAttrs(attrs)

	if (children && children.length) {
		children = (children || EMPTY_ARR).reduce(renderChild, [])
		return new Xml(tag + ">" + children.join("") + "</" + tagName + ">")
	}
	else return new Xml(tag + " />")
}

function Xml(xml) { this.value = xml }

Xml.prototype = Object.create(Markup.prototype, {
	constructor: {value: Xml, configurable: true, writeable: true},
	doctype: {value: DOCTYPE, configurable: true, writeable: true}
})

function isEmpty(obj) { for (var _key in obj) return false; return true }
function newXml(xml) { return new Xml(xml) }
