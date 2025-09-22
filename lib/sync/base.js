/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { Failure  } from "@xan105/error";
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
import * as dylib from "../bindings/ffi.js";

const lib = dlopen(dylib.filePath, dylib.symbols, { 
  errorAtRuntime: true 
});

export function regKeyExists(root, path){
  shouldString(root);
  shouldString(path);
  return lib.RegKeyExists(root, path) === 1;
}
    
export function regListAllSubkeys(root, path){
  shouldString(root);
  shouldString(path);
  const subkeys = lib.RegListAllSubkeys(root, path);
  return subkeys ? subkeys.split(",") : [];
}
    
export function regListAllValues(root, path){
  shouldString(root);
  shouldString(path);
  const values = lib.RegListAllValues(root, path);
  return !values ? [] : values.split(",").sort((a, b) => {
    //Alphabetical sort to match Window's regedit
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
  }); 
}
    
export function regQueryValueType(root, path, key){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  return lib.RegQueryValueType(root, path, key);
}
    
export function regQueryStringValue(root, path, key){ // REG_SZ & REG_EXPAND_SZ
  shouldString(root);
  shouldString(path);
  shouldString(key);

  const res = lib.RegQueryStringValue(root, path, key);
  if (res === ""){
    const type = regQueryValueType(root, path, key);
    if (type === "NONE") return null;
    if (!["SZ","EXPAND_SZ"].includes(type)) 
      throw new Failure("Only REG_SZ & REG_EXPAND_SZ are supported", "ERR_WRONG_USAGE");
  }
  return res;
}

export function regQueryMultiStringValue(root, path, key){ // REG_MULTI_SZ
  shouldString(root);
  shouldString(path);
  shouldString(key);

  const res = lib.RegQueryMultiStringValue(root, path, key);
  if (res === ""){
    const type = regQueryValueType(root, path, key);
    if (type === "NONE") return null;
    if (!["MULTI_SZ"].includes(type)) 
      throw new Failure("Only REG_MULTI_SZ is supported", "ERR_WRONG_USAGE");
  }
  return res.split("\\0");
}
    
export function regQueryBinaryValue(root, path, key){ //REG_BINARY
  shouldString(root);
  shouldString(path);
  shouldString(key);
 
  const res = lib.RegQueryBinaryValue(root, path, key);
  if (res === ""){
    const type = regQueryValueType(root, path, key);
    if (type === "NONE") return null;
    if (!["BINARY"].includes(type)) 
      throw new Failure("Only REG_BINARY is supported", "ERR_WRONG_USAGE");
  }
  return Buffer.from(res,"hex");
}
    
export function regQueryIntegerValue(root, path, key){ //REG_DWORD & REG_QWORD
  shouldString(root);
  shouldString(path);
  shouldString(key);

  const res = lib.RegQueryIntegerValue(root, path, key);
  if (res === "0"){
    const type = regQueryValueType(root, path, key);
    if (type === "NONE") return null;
    if (!["DWORD", "DWORD_BIG_ENDIAN", "QWORD"].includes(type)) 
      throw new Failure("Only REG_DWORD & REG_QWORD are supported", "ERR_WRONG_USAGE");
  }
  const number = Number(res);
  return Number.isSafeInteger(number) ? number : BigInt(res);
}
    
export function regCreate(root, path){
  shouldString(root);
  shouldStringNotEmpty(path); //Creating a root key is not allowed
  lib.RegCreate(root, path);
}

export function regDelete(root, path){
  shouldString(root);
  shouldStringNotEmpty(path); //Deleting a root key is not allowed
  lib.RegDelete(root, path);
}
    
export function regWriteStringValue(root, path, key, value){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  shouldString(value);
  lib.RegWriteStringValue(root, path, key, value);
}

export function regWriteExpandStringValue(root, path, key, value){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  shouldString(value);
  lib.RegWriteExpandStringValue(root, path, key, value);
}

export function regWriteMultiStringValue(root, path, key, values){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  shouldArrayOfString(values);
  lib.RegWriteMultiStringValue(root, path, key, values.join("\\0"));
}
        
export function regWriteBinaryValue(root, path, key, value){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  shouldBuffer(value);
  lib.RegWriteBinaryValue(root, path, key, value.toString("hex"));
}
    
export function regWriteDwordValue(root, path, key, value){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  
  if (isIntegerWithinRange(value, 0, 4294967295) ||
      isBigIntWithinRange(value, 0n, 4294967295n)) 
  {
    lib.RegWriteDwordValue(root, path, key, value.toString());
  } else {
    throw new Failure("DWORD range is [0, 4294967295]", {
      code: 1, 
      info: { 
        type: typeof value, 
        tag: Object.prototype.toString.call(value),
        value 
      }
    });
  }
}
    
export function regWriteQwordValue(root, path, key, value){
  shouldString(root);
  shouldString(path);
  shouldString(key);

  if (isIntegerPositiveOrZero(value) ||
      isBigIntWithinRange(value, 0n, 18446744073709551615n))
  {
    lib.RegWriteQwordValue(root, path, key, value.toString());
  } else {
    throw new Failure("QWORD range is [0n, 18446744073709551615n] (BigInt) or [0, 9007199254740991] (MAX_SAFE_INTEGER)", {
      code: 1, 
      info: { 
        type: typeof value, 
        tag: Object.prototype.toString.call(value),
        value 
      }
    });
  }
}
    
export function regDeleteValue(root, path, key){
  shouldString(root);
  shouldString(path);
  shouldString(key);
  lib.RegDeleteValue(root, path, key);
}
      
export { //alias backward compatibility
  regQueryStringValue as regQueryStringValueAndExpand, 
  regCreate as regWriteKey,
  regDelete as regDeleteKey,
  regDelete as regDeleteKeyIncludingSubkeys, 
  regDeleteValue as regDeleteKeyValue
};