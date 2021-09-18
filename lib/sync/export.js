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
  RegListAllValues,
  RegListAllSubkeys,
  RegQueryValueType,
  RegQueryStringValue,
  RegQueryBinaryValue,
  RegQueryIntegerValue,
  RegKeyExists
} from "./base.js";
import { Failure } from "../util/error.js";
import { isValidRootKey } from "../util/helper.js";

function listValues(root,key){
	let result = [];
	
	const values = RegListAllValues(root,key);
	if(values)
	{
		for (let j=0; j < values.length; j++)
		{
				
			let value = {
				name: values[j],
				type: RegQueryValueType(root, key, values[j]),
			};

			if (value.type === "SZ" || value.type === "EXPAND_SZ") {
				value.data = RegQueryStringValue(root, key, values[j]);
			} else if (value.type === "BINARY") {
				value.data = RegQueryBinaryValue(root, key, values[j]);
			} else if (value.type === "DWORD" || value.type === "DWORD_BIG_ENDIAN" || value.type === "QWORD") {
				value.data = RegQueryIntegerValue(root, key, values[j]);
			} else {
				value.data = null
			}
				
			result.push(value);
				
		}
	}
	
	return result;
}

function walkTree(root,key,recursive = true){
	let hive = { values: listValues(root,key) };
	
	const subkeys = RegListAllSubkeys(root,key);
	if (subkeys) 
	{
		for(let i=0; i < subkeys.length ; i++)
		{
			hive[subkeys[i]] = (recursive) ? walkTree(root,key + "/" + subkeys[i], recursive) : {};
		}
	}
   
	return hive;
}

function RegExportKey(root,key,option = {}){
	if (!isValidRootKey(root)) throw new Failure(`Invalid root key "${root}"`,"ERR_INVALID_ARGS");
	
	const options = {
		recursive: option.recursive ?? true,
		absenceError: option.absenceError ?? true
	};
	
	if (!RegKeyExists(root,key)){
		if (options.absenceError) throw new Failure(`"${root}/${key}" does not exist !`,"ERR_KEY_NOEXIST");
		else return null
	}
	
	return walkTree(root,key,options.recursive);	
}

export { RegExportKey };