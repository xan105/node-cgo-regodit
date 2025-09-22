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

function listValues(root, path){
  const result = [];
  
  const values = regListAllValues(root, path);
  for (let i=0; i < values.length; i++)
  {
    const data = Object.create(null);
    data.key = values[i];
    data.type = regQueryValueType(root, path, data.key);

    switch (data.type){
      case "SZ":
      case "EXPAND_SZ":
        data.value = regQueryStringValue(root, path, data.key);
        break;
      case "MULTI_SZ":
        data.value = regQueryMultiStringValue(root, path, data.key);
        break;
      case "BINARY":
        data.value = regQueryBinaryValue(root, path, data.key);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
      case "QWORD":
        data.value = regQueryIntegerValue(root, path, data.key);
        break;
      default:
        data.value = null;
        break;
    }
        
    result.push(data);		
  }
  
  return result;
}

function walkTree(root, path, recursive = true){
  const hive = Object.create(null);
  Object.defineProperty(hive, Symbol("values"), {
    value: listValues(root, path),
    configurable: false,
    enumerable: true,
    writable: false
  });

  const subkeys = regListAllSubkeys(root, path);
  for(let i=0; i < subkeys.length; i++)
  {
    if (subkeys[i] === "__proto__") continue; //not allowed
    hive[subkeys[i]] = recursive === true ? 
      walkTree(root, path + "/" + subkeys[i], recursive) : 
      Object.create(null);
  }
    
  return hive;
}

function regExportKey(root, path, option = {}){
  shouldString(root);
  shouldString(path);
  shouldObj(option);

  const options = {
    recursive: asBoolean(option.recursive) ?? true
  };
  
  return walkTree(root, path, options.recursive);
}

export { regExportKey };