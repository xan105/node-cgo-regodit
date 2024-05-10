/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { arch } from "node:process";
import { join } from "node:path";

const filePath = join(
  import.meta.dirname,
  "../../dist/",
  `regodit.${{ia32: "x86"}[arch] ?? arch}.dll`
).replace("app.asar", "app.asar.unpacked"); //electron asar friendly

const strings = (n) => new Array(n).fill("string");

const symbols = {
  RegKeyExists: { result: "uint", parameters: strings(2)},  
  RegListAllSubkeys: { result: "string", parameters: strings(2)},
  RegListAllValues: { result: "string", parameters: strings(2)},
  RegQueryValueType: { result: "string", parameters: strings(3)}, 
  RegQueryStringValue: { result: "string", parameters: strings(3)},
  RegQueryMultiStringValue: { result: "string", parameters: strings(3)},
  RegQueryStringValueAndExpand: { result: "string", parameters: strings(3)},
  RegQueryBinaryValue: { result: "string", parameters: strings(3)},
  RegQueryIntegerValue: { result: "string", parameters: strings(3)},
  RegWriteKey: { parameters: strings(2)},
  RegWriteStringValue: { parameters: strings(4)},
  RegWriteMultiStringValue: { parameters: strings(4)},
  RegWriteExpandStringValue: { parameters: strings(4)},
  RegWriteBinaryValue: { parameters: strings(4)},
  RegWriteDwordValue: { parameters: strings(4)},
  RegWriteQwordValue: { parameters: strings(4)},
  RegDeleteKeyValue: { parameters: strings(3)},
  RegDeleteKey: { parameters: strings(2)}
};

export { filePath, symbols };