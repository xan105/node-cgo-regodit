/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { promisify } from "node:util";
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

async function regKeyExists(root, key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  
  const res = await promisify(lib.RegKeyExists.async)(root,normalize(key));
  return res === 1; 
}

async function regListAllSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  
  const list = await promisify(lib.RegListAllSubkeys.async)(root,normalize(key));
  if (!list) return [];
  return list.split(",");
}
    
async function regListAllValues(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  
  const list = await promisify(lib.RegListAllValues.async)(root,normalize(key));
  if (!list) return [];
  const res = list.split(",").sort(function(a, b){ //Alphabetical sort to match regedit view
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
  });
  return res;
}
    
async function regQueryValueType(root,key,name){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = await promisify(lib.RegQueryValueType.async)(root,normalize(key),name);
  return res;
}
    
async function regQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = await promisify(lib.RegQueryStringValue.async)(root,normalize(key),name);
  if (res === ""){
    const type = await regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["SZ","EXPAND_SZ"].includes(type)) throw new Failure("Only REG_SZ & REG_EXPAND_SZ are supported","ERR_WRONG_USAGE");
  }
  return res;
}
    
async function regQueryMultiStringValue(root,key,name){ // REG_MULTI_SZ
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = await promisify(lib.RegQueryMultiStringValue.async)(root,normalize(key),name);
  if (res === ""){
    const type = await regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["MULTI_SZ"].includes(type)) throw new Failure("Only REG_MULTI_SZ is supported","ERR_WRONG_USAGE");
  }
  return res.split("\\0");
}  
    
async function regQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  const res = await promisify(lib.RegQueryStringValueAndExpand.async)(root,normalize(key),name);
  if (res === ""){
    const type = await regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["EXPAND_SZ"].includes(type)) throw new Failure("Only REG_EXPAND_SZ is supported","ERR_WRONG_USAGE");
  }
  return res;
}
    
async function regQueryBinaryValue(root,key,name){ //REG_BINARY
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
   
  const res = await promisify(lib.RegQueryBinaryValue.async)(root,normalize(key),name);
  if (res === ""){
    const type = await regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["BINARY"].includes(type)) throw new Failure("Only REG_BINARY is supported","ERR_WRONG_USAGE");
  }
  return Buffer.from(res,"hex");
}
    
async function regQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
   
  const res = await promisify(lib.RegQueryIntegerValue.async)(root,normalize(key),name);
  if (res === "0"){
    const type = await regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["DWORD","DWORD_BIG_ENDIAN","QWORD"].includes(type)) throw new Failure("Only REG_DWORD & REG_QWORD are supported","ERR_WRONG_USAGE");
  }
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res)
}
    
async function regWriteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldStringNotEmpty(key); //Creating a root key is not allowed

  await promisify(lib.RegWriteKey.async)(root,normalize(key));
}
    
async function regWriteStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  await promisify(lib.RegWriteStringValue.async)(root,normalize(key),name,value);
}

async function regWriteMultiStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldArrayOfString(value);
  
  await promisify(lib.RegWriteMultiStringValue.async)(root,normalize(key),name,value.join("\\0"));
}
   
async function regWriteExpandStringValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  await promisify(lib.RegWriteExpandStringValue.async)(root,normalize(key),name,value);
}
    
async function regWriteBinaryValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  shouldBuffer(value);
  
  await promisify(lib.RegWriteBinaryValue.async)(root,normalize(key),name,value.toString('hex'));
}
    
async function regWriteDwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);

  if (isIntegerWithinRange(value, 0, 4294967295) ||
      isBigIntWithinRange(value, 0n, 4294967295n)) 
  {
    await promisify(lib.RegWriteDwordValue.async)(root,normalize(key),name,value.toString());
  } else {
    throw new Failure("DWORD range 0 - 4294967295", {code: 1, info: { type: typeof value, value: value }});
  }
}
    
async function regWriteQwordValue(root,key,name,value){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);

  if (isIntegerPositiveOrZero(value) ||
      isBigIntWithinRange(value, 0n, 18446744073709551615n))
  {
    await promisify(lib.RegWriteQwordValue.async)(root,normalize(key),name,value.toString());
  } else {
    throw new Failure("QWORD range 0 - 18446744073709551615", {code: 1, info: { type: typeof value, value: value }});
  }
}
    
async function regDeleteKeyValue(root,key,name){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldString(key);
  shouldString(name);
  
  await promisify(lib.RegDeleteKeyValue.async)(root,normalize(key),name);
}
    
async function regDeleteKey(root,key){
  if (!isValidRootKey(root)) throw new Failure(...ROOTKEY);
  shouldStringNotEmpty(key); //Deleting a root key is not allowed

  await promisify(lib.RegDeleteKey.async)(root,normalize(key));
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