/*
MIT License

Copyright (c) 2018-2021 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { 
  RegListAllSubkeys,
  RegDeleteKey,
  RegKeyExists
} from "./base.js";
import { Failure } from "../util/error.js";
import { isValidRootKey } from "../util/helper.js";

async function walkDelTree(root,key,parent = []){
	const subkeys = await RegListAllSubkeys(root,key);
	if (subkeys.length > 0) 
	{
		parent.push(key);
		for(let i=0; i < subkeys.length ; i++) 
      await walkDelTree(root,key + "/" + subkeys[i], parent);
	} 
	else if (parent.length > 0) 
	{
    await RegDeleteKey(root,key);
    const parentKey = parent[parent.length-1];
		parent.pop();
		await walkDelTree(root,parentKey,parent);
	}
}

async function RegDeleteKeyIncludingSubkeys(root,key){
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  
  if (key.length === 0) throw new Failure("Deleting a root key is not allowed","ERR_INVALID_ARGS");
  
  if (await RegKeyExists(root,key)) {
		await walkDelTree(root,key);
		await RegDeleteKey(root,key);
	}
}
	
export { RegDeleteKeyIncludingSubkeys };