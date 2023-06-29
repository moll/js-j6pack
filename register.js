var Fs = require("fs")
var compile = require("./compiler")

require.extensions[".jsx"] = function(module, path) {
  var source = Fs.readFileSync(path, "utf8")
  module._compile(compile(source), path)
}
