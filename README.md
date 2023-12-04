About
=====

Read/Write Windows Registry using FFI and GoLang (x86, x64 and arm64).<br />

Friendly API which takes care of the Windows' registry little annoyances.<br />
Syntax is inspired from InnoSetup's Pascal Scripting Registry functions.

Originally created to demonstrate that you can bind GoLang as a c-shared DLL to Node via FFI (Go>=1.10).

Example
=======

```js
import * as regedit from "regodit"; //sync
import * as regedit from "regodit/promises"; //async

//Reading
const steamPath = regedit.regQueryStringValue("HKCU", "Software/Valve/Steam", "steamPath");
const accel = regedit.regQueryIntegerValue("HKCU", "Software/Valve/Steam", "H264HWAccel");

//Writing
regedit.regWriteStringValue("HKCU", "Software/Valve/Steam", "AutoLoginUser", "user1"); 
regedit.regDeleteKeyValue("HKCU", "Software/Valve/Steam", "AutoLoginUser");

regedit.regWriteKey("HKCU", "Software/Valve/Steam");
regedit.regDeleteKeyIncludingSubkeys("HKCU", "Software/Valve/Steam");

//Util
const exists = regedit.regKeyExists("HKCU", "Software/Valve");
const subkeys = regedit.regListAllSubkeys("HKCU", "Software/Valve");
const values = regedit.regListAllValues("HKCU", "Software/Valve/Steam");
const type = regedit.regQueryValueType("HKCU", "Software/Valve/Steam", "AutoLoginUser");

//Import/Export
const dump = regedit.regExportKey("HKCU", "Software/Valve/Steam");
regedit.regImportKey("HKCU", "Software/Valve/SteamBackup", dump);
```

Install
=======

```
npm install regodit
```

API
===

⚠️ This module is only available as an ECMAScript module (ESM) starting with version 2.0.0.<br />
Previous version(s) are CommonJS (CJS) with an ESM wrapper.

💡 Promises are under the `promises` namespace.
```js
import * as regedit from "regodit";
regedit.promises.regListAllSubkeys("HKCU","Software/Valve") //Promise
regedit.regListAllSubkeys("HKCU","Software/Valve") //Sync

import * as regedit from "regodit/promises";
regedit.regListAllSubkeys("HKCU","Software/Valve") //Promise
```

✔️ root key accepted values are `"HKCR", "HKCU", "HKLM", "HKU" or "HKCC"`.

## Named export

#### `regKeyExists(root: string, key: string): boolean`

If the key exists or not.

#### `regQueryValueType(root: string, key: string, name: string): string`

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

#### `regQueryStringValue(root: string, key: string, name: string): string | null`

Return string value of given key/name.<br />
Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_SZ & REG_EXPAND_SZ

#### `regQueryMultiStringValue(root: string, key: string, name: string): string[] | null`

Return string values of given key/name.<br />
Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_MULTI_SZ

#### `regQueryStringValueAndExpand(root: string, key: string, name: string): string | null`

Return string value of given key/name and expand any environment-variable by replacing them with the value defined for the current user.

```js
//Non-Expanded
regQueryStringValue("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders", "AppData")
//"%USERPROFILE%\AppData\Roaming"

//Expanded
regQueryStringValueAndExpand("HKCU","Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders", "AppData")
//"C:\Users\Xan\AppData\Roaming"
```

Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_EXPAND_SZ

#### `regQueryBinaryValue(root: string, key: string, name: string): Buffer | null`

Return binary value of given key/name.<br />
Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_BINARY

#### `regQueryIntegerValue(root: string, key: string, name: string): number | bigint | null`

Return integer value of given key/name.

NB: REG_QWORD is a 64-bit unsigned integer.<br />
Return a bigint instead of a number if integer value > [Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)

Return `null` If the key/name doesn't exist.

⚠️ Supported: REG_DWORD & REG_QWORD

#### `regWriteKey(root: string, key: string): void`

Create given key whether the key already exists or not (subkeys are created if necessary).

#### `regWriteStringValue(root: string, key: string, name: string, value: string): void`

Write string value in given key/name as 'REG_SZ' (subkeys are created if necessary).

#### `regWriteMultiStringValue(root: string, key: string, name: string, value: string[]): void`

