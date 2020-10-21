'use strict';

const regedit = require("../regedit.cjs");

async function walkDelTree(root,key,parent = []){
	
	const subkeys = await regedit.promises.RegListAllSubkeys(root,key);
	if (subkeys) 
	{
		parent.push(key);
		for(let i=0; i < subkeys.length ; i++) await walkDelTree(root,key + "/" + subkeys[i], parent);
	} 
	else 
	{
		if (parent.length > 0) 
		{
			await regedit.promises.RegDeleteKey(root,key);
			const parentKey = parent[parent.length-1];
			parent.pop();
			await walkDelTree(root,parentKey,parent);
		}
	}
}

function walkDelTreeSync(root,key,parent = []){

	const subkeys = regedit.RegListAllSubkeys(root,key);
	if (subkeys) 
	{
		parent.push(key);
		for(let i=0; i < subkeys.length ; i++) walkDelTreeSync(root,key + "/" + subkeys[i], parent);
	} 
	else 
	{
		if (parent.length > 0) 
		{
			regedit.RegDeleteKey(root,key);
			const parentKey = parent[parent.length-1];
			parent.pop();
			walkDelTreeSync(root,parentKey,parent);
		}
	}
}
	
module.exports = { walkDelTree, walkDelTreeSync };