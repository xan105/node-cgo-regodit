/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/
import { Failure } from "@xan105/error";

const HKEY = ["HKCR", "HKCU", "HKLM", "HKU", "HKCC"];

function isValidRootKey(root){
  return HKEY.includes(root);
}

function shouldValidRootKey(root){
  if (!isValidRootKey(root)) 
    throw new Failure(`Expecting root key to be ${HKEY.join(", ")}`, 1);
}

const normalize = (path) => path.replaceAll("/","\\");

const alphabetical = (a, b) => {
    if(a < b) { return -1; }
    if(a > b) { return 1; }
    return 0;
};

export { 
  shouldValidRootKey,
  normalize,
  alphabetical
};