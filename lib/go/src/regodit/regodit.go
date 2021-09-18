//go:generate goversioninfo -platform-specific=true

/*
MIT License

Copyright (c) 2018-2021 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

package main

import (
	"C"
	"golang.org/x/sys/windows/registry"
	"encoding/hex"
	"strconv"
	"strings"
)

func GetHKEY(root string) registry.Key {

	var HKEY registry.Key
		
	if (root == "HKCR"){ 
		HKEY = registry.CLASSES_ROOT
	} else if (root == "HKCU") {
		HKEY = registry.CURRENT_USER
	}else if (root == "HKLM") {
		HKEY = registry.LOCAL_MACHINE
	}else if (root == "HKU") { 
		HKEY = registry.USERS
	}else if (root == "HKCC") { 
		HKEY = registry.CURRENT_CONFIG
	}
		
	return HKEY

}

//export RegKeyExists
func RegKeyExists(root *C.char, key *C.char) C.uint {

	var result int
	HKEY := GetHKEY(C.GoString(root))

	k, err := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
  
  if err != nil {
		result = 0
  } else {
    result = 1
  }

  defer k.Close()
		 
  return C.uint(result)

}

//export RegListAllSubkeys
func RegListAllSubkeys(root *C.char, key *C.char) *C.char {
  
  var result string
  HKEY := GetHKEY(C.GoString(root))
  
  k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE | registry.ENUMERATE_SUB_KEYS)
		 defer k.Close()
  
  list, _ := k.ReadSubKeyNames(-1)
  
  result = strings.Join(list[:], ",")
  
  return C.CString(result)
  
}

//export RegListAllValues
func RegListAllValues(root *C.char, key *C.char) *C.char {
  
  var result string
  HKEY := GetHKEY(C.GoString(root))
  
  k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE | registry.ENUMERATE_SUB_KEYS)
		 defer k.Close()
  
  list, _ := k.ReadValueNames(-1)
  
  result = strings.Join(list[:], ",")
  
  return C.CString(result)
  
}

//export RegQueryValueType
func RegQueryValueType(root *C.char, key *C.char, name *C.char) *C.char {

	var result string
	var buf []byte;
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 _, valtype, _ := k.GetValue(C.GoString(name),buf)
 
	switch valtype {
		case 0: result = "NONE"
		case 1: result = "SZ"
		case 2: result = "EXPAND_SZ"
		case 3: result = "BINARY"
		case 4: result = "DWORD"
		case 5: result = "DWORD_BIG_ENDIAN"
		case 6: result = "LINK"
		case 7: result = "MULTI_SZ"
		case 8: result = "RESOURCE_LIST"
		case 9: result = "FULL_RESOURCE_DESCRIPTOR"
		case 10: result = "RESOURCE_REQUIREMENTS_LIST"
		case 11: result = "QWORD"
	}
 
	return C.CString(result)
}

//export RegQueryStringValue
func RegQueryStringValue(root *C.char, key *C.char, name *C.char) *C.char { // REG_SZ & REG_EXPAND_SZ

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 result, _, _ = k.GetStringValue(C.GoString(name))
 
	return C.CString(result)
}

//export RegQueryStringValueAndExpand
func RegQueryStringValueAndExpand(root *C.char, key *C.char, name *C.char) *C.char { // REG_EXPAND_SZ (expands environment-variable strings)

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 s, _, _ := k.GetStringValue(C.GoString(name))
     result, _ = registry.ExpandString(s)
     
	return C.CString(result)
}

//export RegQueryBinaryValue
func RegQueryBinaryValue(root *C.char, key *C.char, name *C.char) *C.char { //REG_BINARY

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 x, _, _ := k.GetBinaryValue(C.GoString(name))
 
  result = hex.EncodeToString(x)
 
	return C.CString(result)

}

//export RegQueryIntegerValue
func RegQueryIntegerValue(root *C.char, key *C.char, name *C.char) *C.char { //REG_DWORD & REG_QWORD

	var result string
	HKEY := GetHKEY(C.GoString(root))

	k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.QUERY_VALUE)
		 defer k.Close()
		 i, _, _ := k.GetIntegerValue(C.GoString(name))
 
  result = strconv.FormatUint(i, 10)
 
	return C.CString(result)

}

//export RegWriteKey
func RegWriteKey (root *C.char, key *C.char) {

	HKEY := GetHKEY(C.GoString(root))

  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()

}

//export RegWriteStringValue
func RegWriteStringValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    k.SetStringValue(C.GoString(name), C.GoString(value))
}

//export RegWriteExpandStringValue
func RegWriteExpandStringValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    k.SetExpandStringValue(C.GoString(name), C.GoString(value))
}

//export RegWriteBinaryValue
func RegWriteBinaryValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    x, _ := hex.DecodeString(C.GoString(value))
    k.SetBinaryValue(C.GoString(name), x)
}

//export RegWriteDwordValue
func RegWriteDwordValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    i, _ := strconv.ParseUint(C.GoString(value), 10, 32)
    k.SetDWordValue(C.GoString(name), uint32(i))
}

//export RegWriteQwordValue
func RegWriteQwordValue(root *C.char, key *C.char, name *C.char, value *C.char) {

	HKEY := GetHKEY(C.GoString(root))
  
  k, _, _ := registry.CreateKey(HKEY, C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    i, _ := strconv.ParseUint(C.GoString(value), 10, 64)
    k.SetQWordValue(C.GoString(name), i)
}

//export RegDeleteKeyValue
func RegDeleteKeyValue (root *C.char, key *C.char, name *C.char) {

  HKEY := GetHKEY(C.GoString(root))

  k, _ := registry.OpenKey(HKEY , C.GoString(key), registry.ALL_ACCESS) 
    defer k.Close()
    k.DeleteValue(C.GoString(name))

}

//export RegDeleteKey
func RegDeleteKey (root *C.char, key *C.char) {

  HKEY := GetHKEY(C.GoString(root))

  registry.DeleteKey(HKEY, C.GoString(key)) 

}

func main() {}