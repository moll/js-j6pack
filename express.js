if (require.extensions[".jsx"] == null) void require("j6pack/register")

module.exports = function(path, attrs, done) {
	// NOTE: Express expects the view engine to cache compiled views. Jade, for
	// example, keeps a global cache on Jade.cache. We're depending on the Node
	// module cache through `require`.
	done(null, require(path)(attrs).toString("doctype"))
}
