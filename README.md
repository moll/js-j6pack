J6Pack.js
=========
[![NPM version][npm-badge]](https://www.npmjs.com/package/j6pack)
[![Build status][build-badge]](https://github.com/moll/js-j6pack/actions/workflows/node.yaml)

J6Pack.js is a JavaScript library that compiles **JSX to JavaScript** _and_ can then render the **JSX to HTML or XML**. You can use it to add JSX support to Node.js without build tools. Its HTML/XML rendering is also compatible with any web framework, though it's got builtin support for **[Express.js][express]**. You can even use it client-side as the HTML/XML rendering is ECMAScript 5 compatible. There's even a [Browserify][browserify] plugin handy for bundling.

J6Pack **does not depend on React nor implements a virtual DOM**. The HTML/XML it renders is just text, though with interpolated values securely escaped.

J6Pack.js defaults to using [Acorn][acorn] for parsing JSX — supporting ECMAScript 14 (2023) and beyond — but you're welcome to use any [ESTree](https://github.com/estree/estree) compatible parser and invoke J6Pack.js's compiler directly.

For pedantics, the JavaScript it renders preserves all the whitespace and newlines in your JSX source and is therefore very human readable.

[npm-badge]: https://img.shields.io/npm/v/j6pack.svg
[build-badge]: https://github.com/moll/js-j6pack/actions/workflows/node.yaml/badge.svg
[express]: https://expressjs.com
[acorn]: https://www.npmjs.com/package/acorn
[browserify]: https://browserify.org

### Table of Contents
1. [Installing](#installing)
2. [Rendering HTML/XML](#rendering-html-or-xml)
3. [Compiling JSX to JavaScript](#compiling-jsx-to-javascript)
4. [Using JSX with Node.js](#using-jsx-with-nodejs)
5. [Compiling JSX to JavaScript with Browserify](#compiling-jsx-to-javascript-with-browserify)


Installing
----------
```sh
npm install j6pack
```

J6Pack.js follows [semantic versioning](http://semver.org), so feel free to depend on its major version with something like `>= 1 < 2` (a.k.a `^1`).


Rendering HTML or XML
---------------------
For rendering HTML, import J6Pack.js and call it in the style of [`React.createElement`](https://react.dev/reference/react/createElement) or [equivalent JSX-functions](https://reactjs.org/docs/jsx-in-depth.html), with the additional **requirement that children always be in an array**. Generally that's how a JSX compiler/transpiler would render the function calls.

For example, setting the factory function to `Jsx` via the `@jsx` pragma (most JSX compilers support this), using J6Pack.js would look like:

```javascript
/** @jsx Jsx */
var Jsx = require("j6pack")

var html = <p class="greeting">
  Hello, <em>world</em>!
</p>

String(html) // => "<p class=\"greeting\">Hello, <em>world</em>!</p>"
```

The above should get compiled to the following. You're welcome to always call `Jsx` manually, too, if you don't like the JSX syntax:

```javascript
var Jsx = require("j6pack")

var html = Jsx("p", {class: "greeting"}, [
  "Hello, ",
  Jsx("em", null, ["world"]),
  "!"
])

String(html) // => "<p class=\"greeting\">Hello, <em>world</em>!</p>"
```

The `html` variable in both examples is an instance of `Jsx.Html` with `valueOf` and `toString` methods that return the HTML for the entire tree. The use of a value object over a string is mostly an implementation requirement of the way JSX compilers work. It does however permit you to differentiate between unescaped strings and escaped HTML via `instanceof` should you need to:

```javascript
Jsx("p", null, ["Hello, world!"]) instanceof Jsx.Html // => true
<p>Hello, world!</p> instanceof Jsx.Html // => true
```

To use the JSX syntax (`<p>Hello, {name}!</p>`) on Node.js without an external compiler tool, see the section on "[Using JSX with Node.js](#using-jsx-with-nodejs)".

### XML
J6Pack.js by default renders HTML5-compatible HTML. If you'd like to use it to render generic XML, for example to render an [Atom feed](https://en.wikipedia.org/wiki/Atom_(Web_standard)), you can require the XML variant from `j6pack/xml`:

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
  XML has no void elements.
- HTML forbids children for [void elements][void-elements].
- HTML escapes `<script` and `<!--` text inside `<script>` elements.  
  XML escapes neither and doesn't consider `<script>` special.

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
J6Pack.js renders HTML with minimal transformations, so *use HTML attribute names, not DOM properties*. That is, to set the tag's `class` attribute, use `<p class="greeting">Hello, world!</p>` rather than `className` as you would with React. Same goes for elements' `onclick`, `<label>`s' `for`, `<input>`s' `readonly` and so on.

### Interpolating HTML (like `innerHTML`)
Should you need to interpolate HTML into the output, you can't use the `innerHTML` property (or React's [dangerouslySetInnerHTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)) as those live only in the DOM world, not in HTML. Instead, use the `Jsx.html` function to inject your HTML into otherwise escaped values:

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

If you use another JSX compiler/transpiler than J6Pack.js, configure it to call component functions directly, rather than passing them to the factory function.

### Returning Multiple Elements (Fragments)
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

If you need to configure your external JSX compiler/transpiler for fragments, you can set it to emit fragments either as JavaScript arrays or as invocations of `Jsx.Fragment` like regular components (children in the 2nd argument as an array).

### ESLint
If you use [ESLint][eslint] with the [ESLint React plugin][eslint-react] to lint your JavaScript and are getting an error about [missing `React` when using JSX](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md), you may have to specify a pragma to inform ESLint of the JSX function used:

```javascript
/** @jsx Jsx */
var Jsx = require("j6pack")
var html = <p>Hello, world!</p>
```

A sufficiently new version of [ESLint React plugin][eslint-react] seems to also have a `pragma` setting to set the factory function once for the entire project.

[eslint]: https://eslint.org/
[eslint-react]: https://github.com/yannickcr/eslint-plugin-react


Compiling JSX to JavaScript
---------------------------
In addition to rendering HTML, J6Pack.js also contains a compiler/transpiler for JSX syntax. This section covers the use of the standalone compiler, so if you're looking to use JSX while writing your app (for Node.js), see the section on "[Using JSX with Node.js](#using-jsx-with-nodejs)".

To compile a string of JavaScript with JSX into plain JavaScript, import the J6Pack.js compiler and invoke it with the source code

```javascript
var compile = require("j6pack/compiler")

var js = compile(`
  var Jsx = require("j6pack")
  var html = <Greeting name="John" />

  function Greeting(attrs) {
    return <h1 class="greeting">Hello, {attrs.name}!</h1>
  }
`)
```

The `js` variable should then include the compiled/transpiled output as a string:

```js
var Jsx = require("j6pack")
var html = Greeting({name: "John"})

function Greetng(attrs) {
  return Jsx("h1", {class: "greeting"}, ["Hello, ", attrs.name, "!"])
}
```

### Compiler Options
The compiler has a few options to customize its output.

Option | Description
-------|------------
`factory` | The function called for creating elements.<br>Called with the tag name, attributes object or `null`, and an array of children.<br>Defaults to `Jsx`.
`fragmentFactory` | The function called for `<>…</>` JSX syntax.<br>Called with `null` and an array of children.<br>Set to `null` if want a plain JavaScript array instead of a function call.<br>If it starts with `.`, it's considered to be a property of `factory` and appended to it.<br>Defaults to `null`.
`componentFactory` | The function called for component element (tags whose name starts with a capitalized letter).<br>Called with the component variable, attributes object or `null`, and an array of children.<br>Set to `null` if you want the component variable called directly with attributes and children.<br>If it starts with `.`, it's considered to be a property of `factory` and appended to it.<br>Defaults to `null`.
`assign` | The function used for merging spread attributes (`<div {...attrs} class="foo" />`).<br>If it starts with `.`, it's considered to be a property of `factory` and appended to it.<br>Defaults to `Object.assign`.
`ecmaVersion` | Set or limit the JavaScript version for parsing. Useful for ensuring you don't accidentally use newer JavaScript syntax in your source files.<br>[Acorn][acorn], the parser J6Pack.js uses by default, supports versions from 3–14 and beyond.<br>Defaults to `"latest"`.
`sourceType` | Set to `script` or `module` to configure support for `import` and `export` declarations.<br>Defaults to `script` if `ecmaVersion` is 3 or 5 and `module` otherwise.

You can pass the compiler options to `compile` as a second argument:

```javascript
var compile = require("j6pack/compiler")

var js = compile(`
  var Jaysex = require("j6pack")
  var html = <Greeting name="John" />

  function Greeting(attrs) {
    return <h1 class="greeting">Hello, {attrs.name}!</h1>
  }
`, {factory: "Jaysex"})
```

### Renaming the `Jsx` Function
By default the compiled JavaScript expects the name of the JSX-render (factory) function to be `Jsx`. That's why all the examples here assign `require("j6pack")` to `Jsx`. If you want to use a different function name, you've got two options:

1. Use the `@jsx` pragma to set the factory function:

   ```javascript
   /** @jsx Jaysex */
   var Jaysex = require("j6pack")
   var html = <p>Hello, world!</p>
   ```

2. Set the compiler option `factory`.

### Renaming `Object.assign` for Spread Attributes
Spread attributes get compiled down to using `Object.assign`. For example, the following:

```javascript
<input {...defaults} name="email" {...attrs} />
```

Gets compiled down to:

```javascript
Jsx("input", Object.assign({}, defaults, {name: "email"}, attrs))
```

If you wish to not depend on `Object.assign`, you can use the `assign` compiler option to replace `Object.assign` with a function name of your own.

Both the HTML (`require("j6pack/html")`) and XML (`require("j6pack/xml")`) renderers have an `assign` export with a helper function that shallow-merges objects. If you can't depend on Object.assign being available (e.g. in old browsers) or you dislike its ignoring of inherited properties, you're welcome to set the `assign` option to `.assign`. A leading period indicates it's a property of the factory function.

### Executable
J6Pack.js comes with a simple executable, `j6pack` that you can use to precompile JSX, perhaps for testing or just seeing what JSX compiles down to. After installing J6Pack.js, invoke it with `./node_modules/.bin/j6pack` or from `bin/j6pack` from this repository:

```sh
cat views/index_page.jsx | ./node_modules/.bin/j6pack
./node_modules/.bin/j6pack views/index_page.jsx
```

### Using a Different JavaScript Parser
J6Pack.js defaults to using [Acorn][acorn] for parsing JSX — supporting ECMAScript 14 (2023) and beyond — but you're welcome to use any [ESTree](https://github.com/estree/estree) compatible parser that also supports JSX AST nodes.

For example, use of [Esprima][esprima] should be something like:

```js
var parse = require("esprima").parse
var compile = require("j6pack/compiler").compile

var js = `
  var Jsx = require("j6pack")
  var html = <h1 class="greeting">Hello, John!</h1>
`

compile({factory: "Jaysex"}, parse(js), js)
```

[esprima]: https://esprima.org


Using JSX with Node.js
----------------------
To add transparent support for importing JSX source files to Node.js, require `j6pack/register` before starting the app:

```sh
node --require j6pack/register app.js
```

Or `require` it in your main entry file before you load `.jsx` files:

```javascript
require("j6pack/register")
```

Then, combined with J6Pack.js's HTML rendering, you can use JSX to respond with HTML from within your request handlers:

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

### Setting Options
To set the JSX [compiler options](#compiler-options) (for example, to rename the JSX-render (factory) function), you've got three options:

1. Use the `@jsx` pragma in your JSX files to set the factory function:

   ```javascript
   /** @jsx Jaysex */
   var Jaysex = require("j6pack")
   var html = <p>Hello, world!</p>
   ```

2. Set the `options` on the export of `j6pack/register` before you `require` any `.jsx` files:

   ```javascript
   require("j6pack/register").options = {factory: "Jaysex"}
   ```

3. Copy the contents of `j6pack/register` to your own project and invoke the `compile` function with options directly:

   ```javascript
   var Fs = require("fs")
   var compile = require("j6pack/compiler")

   require.extensions[".jsx"] = function(module, path) {
     var source = Fs.readFileSync(path, "utf8")
     module._compile(compile(source, {factory: "Jaysex"}), path)
   }
   ```

See above for a [list of all options](#compiler-options).


Compiling JSX to JavaScript with Browserify
-------------------------------------------
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

### Setting Options
To set the JSX [compiler options](#compiler-options), use the Browserify transform option syntax. For example, to limit J6Pack.js's JavaScript parser to ECMAScript 5 (to prevent accidentally using newer JavaScript syntax in your source files):


```sh
browserify --extension=jsx --transform [ j6pack/browserify --ecmaVersion 5 ]
```

Or via the `browserify` property in `package.json`:

```json
{
	"browserify": {
		"transform": [["j6pack/browserify", {"ecmaVersion": "5"}]]
	}
}
```


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
