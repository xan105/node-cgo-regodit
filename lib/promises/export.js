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
import { shouldString } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";
import { shouldValidRootKey } from "../util/helper.js";

async function listValues(root,key){
	const result = [];
	
	const values = await regListAllValues(root,key);
  for (let j=0; j < values.length; j++)
	{		
    const value = Object.create(null);
    value.name = values[j];
    value.type = await regQueryValueType(root, key, values[j]);

		if (value.type === "SZ" || value.type === "EXPAND_SZ") {
			value.data = await regQueryStringValue(root, key, values[j]);
		} else if (value.type === "MULTI_SZ") {
			value.data = await regQueryMultiStringValue(root, key, values[j]);
		} else if (value.type === "BINARY") {
			value.data = await regQueryBinaryValue(root, key, values[j]);
		} else if (value.type === "DWORD" || value.type === "DWORD_BIG_ENDIAN" || value.type === "QWORD") {
			value.data = await regQueryIntegerValue(root, key, values[j]);
		} else {
			value.data = null
		}
				
		result.push(value);
	}
	
	return result;
}

async function walkTree(root,key,recursive = true){
	const hive = Object.create(null);
	hive["__values__"] = await listValues(root,key);
	
	const subkeys = await regListAllSubkeys(root,key);
	for(let i=0; i < subkeys.length ; i++)
	{
		if (subkeys[i] === "__proto__") continue; //not allowed
		hive[subkeys[i]] = recursive === true ?
      await walkTree(root,key + "/" + subkeys[i], recursive) : 
      Object.create(null);
	}
   
	return hive;
}

async function regExportKey(root,key,option = {}){
  shouldValidRootKey(root);
  shouldString(key);
	
	const options = {
		recursive: asBoolean(option.recursive) ?? true
	};
  
  const tree = await walkTree(root,key,options.recursive);
	return tree;	
}

export { regExportKey };