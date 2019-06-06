## Unreleased
- Removes the automatically prepended HTML doctype in preparation for XML support.  
  Instead, call `Html.prototype.toString` with `"doctype"` to have it be prepended whenever you wish:

  ```js
  var html = <html><body><p>Hello, world!</p></body></html>
  html.toString("doctype") // => "<!DOCTYPE html>\n<html>"…
  ```

  If you use the included Connect/Express middleware, that will prepend the doctype for you, too.

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
