var compile = require("../compiler")
var outdent = require("./outdent")
var ACORN_VERSION = require("acorn").version

describe("Compile", function() {
	it("must compile export declaration", function() {
		compile(outdent`
			export default {name: "John"}
			export function foo() {}
			export * from "bar"
		`).must.equal(outdent`
			export default {name: "John"}
			export function foo() {}
			export * from "bar"
		`)
	})

	it("must compile import declaration", function() {
		compile(outdent`
			import Foo from "foos"
			import * as Wild from "wilderness"
			import {names as NAMES} from "names"
		`).must.equal(outdent`
			import Foo from "foos"
			import * as Wild from "wilderness"
			import {names as NAMES} from "names"
		`)
	})

	it("must compile import.meta expression", function() {
		compile(outdent`
			console.log(import.meta.url)
		`).must.equal(outdent`
			console.log(import.meta.url)
		`)
	})

	it("must compile regular vars, lets and consts", function() {
		compile(outdent`
			var age = 42
			let name = "John"
			const sex = MALE
		`).must.equal(outdent`
			var age = 42
			let name = "John"
			const sex = MALE
		`)
	})

	it("must compile with hashbang", function() {
		compile(outdent`
			#!/usr/bin/env node
			foo()
		`).must.equal(outdent`
			#!/usr/bin/env node
			foo()
		`)
	})

	it("must compile private fields", function() {
		compile(outdent`
			class JavaScriptUsedToBeMinimallyGood {
				#learnToSayNo

				constructor() {
					this.#learnToSayNo = false
				}
			}
		`).must.equal(outdent`
			class JavaScriptUsedToBeMinimallyGood {
				#learnToSayNo

				constructor() {
					this.#learnToSayNo = false
				}
			}
		`)
	})

	;(isVersionGte(ACORN_VERSION, "8.10.0") ? it : xit)("must compile undeclared private fields", function() {
		compile(outdent`
			class JavaScriptUsedToBeMinimallyGood {
				constructor() {
					this.#learnToSayNo = false
				}
			}
		`).must.equal(outdent`
			class JavaScriptUsedToBeMinimallyGood {
				constructor() {
					this.#learnToSayNo = false
				}
			}
		`)
	})

	;(isVersionGte(ACORN_VERSION, "8.10.0") ? it : xit)("must compile private fields outside of class", function() {
		compile(outdent`
			function javaScriptCommittee() {
				this.#canSayNo = false
			}
		`).must.equal(outdent`
			function javaScriptCommittee() {
				this.#canSayNo = false
			}
		`)
	})

	it("must compile await outside function", function() {
		compile(`await foo()`).must.equal(`await foo()`)
	})

	it("must compile return outside function", function() {
		compile(`return foo()`).must.equal(`return foo()`)
	})

	it("must compile super outside method", function() {
		compile(`super.foo()`).must.equal(`super.foo()`)
	})

	it("must compile function calls on one line", function() {
		compile(`foo(); bar()`).must.equal(`foo(); bar()`)
	})

	it("must compile superfluous parentheses", function() {
		compile(`((foo()))`).must.equal(`((foo()))`)
	})

	describe("given element", function() {
		it("must compile self-closing element", function() {
			compile(`<a />`).must.equal(`Jsx("a")`)
		})

		it("must compile empty element", function() {
			compile(`<h1></h1>`).must.equal(`Jsx("h1")`)
		})
	})

	describe("given ECMA version option", function() {
		;[
			"3",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"latest"
		].forEach(function(ver) {
			it("must compile given ECMAScript " + ver, function() {
				compile(outdent`
					function foo() {}
				`, {ecmaVersion: ver}).must.equal(outdent`
					function foo() {}
				`)
			})
		})

		it("must err given import or export with ECMAScript 3", function() {
			var err
			try {
				compile(outdent`
					export default {name: "John"}
					import * as Module from "module"
				`, {ecmaVersion: "3"})
			}
			catch (ex) { err = ex }
			err.must.be.an.error(SyntaxError, /Unexpected token/)
		})

		it("must err given import or export with ECMAScript 5", function() {
			var err
			try {
				compile(outdent`
					export default {name: "John"}
					import * as Module from "module"
				`, {ecmaVersion: "5"})
			}
			catch (ex) { err = ex }
			err.must.be.an.error(SyntaxError, /keyword.*reserved/)
		})

		;[
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12",
			"13",
			"14",
			"latest"
		].forEach(function(ver) {
			it("must not err given import or export with ECMAScript " + ver,
				function() {
				compile(outdent`
					export default {name: "John"}
					import * as Module from "module"
				`, {ecmaVersion: ver}).must.equal(outdent`
					export default {name: "John"}
					import * as Module from "module"
				`)
			})
		})
	})

	describe("given source type option", function() {
		it("must err given import or export with source type script", function() {
			var err
			try {
				compile(outdent`
					export default {name: "John"}
					import * as Module from "module"
				`, {ecmaVersion: "6", sourceType: "script"})
			}
			catch (ex) { err = ex }
			err.must.be.an.error(SyntaxError, /sourceType: module/)
		})

		it("must permit import or export with source type module", function() {
			compile(outdent`
				export default {name: "John"}
				import * as Module from "module"
			`, {ecmaVersion: "5", sourceType: "module"}).must.equal(outdent`
				export default {name: "John"}
				import * as Module from "module"
			`)
		})
	})

	describe("given @jsx pragma", function() {
		it("must use the given factory function", function() {
			compile(outdent`
				/** @jsx Jaysex */
				<a />
			`).must.equal(outdent`
				/** @jsx Jaysex */
				Jaysex("a")
			`)
		})

		it("must use the factory function given no leading or trailing spaces",
			function() {
			compile(outdent`
				/**@jsx Jaysex*/
				<a />
			`).must.equal(outdent`
				/**@jsx Jaysex*/
				Jaysex("a")
			`)
		})

		it("must use the factory function given tabs", function() {
			compile(outdent`
				/**\t@jsx Jaysex\t*/
				<a />
			`).must.equal(outdent`
				/**\t@jsx Jaysex\t*/
				Jaysex("a")
			`)
		})

		it("must not use the factory function given newlined pragma", function() {
			compile(outdent`
				/**
					@jsx Jaysex
				*/
				<a />
			`).must.equal(outdent`
				/**
					@jsx Jaysex
				*/
				Jsx("a")
			`)
		})
	})

	describe("given @jsxFrag pragma", function() {
		it("must use the given fragment factory function", function() {
			compile(outdent`
				/** @jsxFrag Jaysex.Fragment */
				<><br /></>
			`).must.equal(outdent`
				/** @jsxFrag Jaysex.Fragment */
				Jaysex.Fragment(null, [Jsx("br")])
			`)
		})

		it("must use the factory function given no leading or trailing spaces",
			function() {
			compile(outdent`
				/**@jsxFrag Jaysex.Fragment*/
				<><br /></>
			`).must.equal(outdent`
				/**@jsxFrag Jaysex.Fragment*/
				Jaysex.Fragment(null, [Jsx("br")])
			`)
		})

		it("must use the factory function given tabs", function() {
			compile(outdent`
				/**\t@jsxFrag Jaysex.Fragment\t*/
				<><br /></>
			`).must.equal(outdent`
				/**\t@jsxFrag Jaysex.Fragment\t*/
				Jaysex.Fragment(null, [Jsx("br")])
			`)
		})

		it("must not use the factory function given newlined pragma", function() {
			compile(outdent`
				/**
					@jsxFrag Jaysex.Fragment
				*/
				<><br /></>
			`).must.equal(outdent`
				/**
					@jsxFrag Jaysex.Fragment
				*/
				[Jsx("br")]
			`)
		})
	})
})

function isVersionGte(version, than) {
	version = version.split(".")
	than = than.split(".")

	return (
		(version[0] || 0) >= (than[0] || 0) &&
		(version[1] || 0) >= (than[1] || 0) &&
		(version[2] || 0) >= (than[2] || 0)
	)
}
