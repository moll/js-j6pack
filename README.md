J6Pack.js
=========
[![NPM version][npm-badge]](https://www.npmjs.com/package/j6pack)

J6Pack.js is a JavaScript library that renders **JSX to HTML**. It's also usable from Node.js to **render JSX on the server side** and can hook into **[Express.js][express] view rendering**. It's **minimal** and **does not depend on React**.

J6Pack.js depends on [JsxTransform][jsx-transform] for parsing and compiling JSX to function calls, but you're welcome to use compatible parsers and hook `.jsx` file handling into Node.js yourself.

[npm-badge]: https://img.shields.io/npm/v/j6pack.svg
[express]: https://expressjs.com
[jsx-transform]: https://www.npmjs.com/package/jsx-transform

Installing
----------
```sh
npm install j6pack
```

J6Pack.js follows [semantic versioning](http://semver.org), so feel free to depend on its major version with something like `>= 1.0.0 < 2` (a.k.a `^1.0.0`).


Using
-----
For just generating HTML out of JSX function calls, require J6Pack.js and call it in the style of [`React.createElement`](https://reactjs.org/docs/react-api.html#createelement) or [equivalent JSX-functions](https://reactjs.org/docs/jsx-in-depth.html), with the exception that children need to always be in an array.

```javascript
var Jsx = require("j6pack")

var html = Jsx("p", null, [
  "Hello, ",
  Jsx("em", null, ["world"]),
  "!"
])

String(html) // => "<p>Hello, <span>world</span>!</p>"
```

The `html` variable itself is an instance of `Jsx.Html` with `valueOf` and `toString` methods that return the HTML for the entire tree. The use of a value object over a string is mostly an implementation requirement of the way JSX compilers work. It does however permit you to differentiate between unescaped strings and escaped HTML via `instanceof` should you need to:

```javascript
Jsx("p", null, ["Hello, world!"]) instanceof Jsx.Html // => true
<p>Hello, world!</p> instanceof Jsx.Html // => true
```

To use the JSX syntax (`<p>Hello, {name}!</p>`) in JavaScript on Node.js, read on. *Note*, however, that for now you need to name the export of J6Pack.js to `Jsx` as the JSX compiler is hard-coded to use that. If you wish it to be customizable, please [let me know][email].

### Node.js
To add support for JSX syntax to Node.js, require `j6pack/register` before starting the app:

```sh
node --require j6pack/register app.js
```

Or require it before you load `.jsx` files:

```javascript
require("j6pack/register")
```

Then you can render HTML from within your request handlers:

```javascript
var Jsx = require("j6pack")
var Http = require("http")

function handleRequest(_req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8")

  res.end(String(<html>
    <head><title>J6Pack Test Server</title></head>
    <body><p>Hello, world!</p></body>
  </html>))
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
    <body><p>{attrs.getting}</p></body>
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
  res.render(String(<html>
    <head><title>J6Pack Test Express Server</title></head>
    <body><p>Hello, world!</p></body>
  </html>))
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

### DOM Attributes and Properties
J6Pack.js renders JSX to HTML with minimal transformations, so *use HTML attribute names, not DOM properties*. That is, to set the tag's `class` attribute, use `<p class="greeting">Hello, world!</p>` rather than `className` as you would with React. Same goes for elements' `onclick`, `<label>`s' `for`, `<input>`s' `readonly` and so on.

### Interpolating HTML (like `innerHTML`)
Should you need to interpolate HTML into JSX, you can't use the `innerHTML` property (or React's [dangerouslySetInnerHTML](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)) as those live only in the DOM world, not in HTML. Instead, use the `Jsx.html` function to inject your HTML into otherwise escaped values:

```javascript
var Jsx = require("j6pack")
var html = <p>Hello, {Jsx.html("<em>world</em>")}!</p>
String(html) // => "<p>Hello, <em>world</em>!</p>"
```

### Custom Elements (Functional Components)
Just like React or other virtual DOM implementations, J6Pack.js supports custom elements. Behind the scenes a custom element is really just a function that gets invoked with two arguments — an object of attributes and an array of children. Both can be `null` if they were not given, so beware.

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

Alternatively, wrap them in a `Jsx.Fragment` element, akin to [`React.Fragment`](https://reactjs.org/docs/fragments.html):

```javascript
var Jsx = require("j6pack")
var Fragment = Jsx.Fragment

function Input(attrs) {
  return <Fragment>
    <label>{attrs.label}</label>
    <input type={attrs.type} value={attrs.value} />
  </Fragment>
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

[JsxTransform][jsx-transform], the library J6Pack.js is using for compiling JSX expressions to function calls, unfortunately doesn't support [React's new `<>` syntax](https://reactjs.org/docs/fragments.html#short-syntax) for fragments. It also doesn't yet support referring to member properties (`Foo.Bar`) in tag names (`<Foo.Bar>`), hence the need to assign `Jsx.Fragment` to the `Fragment` variable above.

### Executable
J6Pack.js comes with a simple executable, `j6pack` that you can use to precompile JSX, perhaps for testing. After installing J6Pack.js, invoke it with `./node_modules/.bin/j6pack` or from `bin/j6pack` from this repository:

```sh
cat views/index_page.jsx | ./node_modules/.bin/j6pack
./node_modules/.bin/j6pack views/index_page.jsx
```

### ESLint
If you use [ESLint][eslint] with the [ESLint React plugin][eslint-react] to lint your JavaScript and are getting an error about [missing `React` when using JSX](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md), you have to specify a pragma to inform it of the JSX function used:

```javascript
/** @jsx Jsx */
var Jsx = require("j6pack")
var html = <p>Hello, world!</p>
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
[Monday Calendar][monday] supported the engineering work.

If you find J6Pack.js needs improving, please don't hesitate to type to me now at [andri@dot.ee][email] or [create an issue online][issues].

[email]: mailto:andri@dot.ee
[issues]: https://github.com/moll/js-j6pack/issues
[moll]: https://m811.com
[monday]: https://mondayapp.com
