/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import ffi from "ffi-napi";

const file = join(dirname(fileURLToPath(import.meta.url)), "../dist/regodit.dll")
             .replace('app.asar', 'app.asar.unpacked'); //electron asar friendly

const lib = ffi.Library(file, {
   'RegKeyExists': ["uint", ["string", "string"]],
   'RegListAllSubkeys': ["string", ["string", "string"]],
   'RegListAllValues': ["string", ["string", "string"]],
   'RegQueryValueType': ["string", ["string", "string", "string"]], 
   'RegQueryStringValue': ["string", ["string", "string", "string"]],
   'RegQueryMultiStringValue': ["string", ["string", "string", "string"]],
   'RegQueryStringValueAndExpand': ["string", ["string", "string", "string"]],
   'RegQueryBinaryValue': ["string", ["string", "string", "string"]],
   'RegQueryIntegerValue': ["string", ["string", "string", "string"]],
   'RegWriteKey': ["void", ["string", "string"]],
   'RegWriteStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteMultiStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteExpandStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteBinaryValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteDwordValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteQwordValue': ["void", ["string", "string", "string", "string"]],
   'RegDeleteKeyValue': ["void", ["string", "string", "string"]],
   'RegDeleteKey': ["void", ["string", "string"]]
});

export { lib };