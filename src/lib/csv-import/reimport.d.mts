export type ReimportRow={id:string;values:unknown;lead?:{id:string}|null};
export type KnownRow={id:string;kind?:string;recordKey?:string;entryValues?:unknown};
export type Classified<T extends ReimportRow>=T & {locked:boolean;existingLeadId:string|null;alreadyStatus:'IMPORTED'|'EXISTS'|null};
export function recordKey(values:unknown):string;
export function classifyRows<T extends ReimportRow>(rows:T[],existing?:KnownRow[]):Classified<T>[];
export function planSelection<T extends ReimportRow>(rows:T[],selectedIds:string[],existing?:KnownRow[]):{create:Classified<T>[];duplicates:{row:Classified<T>;sourceId:string}[];already:Classified<T>[]};
export function summarizeRows(rows:{locked:boolean;alreadyStatus:string|null}[]):{imported:number;existing:number;remaining:number;status:string};
