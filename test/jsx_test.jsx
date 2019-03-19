/** @jsx Jsx */
var Jsx = require("..")
var Fragment = Jsx.Fragment
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
			it("must not self-close a non-self-closing tag", function() {
				<script />.must.eql(new Html("<script></script>"))
			})

			it("must render tag with undefined child", function() {
				var html = <p>Hello, {undefined}!</p>
				html.must.eql(new Html("<p>Hello, !</p>"))
			})

			it("must render tag with null child", function() {
				var html = <p>Hello, {null}!</p>
				html.must.eql(new Html("<p>Hello, !</p>"))
			})

			it("must render tag with boolean child", function() {
				var html = <p>Hello, {true}!</p>
				html.must.eql(new Html("<p>Hello, true!</p>"))
			})

			it("must render tag with number child", function() {
				var html = <p>Hello, {42}!</p>
				html.must.eql(new Html("<p>Hello, 42!</p>"))
			})

			it("must render tag with string child", function() {
				<p>Hello, World</p>.must.eql(new Html("<p>Hello, World</p>"))
			})

			it("must escape string child", function() {
				var xss = "<script>alert(1&2)</script>"
				var html = <p>Hello, {xss}!</p>
				html.must.eql(new Html(outdent`
					<p>Hello, &lt;script&gt;alert(1&amp;2)&lt;/script&gt;!</p>
				`))
			})

			it("must not escape quotes in string child", function() {
				var name = "John \"Doe\" Smith's Car"
				var html = <p>Hello, {name}!</p>
				html.must.eql(new Html(`<p>Hello, John "Doe" Smith's Car!</p>`))
			})

			it("must render tag with string and element children", function() {
				var html = <p>Hello, <span>World</span>!</p>
				html.must.eql(new Html("<p>Hello, <span>World</span>!</p>"))
			})

			it("must render tag with array children", function() {
				var html = <p>Hello, {[<span>World</span>, "!"]}</p>
				html.must.eql(new Html("<p>Hello, <span>World</span>!</p>"))
			})

			it("must escape array string children", function() {
				var html = <p>Hello, {["Rock & Roll"]}!</p>
				html.must.eql(new Html("<p>Hello, Rock &amp; Roll!</p>"))
			})

			it("must render object", function() {
				var date = new Date(2015, 5, 18)
				var html = <p>Hello, {date}!</p>
				html.must.eql(new Html("<p>Hello, " + date.toString() + "!</p>"))
			})

			it("must escape object", function() {
				var xss = {toString: () => "<script>alert(1&2)</script>"}
				var html = <p>Hello, {xss}!</p>

				html.must.eql(new Html(outdent`
					<p>Hello, &lt;script&gt;alert(1&amp;2)&lt;/script&gt;!</p>
				`))
			})

			it("must not escape Html", function() {
				var html = <p>Hello, {new Html("<span>world</span>")}!</p>
				html.must.eql(new Html("<p>Hello, <span>world</span>!</p>"))
			})

			describe("given attributes", function() {
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

				it("must escape object attribute", function() {
					var xss = {toString: () => "<script>alert(1&2)</script>"}
					var html = <p class={xss}>Hello, world!</p>

					html.must.eql(new Html(outdent`
						<p class="<script>alert(1&2)</script>">Hello, world!</p>
					`))
				})

				it("must render self-closing tag with attributes", function() {
					var html = <input name="greeting" value="Hello, World!" />
					html.must.eql(new Html(outdent`
						<input name="greeting" value="Hello, World!" />
					`))
				})

				it("must escape double quotes in attributes", function() {
					var url = "http://example.com/John_\"Doe\"_Smith"
					var html = <a href={url}>John</a>

					html.must.eql(new Html(outdent`
						<a href="http://example.com/John_&quot;Doe&quot;_Smith">John</a>
					`))
				})

				it("must not escape single quotes in attributes", function() {
					var url = "http://example.com/John_'Doe'_Smith"
					var html = <a href={url}>John</a>

					html.must.eql(new Html(outdent`
						<a href="http://example.com/John_'Doe'_Smith">John</a>
					`))
				})
			})

			describe("given <html>", function() {
				it("must return with doctype", function() {
					var html = <html>Hello, World</html>
					html.must.eql(new Html("<!DOCTYPE html>\n<html>Hello, World</html>"))
				})
			})

			describe("given <script>", function() {
				it("must render tag with undefined child", function() {
					var html = <script>alert("Hello, {undefined}!")</script>
					html.must.eql(new Html(`<script>alert("Hello, !")</script>`))
				})

				it("must render tag with null child", function() {
					var html = <script>alert("Hello, {null}!")</script>
					html.must.eql(new Html(`<script>alert("Hello, !")</script>`))
				})

				it("must render tag with boolean child", function() {
					var html = <script>alert("Hello, {true}!")</script>
					html.must.eql(new Html(`<script>alert("Hello, true!")</script>`))
				})

				it("must render tag with number child", function() {
					var html = <script>alert("Hello, {42}!")</script>
					html.must.eql(new Html(`<script>alert("Hello, 42!")</script>`))
				})

				it("must render tag with string child", function() {
					var html = <script>alert("Hello, World")</script>
					html.must.eql(new Html(`<script>alert("Hello, World")</script>`))
				})

				it("must not escape entities in string children", function() {
					var html = <script>alert("Rock &amp; Roll")</script>
					html.must.eql(new Html(`<script>alert("Rock & Roll")</script>`))
				})

				it("must not escape </scrip in string children", function() {
					var html = <script>{`if (0 < 1) alert("</scrip")`}</script>

					html.must.eql(new Html(outdent`
						<script>if (0 < 1) alert("</scrip")</script>
					`))
				})

				it("must escape </script in string children", function() {
					var html = <script>{`if (0 < 1) alert("</script")`}</script>

					html.must.eql(new Html(outdent`
						<script>if (0 < 1) alert("<\\/script")</script>
					`))
				})

				it("must escape </ScripT in string children", function() {
					var html = <script>{`if (0 < 1) alert("</ScripT")`}</script>

					html.must.eql(new Html(outdent`
						<script>if (0 < 1) alert("<\\/ScripT")</script>
					`))
				})

				it("must escape </script> in string children", function() {
					var html = <script>{`if (0 < 1) alert("</script>")`}</script>

					html.must.eql(new Html(outdent`
						<script>if (0 < 1) alert("<\\/script>")</script>
					`))
				})

				it("must escape <!-- in string children", function() {
					var html = <script>{`if (0 < 1) alert("<!-- <script>")`}</script>

					html.must.eql(new Html(outdent`
						<script>if (0 < 1) alert("<\\!-- <script>")</script>
					`))
				})

				it("must not escape array string children", function() {
					var html = <script>alert("Hello, {["Rock & Roll"]}!")</script>
					html.must.eql(new Html(outdent`
						<script>alert("Hello, Rock & Roll!")</script>
					`))
				})

				it("must render object", function() {
					var date = new Date(2015, 5, 18)
					var html = <script>alert("Hello, {date}!")</script>
					html.must.eql(new Html(outdent`
						<script>alert("Hello, ${date.toString()}!")</script>
					`))
				})

				it("must escape object", function() {
					var xss = {toString: () => "<script>alert(1&2)</script>"}
					var html = <script>Hello, {xss}!</script>

					html.must.eql(new Html(outdent`
						<script>Hello, <script>alert(1&2)<\\/script>!</script>
					`))
				})

				it("must not escape element children twice", function() {
					var html = <script type="text/x-handlebars-template">
						<div class="entry">
							<h1>{"{{"}title{"}}"}</h1>
							<div class="body">Rock &amp; {"{{"}body{"}}"}</div>
						</div>
					</script>

					html.must.eql(new Html(outdent`
						<script type="text/x-handlebars-template">
							<div class="entry">
								<h1>{{title}}</h1>
								<div class="body">Rock &amp; {{body}}</div>
							</div>
						</script>
					`.replace(/\s*\n\s*/g, "")))
				})

				it("must not escape </script> in element children", function() {
					var html = <script type="text/x-handlebars-template">
						<script>
							alert(1&amp;2)
						</script>
					</script>

					html.must.eql(new Html(outdent`
						<script type="text/x-handlebars-template">
							<script>
								alert(1&2)
							</script>
						</script>
					`.replace(/\s*\n\s*/g, "")))
				})

				it("must not escape Html", function() {
					var html = <script>
						Hello, {new Html("<script>alert(1&2)</script>")}!
					</script>

					html.must.eql(new Html(outdent`
						<script>Hello, <script>alert(1&2)</script>!</script>
					`))
				})
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

			it("must render component with string and element children", function() {
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

				html.must.eql(new Html(`<p>
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

	describe(".Fragment", function() {
		it("must return an array of children HTML", function() {
			var html = <Fragment>
				<p>Hello, World!</p>
				<p>What's up?</p>
			</Fragment>

			html.must.eql([
				new Html("<p>Hello, World!</p>"),
				new Html("<p>What's up?</p>")
			])
		})
	})

	describe(".html", function() {
		it("must return an instance of Html", function() {
			Jsx.html("Rock &amp; Roll").must.eql(new Html("Rock &amp; Roll"))
		})
	})
})
