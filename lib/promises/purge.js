/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  regListAllSubkeys,
  regDeleteKey,
  regKeyExists
} from "./base.js";
import { Failure } from "@xan105/error";
import { shouldStringNotEmpty } from "@xan105/is/assert";
import { isValidRootKey } from "../util/helper.js";

async function walkDelTree(root,key,parent = []){
	const subkeys = await regListAllSubkeys(root,key);
	if (subkeys.length > 0) 
	{
		parent.push(key);
		for(let i=0; i < subkeys.length ; i++) 
      await walkDelTree(root,key + "/" + subkeys[i], parent);
	} 
	else if (parent.length > 0) 
	{
    await regDeleteKey(root,key);
    const parentKey = parent[parent.length-1];
		parent.pop();
		await walkDelTree(root,parentKey,parent);
	}
}

async function regDeleteKeyIncludingSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC", 1);
  shouldStringNotEmpty(key); //Deleting a root key is not allowed
  
  if (await regKeyExists(root,key)) {
		await walkDelTree(root,key);
		await regDeleteKey(root,key);
	}
}
	
export { regDeleteKeyIncludingSubkeys };