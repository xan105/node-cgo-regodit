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
  regQueryIntegerValue
} from "./base.js";
import { asBoolean } from "@xan105/is/opt";
import { shouldString, shouldObj } from "@xan105/is/assert";
import { shouldValidRootKey } from "../util/helper.js";

async function listValues(root, key){
  const result = [];
  
  const values = await regListAllValues(root, key);
  for (let i=0; i < values.length; i++)
  {		
    const value = Object.create(null);
    value.name = values[i];
    value.type = await regQueryValueType(root, key, value.name);

    switch (value.type){
      case "SZ":
      case "EXPAND_SZ":
        value.data = await regQueryStringValue(root, key, value.name);
        break;
      case "MULTI_SZ":
        value.data = await regQueryMultiStringValue(root, key, value.name);
        break;
      case "BINARY":
        value.data = await regQueryBinaryValue(root, key, value.name);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
      case "QWORD":
        value.data = await regQueryIntegerValue(root, key, value.name);
        break;
      default:
        value.data = null;
        break;
    }
  
    result.push(value);
  }
  
  return result;
}

async function walkTree(root, key, recursive = true){
  const hive = Object.create(null);
  Object.defineProperty(hive, Symbol("values"), {
    value: await listValues(root, key),
    configurable: false,
    enumerable: true,
    writable: false
  });
    
  const subkeys = await regListAllSubkeys(root, key);
  for(let i=0; i < subkeys.length; i++)
  {
    if (subkeys[i] === "__proto__") continue; //not allowed
    hive[subkeys[i]] = recursive === true ?
      await walkTree(root, key + "/" + subkeys[i], recursive) : 
      Object.create(null);
  }
   
  return hive;
}

async function regExportKey(root, key, option = {}){
  shouldValidRootKey(root);
  shouldString(key);
  shouldObj(option);
  
  const options = {
    recursive: asBoolean(option.recursive) ?? true
  };
  
  const tree = await walkTree(root, key, options.recursive);
  return tree;	
}

export { regExportKey };