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
import { isValidRootKey, normalize, isArrayOfString } from "../util/helper.js";

function RegKeyExists(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  const res = lib.RegKeyExists(root,normalize(key));
  return res === 1 ? true : false;
}
    
function RegListAllSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  const list = lib.RegListAllSubkeys(root,normalize(key));
  if (!list) return [];
  return list.split(",");
}
    
function RegListAllValues(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  const list = lib.RegListAllValues(root,normalize(key));
  if (!list) return [];
  const res = list.split(",").sort(function(a, b){ //Alphabetical sort to match regedit view
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
  });
  return res;
}
    
function RegQueryValueType(root,key,name){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  return lib.RegQueryValueType(root,normalize(key),name);
}
    
function RegQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  const res = lib.RegQueryStringValue(root,normalize(key),name);
  if (res === ""){
    const type = RegQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["SZ","EXPAND_SZ"].includes(type)) throw new Failure("Only REG_SZ & REG_EXPAND_SZ are supported","ERR_WRONG_USAGE");
  }
  return res;
}

function RegQueryMultiStringValue(root,key,name){ // REG_MULTI_SZ
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  const res = lib.RegQueryMultiStringValue(root,normalize(key),name);
  if (res === ""){
    const type = RegQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["MULTI_SZ"].includes(type)) throw new Failure("Only REG_MULTI_SZ is supported","ERR_WRONG_USAGE");
  }
  return res.split("\\0");
}
    
function RegQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  const res = lib.RegQueryStringValueAndExpand(root,normalize(key),name);
  if (res === ""){
    const type = RegQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["EXPAND_SZ"].includes(type)) throw new Failure("Only REG_EXPAND_SZ is supported","ERR_WRONG_USAGE");
  }
  return res;
}
    
function RegQueryBinaryValue(root,key,name){ //REG_BINARY
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
   
  const res = lib.RegQueryBinaryValue(root,normalize(key),name);
  if (res === ""){
    const type = RegQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["BINARY"].includes(type)) throw new Failure("Only REG_BINARY is supported","ERR_WRONG_USAGE");
  }
  return Buffer.from(res,"hex");
}
    
function RegQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
   
  const res = lib.RegQueryIntegerValue(root,normalize(key),name);
  if (res === "0"){
    const type = RegQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["DWORD","DWORD_BIG_ENDIAN","QWORD"].includes(type)) throw new Failure("Only REG_DWORD & REG_QWORD are supported","ERR_WRONG_USAGE");
  }
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res)
}
    
function RegWriteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");

  if (key.length === 0) throw new Failure("Creating a root key is not allowed","ERR_INVALID_ARGS");
  
  lib.RegWriteKey(root,normalize(key));
}
    
function RegWriteStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (typeof value !== "string") throw new Failure("Expecting key value to be a [string]","ERR_INVALID_ARGS");
  
  lib.RegWriteStringValue(root,normalize(key),name,value);
}

function RegWriteMultiStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (!isArrayOfString(value)) throw new Failure("Expecting key value to be a [string[]]","ERR_INVALID_ARGS");

  lib.RegWriteMultiStringValue(root,normalize(key),name,value.join("\\0"));
}
    
function RegWriteExpandStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (typeof value !== "string") throw new Failure("Expecting key value to be a [string]","ERR_INVALID_ARGS");
  
  lib.RegWriteExpandStringValue(root,normalize(key),name,value);
}
    
function RegWriteBinaryValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (!Buffer.isBuffer(value)) throw new Failure("Expecting key value to be a [buffer]","ERR_INVALID_ARGS");
  
  lib.RegWriteBinaryValue(root,normalize(key),name,value.toString('hex'));
}
    
function RegWriteDwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");

  if ( !["bigint","number","string"].includes(typeof value) ||
       (typeof value === "number" && !Number.isSafeInteger(value)) ||
       (typeof value === "string" && (isNaN(value) || value.length === 0)) )
    throw new Failure("Expecting value to be [bigint], [number] (safe integer) or [string] (non-empty)","ERR_INVALID_ARGS");

  const number = typeof value === "string" ? BigInt(value) : value;
  
  if ( (typeof number === "number" && !(number >= 0 && number <= 4294967295)) ||
       (typeof number === "bigint" && !(number >= 0n && number <= 4294967295n)) )
    throw new Failure("DWORD range 0 - 4294967295","ERR_INVALID_ARGS");  
  
  lib.RegWriteDwordValue(root,normalize(key),name,number.toString());
}
    
function RegWriteQwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  if ( !["bigint","number","string"].includes(typeof value) ||
       (typeof value === "number" && !Number.isSafeInteger(value)) ||
       (typeof value === "string" && (isNaN(value) || value.length === 0)) )
    throw new Failure("Expecting value to be [bigint], [number] (safe integer) or [string] (non-empty)","ERR_INVALID_ARGS");
  
  const number = typeof value === "bigint" ? value : BigInt(value);

  if ( !(number >= 0n && number <= 18446744073709551615n) )
    throw new Failure("QWORD range 0 - 18446744073709551615","ERR_INVALID_ARGS");
  
  lib.RegWriteQwordValue(root,normalize(key),name,number.toString());
}
    
function RegDeleteKeyValue(root,key,name){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  lib.RegDeleteKeyValue(root,normalize(key),name);
}
    
function RegDeleteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  if (key.length === 0) throw new Failure("Deleting a root key is not allowed","ERR_INVALID_ARGS");

  lib.RegDeleteKey(root,normalize(key));
}
    
export {
  RegKeyExists,
  RegListAllSubkeys,  
  RegListAllValues,
  RegQueryValueType,
  RegQueryStringValue, 
  RegQueryMultiStringValue, 
  RegQueryStringValueAndExpand,    
  RegQueryBinaryValue,     
  RegQueryIntegerValue,    
  RegWriteKey,    
  RegWriteStringValue,
  RegWriteMultiStringValue,     
  RegWriteExpandStringValue,     
  RegWriteBinaryValue,     
  RegWriteDwordValue,     
  RegWriteQwordValue,    
  RegDeleteKeyValue,     
  RegDeleteKey
};