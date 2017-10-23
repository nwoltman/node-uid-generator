# uid-generator

[![NPM Version](https://img.shields.io/npm/v/uid-generator.svg)](https://www.npmjs.com/package/uid-generator)
[![Build Status](https://travis-ci.org/nwoltman/node-uid-generator.svg?branch=master)](https://travis-ci.org/nwoltman/node-uid-generator)
[![Coverage Status](https://coveralls.io/repos/github/nwoltman/node-uid-generator/badge.svg?branch=master)](https://coveralls.io/github/nwoltman/node-uid-generator?branch=master)
[![devDependency Status](https://david-dm.org/nwoltman/node-uid-generator/dev-status.svg)](https://david-dm.org/nwoltman/node-uid-generator?type=dev)

Generates cryptographically strong, pseudo-random UIDs with custom size and base-encoding. Generated UIDs are strings that are guaranteed to always be the same length depending on the specified [bit-size](#api). You may also specify the length of the UID to generate instead of specifying the number of bits.

Great for generating things like API keys and UIDs that are safe to use in URLs and cookies.


## Installation

```sh
# npm
npm install uid-generator --save

# yarn
yarn add uid-generator
```


## Usage

```js
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(); // Default is a 128-bit UID encoded in base58

// Async with `await`
await uidgen.generate(); // -> 'B1q2hUEKmeVp9zWepx9cnp'

// Async with promise
uidgen.generate()
  .then(uid => console.log(uid)); // -> 'PXmRJVrtzFAHsxjs7voD5R'

// Async with callback
uidgen.generate((err, uid) => {
  if (err) throw err;
  console.log(uid); // -> '4QhmRwHwwrgFqXULXNtx4d'
});

// Sync
uidgen.generateSync(); // -> '8Vw3bgbMMzeYfrQHQ8p3Jr'
```


## API

### new UIDGenerator([bitSize][, baseEncoding][, uidLength])

Creates a new `UIDGenerator` instance that generates `bitSize`-bit or `uidLength`-sized UIDs encoded using the characters in `baseEncoding`.

| Param          | Type               | Default               | Description
|----------------|--------------------|-----------------------|-------------
| [bitSize]      | `number` \| `null` | `128`                 | The size of the UID to generate in bits. Must be a multiple of `8`.
| [baseEncoding] | `string`           | `UIDGenerator.BASE58` | One of the `UIDGenerator.BASE##` constants or a custom string of characters to use to encode the UID. If a custom string is used, it must made of unique characters.
| [uidLength]    | `number`           | `undefined`           | The length of the UID string to generate. An error is thrown if `uidLength` is specified and `bitSize` is specified and not `null`.

**Note:** If you use a custom `baseEncoding` that has URL-unsafe characters, it is up to you to URL-encode the resulting UID.

**Example**

```js
new UIDGenerator();
new UIDGenerator(256);
new UIDGenerator(UIDGenerator.BASE16);
new UIDGenerator(null, 10);
new UIDGenerator(512, UIDGenerator.BASE62);
new UIDGenerator(UIDGenerator.BASE36, 10);
new UIDGenerator('01'); // Custom encoding (base2)
```

---

### UIDGenerator.BASE16 : `string`
`0123456789abcdef`

### UIDGenerator.BASE36 : `string`
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`

### UIDGenerator.BASE58 : `string`
`123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`

### UIDGenerator.BASE62 : `string`
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`

### UIDGenerator.BASE66 : `string`
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-._~`

(all ASCII characters that do not need to be encoded in a URI as specified by [RFC 3986](https://tools.ietf.org/html/rfc3986#section-2.3))

### UIDGenerator.BASE71 : `string`
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!'()*-._~`

(all ASCII characters that are not encoded by `encodeURIComponent()`)

---

### uidgen.generate([cb]) ⇒ `?Promise<string>`
  
Asynchronously generates a UID.

| Param | Type | Description |
|-------|------|-------------|
| [cb] | `?function(error, uid)` | An optional callback that will be called with the results of generating the UID.<br>If not specified, the function will return a promise. |

**Returns**: `?Promise<string>` - A promise that will resolve with the UID or reject with an error. Returns nothing if the `cb` parameter is specified.

**`async`/`await` Example**

```js
const uidgen = new UIDGenerator();
// This must be inside an async function
const uid = await uidgen.generate();
```

**Promise Example**

```js
const uidgen = new UIDGenerator();

uidgen.generate()
  .then(uid => {
    // Use uid here
  });
```

**Callback Example**

```js
const uidgen = new UIDGenerator();

uidgen.generate((err, uid) => {
  if (err) throw err;
  // Use uid here
});
```

---

### uidgen.generateSync() ⇒ `string`

Synchronously generates a UID.

**Returns**: `string` - The generated UID.

**Example**

```js
const uidgen = new UIDGenerator();
const uid = uidgen.generateSync();
```

---

### (readonly) uidgen.bitSize : `number`

The size of the UID that will be generated in bits (the `bitSize` value passed to the `UIDGenerator` constructor).
If the `uidLength` parameter is passed to the constructor instead of `bitSize`, `bitSize` is calculated as follows:

```js
bitSize = Math.ceil(length * Math.log2(base));
```

**Example**

```js
new UIDGenerator().bitSize // -> 128
new UIDGenerator(256).bitSize // -> 256
new UIDGenerator(null, 10).bitSize // -> 58
new UIDGenerator(null, 11).bitSize // -> 64
```

### (readonly) uidgen.uidLength : `number`

The length of the UID string that will be generated. The generated UID will always be this length.
This will be the same as the `uidLength` parameter passed to the `UIDGenerator` constructor.
If the `uidLength` parameter is not passed to the constructor, it will be calculated using the `bitSize` parameter as follows:

```js
uidLength = Math.ceil(bitSize / Math.log2(base))
```

**Example**

```js
new UIDGenerator().uidLength // -> 22
new UIDGenerator(null, 10).uidLength // -> 10
new UIDGenerator(256, UIDGenerator.BASE62).uidLength // -> 43
```

### (readonly) uidgen.baseEncoding : `string`

The set of characters used to encode the UID string (the `baseEncoding` value passed to the `UIDGenerator` constructor).

**Example**

```js
new UIDGenerator().baseEncoding // -> '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
new UIDGenerator(UIDGenerator.BASE16).baseEncoding // -> '0123456789abcdef'
new UIDGenerator('01').baseEncoding // -> '01'
```

### (readonly) uidgen.base : `number`

The base of the UID that will be generated (which is the number of characters in the `baseEncoding`).

**Example**

```js
new UIDGenerator().base // -> 58
new UIDGenerator(UIDGenerator.BASE16).base // -> 16
new UIDGenerator('01').base // -> 2
```
