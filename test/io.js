import test from "node:test";
import assert from "node:assert/strict";
import { isWindows } from "@xan105/is";
import * as reg from "../lib/index.js";

test("Read/write REG_SZ", {
  skip: isWindows() ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/string"];
  const name = "foo";
  
  await test("sync", () => {
    reg.regWriteStringValue(...key, name, "bar");
    assert.equal(reg.regQueryStringValue(...key, name), "bar");
    
    reg.regWriteStringValue(...key, name, "");
    assert.equal(reg.regQueryStringValue(...key, name), "");

    reg.regDeleteKeyValue(...key, name);
    assert.equal(reg.regQueryStringValue(...key, name), null);
    
    reg.regDeleteKey(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    await reg.promises.regWriteStringValue(...key, name, "bar");
    assert.equal(await reg.promises.regQueryStringValue(...key, name), "bar");
    
    await reg.promises.regWriteStringValue(...key, name, "");
    assert.equal(await reg.promises.regQueryStringValue(...key, name), "");

    await reg.promises.regDeleteKeyValue(...key, name);
    assert.equal(await reg.promises.regQueryStringValue(...key, name), null);
    
    await reg.promises.regDeleteKey(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});

test("Read/write REG_MULTI_SZ", {
  skip: isWindows() ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/string"];
  const name = "foo";
  
  await test("sync", () => {
    reg.regWriteMultiStringValue(...key, name, ["foo", "bar"]);
    assert.deepEqual(reg.regQueryMultiStringValue(...key, name), ["foo", "bar"]);
    
    reg.regWriteMultiStringValue(...key, name, []);
    assert.deepEqual(reg.regQueryMultiStringValue(...key, name), [""]);

    reg.regDeleteKeyValue(...key, name);
    assert.equal(reg.regQueryMultiStringValue(...key, name), null);
    
    reg.regDeleteKey(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    await reg.promises.regWriteMultiStringValue(...key, name, ["foo", "bar"]);
    assert.deepEqual(await reg.promises.regQueryMultiStringValue(...key, name), ["foo", "bar"]);
    
    await reg.promises.regWriteMultiStringValue(...key, name, []);
    assert.deepEqual(await reg.promises.regQueryMultiStringValue(...key, name), [""]);

    await reg.promises.regDeleteKeyValue(...key, name);
    assert.equal(await reg.promises.regQueryMultiStringValue(...key, name), null);
    
    await reg.promises.regDeleteKey(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});

test("Read/write REG_EXPAND_SZ", {
  skip: isWindows() ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/string"];
  const name = "foo";
  
  await test("sync", () => {
    reg.regWriteExpandStringValue(...key, name, "bar");
    assert.equal(reg.regQueryStringValueAndExpand(...key, name), "bar");
    
    reg.regWriteExpandStringValue(...key, name, "");
    assert.equal(reg.regQueryStringValueAndExpand(...key, name), "");

    reg.regDeleteKeyValue(...key, name);
    assert.equal(reg.regQueryStringValueAndExpand(...key, name), null);
    
    reg.regDeleteKey(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    await reg.promises.regWriteExpandStringValue(...key, name, "bar");
    assert.equal(await reg.promises.regQueryStringValueAndExpand(...key, name), "bar");
    
    await reg.promises.regWriteExpandStringValue(...key, name, "");
    assert.equal(await reg.promises.regQueryStringValueAndExpand(...key, name), "");

    await reg.promises.regDeleteKeyValue(...key, name);
    assert.equal(await reg.promises.regQueryStringValueAndExpand(...key, name), null);
    
    await reg.promises.regDeleteKey(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});

test("Read/write REG_BINARY", {
  skip: isWindows() ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/binary"];
  const name = "foo";
  const buffer = Buffer.alloc(8);
  
  await test("sync", () => {
    reg.regWriteBinaryValue(...key, name, buffer);
    assert.deepEqual(reg.regQueryBinaryValue(...key, name), buffer);

    reg.regDeleteKeyValue(...key, name);
    assert.equal(reg.regQueryBinaryValue(...key, name), null);
    
    reg.regDeleteKey(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    await reg.promises.regWriteBinaryValue(...key, name, buffer);
    assert.deepEqual(await reg.promises.regQueryBinaryValue(...key, name), buffer);

    await reg.promises.regDeleteKeyValue(...key, name);
    assert.equal(await reg.promises.regQueryBinaryValue(...key, name), null);
    
    await reg.promises.regDeleteKey(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});

test("Read/write REG_DWORD & REG_QWORD", {
  skip: isWindows() ? false : "This test runs on Windows"
}, async () => {
  
  const key = ["HKCU", "Software/regodit/number"];
  const name = "foo";
  
  await test("sync", () => {
    //REG_DWORD
    reg.regWriteDwordValue(...key, name, 0);
    assert.equal(reg.regQueryIntegerValue(...key, name), 0);
    
    reg.regWriteDwordValue(...key, name, 0n);
    assert.equal(reg.regQueryIntegerValue(...key, name), 0);
    
    try{
      reg.regWriteDwordValue(...key, name, 4294967295 + 1);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }
    
    try{
      reg.regWriteDwordValue(...key, name, 4294967295n + 1n);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }
    
    //REG_QWORD
    reg.regWriteQwordValue(...key, name, 0);
    assert.equal(reg.regQueryIntegerValue(...key, name), 0);
    
    reg.regWriteQwordValue(...key, name, 0n);
    assert.equal(reg.regQueryIntegerValue(...key, name), 0);
    
    try{
      reg.regWriteQwordValue(...key, name, Number.MAX_SAFE_INTEGER + 1);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }
    
    try{
      reg.regWriteQwordValue(...key, name, 18446744073709551615n + 1n);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }    
  
    reg.regDeleteKeyValue(...key, name);
    assert.equal(reg.regQueryIntegerValue(...key, name), null);
    
    reg.regDeleteKey(...key);
    assert.ok(!reg.regKeyExists(...key));
  });
  
  await test("promise", async() => {
    //REG_DWORD
    await reg.promises.regWriteDwordValue(...key, name, 0);
    assert.equal(await reg.promises.regQueryIntegerValue(...key, name), 0);
    
    await reg.promises.regWriteDwordValue(...key, name, 0n);
    assert.equal(await reg.promises.regQueryIntegerValue(...key, name), 0);
    
    try{
      await reg.promises.regWriteDwordValue(...key, name, 4294967295 + 1);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }
    
    try{
      await reg.promises.regWriteDwordValue(...key, name, 4294967295n + 1n);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }
    
    //REG_QWORD
    await reg.promises.regWriteQwordValue(...key, name, 0);
    assert.equal(await reg.promises.regQueryIntegerValue(...key, name), 0);
    
    await reg.promises.regWriteQwordValue(...key, name, 0n);
    assert.equal(await reg.promises.regQueryIntegerValue(...key, name), 0);
    
    try{
      await reg.promises.regWriteQwordValue(...key, name, Number.MAX_SAFE_INTEGER + 1);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    }
    
    try{
      await reg.promises.regWriteQwordValue(...key, name, 18446744073709551615n + 1n);
    }catch(err){
      assert.ok(err.code === "ERR_INVALID_ARG");
    } 
  
    await reg.promises.regDeleteKeyValue(...key, name);
    assert.equal(await reg.promises.regQueryIntegerValue(...key, name), null);
    
    await reg.promises.regDeleteKey(...key);
    assert.ok(!(await reg.promises.regKeyExists(...key)));
  });
  
});
