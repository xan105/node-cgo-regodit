/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  regWriteStringValue,
  regWriteMultiStringValue,
  regWriteExpandStringValue,
  regWriteBinaryValue,
  regWriteDwordValue,
  regWriteQwordValue,
  regWriteKey
} from "./base.js";
import { regDeleteKeyIncludingSubkeys } from "./purge.js";
import { Failure } from "@xan105/error";
import { shouldString, shouldObj } from "@xan105/is/assert";
import { isValidRootKey } from "../util/helper.js";

function writeValues(root,key,values){
	for (let j=0; j < values.length; j++)
	{
		if (values[j].data === null) continue;
		if (values[j].type === "SZ") {
			regWriteStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "MULTI_SZ") {
      regWriteMultiStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "EXPAND_SZ") {
			regWriteExpandStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "BINARY") {
			regWriteBinaryValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "DWORD" || values[j].type === "DWORD_BIG_ENDIAN") {
			regWriteDwordValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "QWORD") {
			regWriteQwordValue(root, key, values[j].name, values[j].data);
		}
	}
}

function writeTree(root,key,data){
	regWriteKey(root,key); 
	if (data["__values__"] && data["__values__"].length > 0) writeValues(root,key,data["__values__"]); 
	delete data["__values__"];

	for (const [name , value ] of Object.entries(data))
		writeTree(root,key + "/" + name,value);
}

function regImportKey(root,key,data,option = {}){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC", 1);
  shouldString(key);
  shouldObj(data);
  
	const options = {
		purgeDest: option.purgeDest || false
	};
	
	if (options.purgeDest) 
    regDeleteKeyIncludingSubkeys(root,key);
	
  writeTree(root,key,data);
}

export { regImportKey };