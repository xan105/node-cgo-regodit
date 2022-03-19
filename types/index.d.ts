export function regKeyExists(root: string,key: string): boolean
export function regListAllSubkeys(root: string,key: string): any
export function regListAllValues(root: string,key: string): any
export function regQueryValueType(root: string,key: string,name: string): string
export function regQueryStringValue(root: string,key: string,name: string): string | null
export function regQueryMultiStringValue(root: string,key: string,name: string): string[] | null
export function regQueryStringValueAndExpand(root: string,key: string,name: string): string | null
export function regQueryBinaryValue(root: string,key: string,name: string): Buffer | null
export function regQueryIntegerValue(root: string,key: string,name: string): number | bigint | null
export function regWriteKey(root: string,key: string): void
export function regWriteStringValue(root: string,key: string,name: string,value: string): void
export function regWriteMultiStringValue(root: string,key: string,name: string,value: string[]): void
export function regWriteExpandStringValue(root: string,key: string,name: string,value: string): void
export function regWriteBinaryValue(root: string,key: string,name: string,value: Buffer): void
export function regWriteDwordValue(root: string,key: string,name: string,value: number | bigint): void
export function regWriteQwordValue(root: string,key: string,name: string,value: number | bigint): void
export function regDeleteKeyValue(root: string,key: string,name: string): void
export function regDeleteKey(root: string,key: string): void

declare interface IRegistryValues {
  name: string,
  type: string,
  data: string | string[] | Buffer | number | bigint | null
}

declare interface IRegistry {
  __values__?: IRegistryValues[]
  [propName: string]: IRegistry;
}

declare interface IExportOpts {
  recursive?: boolean
}

declare interface IImportOpts {
  purgeDest?: boolean
}

export regExportKey(root: string,key: string,option?: IExportOpts): IRegistry
export regImportKey(root: string,key: string,data: IRegistry, option?: IImportOpts): void
export regDeleteKeyIncludingSubkeys(root: string,key: string): void

export * as promises from "./promises.d.ts"