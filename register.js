var Fs = require("fs")
var compile = require("./compiler")
exports.options = {}

require.extensions[".jsx"] = function(module, path) {
  var source = Fs.readFileSync(path, "utf8")
  module._compile(compile(source, exports.options), path)
}
