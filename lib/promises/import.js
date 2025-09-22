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

async function writeValues(root, path, values){
  for (let i=0; i < values.length; i++)
  {
    const { key, value, type } = values[i];

    if (values === null) continue;
    
    switch(type){
      case "SZ":
        await regWriteStringValue(root, path, key, value);
        break;
      case "MULTI_SZ":
        await regWriteMultiStringValue(root, path, key, value);
        break;
      case "EXPAND_SZ":
        await regWriteExpandStringValue(root, path, key, value);
        break;
      case "BINARY":
        await regWriteBinaryValue(root, path, key, value);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
        await regWriteDwordValue(root, path, key, value);
        break;
      case "QWORD":
        await regWriteQwordValue(root, path, key, value);
        break;
    }
  }
}

async function writeTree(root, path, data){
  await regCreate(root, path); 

  const values = Object.getOwnPropertySymbols(data)
  .find((symbol) => symbol.description === "values");
  
  if (values) await writeValues(root, path, data[values]); 
  
  for (const [name, key] of Object.entries(data))
    await writeTree(root, path + "/" + name, key);
}

async function regImportKey(root, path, data, option = {}){
  shouldString(root);
  shouldString(path);
  shouldObj(data);
  shouldObj(option);
  
  const options = {
    purgeDest: asBoolean(option.purgeDest) ?? false
  };

  if (options.purgeDest) await regDelete(root, path);
  await writeTree(root, path, data);
}

export { regImportKey };