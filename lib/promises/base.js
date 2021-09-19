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
import { promisify } from "node:util";
import { isValidRootKey, normalize } from "../util/helper.js";

async function RegKeyExists(root, key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  const res = await promisify(lib.RegKeyExists.async)(root,normalize(key));
  return res === 1 ? true : false; 
}

async function RegListAllSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  const list = await promisify(lib.RegListAllSubkeys.async)(root,normalize(key));
  if (!list) return [];
  const res = list.split(",");
  return res.length > 0 ? res : [];
}
    
async function RegListAllValues(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  const list = await promisify(lib.RegListAllValues.async)(root,normalize(key));
  if (list) {
    const res = list.split(",");
    if (res.length > 0) { 
      return res.sort(function(a, b){ //Alphabetical sort to match regedit view
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
      });
    }
  } 
  return [];
}
    
async function RegQueryValueType(root,key,name){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  const res = await promisify(lib.RegQueryValueType.async)(root,normalize(key),name);
  return res;
}
    
async function RegQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  const res = await promisify(lib.RegQueryStringValue.async)(root,normalize(key),name);
  if (res === "" && await RegQueryValueType(root,key,name) === "NONE") return null;
  return res;
}
    
async function RegQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  const res = await promisify(lib.RegQueryStringValueAndExpand.async)(root,normalize(key),name);
  if (res === "" && await RegQueryValueType(root,key,name) === "NONE") return null;
  return res;
}
    
async function RegQueryBinaryValue(root,key,name){ //REG_BINARY
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
   
  const res = await promisify(lib.RegQueryBinaryValue.async)(root,normalize(key),name);
  if (res === "" && await RegQueryValueType(root,key,name) === "NONE") return null;
  return Buffer.from(res,"hex");
}
    
async function RegQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
   
  const res = await promisify(lib.RegQueryIntegerValue.async)(root,normalize(key),name);
  if ((res === "0" && await RegQueryValueType(root,key,name) === "NONE") || isNaN(res)) return null;
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res)
}
    
async function RegWriteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");

  if (key.length === 0) throw new Failure("Creating a root key is not allowed","ERR_INVALID_ARGS");
  
  await promisify(lib.RegWriteKey.async)(root,normalize(key));
}
    
async function RegWriteStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (typeof value !== "string") throw new Failure("Expecting key value to be a [string]","ERR_INVALID_ARGS");
  
  await promisify(lib.RegWriteStringValue.async)(root,normalize(key),name,value);
}
    
async function RegWriteExpandStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (typeof value !== "string") throw new Failure("Expecting key value to be a [string]","ERR_INVALID_ARGS");
  
  await promisify(lib.RegWriteExpandStringValue.async)(root,normalize(key),name,value);
}
    
async function RegWriteBinaryValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  if (!Buffer.isBuffer(value)) throw new Failure("Expecting key value to be a [buffer]","ERR_INVALID_ARGS");
  
  await promisify(lib.RegWriteBinaryValue.async)(root,normalize(key),name,value.toString('hex'));
}
    
async function RegWriteDwordValue(root,key,name,value){
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
  
  await promisify(lib.RegWriteDwordValue.async)(root,normalize(key),name,number.toString());
}
    
async function RegWriteQwordValue(root,key,name,value){
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
  
  await promisify(lib.RegWriteQwordValue.async)(root,normalize(key),name,number.toString());
}
    
async function RegDeleteKeyValue(root,key,name){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (typeof name !== "string") throw new Failure("Expecting key name to be a [string]","ERR_INVALID_ARGS");
  
  await promisify(lib.RegDeleteKeyValue.async)(root,normalize(key),name);
}
    
async function RegDeleteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  if (key.length === 0) throw new Failure("Deleting a root key is not allowed","ERR_INVALID_ARGS");

  await promisify(lib.RegDeleteKey.async)(root,normalize(key));
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