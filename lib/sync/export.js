/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  regListAllValues,
  regListAllSubkeys,
  regQueryValueType,
  regQueryStringValue,
  regQueryMultiStringValue,
  regQueryBinaryValue,
  regQueryIntegerValue,
} from "./base.js";
import { asBoolean } from "@xan105/is/opt";
import { shouldString, shouldObj } from "@xan105/is/assert";
import { shouldValidRootKey } from "../util/helper.js";

function listValues(root, key){
  const result = [];
  
  const values = regListAllValues(root, key);
  for (let i=0; i < values.length; i++)
  {
    const value = Object.create(null);
    value.name = values[i];
    value.type = regQueryValueType(root, key, value.name);

    switch (value.type){
      case "SZ":
      case "EXPAND_SZ":
        value.data = regQueryStringValue(root, key, value.name);
        break;
      case "MULTI_SZ":
        value.data = regQueryMultiStringValue(root, key, value.name);
        break;
      case "BINARY":
        value.data = regQueryBinaryValue(root, key, value.name);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
      case "QWORD":
        value.data = regQueryIntegerValue(root, key, value.name);
        break;
      default:
        value.data = null;
        break;
    }
        
    result.push(value);		
  }
  
  return result;
}

function walkTree(root, key, recursive = true){
  const hive = Object.create(null);
  Object.defineProperty(hive, Symbol("values"), {
    value: listValues(root, key),
    configurable: false,
    enumerable: true,
    writable: false
  });

  const subkeys = regListAllSubkeys(root,key);
  for(let i=0; i < subkeys.length; i++)
  {
    if (subkeys[i] === "__proto__") continue; //not allowed
    hive[subkeys[i]] = recursive === true ? 
      walkTree(root, key + "/" + subkeys[i], recursive) : 
      Object.create(null);
  }
    
  return hive;
}

function regExportKey(root, key, option = {}){
  shouldValidRootKey(root);
  shouldString(key);
  shouldObj(option);
  
  const options = {
    recursive: asBoolean(option.recursive) ?? true
  };
  
  return walkTree(root, key, options.recursive);
}

export { regExportKey };