/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

function isValidRootKey(root){
  const HKEY = ["HKCR","HKCU","HKLM","HKU","HKCC"];
  return HKEY.includes(root);
}

const normalize = (path) => { return path.replaceAll("/","\\") };

export { 
  isValidRootKey,
  normalize
};