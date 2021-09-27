export function RegKeyExists(root: string,key: string): bool
export function RegListAllSubkeys(root: string,key: string): any
export function RegListAllValues(root: string,key: string): any
export function RegQueryValueType(root: string,key: string,name: string): string
export function RegQueryStringValue(root: string,key: string,name: string): string | null
export function RegQueryMultiStringValue(root: string,key: string,name: string): string[] | null
export function RegQueryStringValueAndExpand(root: string,key: string,name: string): string | null
export function RegQueryBinaryValue(root: string,key: string,name: string): Buffer | null
export function RegQueryIntegerValue(root: string,key: string,name: string): number | bigint | null
export function RegWriteKey(root: string,key: string): void
export function RegWriteStringValue(root: string,key: string,name: string,value: string): void
export function RegWriteMultiStringValue(root: string,key: string,name: string,value: string[]): void
export function RegWriteExpandStringValue(root: string,key: string,name: string,value: string): void
export function RegWriteBinaryValue(root: string,key: string,name: string,value: Buffer): void
export function RegWriteDwordValue(root: string,key: string,name: string,value: number | bigint | string): void
export function RegWriteQwordValue(root: string,key: string,name: string,value: number | bigint | string): void
export function RegDeleteKeyValue(root: string,key: string,name: string): void
export function RegDeleteKey(root: string,key: string): void

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
  recursive?: bool
}

declare interface IImportOpts {
  purgeDest?: bool
}

export RegExportKey(root: string,key: string,option?: IExportOpts): IRegistry
export RegImportKey(root: string,key: string,data: IRegistry, option?: IImportOpts): void
export RegDeleteKeyIncludingSubkeys(root: string,key: string): void

export * as promises from "./promises.d.ts"