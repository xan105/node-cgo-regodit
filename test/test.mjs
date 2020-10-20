import regedit from '../lib/esm.mjs'

(async()=>{

	let res;
	
	res = await regedit.promises.RegKeyExists("HKCU","Software/Valve");
	console.log(res);
	
	res = await regedit.promises.RegListAllSubkeys("HKCU","Software/Valve");
	console.log(res);
	
	res = await regedit.promises.RegListAllValues("HKCU","Software/Valve/Steam");
	console.log(res);

	res = await regedit.RegQueryStringValue("HKCU","Software/Valve/Steam","steamPath");
	console.log(res);
	
	res = await regedit.RegQueryIntegerValue("HKCU","Software/Valve/Steam","H264HWAccel");
	console.log(res);
	
	await regedit.RegWriteStringValue("HKCU","test/some/subkey/that/didnt/exist","hello","hello world"); 
	res = await regedit.RegQueryStringValue("HKCU","test/some/subkey/that/didnt/exist","hello");
	console.log(res);
	
	await regedit.RegDeleteKeyValue("HKCU","test/some/subkey/that/didnt/exist","hello");
	res = await regedit.RegQueryStringValue("HKCU","test/some/subkey/that/didnt/exist","hello");
	console.log(res);
	
	await regedit.RegDeleteKey("HKCU","test/some/subkey/that/didnt/exist");
	res = await regedit.promises.RegKeyExists("HKCU","test/some/subkey/that/didnt/exist");
	console.log(res);
	
})().catch(console.error);