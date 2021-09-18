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

function RegKeyExists(root, key){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
      lib.RegKeyExists.async(root, normalize(key), (err, res) => {
        if(err) return reject(err);
        return resolve((res === 1) ? true : false);
      });
   });  
}

function RegListAllSubkeys(root,key){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
      lib.RegListAllSubkeys.async(root,normalize(key), (err, list) => {
        if(err) return reject(err);
        if(list) {
          const res = list.split(",");
          return resolve((res.length > 0) ? res : null);
        } else {
        return resolve(null);
      }
    });
  });
}
      
function RegListAllValues(root,key){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegListAllValues.async(root,normalize(key), (err, list) => {
      if(err) return reject(err);
      if(list) {
        const res = list.split(",");
        if (res.length > 0) { 
          return resolve(res.sort(function(a, b){ //Alphabetical sort to match regedit view
            if(a < b) { return -1; }
            if(a > b) { return 1; }
            return 0;
          }));
        } else {
          return resolve(null);
        }
      } else {
        return resolve(null);
      }
    });
  });
}

function RegQueryValueType(root,key,name){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegQueryValueType.async(root,normalize(key),name, (err, res) => {
      if(err) return reject(err);
      return resolve(res);
    });
  });
}

function RegQueryStringValue(root,key,name){ // REG_SZ & REG_EXPAND_SZ
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegQueryStringValue.async(root,normalize(key),name, (err, res) => {
      if(err) return reject(err);
      return resolve((res) ? res : null);
    });
  });
}
      
function RegQueryStringValueAndExpand(root,key,name){ // REG_EXPAND_SZ (expands environment-variable strings)
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegQueryStringValueAndExpand.async(root,normalize(key),name, (err, res) => {
      if(err) return reject(err);
      return resolve((res) ? res : null);
    });
  });
}
      
function RegQueryBinaryValue(root,key,name){ //REG_BINARY
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );  
    lib.RegQueryBinaryValue.async(root,normalize(key),name, (err, res) => {
      if(err) return reject(err);
      return resolve((res) ? res : null);
    });
  });
}
      
function RegQueryIntegerValue(root,key,name){ //REG_DWORD & REG_QWORD
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") ); 
    lib.RegQueryIntegerValue.async(root,normalize(key),name, (err, res) => {
      if(err) return reject(err);
      return resolve((res) ? res : null);
    });
  });
}
      
function RegWriteKey(root,key){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegWriteKey.async(root,normalize(key), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegWriteStringValue(root,key,name,value){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegWriteStringValue.async(root,normalize(key),name,value.toString(), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegWriteExpandStringValue(root,key,name,value){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegWriteExpandStringValue.async(root,normalize(key),name,value.toString(), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegWriteBinaryValue(root,key,name,value){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegWriteBinaryValue.async(root,normalize(key),name,value.toString(), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegWriteDwordValue(root,key,name,value){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegWriteDwordValue.async(root,normalize(key),name,value.toString(), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegWriteQwordValue(root,key,name,value){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegWriteQwordValue.async(root,normalize(key),name,value.toString(), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegDeleteKeyValue(root,key,name){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegDeleteKeyValue.async(root,normalize(key),name, (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  });
}
      
function RegDeleteKey(root,key){
  return new Promise((resolve,reject) => {
    if (!isValidRootKey(root)) return reject( new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS") );
    lib.RegDeleteKey.async(root,normalize(key), (err, res) => {
      if(err) return reject(err);
      return resolve();
    });
  }); 
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