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

parsing: lib=633.07ms, builtin=34.62ms
stringify: lib=360.84ms, builtin=27.59ms
```
## Used JS built-ins

- String.fromCharCode(...)
- String.prototype.charCodeAt(...)
- Number(...)