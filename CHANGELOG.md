## Unreleased
- Alters `<script>`s children escaping.  
  Escapes only `</script` via `<\/script`. If that's not a desirable syntax (for example, when you're not using JavaScript in `<script>`), use `Jsx.html` and perform your own escaping.
- Permit interpolating boolean values.

## 0.1.338 (Mar 10, 2019)
- Permit interpolating `undefined` values.  
  That'd be `<p>Hello, {undefined}!</p>`.
- Permit interpolating objects.  
  That'd be `<p>Hello, {new Date}!</p>`.

## 0.1.337 (Mar 9, 2019)
- Preliminary six-pack.
