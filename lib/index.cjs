"use strict";

const regedit = require("./regedit.cjs");
const { walkTree, walkTreeSync } = require("./util/export.cjs");    
const { writeTree, writeTreeSync } = require("./util/import.cjs");     
      
const HKEY = require("./HKEY.json"); 
      
let lib = regedit;

lib.promises.RegExportKey = async (root,key,recursive) => {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	return await walkTree(root,key,recursive);	
}

lib.RegExportKey = (root,key,recursive) => {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	return walkTreeSync(root,key,recursive);	
}

lib.promises.RegImportKey = async (root,key,data) => {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	return await writeTree(root,key,data);	
}

lib.RegImportKey = (root,key,data) => {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	return writeTreeSync(root,key,data);	
}

module.exports = lib;