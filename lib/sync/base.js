/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { Failure, errorLookup  } from "@xan105/error";
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
import { shouldValidRootKey, normalize, alphabetical } from "../util/helper.js";

function regKeyExists(root,key){
  shouldValidRootKey(root);
  shouldString(key);
  
  if (!lib.RegKeyExists) throw new Failure(...errorLookup(120), "windows");
  
  const res = lib.RegKeyExists(root,normalize(key));
  return res === 1;
}
    
function regListAllSubkeys(root,key){
  shouldValidRootKey(root);
  shouldString(key);
  
  if (!lib.RegListAllSubkeys) throw new Failure(...errorLookup(120), "windows");
  
  const list = lib.RegListAllSubkeys(root,normalize(key));
  return list ? list.split(",") : [];
}
    
function regListAllValues(root,key){
  shouldValidRootKey(root);
  shouldString(key);
  
  if (!lib.RegListAllValues) throw new Failure(...errorLookup(120), "windows");
  
  const list = lib.RegListAllValues(root,normalize(key));
  return !list ? [] : 
          list.split(",")
          .sort(alphabetical); //Alphabetical sort to match regedit view
}
    
function regQueryValueType(root,key,name){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  if (!lib.RegQueryValueType) throw new Failure(...errorLookup(120), "windows");
  
  return lib.RegQueryValueType(root,normalize(key),name);
}
    
function regQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  if (!lib.RegQueryStringValue) throw new Failure(...errorLookup(120), "windows");
  
  const res = lib.RegQueryStringValue(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["SZ","EXPAND_SZ"].includes(type)) 
      throw new Failure("Only REG_SZ & REG_EXPAND_SZ are supported","ERR_WRONG_USAGE");
  }
  return res;
}

function regQueryMultiStringValue(root,key,name){ // REG_MULTI_SZ
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  if (!lib.RegQueryMultiStringValue) throw new Failure(...errorLookup(120), "windows");
  
  const res = lib.RegQueryMultiStringValue(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["MULTI_SZ"].includes(type)) 
      throw new Failure("Only REG_MULTI_SZ is supported","ERR_WRONG_USAGE");
  }
  return res.split("\\0");
}
    
function regQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  if (!lib.RegQueryStringValueAndExpand) throw new Failure(...errorLookup(120), "windows");
  
  const res = lib.RegQueryStringValueAndExpand(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["EXPAND_SZ"].includes(type)) 
      throw new Failure("Only REG_EXPAND_SZ is supported","ERR_WRONG_USAGE");
  }
  return res;
}
    
function regQueryBinaryValue(root,key,name){ //REG_BINARY
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
   
  if (!lib.RegQueryBinaryValue) throw new Failure(...errorLookup(120), "windows"); 
   
  const res = lib.RegQueryBinaryValue(root,normalize(key),name);
  if (res === ""){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["BINARY"].includes(type)) 
      throw new Failure("Only REG_BINARY is supported","ERR_WRONG_USAGE");
  }
  return Buffer.from(res,"hex");
}
    
function regQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
   
  if (!lib.RegQueryIntegerValue) throw new Failure(...errorLookup(120), "windows");  
   
  const res = lib.RegQueryIntegerValue(root,normalize(key),name);
  if (res === "0"){
    const type = regQueryValueType(root,key,name);
    if (type === "NONE") return null;
    if (!["DWORD","DWORD_BIG_ENDIAN","QWORD"].includes(type)) 
      throw new Failure("Only REG_DWORD & REG_QWORD are supported","ERR_WRONG_USAGE");
  }
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res)
}
    
function regWriteKey(root,key){
  shouldValidRootKey(root);
  shouldStringNotEmpty(key); //Creating a root key is not allowed
  
  if (!lib.RegWriteKey) throw new Failure(...errorLookup(120), "windows");
  
  lib.RegWriteKey(root,normalize(key));
}
    
function regWriteStringValue(root,key,name,value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  if (!lib.RegWriteStringValue) throw new Failure(...errorLookup(120), "windows");
  
  lib.RegWriteStringValue(root,normalize(key),name,value);
}

function regWriteMultiStringValue(root,key,name,value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldArrayOfString(value);

  if (!lib.RegWriteMultiStringValue) throw new Failure(...errorLookup(120), "windows");

  lib.RegWriteMultiStringValue(root,normalize(key),name,value.join("\\0"));
}
    
function regWriteExpandStringValue(root,key,name,value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldString(value);
  
  if (!lib.RegWriteExpandStringValue) throw new Failure(...errorLookup(120), "windows");
  
  lib.RegWriteExpandStringValue(root,normalize(key),name,value);
}
    
function regWriteBinaryValue(root,key,name,value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  shouldBuffer(value);
  
  if (!lib.RegWriteBinaryValue) throw new Failure(...errorLookup(120), "windows");
  
  lib.RegWriteBinaryValue(root,normalize(key),name,value.toString('hex'));
}
    
function regWriteDwordValue(root,key,name,value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);

  if (!lib.RegWriteDwordValue) throw new Failure(...errorLookup(120), "windows");

  if (isIntegerWithinRange(value, 0, 4294967295) ||
      isBigIntWithinRange(value, 0n, 4294967295n)) 
  {
    lib.RegWriteDwordValue(root,normalize(key),name,value.toString());
  } else {
    throw new Failure("DWORD range is [ 0, 4294967295 ]", {
      code: 1, 
      info: { type: typeof value, value }
    });
  }
}
    
function regWriteQwordValue(root,key,name,value){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);

  if (!lib.RegWriteQwordValue) throw new Failure(...errorLookup(120), "windows");

  if (isIntegerPositiveOrZero(value) ||
      isBigIntWithinRange(value, 0n, 18446744073709551615n))
  {
    lib.RegWriteQwordValue(root,normalize(key),name,value.toString());
  } else {
    throw new Failure("QWORD range is [ 0, 18446744073709551615 ]", {
      code: 1, 
      info: { type: typeof value, value }
    });
  }
}
    
function regDeleteKeyValue(root,key,name){
  shouldValidRootKey(root);
  shouldString(key);
  shouldString(name);
  
  if (!lib.RegDeleteKeyValue) throw new Failure(...errorLookup(120), "windows");
  
  lib.RegDeleteKeyValue(root,normalize(key),name);
}
    
function regDeleteKey(root,key){
  shouldValidRootKey(root);
  shouldStringNotEmpty(key); //Deleting a root key is not allowed

  if (!lib.RegDeleteKey) throw new Failure(...errorLookup(120), "windows");

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