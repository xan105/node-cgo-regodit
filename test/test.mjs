import regedit from '../lib/esm.mjs'

(async()=>{

	if (Object.keys(regedit.promises).length !== Object.keys(regedit).length - 1) console.error("Promises/Sync method count mismatch");

	let res;
	
	res = await regedit.promises.RegKeyExists("HKCU","Software/Valve");
	console.log(res);
	
	res = await regedit.promises.RegListAllSubkeys("HKCU","Software/Valve");
	console.log(res);
	
	res = await regedit.promises.RegListAllValues("HKCU","Software/Valve/Steam");
	console.log(res);

	res = await regedit.promises.RegQueryStringValue("HKCU","Software/Valve/Steam","steamPath");
	console.log(res);
	
	res = await regedit.promises.RegQueryIntegerValue("HKCU","Software/Valve/Steam","H264HWAccel");
	console.log(res);
	
	await regedit.promises.RegWriteStringValue("HKCU","test/some/subkey/that/didnt/exist","hello","hello world"); 
	res = await regedit.promises.RegQueryStringValue("HKCU","test/some/subkey/that/didnt/exist","hello");
	console.log(res);
	
	await regedit.promises.RegDeleteKeyValue("HKCU","test/some/subkey/that/didnt/exist","hello");
	res = await regedit.promises.RegQueryStringValue("HKCU","test/some/subkey/that/didnt/exist","hello");
	console.log(res);
	
	await regedit.promises.RegDeleteKey("HKCU","test/some/subkey/that/didnt/exist");
	res = await regedit.promises.RegKeyExists("HKCU","test/some/subkey/that/didnt/exist");
	console.log(res);
	
	const regdump = await regedit.promises.RegExportKey("HKCU","Software/Valve/Steam");
	await regedit.promises.RegImportKey("HKCU","Software/Valve/Steam - Copy",regdump);

	await regedit.promises.RegDeleteKeyIncludingSubkeys("HKCU","Software/Valve/Steam - Copy");
	res = await regedit.promises.RegKeyExists("HKCU","Software/Valve/Steam - Copy");
	console.log(res);
	
})().catch(console.error);