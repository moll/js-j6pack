/** @jsx Jsx */
var O = require("oolong")
var demand = require("must")
var outdent = require("./outdent")

module.exports = function(Jsx, Markup) {
	describe("as a JSX function", function() {
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
			it("must render tag with undefined child", function() {
				var markup = <p>Hello, {undefined}!</p>
				markup.must.eql(new Markup("<p>Hello, !</p>"))
			})

			it("must render tag with null child", function() {
				var markup = <p>Hello, {null}!</p>
				markup.must.eql(new Markup("<p>Hello, !</p>"))
			})

			it("must render tag with boolean child", function() {
				var markup = <p>Hello, {true}!</p>
				markup.must.eql(new Markup("<p>Hello, true!</p>"))
			})

			it("must render tag with number child", function() {
				var markup = <p>Hello, {42}!</p>
				markup.must.eql(new Markup("<p>Hello, 42!</p>"))
			})

			it("must render tag with string child", function() {
				<p>Hello, World</p>.must.eql(new Markup("<p>Hello, World</p>"))
			})

			// These escapes also match the canonicalization model.
			// https://www.w3.org/TR/xml-c14n/#ProcessingModel
			O.each({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"\r": "&#xD;"
			}, function(to, from) {
				it("must escape " + JSON.stringify(from) + " in string child",
					function() {
					var markup = <p>Hello, {"John " + from + " Smith"}!</p>
					markup.must.eql(new Markup(`<p>Hello, John ${to} Smith!</p>`))
				})

				it("must escape " + JSON.stringify(from) + " in object child",
					function() {
					var name = {toString: () => "John " + from + " Smith"}
					var markup = <p>Hello, {name}!</p>
					markup.must.eql(new Markup(`<p>Hello, John ${to} Smith!</p>`))
				})
			})

			O.each({
				"double quotes": "John \"Doe\" Smith",
				"single quotes": "John's Car",
				"tabs": "John\tSmith",
				"newlines": "John\nSmith"
			}, function(value, title) {
				it(`must not escape ${title} in string child`, function() {
					var markup = <p>Hello, {value}!</p>
					markup.must.eql(new Markup(`<p>Hello, ${value}!</p>`))
				})

				it(`must not escape ${title} in object child`, function() {
					var markup = <p>Hello, {{toString: () => value}}!</p>
					markup.must.eql(new Markup(`<p>Hello, ${value}!</p>`))
				})
			})

			it("must render tag with string and element children", function() {
				var markup = <p>Hello, <span>World</span>!</p>
				markup.must.eql(new Markup("<p>Hello, <span>World</span>!</p>"))
			})

			it("must render tag with array children", function() {
				var markup = <p>Hello, {[<span>World</span>, "!"]}</p>
				markup.must.eql(new Markup("<p>Hello, <span>World</span>!</p>"))
			})

			it("must escape array string children", function() {
				var markup = <p>Hello, {["Rock & Roll"]}!</p>
				markup.must.eql(new Markup("<p>Hello, Rock &amp; Roll!</p>"))
			})

			it("must render object", function() {
				var date = new Date(2015, 5, 18)
				var markup = <p>Hello, {date}!</p>
				markup.must.eql(new Markup("<p>Hello, " + date.toString() + "!</p>"))
			})

			it("must not escape markup", function() {
				var markup = <p>Hello, {new Markup("<span>world</span>")}!</p>
				markup.must.eql(new Markup("<p>Hello, <span>world</span>!</p>"))
			})
		})

		describe("given a plain tag and attributes", function() {
			it("must render tag with attribute", function() {
				var markup = <p class="text">Hello, World!</p>
				markup.must.eql(new Markup("<p class=\"text\">Hello, World!</p>"))
			})

			it("must render tag with attributes", function() {
				var markup = <p id="greeting" class="text">Hello, World!</p>
				markup.must.eql(new Markup(outdent`
					<p id="greeting" class="text">Hello, World!</p>
				`))
			})

			it("must render tag with attribute with no value", function() {
				var markup = <input type="email" required autofocus />
				markup.must.eql(new Markup(`<input type="email" required autofocus />`))
			})

			it("must render tag with boolean attribute of undefined", function() {
				var markup = <input type="email" required={undefined} />
				markup.must.eql(new Markup(`<input type="email" />`))
			})

			it("must render tag with boolean attribute of null", function() {
				var markup = <input type="email" required={null} />
				markup.must.eql(new Markup(`<input type="email" />`))
			})

			it("must render tag with boolean attribute of true", function() {
				var markup = <input type="email" required={!!true} />
				markup.must.eql(new Markup(`<input type="email" required />`))
			})

			it("must render tag with boolean attribute of false", function() {
				var markup = <input type="email" required={false} />
				markup.must.eql(new Markup(`<input type="email" />`))
			})

			it("must render tag with string attribute", function() {
				var markup = <input value={"hello"} />
				markup.must.eql(new Markup(`<input value="hello" />`))
			})

			it("must render tag with number attribute", function() {
				var markup = <input maxlength={42} />
				markup.must.eql(new Markup(`<input maxlength="42" />`))
			})

			it("must throw given array attribute", function() {
				var err
				try { void <p class={[]} /> } catch (ex) { err = ex }
				err.must.be.an.error(TypeError, /attribute/)
			})

			it("must render tag with object attribute", function() {
				var obj = {toString: () => "greeting"}
				var markup = <p class={obj}>Hello, World!</p>
				markup.must.eql(new Markup(`<p class="greeting">Hello, World!</p>`))
			})

			// These escapes also match the canonicalization model.
			// https://www.w3.org/TR/xml-c14n/#ProcessingModel
			O.each({
				"&": "&amp;",
				"<": "&lt;",
				"\"": "&quot;",
				"\t": "&#x9;",
				"\n": "&#xA;",
				"\r": "&#xD;"
			}, function(to, from) {
				it("must escape " + JSON.stringify(from) + " in string attribute",
					function() {
					var markup = <p title={"John " + from + " Smith"}>John</p>
					markup.must.eql(new Markup(`<p title="John ${to} Smith">John</p>`))
				})

				it("must escape " + JSON.stringify(from) + " in object attribute",
					function() {
					var title = {toString: () => "John " + from + " Smith"}
					var markup = <p title={title}>John</p>
					markup.must.eql(new Markup(`<p title="John ${to} Smith">John</p>`))
				})
			})

			O.each({
				"single quotes": "John's Car",
				"greater-than": "John > Car"
			}, function(value, title) {
				it(`must not escape ${title} in string attribute`, function() {
					var markup = <p title={value}>John</p>
					markup.must.eql(new Markup(`<p title="${value}">John</p>`))
				})

				it(`must not escape ${title} in object attribute`, function() {
					var markup = <p title={{toString: () => value}}>John</p>
					markup.must.eql(new Markup(`<p title="${value}">John</p>`))
				})
			})

			it("must not escape markup in attributes", function() {
				var markup = <p title={new Markup("Foo&copy;")}>Foo</p>
				markup.must.eql(new Markup("<p title=\"Foo&copy;\">Foo</p>"))
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
				var markup = <Paragraph>Hello, World</Paragraph>
				markup.must.eql(new Markup("<p>Hello, World</p>"))
			})

			it("must render component with string and element children", function() {
				var markup = <Paragraph>Hello, <span>World</span>!</Paragraph>
				markup.must.eql(new Markup("<p>Hello, <span>World</span>!</p>"))
			})

			it("must render component with attribute and merge", function() {
				var markup = <Greeting class="big">Hello, World!</Greeting>
				markup.must.eql(new Markup(outdent`
					<span id="greeting" class="big">Hello, World!</span>
				`))
			})

			it("must render nested components", function() {
				var markup = <Paragraph>
					<Greeting>Hello, World!</Greeting><br />
					Glad to have you.
				</Paragraph>

				markup.must.eql(new Markup(`<p>
					<span id="greeting">Hello, World!</span>
					<br />
					Glad to have you.
					</p>
				`.replace(/\s*\n\s*/g, "")))
			})

			it("must call with null given no attributes but children", function() {
				function Nullable(attrs, children) {
					demand(attrs).be.null()
					return <div>{children}</div>
				}

				var markup = <Nullable>Hello, World!</Nullable>
				markup.must.eql(new Markup("<div>Hello, World!</div>"))
			})

			it("must call with undefined given no attributes or children",
				function() {
				function Nullable(attrs, children) {
					demand(attrs).be.undefined()
					demand(children).be.undefined()
					return <span>:(</span>
				}

				<Nullable />.must.eql(new Markup("<span>:(</span>"))
			})
		})
	})
}
