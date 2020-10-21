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

List all subkeys name for a given key (non-recursive).

NB: For a more complete listing see RegExportKey below.

### RegListAllValues 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) string[] | null`

List all values name for a given key.

NB: For a more complete listing see RegExportKey below.

### RegQueryValueType
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) 
string : "NONE"|"SZ"|"EXPAND_SZ"|"BINARY"|"DWORD"|"DWORD_BIG_ENDIAN"|"LINK"|"MULTI_SZ"|"RESOURCE_LIST"|"FULL_RESOURCE_DESCRIPTOR"|"RESOURCE_REQUIREMENTS_LIST"|"QWORD"` 

Return key/value type.

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

Create given key whether the key already exists or not (subkeys are created if necessary).

### RegWriteStringValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write string value in given key/valueName as 'REG_SZ' (subkeys are created if necessary).

### RegWriteExpandStringValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write string value in given key/valueName as 'REG_EXPAND_SZ' (subkeys are created if necessary).

### RegWriteBinaryValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write binary value in given key/valueName as 'REG_BINARY' (subkeys are created if necessary).

### RegWriteDwordValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write integer value in given key/valueName as 'REG_DWORD' (subkeys are created if necessary).

### RegWriteQwordValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name, string value) void`

Write integer value in given key/valueName as 'REG_QWORD' (subkeys are created if necessary).

### RegDeleteKeyValue 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, string name) void`

Delete given key/valueName.

### RegDeleteKey 
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) void`

Delete given key. 

NB: If key has some subkeys then key will not be deleted (see below RegDeleteKeyIncludingSubkeys for this)

### RegDeleteKeyIncludingSubkeys
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key) void`

Delete given key and all subkeys.

### RegExportKey
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, [bool recursive = true]) RegDump{}¹`

List all values with their name, content, type and all subkeys from given key recursively (default) or not.<br/>
Export it in an object representation (see ¹RegDump) where<br/>
subkeys are treated as nested objects including an additional propriety values containing values data if any.

Example
-------

```js
const regdump = await regedit.promises.RegExportKey("HKCU","Software/Valve/Steam");
console.log(regdump);

//Console output:

{
  "values": [ //Values of HKCU/Software/Valve/Steam
	{"name": "H264HWAccel","type": "DWORD","data": "1"},
    {"name": "Language","type": "SZ","data": "english"},
    ... //etc
   ],
   "ActiveProcess": { //Subkey ActiveProcess of HKCU/Software/Valve/Steam
    "values": [ //Values of HKCU/Software/Valve/Steam/ActiveProcess
      {"name": "SteamClientDll","type": "SZ","data": "C:\\Program Files (x86)\\Steam\\steamclient.dll"},
      {"name": "SteamClientDll64","type": "SZ","data": "C:\\Program Files (x86)\\Steam\\steamclient64.dll"},
      ... //etc
    ]
   },
	"Apps": { //Subkey Apps of HKCU/Software/Valve/Steam
		"values": [], //Values of HKCU/Software/Valve/Steam/Apps (in this case none)
		"480": { //Subkey 480 of HKCU/Software/Valve/Steam/Apps
		  "values": [ //Values of HKCU/Software/Valve/Steam/Apps/480
			{"name": "Name","type": "SZ","data": "Spacewar"}, 
			... //etc
		  ]
		},
		"550": {
		  "values": [
			{"name": "Installed","type": "DWORD","data": "0"},
			{"name": "Name","type": "SZ","data": "Left 4 Dead 2"},
			... //etc
		  ]
		},
		... //etc
	},
	... //etc
}
```

### RegImportKey
`(string root: "HKCR"|"HKCU"|"HKLM"|"HKU"|"HKCC", string key, RegDump{}¹ data) void`

Import back to the registry a previously exported key (see RegExportKey and ¹RegDump).<br/>
This overwrites existing data if any.

<hr/>

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
