/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { Failure } from "@xan105/error";
import { 
  shouldString, 
  shouldStringNotEmpty, 
  shouldArrayOfString,
  shouldBuffer,
} from "@xan105/is/assert";
import {
  isIntegerWithinRange,
  isBigIntWithinRange,
  isIntegerPositiveOrZero
} from "@xan105/is";
import { lib } from "../util/ffi.js";
import { isValidRootKey, normalize } from "../util/helper.js";

const ROOTKEY = ["Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC", 1];

function regKeyExists(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  
  const res = lib.RegKeyExists(root,normalize(key));
  return res === 1;
}
    
function regListAllSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  
  const list = lib.RegListAllSubkeys(root,normalize(key));
  if (!list) return [];
  return list.split(",");
}
    
function regListAllValues(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  
  const list = lib.RegListAllValues(root,normalize(key));
  if (!list) return [];
  const res = list.split(",").sort(function(a, b){ //Alphabetical sort to match regedit view
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
  });
  return res;
}
    
function regQueryValueType(root,key,name){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  return lib.RegQueryValueType(root,normalize(key),name);
}
    
function regQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = lib.RegQueryStringValue(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["SZ","EXPAND_SZ"].includes(type)) throw new Failure("Only REG_SZ & REG_EXPAND_SZ are supported","ERR_WRONG_USAGE");
  }
  return res;
}

function regQueryMultiStringValue(root,key,name){ // REG_MULTI_SZ
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = lib.RegQueryMultiStringValue(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["MULTI_SZ"].includes(type)) throw new Failure("Only REG_MULTI_SZ is supported","ERR_WRONG_USAGE");
  }
  return res.split("\\0");
}
    
function regQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = lib.RegQueryStringValueAndExpand(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["EXPAND_SZ"].includes(type)) throw new Failure("Only REG_EXPAND_SZ is supported","ERR_WRONG_USAGE");
  }
  return res;
}
    
function regQueryBinaryValue(root,key,name){ //REG_BINARY
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
   
  const res = lib.RegQueryBinaryValue(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["BINARY"].includes(type)) throw new Failure("Only REG_BINARY is supported","ERR_WRONG_USAGE");
  }
  return Buffer.from(res,"hex");
}
    
function regQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
   
  const res = lib.RegQueryIntegerValue(root,normalize(key),name);
  if (res === "0"){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["DWORD","DWORD_BIG_ENDIAN","QWORD"].includes(type)) throw new Failure("Only REG_DWORD & REG_QWORD are supported","ERR_WRONG_USAGE");
  }
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res)
}
    
function regWriteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldStringNotEmpty(key); //Creating a root key is not allowed
  
  lib.RegWriteKey(root,normalize(key));
}
    
function regWriteStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  lib.RegWriteStringValue(root,normalize(key),name,value);
}

function regWriteMultiStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldArrayOfString(value);

  lib.RegWriteMultiStringValue(root,normalize(key),name,value.join("\\0"));
}
    
function regWriteExpandStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  lib.RegWriteExpandStringValue(root,normalize(key),name,value);
}
    
function regWriteBinaryValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldBuffer(value);
  
  lib.RegWriteBinaryValue(root,normalize(key),name,value.toString('hex'));
}
    
function regWriteDwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);

  if (isIntegerWithinRange(value, 0, 4294967295) ||
      isBigIntWithinRange(value, 0n, 4294967295n)) 
  {
    lib.RegWriteDwordValue(root,normalize(key),name,value.toString());
  } else {
    throw new Failure("DWORD range 0 - 4294967295", {code: 1, info: { type: typeof value, value: value }});
  }
}
    
function regWriteQwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);

  if (isIntegerPositiveOrZero(value) ||
      isBigIntWithinRange(value, 0n, 18446744073709551615n))
  {
    lib.RegWriteQwordValue(root,normalize(key),name,value.toString());
  } else {
    throw new Failure("QWORD range 0 - 18446744073709551615", {code: 1, info: { type: typeof value, value: value }});
  }
}
    
function regDeleteKeyValue(root,key,name){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  lib.RegDeleteKeyValue(root,normalize(key),name);
}
    
function regDeleteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldStringNotEmpty(key); //Deleting a root key is not allowed

  lib.RegDeleteKey(root,normalize(key));
}
    
export {
  regKeyExists,
  regListAllSubkeys,  
  regListAllValues,
  regQueryValueType,
  regQueryStringValue, 
  regQueryMultiStringValue, 
  regQueryStringValueAndExpand,    
  regQueryBinaryValue,     
  regQueryIntegerValue,    
  regWriteKey,    
  regWriteStringValue,
  regWriteMultiStringValue,     
  regWriteExpandStringValue,     
  regWriteBinaryValue,     
  regWriteDwordValue,     
  regWriteQwordValue,    
  regDeleteKeyValue,     
  regDeleteKey
};