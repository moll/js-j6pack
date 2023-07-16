var TransformStream = require("stream").Transform
var compile = require("./compiler")
module.exports = StreamCompiler

function StreamCompiler(opts) {
	this.options = opts
	this.js = []
	TransformStream.call(this, {encoding: "utf8"})
}

StreamCompiler.prototype = Object.create(TransformStream.prototype, {
	constructor: {value: TransformStream, configurable: true, writeable: true}
})

StreamCompiler.prototype._transform = function(js, _encoding, done) {
	this.js.push(js)
	done()
}

StreamCompiler.prototype._flush = function(done) {
	try { this.push(this.compile()); done() }
	catch (ex) { done(ex) }
}

StreamCompiler.prototype.compile = function() {
	return compile(this.js.join(""), this.options)
}
