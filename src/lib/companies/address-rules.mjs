export const NO_ADDRESS_NUMBER = "S/N";
export function onlyAddressNumber(value) { return String(value ?? "").replace(/\D/g, "").slice(0,5); }
export function isAddressNumber(value) { return value === "" || value === NO_ADDRESS_NUMBER || /^\d{1,5}$/.test(value); }
export function isNoAddressNumber(value) { return /^s\s*[/.]?\s*n(?:[uú]mero)?\.?$/i.test(String(value??"").trim()) || /^sem n[uú]mero$/i.test(String(value??"").trim()); }
export function cepPatch(data,expectedCep,currentCep) {
  if(currentCep !== expectedCep || !/^\d{8}$/.test(expectedCep) || !data || data.cep!==expectedCep) return null;
  const keys=["address","neighborhood","city","state"];
  if(!keys.every(k=>typeof data[k]==="string")) return null;
  return Object.fromEntries(keys.map(k=>[k,data[k]]));
}
