About
=====

Read/Write Windows Registry in Node using GoLang.

Made to demo that you can bind GoLang as a c-shared DLL (Go>=1.10) to node-ffi-napi.<br />
Syntax is inspired from InnoSetup's Pascal Scripting Registry functions.

Example
=======

```js

import * as regedit from 'regodit/promises';

//Reading
const steamPath = await regedit.RegQueryStringValue("HKCU","Software/Valve/Steam","steamPath");
const accel = await regedit.RegQueryIntegerValue("HKCU","Software/Valve/Steam","H264HWAccel");

//Writing
await regedit.RegWriteStringValue("HKCU","Software/Valve/Steam","AutoLoginUser","user1"); 
await regedit.RegDeleteKeyValue("HKCU","Software/Valve/Steam","AutoLoginUser");
await regedit.RegDeleteKeyIncludingSubkeys("HKCU","Software/Valve/Steam");
await regedit.RegWriteKey("HKCU","Software/Valve/Steam");

//Util
const exists = await regedit.RegKeyExists("HKCU","Software/Valve");
const subkeys = await regedit.RegListAllSubkeys("HKCU","Software/Valve");
const values = await regedit.RegListAllValues("HKCU","Software/Valve/Steam");
const type = await regedit.RegQueryValueType("HKCU","Software/Valve/Steam","AutoLoginUser"); //SZ (string)

//Import/Export
const copy = await regedit.RegExportKey("HKCU","Software/Valve/Steam");
await regedit.RegImportKey("HKCU","Software/Valve/Steam2",copy);
```

Install
=======

```
npm install regodit
```

