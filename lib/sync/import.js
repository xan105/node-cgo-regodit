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
  RegWriteStringValue,
  RegWriteExpandStringValue,
  RegWriteBinaryValue,
  RegWriteDwordValue,
  RegWriteQwordValue,
  RegWriteKey
} from "./base.js";
import { RegDeleteKeyIncludingSubkeys } from "./purge.js";
import { Failure } from "../util/error.js";
import { isValidRootKey, isObj } from "../util/helper.js";

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
  if (!isValidRootKey(root)) throw new Failure("Expecting root key to be HKCR, HKCU, HKLM, HKU or HKCC","ERR_INVALID_ARGS");
  if (typeof key !== "string") throw new Failure("Expecting key path to be a [string]","ERR_INVALID_ARGS");
  if (!isObj(data)) throw new Failure("Expecting data to be a plain obj","ERR_INVALID_ARGS");
  
	const options = {
		purgeDest: option.purgeDest || false
	};
	
	if (options.purgeDest) 
    RegDeleteKeyIncludingSubkeys(root,key);
	
  writeTree(root,key,data);
}

export { RegImportKey };