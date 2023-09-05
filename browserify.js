var PassThrough = require("stream").PassThrough
var StreamCompiler = require("./stream_compiler")

exports = module.exports = function(path, opts) {
  if (!path.endsWith(".jsx")) return new PassThrough
	return new StreamCompiler(opts)
}
