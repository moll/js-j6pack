/** @jsx Jsx */
var Jsx = require("../html")
var Fragment = Jsx.Fragment
var Html = Jsx.Html
var outdent = require("./outdent")

describe("HTML JSX", function() {
	require("./_jsx")(Jsx, Html)

	describe("as an HTML JSX function", function() {
		describe("given a plain tag", function() {
			it("must not self-close a non-self-closing tag", function() {
				<script />.must.eql(new Html("<script></script>"))
			})
		})

		describe("given a plain tag and attributes", function() {
			it("must render self-closing tag with attributes", function() {
				var html = <input name="greeting" value="Hello, World!" />
				html.must.eql(new Html(outdent`
					<input name="greeting" value="Hello, World!" />
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
