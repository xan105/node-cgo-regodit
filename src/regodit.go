/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

package main

import (
  "C"
  "strconv"
  "strings"
  "encoding/hex"
  "regodit/internal/regedit"
)

//export RegKeyExists
func RegKeyExists(root *C.char, path *C.char) C.uint {
  if regedit.KeyExists(C.GoString(root), C.GoString(path)) {
    return C.uint(1)
  }
  return C.uint(0)
}

//export RegListAllSubkeys
func RegListAllSubkeys(root *C.char, path *C.char) *C.char {
  subkeys := regedit.ListAllSubkeys(C.GoString(root), C.GoString(path))
  return C.CString(strings.Join(subkeys[:], ","))
}

//export RegListAllValues
func RegListAllValues(root *C.char, path *C.char) *C.char {
  values := regedit.ListAllValues(C.GoString(root), C.GoString(path))
  return C.CString(strings.Join(values[:], ","))
}

//export RegQueryValueType
func RegQueryValueType(root *C.char, path *C.char, key *C.char) *C.char {
  return C.CString(regedit.QueryValueType(C.GoString(root), C.GoString(path), C.GoString(key)))
}

//export RegQueryStringValue
func RegQueryStringValue(root *C.char, path *C.char, key *C.char) *C.char { // REG_SZ & REG_EXPAND_SZ
  return C.CString(regedit.QueryStringValue(C.GoString(root), C.GoString(path), C.GoString(key)))
}

//export RegQueryMultiStringValue
func RegQueryMultiStringValue(root *C.char, path *C.char, key *C.char) *C.char { // REG_MULTI_SZ
  values := regedit.QueryMultiStringValue(C.GoString(root), C.GoString(path), C.GoString(key))
  return C.CString(strings.Join(values[:], "\\0"))
}

//export RegQueryBinaryValue
func RegQueryBinaryValue(root *C.char, path *C.char, key *C.char) *C.char { //REG_BINARY
  value := regedit.QueryBinaryValue(C.GoString(root), C.GoString(path), C.GoString(key))
  return C.CString(hex.EncodeToString(value))
}

//export RegQueryIntegerValue
func RegQueryIntegerValue(root *C.char, path *C.char, key *C.char) *C.char { //REG_DWORD & REG_QWORD
  value := regedit.QueryIntegerValue(C.GoString(root), C.GoString(path), C.GoString(key))
  return C.CString(strconv.FormatUint(value, 10))
}

//export RegCreate
func RegCreate(root *C.char, path *C.char) {
  regedit.Create(C.GoString(root), C.GoString(path))
}

//export RegDelete
func RegDelete (root *C.char, path *C.char) {
  regedit.Delete(C.GoString(root), C.GoString(path))
}

//export RegWriteStringValue
func RegWriteStringValue(root *C.char, path *C.char, key *C.char, value *C.char) {
  regedit.WriteStringValue(C.GoString(root), C.GoString(path), C.GoString(key), C.GoString(value))
}

//export RegWriteExpandStringValue
func RegWriteExpandStringValue(root *C.char, path *C.char, key *C.char, value *C.char) {
  regedit.WriteExpandStringValue(C.GoString(root), C.GoString(path), C.GoString(key), C.GoString(value))
}

//export RegWriteMultiStringValue
func RegWriteMultiStringValue(root *C.char, path *C.char, key *C.char, value *C.char) {
  values := strings.Split(C.GoString(value), "\\0")
  regedit.WriteMultiStringValue(C.GoString(root), C.GoString(path), C.GoString(key), values)
}

//export RegWriteBinaryValue
func RegWriteBinaryValue(root *C.char, path *C.char, key *C.char, value *C.char) {
  bytes, _ := hex.DecodeString(C.GoString(value))
  regedit.WriteBinaryValue(C.GoString(root), C.GoString(path), C.GoString(key), bytes)
}

//export RegWriteDwordValue
func RegWriteDwordValue(root *C.char, path *C.char, key *C.char, value *C.char) {
  i, _ := strconv.ParseUint(C.GoString(value), 10, 32)
  regedit.WriteDwordValue(C.GoString(root), C.GoString(path), C.GoString(key), uint32(i))
}

//export RegWriteQwordValue
func RegWriteQwordValue(root *C.char, path *C.char, key *C.char, value *C.char) {
  i, _ := strconv.ParseUint(C.GoString(value), 10, 64)
  regedit.WriteQwordValue(C.GoString(root), C.GoString(path), C.GoString(key), i)
}

//export RegDeleteValue
func RegDeleteValue (root *C.char, path *C.char, key *C.char) {
  regedit.DeleteValue(C.GoString(root), C.GoString(path), C.GoString(key))
}

func main() {}