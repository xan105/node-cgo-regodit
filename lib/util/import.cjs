'use strict';

const regedit = require("../regedit.cjs");

async function writeValues(root,key,values){

	for (let j=0; j < values.length; j++)
	{
		if (values[j].type === "SZ") {
			await regedit.promises.RegWriteStringValue(root, key, values[j].name, values[j].data || "");
		} else if (values[j].type === "EXPAND_SZ") {
			await regedit.promises.RegWriteExpandStringValue(root, key, values[j].name, values[j].data || "");
		} else if (values[j].type === "BINARY") {
			await regedit.promises.RegWriteBinaryValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "DWORD" || values[j].type === "DWORD_BIG_ENDIAN") {
			await regedit.promises.RegWriteDwordValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "QWORD") {
			await regedit.promises.RegWriteQwordValue(root, key, values[j].name, values[j].data);
		}
	}
	
}

function writeValuesSync(root,key,values){

	for (let j=0; j < values.length; j++)
	{
		if (values[j].type === "SZ") {
			regedit.RegWriteStringValue(root, key, values[j].name, values[j].data || "");
		} else if (values[j].type === "EXPAND_SZ") {
			regedit.RegWriteExpandStringValue(root, key, values[j].name, values[j].data || "");
		} else if (values[j].type === "BINARY") {
			regedit.RegWriteBinaryValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "DWORD" || values[j].type === "DWORD_BIG_ENDIAN") {
			regedit.RegWriteDwordValue(root, key, values[j].name, values[j].data);
		} else if (values[j].type === "QWORD") {
			regedit.RegWriteQwordValue(root, key, values[j].name, values[j].data);
		}
	}
	
}

async function writeTree(root,key,data)
{

	await regedit.promises.RegWriteKey(root,key); 
	if (data.values && data.values.length > 0) await writeValues(root,key,data.values); 
	delete data.values;

	for (let [name , value ] of Object.entries(data))
		await writeTree(root,key + "/" + name,value);
}

function writeTreeSync(root,key,data)
{

	regedit.RegWriteKey(root,key); 
	if (data.values && data.values.length > 0) writeValuesSync(root,key,data.values); 
	delete data.values;

	for (let [name , value ] of Object.entries(data))
		writeTreeSync(root,key + "/" + name,value);
}

module.exports = { writeTree, writeTreeSync };