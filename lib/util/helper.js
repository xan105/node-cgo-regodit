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

function isValidRootKey(root){
  const HKEY = ["HKCR","HKCU","HKLM","HKU","HKCC"];
  return HKEY.includes(root) ? true : false;
}

function isObj(value){ //as in a "plain obj" and not a JS obj so {}, new Object() and Object.create(null)
  if(value){
    if (Object.prototype.toString.call(value) === "[object Object]") return true;
    const prototype = Object.getPrototypeOf(value);
    if (prototype === null  || prototype === Object.prototype) return true;
  }
  return false;
}

function isArrayOfString(value){
  return Array.isArray(value) && value.every(elem => typeof elem === "string");
}

export const normalize = (path) => { return path.replace(/([/])/g,"\\") };
export { 
  isValidRootKey, 
  isObj, 
  isArrayOfString 
};
