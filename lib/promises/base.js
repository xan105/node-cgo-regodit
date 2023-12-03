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
import { dlopen } from "@xan105/ffi/koffi";
import * as dylib from "../util/ffi.js";
import { shouldValidRootKey, normalize, alphabetical } from "../util/helper.js";

const lib = dlopen(dylib.filePath, dylib.symbols, { errorAtRuntime: true, nonblocking: true });

async function regKeyExists(root, key){
  shouldValidRootKey(root);
  shouldString(key);
  
  const res = await lib.RegKeyExists(root, normalize(key));
  return res === 1; 
}

async function regListAllSubkeys(root, key){
  shouldValidRootKey(root);
  shouldString(key);
  
  const list = await lib.RegListAllSubkeys(root, normalize(key));
  return list ? list.split(",") : [];
}
    
async function regListAllValues(root, key){
  shouldValidRootKey(root);
  shouldString(key);
  
  const list = await lib.RegListAllValues(root, normalize(key));
  return !list ? [] : list.split(",").sort(alphabetical); //Alphabetical sort to match regedit view
}
    
async function regQueryValueType(root, key, name){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  const res = await lib.RegQueryValueType(root, normalize(key), name);
  return res;
}
    
async function regQueryStringValue(root, key, name){ // REG_SZ & REG_EXPAND_SZ
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  const res = await lib.RegQueryStringValue(root, normalize(key), name);
  if (res === ""){
    const type = await regQueryValueType(root, key, name);
    if (type === "NONE") return null;
    if (!["SZ", "EXPAND_SZ"].includes(type)) 
      throw new Failure("Only REG_SZ & REG_EXPAND_SZ are supported", "ERR_WRONG_USAGE");
  }
  return res;
}
    
async function regQueryMultiStringValue(root, key, name){ // REG_MULTI_SZ
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  const res = await lib.RegQueryMultiStringValue(root, normalize(key), name);
  if (res === ""){
    const type = await regQueryValueType(root, key, name);
    if (type === "NONE") return null;
    if (!["MULTI_SZ"].includes(type)) 
      throw new Failure("Only REG_MULTI_SZ is supported", "ERR_WRONG_USAGE");
  }
  return res.split("\\0");
}  
    
async function regQueryStringValueAndExpand(root, key, name){ // REG_EXPAND_SZ (expands environment-variable strings)
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  const res = await lib.RegQueryStringValueAndExpand(root, normalize(key), name);
  if (res === ""){
    const type = await regQueryValueType(root, key, name);
    if (type === "NONE") return null;
    if (!["EXPAND_SZ"].includes(type)) 
      throw new Failure("Only REG_EXPAND_SZ is supported", "ERR_WRONG_USAGE");
  }
  return res;
}
    
async function regQueryBinaryValue(root, key, name){ //REG_BINARY
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
   
  const res = await lib.RegQueryBinaryValue(root, normalize(key), name);
  if (res === ""){
    const type = await regQueryValueType(root, key, name);
    if (type === "NONE") return null;
    if (!["BINARY"].includes(type)) 
      throw new Failure("Only REG_BINARY is supported", "ERR_WRONG_USAGE");
  }
  return Buffer.from(res,"hex");
}
    
async function regQueryIntegerValue(root, key, name){ //REG_DWORD & REG_QWORD
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  const res = await lib.RegQueryIntegerValue(root, normalize(key), name);
  if (res === "0"){
    const type = await regQueryValueType(root, key, name);
    if (type === "NONE") return null;
    if (!["DWORD", "DWORD_BIG_ENDIAN", "QWORD"].includes(type)) 
      throw new Failure("Only REG_DWORD & REG_QWORD are supported", "ERR_WRONG_USAGE");
  }
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res);
}
    
async function regWriteKey(root, key){
  shouldValidRootKey(root);
  shouldStringNotEmpty(key); //Creating a root key is not allowed

  await lib.RegWriteKey(root, normalize(key));
}
    
async function regWriteStringValue(root, key, name, value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  await lib.RegWriteStringValue(root, normalize(key), name, value);
}

async function regWriteMultiStringValue(root, key, name, value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldArrayOfString(value);
  
  await lib.RegWriteMultiStringValue(root, normalize(key), name, value.join("\\0"));
}
   
async function regWriteExpandStringValue(root, key, name, value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  await lib.RegWriteExpandStringValue(root, normalize(key), name, value);
}
    
async function regWriteBinaryValue(root, key, name, value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldBuffer(value);
  
  await lib.RegWriteBinaryValue(root, normalize(key), name, value.toString("hex"));
}
    
async function regWriteDwordValue(root, key, name, value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);

  if (isIntegerWithinRange(value, 0, 4294967295) ||
      isBigIntWithinRange(value, 0n, 4294967295n)) 
  {
    await lib.RegWriteDwordValue(root, normalize(key), name, value.toString());
  } else {
    throw new Failure("DWORD range is [ 0, 4294967295 ]", { 
      code: 1, 
      info: { 
        type: typeof value, 
        tag: Object.prototype.toString.call(value),
        value 
      }
    });
  }
}
    
async function regWriteQwordValue(root, key, name, value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);

  if (isIntegerPositiveOrZero(value) ||
      isBigIntWithinRange(value, 0n, 18446744073709551615n))
  {
    await lib.RegWriteQwordValue(root, normalize(key), name, value.toString());
  } else {
    throw new Failure("QWORD range is [ 0, 18446744073709551615 ]", {
      code: 1, 
      info: { 
        type: typeof value, 
        tag: Object.prototype.toString.call(value),
        value 
      }
    });
  }
}
    
async function regDeleteKeyValue(root, key, name){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  await lib.RegDeleteKeyValue(root, normalize(key), name);
}
    
async function regDeleteKey(root,key){
  shouldValidRootKey(root);
  shouldStringNotEmpty(key); //Deleting a root key is not allowed

  await lib.RegDeleteKey(root, normalize(key));
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