Write string values in given key/name as 'REG_MULTI_SZ' (subkeys are created if necessary).

#### `regWriteExpandStringValue(root: string, key: string, name: string, value: string): void`

Write string value in given key/name as 'REG_EXPAND_SZ' (subkeys are created if necessary).

#### `regWriteBinaryValue(root: string, key: string, name: string, value: Buffer): void`

Write binary value in given key/name as 'REG_BINARY' (subkeys are created if necessary).

#### `regWriteDwordValue(root: string, key: string, name: string, value: number | bigint): void`

Write integer value in given key/name as 'REG_DWORD' (subkeys are created if necessary).

#### `regWriteQwordValue(root: string, key: string, name: string, value: number | bigint): void`

Write integer value in given key/name as 'REG_QWORD' (subkeys are created if necessary).

#### `regDeleteKeyValue(root: string, key: string, name: string): void`

Delete value in given key.

#### `regDeleteKey(root: string, key: string): void`

Delete given key.<br />
NB: If the key has some subkeys then deletion will be aborted (Use RegDeleteKeyIncludingSubkeys below instead)

#### `regDeleteKeyIncludingSubkeys(root: string, key: string): void`

Delete given key and all its subkeys.

#### `regListAllSubkeys(root: string, key: string): string[] | []`

List all subkeys name for a given key (non-recursive).<br />
NB: For a more complete listing see RegExportKey below.

```js
const result = regListAllSubkeys("HKCU","Software/Valve/Steam");
console.log(result);
/*
[
  "ActiveProcess",
  "Apps",
  "steamglobal"
  "Users"
]
*/
```

Return an empty array If the key doesn't exist or has no subkeys.

#### `regListAllValues(root: string, key: string): string[] | []`

List all values name for a given key.<br />
NB: For a more complete listing see RegExportKey below.

```js
const result = regListAllValues("HKCU","Software/Valve/Steam");
console.log(result);
/*
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

#### `regExportKey(root: string, key: string, option?: object): object`

List all values with their name, content, type and all subkeys.<br/>
Exported in an object representation where<br/>
subkeys are treated as nested objects and values stored in the property symbol "values".

##### option ⚙️

|name|type|default|description|
|----|----|-------|------------|
|recursive|boolean|true|List values of subkeys|

Example:

```js
const dump = await regExportKey("HKCU","Software/Valve/Steam");
console.dir(dump, { depth: null });
```

Output:

```js
{
  [Symbol(values)]: [
    {"name": "H264HWAccel", "type": "DWORD", "data": 1},
    {"name": "Language", "type": "SZ", "data": "english"},
    // etc...
   ],
   "ActiveProcess": {
    [Symbol(values)]: [
      {"name": "SteamClientDll", "type": "SZ", "data": "steamclient.dll"},
      {"name": "SteamClientDll64", "type": "SZ", "data": "steamclient64.dll"},
      // etc...
    ]
   },
  "Apps": { 
    [Symbol(values)]: [],
    "480": {
      [Symbol(values)]: [
        {"name": "Name", "type": "SZ", "data": "Spacewar"}, 
        // etc...
      ]
    },
    "550": {
      [Symbol(values)]: [
        {"name": "Installed", "type": "DWORD", "data": 0},
        {"name": "Name", "type": "SZ", "data": "Left 4 Dead 2"},
        // etc...
      ]
    },
    // etc...
  },
  // etc...
}
```

#### `regImportKey(root: string, key: string, data: object, option?: object): void`

Import back to the registry a previously exported key dump (see RegExportKey).<br/>
This overwrites existing data if any.

##### option ⚙️

|name|type|default|description|
|----|----|-------|-----------|
|purgeDest|boolean|false|Delete target key and its subkeys before importing|

Build cgo-dll
=============

⚠️ CGO requires a cross compiling C compiler for the target architecture.

- [GoLang](https://go.dev/) 1.21.4 windows/amd64
- [Zig](https://ziglang.org/) 0.11.0 as the C cross compiler and it should be added to your environment variable `PATH`

Run:
  - `npm run build:win` (win32/powershell)
  - `npm run build:win:legacy` (win32/cmd)
  - `npm run build:linux` (linux/bash)

Targets:
  - Windows
    + x86
    + x64
    + arm64

Compiled DLLs can be found in the `./dist` folder.