/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { 
  regCreate,
  regDelete,
  regWriteStringValue,
  regWriteExpandStringValue,
  regWriteMultiStringValue,
  regWriteBinaryValue,
  regWriteDwordValue,
  regWriteQwordValue
} from "./base.js";
import { asBoolean } from "@xan105/is/opt";
import { shouldString, shouldObj } from "@xan105/is/assert";

function writeValues(root, path, values){
  for (let i=0; i < values.length; i++)
  {
    const { key, value, type } = values[i];

    if (value === null) continue;
    
    switch(type){
      case "SZ":
        regWriteStringValue(root, path, key, value);
        break;
      case "MULTI_SZ":
        regWriteMultiStringValue(root, path, key, value);
        break;
      case "EXPAND_SZ":
        regWriteExpandStringValue(root, path, key, value);
        break;
      case "BINARY":
        regWriteBinaryValue(root, path, key, value);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
        regWriteDwordValue(root, path, key, value);
        break;
      case "QWORD":
        regWriteQwordValue(root, path, key, value);
        break;
    }
  }
}

function writeTree(root, path, data){
  regCreate(root, path);

  const values = Object.getOwnPropertySymbols(data)
  .find((symbol) => symbol.description === "values");
  
  if (values) writeValues(root, path, data[values]); 

  for (const [name, key] of Object.entries(data))
    writeTree(root, path + "/" + name, key);
}

function regImportKey(root, path, data, option = {}){
  shouldString(root);
  shouldString(path);
  shouldObj(data);
  shouldObj(option);
  
  const options = {
    purgeDest: asBoolean(option.purgeDest) ?? false
  };
  
  if (options.purgeDest) regDelete(root, path);
  writeTree(root, path, data);
}

export { regImportKey };