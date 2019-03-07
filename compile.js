var JsxTransform = require("jsx-transform")

var OPTS = {
	factory: "Jsx",
	passUnknownTagsToFactory: false,
	arrayChildren: true
}

module.exports = function(source) {
  return JsxTransform.fromString(source, OPTS)
}
