'use strict';

const regedit = require("../regedit.cjs");

async function listValues(root,key){
	let result = [];
	
	const values = await regedit.promises.RegListAllValues(root,key);
	if(values)
	{
		for (let j=0; j < values.length; j++)
		{
				
			let value = {
				name: values[j],
				type: await regedit.promises.RegQueryValueType(root, key, values[j]),
			};

			if (value.type === "SZ" || value.type === "EXPAND_SZ") {
				value.data = await regedit.promises.RegQueryStringValue(root, key, values[j]);
			} else if (value.type === "BINARY") {
				value.data = await regedit.promises.RegQueryBinaryValue(root, key, values[j]);
			} else if (value.type === "DWORD" || value.type === "DWORD_BIG_ENDIAN" || value.type === "QWORD") {
				value.data = await regedit.promises.RegQueryIntegerValue(root, key, values[j]);
			} else {
				value.data = null
			}
				
			result.push(value);
				
		}
	}
	
	return result;
}

function listValuesSync(root,key){
	let result = [];
	
	const values = regedit.RegListAllValues(root,key);
	if(values)
	{
		for (let j=0; j < values.length; j++)
		{
				
			let value = {
				name: values[j],
				type: regedit.RegQueryValueType(root, key, values[j]),
			};

			if (value.type === "SZ" || value.type === "EXPAND_SZ") {
				value.data = regedit.RegQueryStringValue(root, key, values[j]);
			} else if (value.type === "BINARY") {
				value.data = regedit.RegQueryBinaryValue(root, key, values[j]);
			} else if (value.type === "DWORD" || value.type === "DWORD_BIG_ENDIAN" || value.type === "QWORD") {
				value.data = regedit.RegQueryIntegerValue(root, key, values[j]);
			} else {
				value.data = null
			}
				
			result.push(value);
				
		}
	}
	
	return result;
}

async function walkTree(root,key,recursive = true)
{
	let hive = { values: await listValues(root,key) };
	
	const subkeys = await regedit.promises.RegListAllSubkeys(root,key);
	if (subkeys) 
	{
		for(let i=0; i < subkeys.length ; i++)
		{
			hive[subkeys[i]] = (recursive) ? await walkTree(root,key + "/" + subkeys[i], recursive) : {};
		}
	}
   
	return hive;
}

function walkTreeSync(root,key,recursive = true)
{
	let hive = { values: listValuesSync(root,key) };
	
	const subkeys = regedit.RegListAllSubkeys(root,key);
	if (subkeys) 
	{
		for(let i=0; i < subkeys.length ; i++)
		{
			hive[subkeys[i]] = (recursive) ? walkTreeSync(root,key + "/" + subkeys[i], recursive) : {};
		}
	}
   
	return hive;
}

module.exports = { walkTree, walkTreeSync };