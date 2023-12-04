/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  regWriteStringValue,
  regWriteMultiStringValue,
  regWriteExpandStringValue,
  regWriteBinaryValue,
  regWriteDwordValue,
  regWriteQwordValue,
  regWriteKey
} from "./base.js";
import { regDeleteKeyIncludingSubkeys } from "./purge.js";
import { shouldString, shouldObj } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";
import { shouldValidRootKey } from "../util/helper.js";

function writeValues(root, key, values){
  for (let i=0; i < values.length; i++)
  {
    const { name, data, type } = values[i];

    if (data === null) continue;
    
    switch(type){
      case "SZ":
        regWriteStringValue(root, key, name, data);
        break;
      case "MULTI_SZ":
        regWriteMultiStringValue(root, key, name, data);
        break;
      case "EXPAND_SZ":
        regWriteExpandStringValue(root, key, name, data);
        break;
      case "BINARY":
        regWriteBinaryValue(root, key, name, data);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
        regWriteDwordValue(root, key, name, data);
        break;
      case "QWORD":
        regWriteQwordValue(root, key, name, data);
        break;
    }
  }
}

function writeTree(root, key, data){
  regWriteKey(root, key); 

  const values = Object.getOwnPropertySymbols(data)
  .find((symbol) => symbol.description === "values");
  
  if (values) writeValues(root, key, data[values]); 

  for (const [name, value] of Object.entries(data))
    writeTree(root, key + "/" + name, value);
}

function regImportKey(root, key, data, option = {}){
  shouldValidRootKey(root);
  shouldString(key);
  shouldObj(data);
  shouldObj(option);
  
  const options = {
    purgeDest: asBoolean(option.purgeDest) ?? false
  };
  
  if (options.purgeDest) regDeleteKeyIncludingSubkeys(root, key);
  writeTree(root, key, data);
}

export { regImportKey };