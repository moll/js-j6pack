## Unreleased
- Switches from using [JsxTransform][jsx-transform] to implementing a custom JSX compiler with the help of [Acorn][acorn], a JavaScript parsing library.

  The result is almost byte-for-byte identical with the exception of a few improvements around closing-brace position. Just like JsxTransform, J6Pack retains all whitespace in the source file, so all reported line numbers match.

  Switching to Acorn also adds support for ECMAScript 14 (2023) and beyond.

- Adds a [Browserify][browserify] transform.
- Adds a way to set compilation options when using `j6pack/register` via setting the `options` property of its export.

[acorn]: https://www.npmjs.com/package/acorn
[jsx-transform]: https://www.npmjs.com/package/jsx-transform
[browserify]: https://browserify.org

## 1.1.0 (Jan 11, 2021)
- Escapes ampersands (`&`) in HTML and XML attributes.  
  Previous behavior permitted using HTML entities in attributes, but it's safer to opt-in to that where necessary with `Jsx.html`:

  ```javascript
  var Jsx = require("j6pack")
  var html = <a title={Jsx.html("Foo&copy;")}>Foo</a>
  html.toString() // => <a title="Foo&copy;">Foo</a>
  ```

- Escapes less-than (`<`) in XML attributes.  
  While not necessary for HTML, it is necessary for XML validation.
- Escapes carriage returns (`\r`) in tag content to align with [XML end-of-line handling](https://www.w3.org/TR/REC-xml/#sec-line-ends).
- Escapes tabs, newlines and carriage returns in tag attributes for [XML attribute normalization](https://www.w3.org/TR/REC-xml/#AVNormalize).

## 1.0.0 (Jun 6, 2019)
- Removes the automatically prepended HTML doctype in preparation for XML support.  
  Instead, call `Html.prototype.toString` with `"doctype"` to have it be prepended whenever you wish:

  ```javascript
  var html = <html><body><p>Hello, world!</p></body></html>
  html.toString("doctype") // => <!DOCTYPE html>\n<html>…
  ```

  If you use the included Connect/Express middleware, that will prepend the doctype for you, too.
- Adds XML support.  
  This is mostly like HTML, but without special support for `<script>` contents' escaping and void element checks (like forbidding children on `<input>`s).

## 0.2.1 (Mar 15, 2019)
- Fixes escaping uppercase variations of `</script` in `<script>` tags.
- Escapes comments (`<!--`) in `<script>` tags.

## 0.2.0 (Mar 15, 2019)
- Alters `<script>`s' children escaping.  
  Escapes only `</script` via `<\/script`. If that's not a desirable syntax (for example, when you're not using JavaScript in `<script>`), use `Jsx.html` and perform your own escaping.
- Permit interpolating boolean values.

## 0.1.338 (Mar 10, 2019)
- Permit interpolating `undefined` values.  
  That'd be `<p>Hello, {undefined}!</p>`.
- Permit interpolating objects.  
  That'd be `<p>Hello, {new Date}!</p>`.

## 0.1.337 (Mar 9, 2019)
- Preliminary six-pack.
