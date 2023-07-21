var Acorn = require("acorn")
var parser = Acorn.Parser.extend(require("acorn-jsx")())
var compile = require("./lib/js").compile
var assign = require("./lib").assign
exports = module.exports = parseAndCompile
exports.compile = compile
exports.parse = parse

function parseAndCompile(jsx, opts) {
	var ast = parse(jsx, opts && {
		ecmaVersion: opts.ecmaVersion,
		sourceType: opts.sourceType
	})

	return compile(assign(ast.jsx, opts), ast, jsx)
}

function parse(jsx, opts) {
	var factory, fragmentFactory
	var ecmaVersion = opts && opts.ecmaVersion || "latest"

	// It's not the job of a JSX parser-compiler to validate code, hence all
	// Acorn checks like super-outside-method and private field checking is
	// disabled. This also permits running J6pack over code fragments from
	// a larger program.
	return assign(parser.parse(jsx, defaults({
		ecmaVersion: ecmaVersion,

		sourceType: (
			opts && opts.sourceType ||
			(ecmaVersion == "3" || ecmaVersion == "5" ? "script" : "module")
		),

		onComment: function(isBlockComment, comment) {
			var m
			if (!isBlockComment) return

			if (
				factory == null &&
				(m = /^\*[ \t]*@jsx[ \t]+([^\s]+)[ \t]*/.exec(comment))
			) factory = m[1]

			// Babel seems to support @jsxFrag:
			// https://babeljs.io/docs/babel-plugin-transform-react-jsx#customizing-with-the-classic-runtime
			if (
				fragmentFactory == null &&
				(m = /^\*[ \t]*@jsxFrag[ \t]+([^\s]+)[ \t]*/.exec(comment))
			) fragmentFactory = m[1]
		}
	}, opts, {
		allowAwaitOutsideFunction: true,
		allowReturnOutsideFunction: true,
		allowSuperOutsideMethod: true,
		checkPrivateFields: false,
		allowHashBang: true
	})), {jsx: {factory: factory, fragmentFactory: fragmentFactory}})
}

function defaults(target) {
  if (target != null) for (var i = 1; i < arguments.length; ++i) {
    var source = arguments[i]
    for (var key in source) if (!(key in target)) target[key] = source[key]
  }

  return target
}
