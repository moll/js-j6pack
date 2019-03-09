/** @jsx Jsx */
var Jsx = require("..")
var Html = Jsx.Html
var outdent = require("./outdent")
var demand = require("must")

describe("Jsx", function() {
	describe("as a function", function() {
		describe("given undefined", function() {
			it("must throw TypeError", function() {
				var NonExistent
				var err
				try { void <NonExistent /> } catch (ex) { err = ex }
				err.must.be.an.error(TypeError)
			})
		})

		describe("given null", function() {
			it("must throw TypeError", function() {
				var NonExistent = null
				var err
				try { void <NonExistent /> } catch (ex) { err = ex }
				err.must.be.an.error(TypeError)
			})
		})

		describe("given number", function() {
			it("must throw TypeError", function() {
				var NonExistent = null
				var err
				try { void <NonExistent /> } catch (ex) { err = ex }
				err.must.be.an.error(TypeError)
			})
		})

		describe("given a plain tag", function() {
			it("must render tag with text child", function() {
				<p>Hello, World</p>.must.eql(new Html("<p>Hello, World</p>"))
			})

			it("must render tag with text and element children", function() {
				var html = <p>Hello, <span>World</span>!</p>
				html.must.eql(new Html("<p>Hello, <span>World</span>!</p>"))
			})

			it("must render tag with array children", function() {
				var html = <p>Hello, {[<span>World</span>, "!"]}</p>
				html.must.eql(new Html("<p>Hello, <span>World</span>!</p>"))
			})

			it("must render tag with attribute", function() {
				var html = <p class="text">Hello, World!</p>
				html.must.eql(new Html("<p class=\"text\">Hello, World!</p>"))
			})

			it("must render tag with attributes", function() {
				var html = <p id="greeting" class="text">Hello, World!</p>
				html.must.eql(new Html(outdent`
					<p id="greeting" class="text">Hello, World!</p>
				`))
			})

			it("must render tag with attribute with no value", function() {
				var html = <script src="http://example.com" async defer />

				html.must.eql(new Html(outdent`
					<script src="http://example.com" async defer></script>
				`))
			})

			it("must render tag with boolean attribute of undefined", function() {
				var html = <script src="http://example.com" async={undefined} />
				html.must.eql(new Html(`<script src="http://example.com"></script>`))
			})

			it("must render tag with boolean attribute of null", function() {
				var html = <script src="http://example.com" async={null} />
				html.must.eql(new Html(`<script src="http://example.com"></script>`))
			})

			it("must render tag with boolean attribute of true", function() {
				var html = <script src="http://example.com" async={!!true} />
				html.must.eql(new Html(outdent`
					<script src="http://example.com" async></script>
				`))
			})

			it("must render tag with boolean attribute of false", function() {
				var html = <script src="http://example.com" async={false} />
				html.must.eql(new Html(`<script src="http://example.com"></script>`))
			})

			it("must render tag with string attribute", function() {
				var html = <input value={"hello"} />
				html.must.eql(new Html(`<input value="hello" />`))
			})

			it("must render tag with number attribute", function() {
				var html = <input maxlength={42} />
				html.must.eql(new Html(`<input maxlength="42" />`))
			})

			it("must throw given array attribute", function() {
				var err
				try { void <p class={[]} /> } catch (ex) { err = ex }
				err.must.be.an.error(TypeError, /attribute/)
			})

			it("must render tag with object attribute", function() {
				var obj = {toString: () => "greeting"}
				var html = <p class={obj}>Hello, World!</p>
				html.must.eql(new Html(`<p class="greeting">Hello, World!</p>`))
			})

			it("must render self-closing tag with attributes", function() {
				var html = <input name="greeting" value="Hello, World!" />
				html.must.eql(new Html(outdent`
					<input name="greeting" value="Hello, World!" />
				`))
			})

			it("must not self-close a non-self-closing tag", function() {
				<script />.must.eql(new Html("<script></script>"))
			})

			it("must escape interpolated text", function() {
				var xss = "<script>alert(1&2)</script>"
				var html = <p>Hello, {xss}!</p>
				html.must.eql(new Html(outdent`
					<p>Hello, &lt;script&gt;alert(1&amp;2)&lt;/script&gt;!</p>
				`))
			})

			it("must not escape interpolated single or double quotes in text",
				function() {
				var name = "John \"Doe\" Smith's Car"
				var html = <p>Hello, {name}!</p>
				html.must.eql(new Html(`<p>Hello, John "Doe" Smith's Car!</p>`))
			})

			it("must escape double quotes in interpolated attributes", function() {
				var url = "http://example.com/John_\"Doe\"_Smith"
				var html = <a href={url}>John</a>

				html.must.eql(new Html(outdent`
					<a href="http://example.com/John_&quot;Doe&quot;_Smith">John</a>
				`))
			})

			it("must not escape single quotes in interpolated attributes",
				function() {
				var url = "http://example.com/John_'Doe'_Smith"
				var html = <a href={url}>John</a>

				html.must.eql(new Html(outdent`
					<a href="http://example.com/John_'Doe'_Smith">John</a>
				`))
			})

			it("must return a doctype with <html>", function() {
				var html = <html>Hello, World</html>
				html.must.eql(new Html("<!DOCTYPE html>\n<html>Hello, World</html>"))
			})
		})

		describe("given a function", function() {
			function Paragraph(props, children) {
				return <p {...props}>{children}</p>
			}

			function Greeting(props, children) {
				return <span id="greeting" {...props}>{children}</span>
			}

			it("must render a plain component", function() {
				var html = <Paragraph>Hello, World</Paragraph>
				html.must.eql(new Html("<p>Hello, World</p>"))
			})

			it("must render component with text and element children", function() {
				var html = <Paragraph>Hello, <span>World</span>!</Paragraph>
				html.must.eql(new Html("<p>Hello, <span>World</span>!</p>"))
			})

			it("must render component with attribute and merge", function() {
				var html = <Greeting class="big">Hello, World!</Greeting>
				html.must.eql(new Html(outdent`
					<span id="greeting" class="big">Hello, World!</span>
				`))
			})

			it("must render nested components", function() {
				var html = <Paragraph>
					<Greeting>Hello, World!</Greeting><br />
					Glad to have you.
				</Paragraph>

				html.must.eql(new Html(`<p><span id="greeting">Hello, World!</span><br />Glad to have you.</p>`))
			})

			it("must call with null given no attributes but children", function() {
				function Nullable(attrs, children) {
					demand(attrs).be.null()
					return <div>{children}</div>
				}

				var html = <Nullable>Hello, World!</Nullable>
				html.must.eql(new Html("<div>Hello, World!</div>"))
			})

			it("must call with undefined given no attributes or children",
				function() {
				function Nullable(attrs, children) {
					demand(attrs).be.undefined()
					demand(children).be.undefined()
					return <span>:(</span>
				}

				<Nullable />.must.eql(new Html("<span>:(</span>"))
			})
		})
	})
})