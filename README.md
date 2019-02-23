A golang dll to access Windows registry.
Syntax is inspired from InnoSetup's Pascal Scripting.

Dependencies
============

- golang.org/x/sys/windows/registry

Start `dependencies.cmd` or `>_ go get golang.org/x/sys/windows/registry`

`go get` requires git for windows installed and in PATH.


Build me
========

cgo requires a gcc compiler installed and in PATH. 
Recommended : http://tdm-gcc.tdragon.net/download
  
Start `build.cmd` or 
```
>_ go generate
>_ go build -buildmode=c-shared -o regedit.dll registry_dll
```

API
===

`RegKeyExists`
(root *C.char, key *C.char) C.uint // 0: false | 1: true

`RegQueryStringValue` // REG_SZ & REG_EXPAND_SZ
(root *C.char, key *C.char, name *C.char) *C.char

`RegQueryStringValueAndExpand` // REG_EXPAND_SZ (expands environment-variable strings)
(root *C.char, key *C.char, name *C.char) *C.char

`RegQueryBinaryValue` //REG_BINARY
(root *C.char, key *C.char, name *C.char) *C.char

`RegQueryIntegerValue` //REG_DWORD & REG_QWORD
(root *C.char, key *C.char, name *C.char) *C.char

`RegWriteStringValue`
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteExpandStringValue`
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteBinaryValue`
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteDwordValue`
(root *C.char, key *C.char, name *C.char, value *C.char)

`RegWriteQwordValue`
(root *C.char, key *C.char, name *C.char, value *C.char) 

`RegDeleteKeyValue`
(root *C.char, key *C.char, name *C.char)

Example
=======

Node.js
```js
const path = require('path');
const ffi = require('ffi-napi');
const arch = (process.arch === "x64") ? "x64" : "x86";

const regedit = ffi.Library(path.resolve(__dirname, `build/regedit.${arch}.dll`), {
   'RegKeyExists': ["string", ["string", "string"]],
   'RegQueryStringValue': ["string", ["string", "string", "string"]],
   'RegQueryStringValueAndExpand': ["string", ["string", "string", "string"]],
   'RegQueryBinaryValue': ["string", ["string", "string", "string"]],
   'RegQueryIntegerValue': ["string", ["string", "string", "string"]],
   'RegWriteStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteExpandStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteBinaryValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteDwordValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteQwordValue': ["void", ["string", "string", "string", "string"]],
   'RegDeleteKey': ["void", ["string", "string"]],
   'RegDeleteKeyValue': ["void", ["string", "string", "string"]]
});

let example = regedit.RegQueryStringValue("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Store","PrimaryWebAccountId");
console.log(example);

```