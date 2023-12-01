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

async function writeValues(root, key, values){
  for (let i=0; i < values.length; i++)
  {
    const { name, data, type } = values[i];

    if (data === null) continue;
    
    switch(type){
      case "SZ":
        await regWriteStringValue(root, key, name, data);
        break;
      case "MULTI_SZ":
        await regWriteMultiStringValue(root, key, name, data);
        break;
      case "EXPAND_SZ":
        await regWriteExpandStringValue(root, key, name, data);
        break;
      case "BINARY":
        await regWriteBinaryValue(root, key, name, data);
        break;
      case "DWORD":
      case "DWORD_BIG_ENDIAN":
        await regWriteDwordValue(root, key, name, data);
        break;
      case "QWORD":
        await regWriteQwordValue(root, key, name, data);
        break;
    }
  }
}

async function writeTree(root, key, data){
  await regWriteKey(root, key); 

  const values = Object.getOwnPropertySymbols(data)
  .find((symbol) => symbol.description === "values");
  
  if (values) await writeValues(root, key, data[values]); 
  
  for (const [name, value] of Object.entries(data))
    await writeTree(root, key + "/" + name, value);
}

async function regImportKey(root, key, data, option = {}){
  shouldValidRootKey(root);
  shouldString(key);
  shouldObj(data);
  shouldObj(option);
  
  const options = {
    purgeDest: asBoolean(option.purgeDest) ?? false
  };

  if (options.purgeDest) await regDeleteKeyIncludingSubkeys(root, key);
  await writeTree(root, key, data);
}

export { regImportKey };