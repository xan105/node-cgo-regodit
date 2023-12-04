import test from "node:test";
import assert from "node:assert/strict";
import { userInfo } from "node:os";
import { isWindows } from "@xan105/is";
import * as reg from "../lib/index.js";

test("Promises/Sync method count", {
  skip: isWindows ? false : "This test runs on Windows"
}, () => {

  const promises = Object.keys(reg.promises).length;
  const sync = Object.keys(reg).length - 1;
  assert.ok(promises === sync);
  
});

test("Creating and deleting a key", {
  skip: isWindows ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/create"]
  
  await test("sync", () => {
    reg.regWriteKey(...key);
    assert.ok(reg.regKeyExists(...key));
    
    reg.regDeleteKey(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    await reg.promises.regWriteKey(...key);
    assert.ok(await reg.promises.regKeyExists(...key));
    
    await reg.promises.regDeleteKey(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});

test("Read string expand env var", {
  skip: isWindows ? false : "This test runs on Windows"
}, async () => {

  const key = ["HKCU", "Software/Microsoft/Windows/CurrentVersion/Explorer/User Shell Folders", "AppData"];
  const { username } = userInfo();
  
  await test("sync", () => {
    assert.equal(reg.regQueryStringValue(...key), "%USERPROFILE%\\AppData\\Roaming");
    assert.equal(reg.regQueryStringValueAndExpand(...key), `C:\\Users\\${username}\\AppData\\Roaming`);
  });
  
  await test("promise", async() => {
    assert.equal(await reg.promises.regQueryStringValue(...key), "%USERPROFILE%\\AppData\\Roaming");
    assert.equal(await reg.promises.regQueryStringValueAndExpand(...key), `C:\\Users\\${username}\\AppData\\Roaming`);
  });
  
});

test("List subkeys / values", {
  skip: isWindows ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/listing"];
  
  await test("sync", () => {
    reg.regWriteKey(...key);
    reg.regWriteKey(key[0], key[1] + "/foo");
    reg.regWriteKey(key[0], key[1] + "/bar");
    assert.deepEqual(reg.regListAllSubkeys(...key), ["bar", "foo"]);
   
    reg.regWriteStringValue(...key, "", "root key");
    reg.regWriteStringValue(...key, "foo", "bar");
    reg.regWriteStringValue(...key, "bar", "foo");
    assert.deepEqual(reg.regListAllValues(...key), ["", "bar", "foo"]);
    
    reg.regDeleteKeyIncludingSubkeys(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    await reg.promises.regWriteKey(...key);
    await reg.promises.regWriteKey(key[0], key[1] + "/foo");
    await reg.promises.regWriteKey(key[0], key[1] + "/bar");
    assert.deepEqual(await reg.promises.regListAllSubkeys(...key), ["bar", "foo"]);
   
    await reg.promises.regWriteStringValue(...key, "", "root key");
    await reg.promises.regWriteStringValue(...key, "foo", "bar");
    await reg.promises.regWriteStringValue(...key, "bar", "foo");
    assert.deepEqual(await reg.promises.regListAllValues(...key), ["", "bar", "foo"]);
    
    await reg.promises.regDeleteKeyIncludingSubkeys(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});


test("Import/Export", {
  skip: isWindows ? false : "This test runs on Windows"
}, async () => {
  
  await test("sync", () => {
    const dump = reg.regExportKey("HKCU", "Software/Microsoft/EdgeUpdate");
    reg.regImportKey("HKCU", "Software_Backup", dump, { purgeDest: true });
    
    try{
      assert.deepEqual(reg.regExportKey("HKCU", "Software_Backup"), dump);
    }catch(err){
      assert.ok(err.message.includes("Values have same structure but are not reference-equal"));
    }
    
    reg.regDeleteKeyIncludingSubkeys("HKCU", "Software_Backup");
    assert.ok(!reg.regKeyExists("HKCU", "Software_Backup"));
  });
  
  await test("promise", async() => {
    const dump = await reg.promises.regExportKey("HKCU", "Software/Microsoft/EdgeUpdate");
    await reg.promises.regImportKey("HKCU", "Software_Backup", dump, { purgeDest: true });
    
    try{
      assert.deepEqual(await reg.promises.regExportKey("HKCU", "Software_Backup"), dump);
    }catch(err){
      assert.ok(err.message.includes("Values have same structure but are not reference-equal"));
    }
    
    await reg.promises.regDeleteKeyIncludingSubkeys("HKCU", "Software_Backup");
    assert.ok(!(await reg.promises.regKeyExists("HKCU", "Software_Backup")));
  });
  
});