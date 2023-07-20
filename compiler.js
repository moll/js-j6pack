var Acorn = require("acorn")
var parser = Acorn.Parser.extend(require("acorn-jsx")())
var compile = require("./lib/js").compile
exports = module.exports = parseAndCompile
exports.compile = compile
exports.parse = parse

function parseAndCompile(jsx, opts) {
	var parsed = parse(jsx)
	return compile(assign({factory: parsed.factory}, opts), parsed.ast, jsx)
}

function parse(jsx, opts) {
	var factory = null

	var ecmaVersion = opts && opts.ecmaVersion || "latest"
	var sourceType = ecmaVersion == "3" || ecmaVersion == "5" ? "script" : "module"

	var ast = parser.parse(jsx, assign({
		ecmaVersion: ecmaVersion,
		sourceType: sourceType,
		allowAwaitOutsideFunction: true,
		allowReturnOutsideFunction: true,
		allowHashBang: true,
		preserveParens: false,
		locations: false,

		onComment: function(isBlockComment, comment) {
			if (!isBlockComment) return
			if (factory != null) return
			var m = /^\*[ \t]*@jsx[ \t]+([^\s]+)[ \t]*/.exec(comment)
			if (m) factory = m[1]
		}
	}, opts))

	return {ast: ast, factory: factory}
}

function assign(target) {
  if (target != null) for (var i = 1; i < arguments.length; ++i) {
    var source = arguments[i]
    for (var key in source) target[key] = source[key]
  }

  return target
}