_Prerequisite: C/C++ build tools and Python 3.x (node-gyp) in order to build [node-ffi-napi](https://www.npmjs.com/package/ffi-napi)._

API
===

⚠️ This module is only available as an ECMAScript module (ESM) starting with version 2.0.0.<br />
Previous version(s) are CommonJS (CJS) with an ESM wrapper.

💡 Promises are under the `promises` namespace.
```js
import * as regedit from 'regodit';
regedit.promises.RegListAllSubkeys("HKCU","Software/Valve") //Promise
regedit.RegListAllSubkeys("HKCU","Software/Valve") //Sync

import * as regedit from 'regodit/promises';
regedit.RegListAllSubkeys("HKCU","Software/Valve") //Promise
```

✔️ root key accepted values are "HKCR", "HKCU", "HKLM", "HKU" or "HKCC". 

## Named export

### `RegKeyExists(root: string, key: string): boolean`

If the key exists or not.

### `RegListAllSubkeys(root: string, key: string): string[] | []`

List all subkeys name for a given key (non-recursive).<br />
NB: For a more complete listing see RegExportKey below.

```js
const result = RegListAllSubkeys("HKCU","Software/Valve/Steam");
console.log(result);
/*output
[
  "ActiveProcess",
  "Apps",
  "steamglobal"
  "Users"
]
*/
```

Return an empty array If the key doesn't exist or has no subkeys.

### `RegListAllValues(root: string, key: string): string[] | []`

List all values name for a given key.<br />
NB: For a more complete listing see RegExportKey below.

```js
const result = RegListAllValues("HKCU","Software/Valve/Steam");
console.log(result);
/*output
[
  "AlreadyRetriedOfflineMode",
  "AutoLoginUser",
  "BigPictureInForeground",
  "DPIScaling",
  ...
]
*/
```

Return an empty array If the key doesn't exist or has no values.

### `RegQueryValueType(root: string, key: string, name: string): string`

Return key/name type:

- NONE
- SZ
- EXPAND_SZ
- BINARY
- DWORD
- DWORD_BIG_ENDIAN
- LINK
- MULTI_SZ
- RESOURCE_LIST
- FULL_RESOURCE_DESCRIPTOR
- RESOURCE_REQUIREMENTS_LIST
- QWORD

Return "NONE" If the key doesn't exist or is of an unknown type.

### `RegQueryStringValue(root: string, key: string, name: string): string | null`

Return string value of given key/name.<br />
Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_SZ & REG_EXPAND_SZ

### `RegQueryMultiStringValue(root: string, key: string, name: string): string[] | null`

Return string values of given key/name.<br />
Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_MULTI_SZ

### `RegQueryStringValueAndExpand(root: string, key: string, name: string): string | null`

Return string value of given key/name and expand any environment-variable by replacing them with the value defined for the current user.

```js
//Expanded
regedit.RegQueryStringValueAndExpand("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","AppData")
//"C:\Users\Xan\AppData\Roaming"

//Non-Expanded
regedit.RegQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders","AppData")
//"%USERPROFILE%\AppData\Roaming"
```

Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_EXPAND_SZ

### `RegQueryBinaryValue(root: string, key: string, name: string): Buffer | null`

Return binary value of given key/name.<br />
Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_BINARY

### `RegQueryIntegerValue(root: string, key: string, name: string): number | bigint | null`

Return integer value of given key/name.

NB: REG_QWORD is a 64-bit unsigned integer.<br />
Return a bigint instead of a number if integer value > [Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)

Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_DWORD & REG_QWORD

### `RegWriteKey(root: string, key: string): void`

Create given key whether the key already exists or not (subkeys are created if necessary).

### `RegWriteStringValue(root: string, key: string, name: string, value: string): void`

Write string value in given key/name as 'REG_SZ' (subkeys are created if necessary).

### `RegWriteMultiStringValue(root: string, key: string, name: string, value: string[]): void`

Write string values in given key/name as 'REG_MULTI_SZ' (subkeys are created if necessary).

### `RegWriteExpandStringValue(root: string, key: string, name: string, value: string): void`

Write string value in given key/name as 'REG_EXPAND_SZ' (subkeys are created if necessary).

### `RegWriteBinaryValue(root: string, key: string, name: string, value: Buffer): void`

Write binary value in given key/name as 'REG_BINARY' (subkeys are created if necessary).

### `RegWriteDwordValue(root: string, key: string, name: string, value: number | bigint): void`

Write integer value in given key/name as 'REG_DWORD' (subkeys are created if necessary).

### `RegWriteQwordValue(root: string, key: string, name: string, value: number | bigint): void`

Write integer value in given key/name as 'REG_QWORD' (subkeys are created if necessary).

### `RegDeleteKeyValue(root: string, key: string, name: string): void`

Delete value in given key.

### `RegDeleteKey(root: string, key: string): void`

Delete given key.<br />
NB: If the key has some subkeys then deletion will be aborted (Use RegDeleteKeyIncludingSubkeys below instead)

### `RegDeleteKeyIncludingSubkeys(root: string, key: string): void`

Delete given key and all its subkeys.

### `RegExportKey(root: string, key: string, option?: obj): obj`

List all values with their name, content, type and all subkeys from given key recursively (default) or not.<br/>
Exported in an object representation where<br/>
subkeys are treated as nested objects including an additional propriety `__values__` containing values data if any.

#### option ⚙️

|name|type|default|description|
|----|----|-------|------------|
|recursive|boolean|true|List values recursively|

Example
-------

```js
const copy = await RegExportKey("HKCU","Software/Valve/Steam");
console.log(copy);

//Console output:

{
  "__values__": [ //Values of HKCU/Software/Valve/Steam
    {"name": "H264HWAccel","type": "DWORD","data": 1},
    {"name": "Language","type": "SZ","data": "english"},
    ... //etc
   ],
   "ActiveProcess": { //Subkey ActiveProcess of HKCU/Software/Valve/Steam
    "__values__": [ //Values of HKCU/Software/Valve/Steam/ActiveProcess
      {"name": "SteamClientDll","type": "SZ","data": "C:\\Program Files (x86)\\Steam\\steamclient.dll"},
      {"name": "SteamClientDll64","type": "SZ","data": "C:\\Program Files (x86)\\Steam\\steamclient64.dll"},
      ... //etc
    ]
   },
	"Apps": { //Subkey Apps of HKCU/Software/Valve/Steam
		"__values__": [], //Values of HKCU/Software/Valve/Steam/Apps (in this case none)
		"480": { //Subkey 480 of HKCU/Software/Valve/Steam/Apps
		  "__values__": [ //Values of HKCU/Software/Valve/Steam/Apps/480
			{"name": "Name","type": "SZ","data": "Spacewar"}, 
			... //etc
		  ]
		},
		"550": {
		  "__values__": [
			{"name": "Installed","type": "DWORD","data": 0},
			{"name": "Name","type": "SZ","data": "Left 4 Dead 2"},
			... //etc
		  ]
		},
		... //etc
	},
	... //etc
}
```

### `RegImportKey(root: string, key: string, data: obj, option?: obj): void`

Import back to the registry a previously exported key (see RegExportKey).<br/>
This overwrites existing data if any.

#### option ⚙️

|name|type|default|description|
|----|----|-------|-----------|
|purgeDest|boolean|false|Delete target key and its subkeys before importing|

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
  
Run `lib/go/build.cmd` or `npm run-script build`<br />

Manually: <br />
```
>_ cd src\regodit
>_ go generate
>_ cd ..\
>_ set GOPATH="%~dp0"
>_ go build -buildmode=c-shared -o ..\dist\regodit.dll regodit
```
