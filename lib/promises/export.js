/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  RegListAllValues,
  RegListAllSubkeys,
  RegQueryValueType,
  RegQueryStringValue,
  RegQueryMultiStringValue,
  RegQueryBinaryValue,
  RegQueryIntegerValue
} from "./base.js";
import { Failure } from "@xan105/error";
import { shouldString } from "@xan105/is/assert";
import { isValidRootKey } from "../util/helper.js";

async function listValues(root,key){
	let result = [];
	
	const values = await RegListAllValues(root,key);
  for (let j=0; j < values.length; j++)
	{
				
    let value = Object.create(null);
    value.name = values[j];
    value.type = await RegQueryValueType(root, key, values[j]);

		if (value.type === "SZ" || value.type === "EXPAND_SZ") {
			value.data = await RegQueryStringValue(root, key, values[j]);
		} else if (value.type === "MULTI_SZ") {
			value.data = await RegQueryMultiStringValue(root, key, values[j]);
		} else if (value.type === "BINARY") {
			value.data = await RegQueryBinaryValue(root, key, values[j]);
		} else if (value.type === "DWORD" || value.type === "DWORD_BIG_ENDIAN" || value.type === "QWORD") {
			value.data = await RegQueryIntegerValue(root, key, values[j]);
		} else {
			value.data = null
		}
				
		result.push(value);
	}
	
	return result;
}

async function walkTree(root,key,recursive = true){
	let hive = Object.create(null);
	hive["__values__"] = await listValues(root,key);
	
	const subkeys = await RegListAllSubkeys(root,key);
	for(let i=0; i < subkeys.length ; i++)
	{
		if (subkeys[i] === "__proto__") continue; //not allowed
		hive[subkeys[i]] = recursive ? await walkTree(root,key + "/" + subkeys[i], recursive) : Object.create(null);
	}
   
	return hive;
}

async function RegExportKey(root,key,option = {}){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC", 1);
  shouldString(key);
	
	const options = {
		recursive: option.recursive ?? true,
	};
  
  const tree = await walkTree(root,key,options.recursive);
	return tree;	
}

export { RegExportKey };