Read/Write Windows Registry in Node using ffi-napi with a GoLang c-shared DLL.<br />
This was to demo that you can use GoLang c-shared DLL (Go>=1.10) with ffi.<br />
Syntax is inspired from InnoSetup's Pascal Scripting.

Example
=======

```js

const regedit = require("regodit"); //commonjs
import regedit from 'regodit'; //esm

(async()=>{

  //promise
  const res = await regedit.promises.RegListAllSubkeys("HKCU","Software/Valve");
  console.log(res);
  
  //sync
  const resSync = regedit.RegListAllSubkeys("HKCU","Software/Valve");
  console.log(resSync);

})().catch(console.error);
```

Install
=======

```npm install regodit```

Prequisites: C/C++ build tools (Visual Studio) and Python 2.7 (node-gyp) in order to build [ffi-napi](https://www.npmjs.com/package/ffi-napi).

API
===

_Promise are under the "promises" namespace otherwise sync method_

eg: 

- promises.RegListAllSubkeys("HKCU","Software/Valve") //Promise
- RegListAllSubkeys("HKCU","Software/Valve") //Sync

### RegKeyExists 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) bool`

If the key exists or not.

### RegListAllSubkeys
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) string[] | null`

List all sub-keys name for a given key (non-recursive).

### RegListAllValues 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) string[] | null`

List all values name for a given key.

### RegQueryValueType
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) 
string : "NONE"|"SZ"|"EXPAND_SZ"|"BINARY"|"DWORD"|"DWORD_BIG_ENDIAN"|"LINK"|"MULTI_SZ"|"RESOURCE_LIST"|"FULL_RESOURCE_DESCRIPTOR"|"RESOURCE_REQUIREMENTS_LIST"|"QWORD"` 

Return key's type.

### RegQueryStringValue //REG_SZ & REG_EXPAND_SZ
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

Return string value of given key/valueName.

### RegQueryStringValueAndExpand //REG_EXPAND_SZ (expands environment-variables)
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

Return string value of given key/valueName and expands environment-variable by replacing them with the values defined for the current user.

### RegQueryBinaryValue //REG_BINARY
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

Return binary value of given key/valueName.

### RegQueryIntegerValue //REG_DWORD & REG_QWORD
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) string | null`

Return integer value of given key/valueName.

NB: REG_QWORD is a 64-bit unsigned integer.

### RegWriteKey
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) void`

Create given key whether the key already existed or not.

### RegWriteStringValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write string value in given key/valueName as 'REG_SZ'.

### RegWriteExpandStringValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write string value in given key/valueName as 'REG_EXPAND_SZ'.

### RegWriteBinaryValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write binary value in given key/valueName as 'REG_BINARY'.

### RegWriteDwordValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write integer value in given key/valueName as 'REG_DWORD'.

### RegWriteQwordValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write integer value in given key/valueName as 'REG_QWORD'.

### RegDeleteKey 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) void`

Delete given key. 

NB: If key has some sub-keys key will not be deleted.

### RegDeleteKeyValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) void`

Delete given key/valueName.

### RegExportKey
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, [bool recursive = true]) RegDump{}¹`

Export given key to a json-ish object (see ¹RegDump).

recursive is set to true by default.

### RegImportKey
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, RegDump{}¹ data) void

Import back to the registry a previously exported key (see ¹RegDump).
This overwrites existing data if any.


¹RegDump:
```ts
interface RegDump {
	values: [ {name: string, type: string, data: string} ...], 
	subkeyName : RegDump{}, ... 
}
```

Build cgo-dll
=============

### Dependencies

- golang.org/x/sys/windows/registry

Run `lib/go/dependencies.cmd` or <br />
`>_ go get golang.org/x/sys/windows/registry`<br />

`go get` requires git for windows installed and in PATH.

cgo requires a gcc compiler installed and in PATH. <br />
Recommended : http://tdm-gcc.tdragon.net/download
  
### Build  
  
Run `lib/go/build.cmd` or <br />
```
>_ cd src\regodit
>_ go generate
>_ cd ..\
>_ set GOPATH="%~dp0"
>_ go build -buildmode=c-shared -o build\regodit.dll regodit
```
