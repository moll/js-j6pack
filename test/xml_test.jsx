/** @jsx Jsx */
var Jsx = require("../xml")
var Fragment = Jsx.Fragment
var Xml = Jsx.Xml
var outdent = require("./outdent")

describe("XML JSX", function() {
	require("./_jsx")(Jsx, Xml)

	describe("as an XML JSX function", function() {
		describe("given a plain tag", function() {
			it("must self-close a non-self-closing HTML tag", function() {
				<input />.must.eql(new Xml("<input />"))
			})

			it("must support namespace aliases", function() {
				<atom:feed xmlns:atom="http://www.w3.org/2005/Atom">
					<atom:id>http://example.com</atom:id>
				</atom:feed>.must.eql(new Xml(outdent`
					<atom:feed xmlns:atom="http://www.w3.org/2005/Atom"><atom:id>http://example.com</atom:id></atom:feed>
				`))
			})
		})
	})

	describe("Xml", function() {
		describe(".prototype.toString", function() {
			it("must return XML", function() {
				<p>Hello, world!</p>.toString().must.equal("<p>Hello, world!</p>")
			})

			it("must return XML with doctype if asked for", function() {
				<p>Hello, world!</p>.toString("doctype").must.eql(outdent`
					<?xml version="1.0" encoding="utf-8" ?>
					<p>Hello, world!</p>
				`)
			})
		})
	})

	describe(".Fragment", function() {
		it("must return an array of children XML", function() {
			var xml = <Fragment>
				<p>Hello, World!</p>
				<p>What's up?</p>
			</Fragment>

			xml.must.eql([
				new Xml("<p>Hello, World!</p>"),
				new Xml("<p>What's up?</p>")
			])
		})
	})

	describe(".xml", function() {
		it("must return an instance of Xml", function() {
			Jsx.xml("Rock &amp; Roll").must.eql(new Xml("Rock &amp; Roll"))
		})
	})
})
