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

async function writeValues(root,key,values){
	for (let j=0; j < values.length; j++)
	{
		if (values[j].data === null) continue;
		if (values[j].type === "SZ") {
			await regWriteStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "MULTI_SZ") {
      await regWriteMultiStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "EXPAND_SZ") {
			await regWriteExpandStringValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "BINARY") {
			await regWriteBinaryValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "DWORD" || values[j].type === "DWORD_BIG_ENDIAN") {
			await regWriteDwordValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "QWORD") {
			await regWriteQwordValue(root, key, values[j].name, values[j].data);
		}
	}
}

async function writeTree(root,key,data){
	await regWriteKey(root,key); 
	if (data["__values__"] && data["__values__"].length > 0) await writeValues(root,key,data["__values__"]); 
	delete data["__values__"];

	for (const [name , value ] of Object.entries(data))
		await writeTree(root,key + "/" + name,value);
}

async function regImportKey(root,key,data,option = {}){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC", 1);
  shouldString(key);
  shouldObj(data);
	
	const options = {
		purgeDest: option.purgeDest || false
	};

	if (options.purgeDest) 
    await regDeleteKeyIncludingSubkeys(root,key);
	
  await writeTree(root,key,data);
}

export { regImportKey };