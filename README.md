# json.js

A spec-compliant JSON parser written in JS (because why not?)

## Why would I use this over the built-in `JSON.parse()` and `JSON.stringify()`?

You probably shouldn't!

This was built as an exercise to...

- learn about the JSON spec
- see how a JSON parser written in JS performs relative to the built-in
- provide an extensible JSON parser with better error messages

The only scenarios I can imagine where this might be useful...
- you want to avoid scenarios where scripts override the builtin JSON.parse
- you want to extend the json parser with different features
- you are using a JS engine which for some reason doesn't have a built-in JSON parserxs

## Tests

This repo leverages the great set of test cases from  https://github.com/nst/JSONTestSuite

## Benchmark

It's not very fast...

```
➜  json.js git:(main) ✗ npm run bench  

> bench
> npm run build -- --module commonjs && node ./dist/benchmark/index.js


> build
> rm -rf ./dist && tsc "--module" "commonjs"

parsing: medians -> lib=616.41ms, builtin=34.8ms (lib is 17.71x slower)
stringify: medians -> lib=354.32ms, builtin=27.22ms (lib is 13.02x slower)
```
## Used JS built-ins

- String.fromCharCode(...)
- String.prototype.charCodeAt(...)
- Number(...)