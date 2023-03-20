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
import { shouldString } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";
import { shouldValidRootKey } from "../util/helper.js";

function listValues(root,key){
	const result = [];
	
	const values = regListAllValues(root,key);
	for (let j=0; j < values.length; j++)
	{
		const value = Object.create(null);
		value.name = values[j];
		value.type = regQueryValueType(root, key, values[j]);

		if (value.type === "SZ" || value.type === "EXPAND_SZ") {
			value.data = regQueryStringValue(root, key, values[j]);
		} else if (value.type === "MULTI_SZ") {
			value.data = regQueryMultiStringValue(root, key, values[j]);
		} else if (value.type === "BINARY") {
			value.data = regQueryBinaryValue(root, key, values[j]);
		} else if (value.type === "DWORD" || value.type === "DWORD_BIG_ENDIAN" || value.type === "QWORD") {
			value.data = regQueryIntegerValue(root, key, values[j]);
		} else {
			value.data = null
		}
				
		result.push(value);		
	}
	
	return result;
}

function walkTree(root,key,recursive = true){
	const hive = Object.create(null);
	hive["__values__"] = listValues(root,key);

	const subkeys = regListAllSubkeys(root,key);
	for(let i=0; i < subkeys.length ; i++)
	{
    if (subkeys[i] === "__proto__") continue; //not allowed
    hive[subkeys[i]] = recursive === true ? 
      walkTree(root,key + "/" + subkeys[i], recursive) : 
      Object.create(null);
  }
    
	return hive;
}

function regExportKey(root,key,option = {}){
  shouldValidRootKey(root);
  shouldString(key);
	
	const options = {
		recursive: asBoolean(option.recursive) ?? true
	};
  
  return walkTree(root,key,options.recursive);
}

export { regExportKey };