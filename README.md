J6Pack.js
=========
[![NPM version][npm-badge]](https://www.npmjs.com/package/j6pack)
[![Build status][build-badge]](https://github.com/moll/js-j6pack/actions/workflows/node.yaml)

J6Pack.js is a JavaScript library that transpiles **JSX to JavaScript** _and_ can separately render **JSX to HTML**. It comes with a [Browserify][browserify] transform out of the box. It's also usable from Node.js to **render JSX on the server side** and can hook into **[Express.js][express] view rendering**. J6Pack **does not depend on React nor implements a virtual DOM**. The HTML it renders is just text, though with interpolated values securely escaped.

To use JSX on the backend with Node.js, you don't need an external build tool. Just let J6Pack.js handle the JSX translation transparently as you `require` or import modules.

J6Pack.js defaults to using [Acorn][acorn] for parsing JSX — supporting ECMAScript 14 (2023) and beyond — but you're welcome to use any [ESTree](https://github.com/estree/estree) compatible parser and invoke J6Pack.js's compiler directly.

For pedantics, the JavaScript it renders preserves all the whitespace and newlines in your JSX source and is therefore very human readable.

[npm-badge]: https://img.shields.io/npm/v/j6pack.svg
[build-badge]: https://github.com/moll/js-j6pack/actions/workflows/node.yaml/badge.svg
[express]: https://expressjs.com
[acorn]: https://www.npmjs.com/package/acorn
[browserify]: https://browserify.org


Installing
----------
```sh
npm install j6pack
```

J6Pack.js follows [semantic versioning](http://semver.org), so feel free to depend on its major version with something like `>= 1.0.0 < 2` (a.k.a `^1.0.0`).


Using J6Pack to Render HTML
---------------------------
For just generating HTML out of JSX function calls, require J6Pack.js and call it in the style of [`React.createElement`](https://react.dev/reference/react/createElement) or [equivalent JSX-functions](https://reactjs.org/docs/jsx-in-depth.html), with the exception that children need to always be in an array.

```javascript
var Jsx = require("j6pack")

var html = Jsx("p", {class: "greeting"}, [
  "Hello, ",
  Jsx("em", null, ["world"]),
  "!"
])

String(html) // => "<p class=\"greeting\">Hello, <em>world</em>!</p>"
```

The `html` variable above is an instance of `Jsx.Html` with `valueOf` and `toString` methods that return the HTML for the entire tree. The use of a value object over a string is mostly an implementation requirement of the way JSX compilers work. It does however permit you to differentiate between unescaped strings and escaped HTML via `instanceof` should you need to:

```javascript
Jsx("p", null, ["Hello, world!"]) instanceof Jsx.Html // => true
<p>Hello, world!</p> instanceof Jsx.Html // => true
```

To use the JSX syntax (`<p>Hello, {name}!</p>`) in JavaScript on Node.js, see below.

### XML
J6Pack.js by default renders HTML5 compatible HTML. If you'd like to use it to render generic XML, for example to render an [Atom feed](https://en.wikipedia.org/wiki/Atom_(Web_standard)), you can require the XML variant:

```javascript
var Jsx = require("j6pack/xml")

var xml = <feed xmlns="http://www.w3.org/2005/Atom">
  <id>http://example.com</id>
  <title>My Blog</title>

  {articles.map(function(article) {
    return <entry>
      <id>{article.url}</id>
      <title>{article.title}</title>
      <content type="text">{article.text}</content>
    </entry>
  })}
</feed>
```

The HTML and XML serializers render slightly differently:

- HTML is rendered with explicit closing-elements for empty tags, except for the [void elements in the HTML standard][void-elements] (like `<input>`).
- HTML forbids children for [void elements][void-elements].
- HTML escapes `<script` and `<!--` text inside `<script>` elements.

[void-elements]: https://developer.mozilla.org/en-US/docs/Glossary/Void_element

J6Pack.js and the [Acorn][acorn] parser it defaults to also supports element namespaces, so you're not required to use XML default namespaces:

```javascript
var xml = <atom:feed xmlns:atom="http://www.w3.org/2005/Atom">
  <atom:id>http://example.com</atom:id>
  <atom:title>My Blog</atom:title>

  {articles.map(function(article) {
    return <atom:entry>
      <atom:id>{article.url}</atom:id>
      <atom:title>{article.title}</atom:title>
      <atom:content type="text">{article.text}</atom:content>
    </atom:entry>
  })}
</atom:feed>
```

As with HTML above, you can use differentiate between unescaped strings and escaped XML via `instanceof Jsx.Xml`:

```javascript
Jsx("p", null, ["Hello, world!"]) instanceof Jsx.Xml // => true
<p>Hello, world!</p> instanceof Jsx.Xml // => true
```

### DOM Attributes and Properties
J6Pack.js renders JSX to HTML with minimal transformations, so *use HTML attribute names, not DOM properties*. That is, to set the tag's `class` attribute, use `<p class="greeting">Hello, world!</p>` rather than `className` as you would with React. Same goes for elements' `onclick`, `<label>`s' `for`, `<input>`s' `readonly` and so on.

### Interpolating HTML (like `innerHTML`)
Should you need to interpolate HTML into JSX, you can't use the `innerHTML` property (or React's [dangerouslySetInnerHTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)) as those live only in the DOM world, not in HTML. Instead, use the `Jsx.html` function to inject your HTML into otherwise escaped values:

```javascript
var Jsx = require("j6pack")
var html = <p>Hello, {Jsx.html("<em>world</em>")}!</p>
String(html) // => "<p>Hello, <em>world</em>!</p>"
```

When you're rendering XML, use `Jsx.xml`:

```javascript
var Jsx = require("j6pack/xml")

var atom = <feed xmlns="http://www.w3.org/2005/Atom">
  <id>http://example.com</id>
  <title>My Blog</title>
  {Jsx.xml("<entry>…</entry>")}
</feed>
```

### Custom Elements (Functional Components)
Just like React or other virtual DOM implementations, J6Pack.js supports custom elements. Behind the scenes a custom element is really just a function that gets invoked with two arguments — an object of attributes and an array of children. Both can be `null`/`undefined` if they were not given, so beware.

```javascript
function Page(attrs, children) {
  return <html>
    <head><title>{attrs.title}</title></head>
    <body>{children}</body>
  </html>
}

var html = <Page title="Test Page">
  <p>Hello, world!</p>
</Page>
```

### Returning Multiple Elements (React Fragments)
Occasionally you may want a custom element to return multiple elements without wrapping them in yet another element. You can do that in two ways.

Return an array of elements:

```javascript
var Jsx = require("j6pack")

function Input(attrs) {
  return [
    <label>{attrs.label}</label>,
    <input type={attrs.type} value={attrs.value} />
  ]
}
```

Alternatively, wrap them in an `<>` element, akin to how [`React.Fragment`](https://react.dev/reference/react/Fragment) works:

```javascript
var Jsx = require("j6pack")

function Input(attrs) {
  return <>
    <label>{attrs.label}</label>
    <input type={attrs.type} value={attrs.value} />
  </>
}
```

Then use it as you would any other custom element:

```javascript
var html = <div>
  <Input label="Name" value="John" />
  <br />
  <Input label="Age" type="number" value={42} />
</div>
```

### ESLint
If you use [ESLint][eslint] with the [ESLint React plugin][eslint-react] to lint your JavaScript and are getting an error about [missing `React` when using JSX](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md), you may have to specify a pragma to inform ESLint of the JSX function used:

```javascript
/** @jsx Jsx */
var Jsx = require("j6pack")
var html = <p>Hello, world!</p>
```

A sufficiently new version of [ESLint React plugin][eslint-react] seems to also have a `pragma` setting to set the factory function once for the entire project.


Using J6Pack to Render JSX to JavaScript
----------------------------------------
### Node.js
To add support for JSX syntax to Node.js, require `j6pack/register` before starting the app:

```sh
node --require j6pack/register app.js
```

Or require it in your main entry file before you load `.jsx` files:

```javascript
require("j6pack/register")
```

Then you can write JSX anywhere in `.jsx` files and render HTML, for example, from within your request handlers:

```javascript
var Jsx = require("j6pack")
var Http = require("http")

function handleRequest(_req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8")

  res.end(<html>
    <head><title>J6Pack Test Server</title></head>
    <body><p>Hello, world!</p></body>
  </html>.toString("doctype"))
}

Http.createServer(handleRequest).listen(process.env.PORT || 3000)
```

The same example code is in `examples/server.jsx` which you can run via `make examples/server.jsx` and view on <http://localhost:3000> by default.

### Browserify
To have [Browserify][browserify] use J6Pack.js for precompiling JSX files to JavaScript, pass `j6pack/browserify` as a transform when invoking Browserify:

```sh
browserify --extension=jsx --transform j6pack/browserify
```

Or add a `browserify` property to `package.json`:

```json
{
	"browserify": {
		"transform": ["j6pack/browserify"]
	}
}
```

### Express.js
J6Pack.js comes with explicit support for the [Express.js][express] web framework [templates](https://expressjs.com/en/guide/using-template-engines.html). To add `.jsx` template support to Express.js, set it as an engine:

```javascript
var Express = require("express")
var app = Express()
app.engine(".jsx", require("j6pack/express"))
```

You can then render a JSX component through `res.render`. As its attributes it gets the sum of global `app.locals`, request's `res.locals` and the attributes you pass to `res.render`, much just like a [Jade/Pug](https://pugjs.org) template would:

```javascript
app.get("/", function(_req, res) {
  res.render("index_page.jsx", {greeting: "Hello, world!"})
})
```

An example template in `views/index_page.jsx`:

```javascript
var Jsx = require("j6pack")

module.exports = function(attrs) {
  return <html>
    <head><title>J6Pack Test Express Template Server</title></head>
    <body><p>{attrs.greeting}</p></body>
  </html>
}
```

Note that you don't need to wrap the JSX in `String` as you did elsewhere. That's handled for you by J6Pack.js's integration with Express.js.

If you'd rather have your routes render HTML directly without extracting templates to a separate file, you can do the same as with the plain HTTP server above. You don't even need to set the `view engine` parameter as this will be bypassing Express.js's templating entirely:

```javascript
var Jsx = require("j6pack")
var Http = require("http")
var Express = require("express")
var app = Express()

app.get("/", function(_req, res) {
  res.send(<html>
    <head><title>J6Pack Test Express Server</title></head>
    <body><p>Hello, world!</p></body>
  </html>.toString("doctype"))
})

Http.createServer(handleRequest).listen(process.env.PORT || 3000)
```

Note we're using `res.send`. That sets the `Content-Type` header automatically that we previously had to set ourselves with `res.setHeader`.

If you want Express to default to the `.jsx` extension for templates, set the `view engine` property to `.jsx`:

```javascript
var Express = require("express")
var app = Express()
app.set("view engine", ".jsx")
```

You can then leave out the `.jsx` extension from your `res.render` call:

```javascript
app.get("/", function(_req, res) {
  res.render("index_page", {greeting: "Hello, world!"})
})
```

### Renaming the `Jsx` Function
By default the transpiled JavaScript expects the name of the JSX-render (factory) function to be `Jsx`. That's why all the examples here assign `require("j6pack")` to `Jsx`. If you want to use a different function name, feel free to either use the `@jsx` pragma or make a local copy of `j6pack/register` for use in Node.js.

```javascript
/** @jsx Jaysex */
var Jaysex = require("j6pack")
var html = <p>Hello, world!</p>
```

Or run the following JavaScript at the start of the your app (just like `require`ing `j6pack/register` does):

```javascript
var Fs = require("fs")
var compile = require("./compiler")

require.extensions[".jsx"] = function(module, path) {
  var source = Fs.readFileSync(path, "utf8")
  module._compile(compile(source, {factory: "Jaysex"}), path)
}
```

### Renaming `Object.assign` for Spread Attributes
Spread attributes get compiled down to using `Object.assign`. For example, the following:

```javascript
<input {...defaults} name="email" {...attrs} />
```

Gets compiled down to:

```javascript
Jsx("input", Object.assign({}, defaults, {name: "email"}, attrs))
```

If for some reason you wish to not depend on `Object.assign`, you can use the `assign` option when compiling to replace `Object.assign` with a function name of your own. Works the same as above with changing the `factory` function name.

### Executable
J6Pack.js comes with a simple executable, `j6pack` that you can use to precompile JSX, perhaps for testing or just seeing what JSX transpiles down to. After installing J6Pack.js, invoke it with `./node_modules/.bin/j6pack` or from `bin/j6pack` from this repository:

```sh
cat views/index_page.jsx | ./node_modules/.bin/j6pack
./node_modules/.bin/j6pack views/index_page.jsx
```

[eslint]: https://eslint.org/
[eslint-react]: https://github.com/yannickcr/eslint-plugin-react


License
-------
J6Pack.js is released under a *Lesser GNU Affero General Public License*, which in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g. bug-fixes) you've made to this program.

For more convoluted language, see the `LICENSE` file.


About
-----
**[Andri Möll][moll]** typed this and the code.  
[Monday Calendar][monday] and [Billberry][billberry] supported the engineering work.

If you find J6Pack.js needs improving, please don't hesitate to type to me now at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-j6pack/issues
[moll]: https://m811.com
[monday]: https://mondayapp.com
[billberry]: https://billberry.ee
