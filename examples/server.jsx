/** @jsx Jsx */
var Jsx = require("..")
var Url = require("url")
var Http = require("http")
var PORT = process.env.PORT || 3000

function handleRequest(_req, res) {
	res.setHeader("Content-Type", "text/html; charset=utf-8")

	res.end(<html>
		<head><title>J6Pack Test Server</title></head>
		<body><p>Hello, world!</p></body>
	</html>.toString("doctype"))
}

Http.createServer(handleRequest).listen(PORT, function() {
	var addr = this.address()

	console.log("Listening on %s.", typeof addr == "string"? addr : Url.format({
		protocol: "http", hostname: addr.address, port: addr.port
	}))
})
