/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { dlopen } from "@xan105/ffi/koffi";

const file = join(dirname(fileURLToPath(import.meta.url)), "../dist/regodit.dll")
             .replace("app.asar", "app.asar.unpacked"); //electron asar friendly

const lib = dlopen(file,{
  RegKeyExists: { result: "uint", parameters: ["string", "string"]},
  RegListAllSubkeys: { result: "string", parameters: ["string", "string"]},
  RegListAllValues: { result: "string", parameters: ["string", "string"]},
  RegQueryValueType: { result: "string", parameters: ["string", "string", "string"]}, 
  RegQueryStringValue: { result: "string", parameters: ["string", "string", "string"]},
  RegQueryMultiStringValue: { result: "string", parameters: ["string", "string", "string"]},
  RegQueryStringValueAndExpand: { result: "string", parameters: ["string", "string", "string"]},
  RegQueryBinaryValue: { result: "string", parameters: ["string", "string", "string"]},
  RegQueryIntegerValue: { result: "string", parameters: ["string", "string", "string"]},
  RegWriteKey: { parameters: ["string", "string"]},
  RegWriteStringValue: { parameters: ["string", "string", "string", "string"]},
  RegWriteMultiStringValue: { parameters: ["string", "string", "string", "string"]},
  RegWriteExpandStringValue: { parameters: ["string", "string", "string", "string"]},
  RegWriteBinaryValue: { parameters: ["string", "string", "string", "string"]},
  RegWriteDwordValue: { parameters: ["string", "string", "string", "string"]},
  RegWriteQwordValue: { parameters: ["string", "string", "string", "string"]},
  RegDeleteKeyValue: { parameters: ["string", "string", "string"]},
  RegDeleteKey: { parameters: ["string", "string"]}
});

export { lib };