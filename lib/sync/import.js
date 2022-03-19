/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  RegWriteStringValue,
  RegWriteMultiStringValue,
  RegWriteExpandStringValue,
  RegWriteBinaryValue,
  RegWriteDwordValue,
  RegWriteQwordValue,
  RegWriteKey
} from "./base.js";
import { RegDeleteKeyIncludingSubkeys } from "./purge.js";
import { Failure } from "@xan105/error";
import { shouldString, shouldObj } from "@xan105/is/assert";
import { isValidRootKey } from "../util/helper.js";

function writeValues(root,key,values){
	for (let j=0; j < values.length; j++)
	{
		if (values[j].data === null) continue;
		if (values[j].type === "SZ") {
			RegWriteStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "MULTI_SZ") {
      RegWriteMultiStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "EXPAND_SZ") {
			RegWriteExpandStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "BINARY") {
			RegWriteBinaryValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "DWORD" || values[j].type === "DWORD_BIG_ENDIAN") {
			RegWriteDwordValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "QWORD") {
			RegWriteQwordValue(root, key, values[j].name, values[j].data);
		}
	}
}

function writeTree(root,key,data){
	RegWriteKey(root,key); 
	if (data["__values__"] && data["__values__"].length > 0) writeValues(root,key,data["__values__"]); 
	delete data["__values__"];

	for (const [name , value ] of Object.entries(data))
		writeTree(root,key + "/" + name,value);
}

function RegImportKey(root,key,data,option = {}){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC", 1);
  shouldString(key);
  shouldObj(data);
  
	const options = {
		purgeDest: option.purgeDest || false
	};
	
	if (options.purgeDest) 
    RegDeleteKeyIncludingSubkeys(root,key);
	
  writeTree(root,key,data);
}

export { RegImportKey };