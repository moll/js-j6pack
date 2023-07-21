var isArray = Array.isArray

exports.typeOf = function(value) {
	return value === null ? "null" : isArray(value) ? "array" : typeof value
}

exports.assign = function(target) {
  if (target != null) for (var i = 1; i < arguments.length; ++i) {
    var source = arguments[i]
    for (var key in source) target[key] = source[key]
  }

  return target
}
