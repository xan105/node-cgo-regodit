import * as regedit from '../lib/index.js';

if (Object.keys(regedit.promises).length !== Object.keys(regedit).length - 1) console.error("Promises/Sync method count mismatch");

let res;
	
res = await regedit.promises.regKeyExists("HKCU","Software/Valve");
console.log(res);
	
res = await regedit.promises.regListAllSubkeys("HKCU","Software/Valve");
console.log(res);
	
res = await regedit.promises.regListAllValues("HKCU","Software/Valve/Steam");
console.log(res);

res = await regedit.promises.regQueryStringValue("HKCU","Software/Valve/Steam","steamPath");
console.log(res);
	
res = await regedit.promises.regQueryIntegerValue("HKCU","Software/Valve/Steam","H264HWAccel");
console.log(res);
	
await regedit.promises.regWriteStringValue("HKCU","test/some/subkey/that/didnt/exist","hello","hello world"); 
res = await regedit.promises.regQueryStringValue("HKCU","test/some/subkey/that/didnt/exist","hello");
console.log(res);
	
await regedit.promises.regDeleteKeyValue("HKCU","test/some/subkey/that/didnt/exist","hello");
res = await regedit.promises.regQueryStringValue("HKCU","test/some/subkey/that/didnt/exist","hello");
console.log(res);
	
await regedit.promises.regDeleteKey("HKCU","test/some/subkey/that/didnt/exist");
res = await regedit.promises.regKeyExists("HKCU","test/some/subkey/that/didnt/exist");
console.log(res);
	
const regdump = await regedit.promises.regExportKey("HKCU","Software/Valve/Steam");
console.log(regdump);
await regedit.promises.regImportKey("HKCU","Software/Valve/Steam - Copy",regdump);

await regedit.promises.regDeleteKeyIncludingSubkeys("HKCU","Software/Valve/Steam - Copy");
res = await regedit.promises.regKeyExists("HKCU","Software/Valve/Steam - Copy");
console.log(res);