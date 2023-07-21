var Js = require("../../lib/js")
var parse = require("../../compiler").parse
var outdent = require("../outdent")
var WHITESPACE_SANS_NL = "\t\v \f"

describe("Compiler", function() {
	it("must compile function calls on one line", function() {
		compile(outdent`
			foo(); bar()
		`).must.equal(outdent`
			foo(); bar()
		`)
	})

	it("must compile superfluous parentheses", function() {
		compile(outdent`
			((foo()))
		`).must.equal(outdent`
			((foo()))
		`)
	})

	describe("given element", function() {
		it("must compile self-closing element", function() {
			compile(`<a />`).must.equal(`Jsx("a")`)
		})

		it("must compile self-closing element with space between />", function() {
			compile(`<a / >`).must.equal(`Jsx("a")`)
		})

		it("must compile empty element", function() {
			compile(outdent`
				<h1></h1>
			`).must.equal(outdent`
				Jsx("h1")
			`)
		})

		it("must compile empty element with space between </", function() {
			compile(outdent`
				<h1>< / h1>
			`).must.equal(outdent`
				Jsx("h1")
			`)
		})

		it("must compile self-closing element with dash", function() {
			compile(`<a-link />`).must.equal(`Jsx("a-link")`)
		})

		it("must compile self-closing element with second letter uppercase", function() {
			compile(`<aLink />`).must.equal(`Jsx("aLink")`)
		})

		it("must compile self-closing element with namespace", function() {
			compile(`<atom:feed />`).must.equal(`Jsx("atom:feed")`)
		})

		it("must compile self-closing element with namespace and capitalized name", function() {
			compile(`<atom:Person />`).must.equal(`Jsx("atom:Person")`)
		})

		it("must compile self-closing element with attribute", function() {
			compile(outdent`
				<input value="John Doe" />
			`).must.equal(outdent`
				Jsx("input", {value: "John Doe"})
			`)
		})

		it("must compile self-closing element with attribute and space between />", function() {
			compile(outdent`
				<input value="John Doe" / >
			`).must.equal(outdent`
				Jsx("input", {value: "John Doe" })
			`)
		})

		it("must compile self-closing element with attribute and namespace", function() {
			compile(outdent`
				<atom:feed xmlns:atom="http://www.w3.org/2005/Atom" />
			`).must.equal(outdent`
				Jsx("atom:feed", {"xmlns:atom": "http://www.w3.org/2005/Atom"})
			`)
		})

		it("must compile self-closing element with attribute on separate line", function() {
			compile(outdent`
				<input
					value="John Doe"
				/>
			`).must.equal(outdent`
				Jsx("input", {
					value: "John Doe"
				})
			`)
		})

		it("must compile self-closing element with attribute on separate line and newlines between />", function() {
			compile(outdent`
				<input
					value="John Doe"
				/
				>
			`).must.equal(outdent`
				Jsx("input", {
					value: "John Doe"

				})
			`)
		})

		it("must compile self-closing element with attribute on separate line and newline between />", function() {
			compile(outdent`
				<input
					value="John Doe" /
				>
			`).must.equal(outdent`
				Jsx("input", {
					value: "John Doe"
				})
			`)
		})

		it("must compile self-closing element with two attributes", function() {
			compile(outdent`
				<input type="email" value="user@example.com" />
			`).must.equal(outdent`
				Jsx("input", {type: "email", value: "user@example.com"})
			`)
		})

		it("must compile self-closing element with two attributes on separate lines", function() {
			compile(outdent`
				<input
					type="email"
					value="user@example.com"
				/>
			`).must.equal(outdent`
				Jsx("input", {
					type: "email",
					value: "user@example.com"
				})
			`)
		})

		it("must compile self-closing element with three attributes", function() {
			compile(outdent`
				<input type="email" name="new-email" value="user@example.com" />
			`).must.equal(outdent`
				Jsx("input", {type: "email", name: "new-email", value: "user@example.com"})
			`)
		})

		it("must compile self-closing element with three attributes on separate lines", function() {
			compile(outdent`
				<input
					type="email"
					name="new-email"
					value="user@example.com"
				/>
			`).must.equal(outdent`
				Jsx("input", {
					type: "email",
					name: "new-email",
					value: "user@example.com"
				})
			`)
		})

		it("must compile self-closing element with dynamic attribute", function() {
			compile(outdent`
				<input value={name} />
			`).must.equal(outdent`
				Jsx("input", {value: name})
			`)
		})

		it("must compile self-closing with valueless attribute", function() {
			compile(outdent`
				<input required />
			`).must.equal(outdent`
				Jsx("input", {required: true})
			`)
		})

		it("must compile with valueless attribute and text", function() {
			compile(outdent`
				<textarea required>Hello</textarea>
			`).must.equal(outdent`
				Jsx("textarea", {required: true}, ["Hello"])
			`)
		})

		it("must compile self-closing element with two valueless attributes", function() {
			compile(outdent`
				<input required disabled />
			`).must.equal(outdent`
				Jsx("input", {required: true, disabled: true})
			`)
		})

		it("must compile element with two valueless attributes and text", function() {
			compile(outdent`
				<textarea required disabled>Hello</textarea>
			`).must.equal(outdent`
				Jsx("textarea", {required: true, disabled: true}, ["Hello"])
			`)
		})

		it("must compile self-closing element with two valueless attributes on separate lines", function() {
			compile(outdent`
				<input
					required
					disabled
				/>
			`).must.equal(outdent`
				Jsx("input", {
					required: true,
					disabled: true
				})
			`)
		})

		it("must compile element with two valueless attributes on separate lines and text", function() {
			compile(outdent`
				<textarea
					required
					disabled
				>Hello</textarea>
			`).must.equal(outdent`
				Jsx("textarea", {
					required: true,
					disabled: true
				}, ["Hello"])
			`)
		})

		it("must compile self-closing element with three valueless attributes on separate lines",
			function() {
			compile(outdent`
				<input
					required
					disabled
					readonly
				/>
			`).must.equal(outdent`
				Jsx("input", {
					required: true,
					disabled: true,
					readonly: true
				})
			`)
		})

		it("must compile self-closing element with a single spread attribute", function() {
			compile(outdent`
				<input {...attrs} />
			`).must.equal(outdent`
				Jsx("input", attrs)
			`)
		})

		it("must compile self-closing element with a single spread expression", function() {
			compile(outdent`
				<input {...Foo.ATTRS} />
			`).must.equal(outdent`
				Jsx("input", Foo.ATTRS)
			`)
		})

		it("must compile self-closing element with a single spread attribute with around dots", function() {
			compile(outdent`
				<input { ... attrs} />
			`).must.equal(outdent`
				Jsx("input",   attrs)
			`)
		})

		it("must compile self-closing element with a single spread attribute on separate line with internal whitespace", function() {
			compile(outdent`
				<input {
					...attrs
				} />
			`).must.equal(outdent`
				Jsx("input",
					attrs
				)
			`)
		})

		it("must compile self-closing element with a single spread attribute on separate line", function() {
			compile(outdent`
				<input
					{...attrs}
				/>
			`).must.equal(outdent`
				Jsx("input",
					attrs
				)
			`)
		})

		it("must compile self-closing element with a two spread attributes", function() {
			compile(outdent`
				<input {...defaults} {...attrs} />
			`).must.equal(outdent`
				Jsx("input", Object.assign({}, defaults, attrs))
			`)
		})

		it("must compile self-closing element with a named attribute and a spread attribute", function() {
			compile(outdent`
				<input name="age" {...attrs} />
			`).must.equal(outdent`
				Jsx("input", Object.assign({name: "age"}, attrs))
			`)
		})

		it("must compile self-closing element with a named attribute and a spread attribute using given assign name", function() {
			compile(outdent`
				<input name="age" {...attrs} />
			`, {assign: "Jsx.assign"}).must.equal(outdent`
				Jsx("input", Jsx.assign({name: "age"}, attrs))
			`)
		})

		it("must compile self-closing element with a spread attribute and named attribute", function() {
			compile(outdent`
				<input name="age" {...attrs} />
			`).must.equal(outdent`
				Jsx("input", Object.assign({name: "age"}, attrs))
			`)
		})

		it("must compile self-closing element with a single spread attribute on separate line and an attribute after", function() {
			compile(outdent`
				<input
					{...attrs}
					name="sex"
				/>
			`).must.equal(outdent`
				Jsx("input", Object.assign({},
					attrs, {
					name: "sex"
				}))
			`)
		})

		it("must compile self-closing element with a single attribute and spread attribute after on separate lines", function() {
			compile(outdent`
				<input
					name="sex"
					{...attrs}
				/>
			`).must.equal(outdent`
				Jsx("input", Object.assign({
					name: "sex"
					}, attrs
				))
			`)
		})

		it("must compile self-closing element with a spread attribute surrounded by named attributes", function() {
			compile(outdent`
				<input name="age" {...attrs} value="42" />
			`).must.equal(outdent`
				Jsx("input", Object.assign({name: "age"}, attrs, {value: "42"}))
			`)
		})

		it("must compile self-closing element with a spread attribute surrounded by named attributes on separate lines", function() {
			compile(outdent`
				<input
					name="age"
					{...attrs}
					value="42"
				/>
			`).must.equal(outdent`
				Jsx("input", Object.assign({
					name: "age"
					}, attrs, {
					value: "42"
				}))
			`)
		})

		it("must compile self-closing element with a named attribute surrounded by spread attributes on separate lines", function() {
			compile(outdent`
				<input
					{...defaults}
					name="age"
					{...attrs}
				/>
			`).must.equal(outdent`
				Jsx("input", Object.assign({},
					defaults, {
					name: "age"
					}, attrs
				))
			`)
		})
	})

	describe("given element with children", function() {
		it("must compile element with one line of text", function() {
			compile(outdent`
				<h1>Hello, John</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, John"])
			`)
		})

		it("must compile element with one line of text with multiple spaces", function() {
			compile(outdent`
				<h1>Hello,   John</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello,   John"])
			`)
		})

		it("must compile element with one line of text with inline whitespace", function() {
			compile(outdent`
				<h1>Hello,${WHITESPACE_SANS_NL}John</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello,${WHITESPACE_SANS_NL}John"])
			`)
		})

		it("must compile element with one line of text with whitespace around", function() {
			compile(outdent`
				<h1>${WHITESPACE_SANS_NL}Hello, John${WHITESPACE_SANS_NL}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}"Hello, John"])
			`)
		})

		it("must compile element with ampersand HTML entity", function() {
			compile(outdent`
				<h1>Hello, John &amp; Mike</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, John & Mike"])
			`)
		})

		it("must compile element with only non-breaking space HTML entity", function() {
			compile(outdent`
				<h1>&nbsp;</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["\xa0"])
			`)
		})

		it("must compile element with non-breaking space HTML entity", function() {
			compile(outdent`
				<h1>Hello,&nbsp;John</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello,\xa0John"])
			`)
		})

		it("must compile element with text with backslashes", function() {
			compile(outdent`
				<h1>Hello, John Smi\\th</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, John Smi\\\\th"])
			`)
		})

		it("must compile element with text with trailing backslash", function() {
			compile(outdent`
				<h1>Hello, John Smi\\</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, John Smi\\\\"])
			`)
		})

		it("must compile element with text with quotes", function() {
			compile(outdent`
				<h1>Hello, John "Maddox" Smith</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, John \\"Maddox\\" Smith"])
			`)
		})

		it("must compile element with text on separate line", function() {
			compile(outdent`
				<h1>
					Hello, John
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					"Hello, John"
				])
			`)
		})

		it("must compile element with text on separate line with whitespace around line", function() {
			compile(outdent`
				<h1>
					${WHITESPACE_SANS_NL}Hello, John${WHITESPACE_SANS_NL}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					${WHITESPACE_SANS_NL}"Hello, John"
				])
			`)
		})

		it("must compile element with two lines of text on separate lines", function() {
			compile(outdent`
				<h1>
					Hello, John!
					How are you?
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					"Hello, John! " +
					"How are you?"
				])
			`)
		})

		it("must compile element with two lines of text", function() {
			compile(outdent`
				<h1>Hello, John!
					How are you?</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, John! " +
					"How are you?"])
			`)
		})

		it("must compile element with two lines of text with whitespace around lines",
			function() {
			compile(outdent`
				<h1>
					${WHITESPACE_SANS_NL}Hello, John!${WHITESPACE_SANS_NL}
					${WHITESPACE_SANS_NL}How are you?${WHITESPACE_SANS_NL}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					${WHITESPACE_SANS_NL}"Hello, John! " +
					${WHITESPACE_SANS_NL}"How are you?"
				])
			`)
		})

		it("must compile element with three lines of text", function() {
			compile(outdent`
				<h1>
					Hello, John!
					How are you?
					You look good.
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					"Hello, John! " +
					"How are you? " +
					"You look good."
				])
			`)
		})

		it("must compile element with three lines of text with whitespace around lines",
			function() {
			compile(outdent`
				<h1>
					${WHITESPACE_SANS_NL}Hello, John!${WHITESPACE_SANS_NL}
					${WHITESPACE_SANS_NL}How are you?${WHITESPACE_SANS_NL}
					${WHITESPACE_SANS_NL}You look good.${WHITESPACE_SANS_NL}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					${WHITESPACE_SANS_NL}"Hello, John! " +
					${WHITESPACE_SANS_NL}"How are you? " +
					${WHITESPACE_SANS_NL}"You look good."
				])
			`)
		})

		it("must compile element with comment expression", function() {
			compile(outdent`
				<h1>{/* Hello */}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [/* Hello */])
			`)
		})

		it("must compile element with comment expression with external whitespace", function() {
			compile(outdent`
				<h1>${WHITESPACE_SANS_NL}{/* Hello */}${WHITESPACE_SANS_NL}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}/* Hello */${WHITESPACE_SANS_NL}])
			`)
		})

		it("must compile element with comment expression with internal whitespace", function() {
			compile(outdent`
				<h1>{${WHITESPACE_SANS_NL}/* Hello */${WHITESPACE_SANS_NL}}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}/* Hello */${WHITESPACE_SANS_NL}])
			`)
		})

		it("must compile element with expression", function() {
			compile(outdent`
				<h1>{name}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [name])
			`)
		})

		it("must compile element with expression with external whitespace",
			function() {
			compile(outdent`
				<h1>${WHITESPACE_SANS_NL}{name}${WHITESPACE_SANS_NL}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}name${WHITESPACE_SANS_NL}])
			`)
		})

		it("must compile element with expression with internal whitespace",
			function() {
			compile(outdent`
				<h1>{${WHITESPACE_SANS_NL}name${WHITESPACE_SANS_NL}}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}name${WHITESPACE_SANS_NL}])
			`)
		})

		it("must compile element with two expressions separated by space", function() {
			compile(outdent`
				<h1>{name} {age}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [name, " ", age])
			`)
		})

		it("must compile element with two expressions separated by two spaces", function() {
			compile(outdent`
				<h1>{name}  {age}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [name, "  ", age])
			`)
		})

		it("must compile element with two expressions separated by whitespace", function() {
			compile(outdent`
				<h1>{name}${WHITESPACE_SANS_NL}{age}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [name, "${WHITESPACE_SANS_NL}", age])
			`)
		})

		it("must compile element with expression with newlines around braces", function() {
			compile(outdent`
				<h1>
					{name}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					name
				])
			`)
		})

		it("must compile element with expression with newlines inside braces", function() {
			compile(outdent`
				<h1>{
					name
				}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					name
				])
			`)
		})

		it("must compile element with expression with newlines around and inside braces", function() {
			compile(outdent`
				<h1>
					{
						name
					}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					${""}
						name
					${""}
				])
			`)
		})

		it("must compile element with two expressions with external newlines around", function() {
			compile(outdent`
				<h1>
					{name}
					{age}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					name,
					age
				])
			`)
		})

		it("must compile element with three expressions with external newlines around", function() {
			compile(outdent`
				<h1>
					{name}
					{age}
					{sex}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					name,
					age,
					sex
				])
			`)
		})

		it("must compile element with text and expression", function() {
			compile(outdent`
				<h1>Super{man}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Super", man])
			`)
		})

		it("must compile element with expression and text ", function() {
			compile(outdent`
				<h1>{name}man</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [name, "man"])
			`)
		})

		it("must compile element with text, space and expression", function() {
			compile(outdent`
				<h1>Hello, {name}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, ", name])
			`)
		})

		it("must compile element with expression, space and text ", function() {
			compile(outdent`
				<h1>{name} Man</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [name, " Man"])
			`)
		})

		it("must compile element with text, expression and text", function() {
			compile(outdent`
				<h1>Super{man}!</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Super", man, "!"])
			`)
		})

		it("must compile element with expression, text and expression with spaces", function() {
			compile(outdent`
				<h1>{greeting} fellow {man}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [greeting, " fellow ", man])
			`)
		})

		it("must compile element with text, expression and text with spaces", function() {
			compile(outdent`
				<h1>Hello, {name} man!</h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello, ", name, " man!"])
			`)
		})

		it("must compile element with expression and text on separate lines", function() {
			compile(outdent`
				<h1>
					{name}
					Man
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					name,
					"Man"
				])
			`)
		})

		it("must compile element with text and expression on separate lines", function() {
			compile(outdent`
				<h1>
					Super
					{man}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					"Super",
					man
				])
			`)
		})

		it("must compile element with expression surrounded by text on separate lines", function() {
			compile(outdent`
				<h1>
					Hello,
					{name}
					!
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					"Hello,",
					name,
					"!"
				])
			`)
		})

		it("must compile element with expression surrounded by text on separate lines with whitespace", function() {
			compile(outdent`
				<h1>
					${WHITESPACE_SANS_NL}Hello,${WHITESPACE_SANS_NL}
					${WHITESPACE_SANS_NL}{name}${WHITESPACE_SANS_NL}
					${WHITESPACE_SANS_NL}!${WHITESPACE_SANS_NL}
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					${WHITESPACE_SANS_NL}"Hello,",
					${WHITESPACE_SANS_NL}name,${WHITESPACE_SANS_NL}
					${WHITESPACE_SANS_NL}"!"
				])
			`)
		})

		it("must compile element with one self-closing child element", function() {
			compile(outdent`
				<h1><br /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br")])
			`)
		})

		it("must compile element with one line of self-closing element and whitespace around", function() {
			compile(outdent`
				<h1>${WHITESPACE_SANS_NL}<br />${WHITESPACE_SANS_NL}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}Jsx("br")${WHITESPACE_SANS_NL}])
			`)
		})

		it("must compile element with self-closing child element on separate line", function() {
			compile(outdent`
				<h1>
					<br />
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					Jsx("br")
				])
			`)
		})

		it("must compile element with two self-closing elements on separate lines", function() {
			compile(outdent`
				<h1>
					<br />
					<hr />
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					Jsx("br"),
					Jsx("hr")
				])
			`)
		})

		it("must compile element with two self-closing elements separated by space", function() {
			compile(outdent`
				<h1><br /> <hr /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), " ", Jsx("hr")])
			`)
		})

		it("must compile element with two self-closing elements separated by two spaces", function() {
			compile(outdent`
				<h1><br />  <hr /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), "  ", Jsx("hr")])
			`)
		})

		it("must compile element with two self-closing elements separated by whitespace", function() {
			compile(outdent`
				<h1><br />${WHITESPACE_SANS_NL}<hr /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), "${WHITESPACE_SANS_NL}", Jsx("hr")])
			`)
		})

		it("must compile element with three self-closing elements on separate lines", function() {
			compile(outdent`
				<h1>
					<br />
					<hr />
					<input />
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					Jsx("br"),
					Jsx("hr"),
					Jsx("input")
				])
			`)
		})

		it("must compile element with element on separate line", function() {
			compile(outdent`
				<h1>
					<p>Hi, John!</p>
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					Jsx("p", null, ["Hi, John!"])
				])
			`)
		})

		it("must compile element with element with whitespace around", function() {
			compile(outdent`
				<h1>${WHITESPACE_SANS_NL}<br />${WHITESPACE_SANS_NL}</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [${WHITESPACE_SANS_NL}Jsx("br")${WHITESPACE_SANS_NL}])
			`)
		})

		it("must compile element with element and expression", function() {
			compile(outdent`
				<h1>Hello<br /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello", Jsx("br")])
			`)
		})

		it("must compile element with element, space and expression", function() {
			compile(outdent`
				<h1>Hello <br /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, ["Hello ", Jsx("br")])
			`)
		})

		it("must compile element with expression and element", function() {
			compile(outdent`
				<h1><br />Hello</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), "Hello"])
			`)
		})

		it("must compile element with expression, space and element", function() {
			compile(outdent`
				<h1><br /> Hello</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), " Hello"])
			`)
		})

		it("must compile element with element, expression and element", function() {
			compile(outdent`
				<h1><br />Hello<hr /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), "Hello", Jsx("hr")])
			`)
		})

		it("must compile element with element, expression and element with spaces", function() {
			compile(outdent`
				<h1><br /> Hello <hr /></h1>
			`).must.equal(outdent`
				Jsx("h1", null, [Jsx("br"), " Hello ", Jsx("hr")])
			`)
		})

		it("must compile element with element, text and element on separate lines", function() {
			compile(outdent`
				<h1>
					<br />
					or
					<hr />
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					Jsx("br"),
					"or",
					Jsx("hr")
				])
			`)
		})

		it("must compile element with element, text with non-breaking space and element on separate lines", function() {
			compile(outdent`
				<h1>
					<br />
					&nbsp;or&nbsp;
					<hr />
				</h1>
			`).must.equal(outdent`
				Jsx("h1", null, [
					Jsx("br"),
					"\xa0or\xa0",
					Jsx("hr")
				])
			`)
		})
	})

	describe("given component", function() {
		describe("given no component factory name", function() {
			it("must compile self-closing component", function() {
				compile(`<Person />`).must.equal(`Person()`)
			})

			it("must compile empty component", function() {
				compile(`<Person></Person>`).must.equal(`Person()`)
			})

			it("must compile self-closing property accessed component", function() {
				compile(`<People.Person />`).must.equal(`People.Person()`)
			})

			it("must compile component with one line text", function() {
				compile(outdent`
					<Person>John</Person>
				`).must.equal(outdent`
					Person(null, ["John"])
				`)
			})

			it("must compile self-closing component with attribute", function() {
				compile(outdent`
					<Person name="John Doe" />
				`).must.equal(outdent`
					Person({name: "John Doe"})
				`)
			})

			it("must compile component with attribute and text", function() {
				compile(outdent`
					<Person name="John Doe">Hello, John</Person>
				`).must.equal(outdent`
					Person({name: "John Doe"}, ["Hello, John"])
				`)
			})
		})

		describe("when component factory name", function() {
			function compile(jsx) {
				return Js.compile({
					componentFactory: "Jsx.Component"
				}, parse(jsx).ast, jsx)
			}

			it("must compile self-closing component", function() {
				compile(`<Person />`).must.equal(`Jsx.Component(Person)`)
			})

			it("must compile empty component", function() {
				compile(`<Person></Person>`).must.equal(`Jsx.Component(Person)`)
			})

			it("must compile self-closing property accessed component", function() {
				compile(`<People.Person />`).must.equal(`Jsx.Component(People.Person)`)
			})

			it("must compile component with one line text", function() {
				compile(outdent`
					<Person>John</Person>
				`).must.equal(outdent`
					Jsx.Component(Person, null, ["John"])
				`)
			})
		})
	})

	describe("given fragment", function() {
		describe("given no fragment factory name", function() {
			it("must compile element", function() {
				compile(outdent`
					<><br /></>
				`).must.equal(outdent`
					[Jsx("br")]
				`)
			})

			it("must compile element surrounded by whitespace", function() {
				compile(outdent`
					<>${WHITESPACE_SANS_NL}<br />${WHITESPACE_SANS_NL}</>
				`).must.equal(outdent`
					[${WHITESPACE_SANS_NL}Jsx("br")${WHITESPACE_SANS_NL}]
				`)
			})

			it("must compile two elements on separate lines", function() {
				compile(outdent`
					<>
						<br />
						<hr />
					</>
				`).must.equal(outdent`
					[
						Jsx("br"),
						Jsx("hr")
					]
				`)
			})
		})

		describe("given a fragment factory name", function() {
			function compile(jsx) {
				return Js.compile({
					fragmentFactory: "Jsx.Fragment"
				}, parse(jsx).ast, jsx)
			}

			it("must compile element", function() {
				compile(outdent`
					<><br /></>
				`).must.equal(outdent`
					Jsx.Fragment(null, [Jsx("br")])
				`)
			})

			it("must compile element surrounded by whitespace", function() {
				compile(outdent`
					<>${WHITESPACE_SANS_NL}<br />${WHITESPACE_SANS_NL}</>
				`).must.equal(outdent`
					Jsx.Fragment(null, [${WHITESPACE_SANS_NL}Jsx("br")${WHITESPACE_SANS_NL}])
				`)
			})

			it("must compile two elements on separate lines", function() {
				compile(outdent`
					<>
						<br />
						<hr />
					</>
				`).must.equal(outdent`
					Jsx.Fragment(null, [
						Jsx("br"),
						Jsx("hr")
					])
				`)
			})
		})
	})
})

function compile(jsx, opts) { return Js.compile(opts, parse(jsx).ast, jsx) }
