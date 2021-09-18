/*
MIT License

Copyright (c) 2018-2021 Anthony Beaumont

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import ffi from "ffi-napi";

const lib = ffi.Library(join(dirname(fileURLToPath(import.meta.url)), "/dist/regodit.dll"), {
   'RegKeyExists': ["uint", ["string", "string"]],
   'RegListAllSubkeys': ["string", ["string", "string"]],
   'RegListAllValues': ["string", ["string", "string"]],
   'RegQueryValueType': ["string", ["string", "string", "string"]], 
   'RegQueryStringValue': ["string", ["string", "string", "string"]],
   'RegQueryStringValueAndExpand': ["string", ["string", "string", "string"]],
   'RegQueryBinaryValue': ["string", ["string", "string", "string"]],
   'RegQueryIntegerValue': ["string", ["string", "string", "string"]],
   'RegWriteKey': ["void", ["string", "string"]],
   'RegWriteStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteExpandStringValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteBinaryValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteDwordValue': ["void", ["string", "string", "string", "string"]],
   'RegWriteQwordValue': ["void", ["string", "string", "string", "string"]],
   'RegDeleteKeyValue': ["void", ["string", "string", "string"]],
   'RegDeleteKey': ["void", ["string", "string"]]
});

export { lib };