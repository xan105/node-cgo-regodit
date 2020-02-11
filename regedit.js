"use strict";

const path = require('path');
const ffi = require('ffi-napi');

const lib = ffi.Library(path.join(__dirname, "build",`${(process.arch === "x64") ? 'regedit.x64.dll' : 'regedit.x86.dll'}`), {
   'RegKeyExists': ["int", ["string", "string"]],
   'RegListAllSubkeys': ["string", ["string", "string"]],
   'RegListAllValues': ["string", ["string", "string"]],
   'RegQueryStringValue': ["string", ["string", "string", "string"]],
   'RegQueryStringValueAndExpand': ["string", ["string", "string", "string"]],
   'RegQueryBinaryValue': ["string", ["string", "string", "string"]],
   'RegQueryIntegerValue': ["string", ["string", "string", "string"]],
   'RegWriteStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteExpandStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteBinaryValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteDwordValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteQwordValue': ["void", ["string", "string", "string", "string"]],
   'RegDeleteKey': ["void", ["string", "string"]],
   'RegDeleteKeyValue': ["void", ["string", "string", "string"]]
});

const HKEY = ["HKCR","HKCU","HKLM","HKU","HKCC"];
function goPath(s) { return s.replace(/([\/])/g,"\\") }

module.exports = {
    promises : {
      RegKeyExists : (root,key) => {
        return new Promise((resolve,reject) => {
          if (!HKEY.some(key => root === key)) return reject(`Unvalid root key "${root}"`);
          lib.RegKeyExists.async(root,goPath(key), (err, res) => {
            if(err) return reject(err);
            return resolve((res === 1) ? true : false);
          });
        });  
      },
      RegListAllSubkeys : (root,key) => {
        return new Promise((resolve,reject) => {
          if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
          lib.RegListAllSubkeys.async(root,goPath(key), (err, list) => {
            if(err) return reject(err);
            if(list) {
              let res = list.split(",");
              return resolve((res.length > 0) ? res : null);
            } else {
              return resolve(null);
            }
          });
        });
      }, 
      RegListAllValues : (root,key) => {
        return new Promise((resolve,reject) => {
          if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
          lib.RegListAllValues.async(root,goPath(key), (err, list) => {
            if(err) return reject(err);
            if(list) {
              let res = list.split(",");
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
      },
      RegQueryStringValue : (root,key,name) => { // REG_SZ & REG_EXPAND_SZ
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`; 
            let res = lib.RegQueryStringValue.async(root,goPath(key),name, (err, res) => {
              if(err) return reject(err);
              return resolve((res) ? res : null);
            });
        });
      },
      RegQueryStringValueAndExpand : (root,key,name) => { // REG_EXPAND_SZ (expands environment-variable strings)
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`; 
            let res = lib.RegQueryStringValueAndExpand.async(root,goPath(key),name, (err, res) => {
              if(err) return reject(err);
              return resolve((res) ? res : null);
            });
        });
      },
      RegQueryBinaryValue : (root,key,name) => { //REG_BINARY
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;  
            let res = lib.RegQueryBinaryValue.async(root,goPath(key),name, (err, res) => {
              if(err) return reject(err);
              return resolve((res) ? res : null);
            });
        });
      },
      RegQueryIntegerValue : (root,key,name) => { //REG_DWORD & REG_QWORD
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;   
            let res = lib.RegQueryIntegerValue.async(root,goPath(key),name, (err, res) => {
              if(err) return reject(err);
              return resolve((res) ? res : null);
            });
        });
      },
      RegWriteStringValue : (root,key,name,value) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegWriteStringValue.async(root,goPath(key),name,value.toString(), (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      },
      RegWriteExpandStringValue : (root,key,name,value) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegWriteExpandStringValue.async(root,goPath(key),name,value.toString(), (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      },
      RegWriteBinaryValue : (root,key,name,value) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegWriteBinaryValue.async(root,goPath(key),name,value.toString(), (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      },
      RegWriteDwordValue : (root,key,name,value) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegWriteDwordValue.async(root,goPath(key),name,value.toString(), (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      },
      RegWriteQwordValue : (root,key,name,value) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegWriteQwordValue.async(root,goPath(key),name,value.toString(), (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      },
      RegDeleteKey : (root,key) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegDeleteKey.async(root,goPath(key), (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      },
      RegDeleteKeyValue : (root,key,name) => {
        return new Promise((resolve,reject) => {
            if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
            lib.RegDeleteKeyValue.async(root,goPath(key),name, (err, res) => {
              if(err) return reject(err);
              return resolve();
            });
        });
      }
    },//Sync
    RegKeyExists : (root,key) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        let res = lib.RegKeyExists(root,goPath(key));
        return (res === 1) ? true : false;
    },
    RegListAllSubkeys : (root,key) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        let list = lib.RegListAllSubkeys(root,goPath(key));
        if (list) {
          let res = list.split(",");
          return (res.length > 0) ? res : null;
        } else {
          return null;
        }
    },
    RegListAllValues : (root,key) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        let list = lib.RegListAllValues(root,goPath(key));
        if (list) {
          let res = list.split(",");
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
    },
    RegQueryStringValue : (root,key,name) => { // REG_SZ & REG_EXPAND_SZ
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`; 
        let res = lib.RegQueryStringValue(root,goPath(key),name);
        return (res) ? res : null;
    },
    RegQueryStringValueAndExpand : (root,key,name) => { // REG_EXPAND_SZ (expands environment-variable strings)
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`; 
        let res = lib.RegQueryStringValueAndExpand(root,goPath(key),name);
        return (res) ? res : null;
    },
    RegQueryBinaryValue : (root,key,name) => { //REG_BINARY
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;  
        let res = lib.RegQueryBinaryValue(root,goPath(key),name);
        return (res) ? res : null;
    },
    RegQueryIntegerValue : (root,key,name) => { //REG_DWORD & REG_QWORD
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;   
        let res = lib.RegQueryIntegerValue(root,goPath(key),name);
        return (res) ? res : null;
    },
    RegWriteStringValue : (root,key,name,value) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegWriteStringValue(root,goPath(key),name,value.toString());
    },
    RegWriteExpandStringValue : (root,key,name,value) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegWriteExpandStringValue(root,goPath(key),name,value.toString());
    },
    RegWriteBinaryValue : (root,key,name,value) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegWriteBinaryValue(root,goPath(key),name,value.toString());
    },
    RegWriteDwordValue : (root,key,name,value) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegWriteDwordValue(root,goPath(key),name,value.toString());
    },
    RegWriteQwordValue : (root,key,name,value) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegWriteQwordValue(root,goPath(key),name,value.toString());
    },
    RegDeleteKey : (root,key) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegDeleteKey(root,goPath(key));
    },
    RegDeleteKeyValue : (root,key,name) => {
        if (!HKEY.some(key => root === key)) throw `Unvalid root key "${root}"`;
        lib.RegDeleteKeyValue(root,goPath(key),name);
    }
};