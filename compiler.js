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
	var factory
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
			if (!isBlockComment) return
			if (factory != null) return
			var m = /^\*[ \t]*@jsx[ \t]+([^\s]+)[ \t]*/.exec(comment)
			if (m) factory = m[1]
		}
	}, opts, {
		allowAwaitOutsideFunction: true,
		allowReturnOutsideFunction: true,
		allowSuperOutsideMethod: true,
		checkPrivateFields: false,
		allowHashBang: true
	})), {jsx: {factory: factory}})
}

function defaults(target) {
  if (target != null) for (var i = 1; i < arguments.length; ++i) {
    var source = arguments[i]
    for (var key in source) if (!(key in target)) target[key] = source[key]
  }

  return target
}
