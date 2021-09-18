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
import { isValidRootKey } from "../util/helper.js";

async function writeValues(root,key,values){
	for (let j=0; j < values.length; j++)
	{
		if (values[j].type === "SZ") {
			await RegWriteStringValue(root, key, values[j].name, values[j].data || "");
		} else if (values[j].type === "EXPAND_SZ") {
			await RegWriteExpandStringValue(root, key, values[j].name, values[j].data || "");
		} else if (values[j].type === "BINARY") {
			await RegWriteBinaryValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "DWORD" || values[j].type === "DWORD_BIG_ENDIAN") {
			await RegWriteDwordValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "QWORD") {
			await RegWriteQwordValue(root, key, values[j].name, values[j].data);
		}
	}
}

async function writeTree(root,key,data){
	await RegWriteKey(root,key); 
	if (data.values && data.values.length > 0) await writeValues(root,key,data.values); 
	delete data.values;

	for (let [name , value ] of Object.entries(data))
		await writeTree(root,key + "/" + name,value);
}

async function RegImportKey(root,key,data,option = {}){
	if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
	
	const options = {
		absenceDelete: option.absenceDelete || false
	};

	if (data) {
		await writeTree(root,key,data);
	} else if (options.absenceDelete){
		await RegDeleteKeyIncludingSubkeys(root,key);
	} else {
		throw new Failure("/*placeholder*/","ERR_INVALID_DATA");
	}	
}

export { RegImportKey };