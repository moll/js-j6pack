var compile = require("../compiler")
var outdent = require("./outdent")

describe("Compile", function() {
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

	it("must compile await outside function", function() {
		compile(`await foo()`).must.equal(`await foo()`)
	})

	it("must compile return outside function", function() {
		compile(`return foo()`).must.equal(`return foo()`)
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

		it("must not use the factory function given newlined pragma",
			function() {
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
})
