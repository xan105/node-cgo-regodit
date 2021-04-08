"use strict";

const regedit = require("./regedit.cjs");
const { walkTree, walkTreeSync } = require("./util/export.cjs");    
const { writeTree, writeTreeSync } = require("./util/import.cjs");
const { walkDelTree, walkDelTreeSync } = require("./util/purge.cjs");      
      
const HKEY = require("./HKEY.json"); 
      
let lib = regedit;

lib.promises.RegDeleteKeyIncludingSubkeys = async (root,key) => {
		if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
		
		if (await regedit.promises.RegKeyExists(root,key)) {
			await walkDelTree(root,key);
			await regedit.promises.RegDeleteKey(root,key);
		}
}

lib.RegDeleteKeyIncludingSubkeys = (root,key) => {
		if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
		
		if (regedit.RegKeyExists(root,key)) {
			walkDelTreeSync(root,key);
			regedit.RegDeleteKey(root,key);
		}
}

lib.promises.RegExportKey = async (root,key,option = {}) => {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	
	const options = {
		recursive: (option.recursive != null) ? option.recursive : true,
		absenceError: (option.absenceError != null) ? option.absenceError : true
	};

	if (!await regedit.promises.RegKeyExists(root,key)){
		if (options.absenceError) throw "ERR_KEY_NOEXIST"
		else return null
	}
	
	return await walkTree(root,key,options.recursive);

}

lib.RegExportKey = (root,key,option = {}) => {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	
	const options = {
		recursive: (option.recursive != null) ? option.recursive : true,
		absenceError: (option.absenceError != null) ? option.absenceError : true
	};
	
	if (!regedit.RegKeyExists(root,key)){
		if (options.absenceError) throw "ERR_KEY_NOEXIST"
		else return null
	}
	
	return walkTreeSync(root,key,options.recursive);	
}

lib.promises.RegImportKey = async function (root,key,data,option = {}) {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	
	const options = {
		absenceDelete: option.absenceDelete || false
	};

	if (data) {
		await writeTree(root,key,data);
	} else if (options.absenceDelete){
		await this.RegDeleteKeyIncludingSubkeys(root,key);
	} else {
		throw "ERR_INVALID_DATA"
	}	
}

lib.RegImportKey = function (root,key,data,option = {}) {
	if (!HKEY.some(key => root === key)) throw `Invalid root key "${root}"`;
	
	const options = {
		absenceDelete: option.absenceDelete || false
	};
	
	if (data) {
		writeTreeSync(root,key,data);
	} else if (options.absenceDelete){
		this.RegDeleteKeyIncludingSubkeys(root,key);
	} else {
		throw "ERR_INVALID_DATA"
	}	
}

module.exports = lib;