export const NO_ADDRESS_NUMBER: "S/N";
export function onlyAddressNumber(value:unknown):string;
export function isAddressNumber(value:string):boolean;
export function isNoAddressNumber(value:unknown):boolean;
export function cepPatch(data:unknown,expectedCep:string,currentCep:string):{address:string;neighborhood:string;city:string;state:string}|null;
