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

import { lib } from "../ffi.js";
import { Failure } from "../util/error.js";
import { isValidRootKey, normalize } from "../util/helper.js";

function RegKeyExists(root,key){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  const res = lib.RegKeyExists(root,normalize(key));
  return (res === 1) ? true : false;
}
    
function RegListAllSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  const list = lib.RegListAllSubkeys(root,normalize(key));
  if (list) {
    const res = list.split(",");
    return (res.length > 0) ? res : null;
  } else {
    return null;
  }
}
    
function RegListAllValues(root,key){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  const list = lib.RegListAllValues(root,normalize(key));
  if (list) {
    const res = list.split(",");
    if (res.length > 0) { 
      return res.sort(function(a, b){ //Alphabetical sort to match regedit view
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
      })
    } else {
      return null;
    }
  } else {
    return null;
  }
}
    
function RegQueryValueType(root,key,name){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  return lib.RegQueryValueType(root,normalize(key),name);
}
    
function RegQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS"); 
  const res = lib.RegQueryStringValue(root,normalize(key),name);
  return (res) ? res : null;
}
    
function RegQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  const res = lib.RegQueryStringValueAndExpand(root,normalize(key),name);
  return (res) ? res : null;
}
    
function RegQueryBinaryValue(root,key,name){ //REG_BINARY
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");  
  const res = lib.RegQueryBinaryValue(root,normalize(key),name);
  return (res) ? res : null;
}
    
function RegQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");   
  const res = lib.RegQueryIntegerValue(root,normalize(key),name);
  return (res) ? res : null;
}
    
function RegWriteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegWriteKey(root,normalize(key));
}
    
function RegWriteStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegWriteStringValue(root,normalize(key),name,value.toString());
}
    
function RegWriteExpandStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegWriteExpandStringValue(root,normalize(key),name,value.toString());
}
    
function RegWriteBinaryValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegWriteBinaryValue(root,normalize(key),name,value.toString());
}
    
function RegWriteDwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegWriteDwordValue(root,normalize(key),name,value.toString());
}
    
function RegWriteQwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegWriteQwordValue(root,normalize(key),name,value.toString());
}
    
function RegDeleteKeyValue(root,key,name){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegDeleteKeyValue(root,normalize(key),name);
}
    
function RegDeleteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
  lib.RegDeleteKey(root,normalize(key));
}
    
export {
  RegKeyExists,
  RegListAllSubkeys,  
  RegListAllValues,
  RegQueryValueType,
  RegQueryStringValue,  
  RegQueryStringValueAndExpand,    
  RegQueryBinaryValue,     
  RegQueryIntegerValue,    
  RegWriteKey,    
  RegWriteStringValue,     
  RegWriteExpandStringValue,     
  RegWriteBinaryValue,     
  RegWriteDwordValue,     
  RegWriteQwordValue,    
  RegDeleteKeyValue,     
  RegDeleteKey
};