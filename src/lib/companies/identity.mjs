export function digits(value) { return String(value ?? "").replace(/\D/g, ""); }
export function formatCpf(value) {
  const d = digits(value).slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}
export function canonicalDocument(value) { return String(value ?? "").replace(/[.\/\-\s]/g, "").toUpperCase(); }
export function formatCnpj(value) {
  const raw = canonicalDocument(value).replace(/[^A-Z0-9]/g, "");
  const d = raw.slice(0,12) + raw.slice(12,14).replace(/\D/g, "");
  let s = d.slice(0,2);
  if(d.length>2) s += "." + d.slice(2,5);
  if(d.length>5) s += "." + d.slice(5,8);
  if(d.length>8) s += "/" + d.slice(8,12);
  if(d.length>12) s += "-" + d.slice(12,14);
  return s;
}
export function formatPhone(value) {
  const d = digits(value).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const tail = d.slice(2);
  if (tail.length <= 4) return `(${d.slice(0,2)}) ${tail}`;
  const cut = d.length > 10 ? 5 : 4;
  return `(${d.slice(0,2)}) ${tail.slice(0,cut)}${tail.length > cut ? "-" + tail.slice(cut) : ""}`;
}
export function formatCep(value) { const d = digits(value).slice(0,8); return d.length > 5 ? d.slice(0,5) + "-" + d.slice(5) : d; }
export function validCpf(value) {
  if (typeof value !== "string" || !/^[\d.\-\s]+$/.test(value)) return false;
  const d = canonicalDocument(value);
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  for (const length of [9, 10]) {
    let sum = 0;
    for (let i=0; i<length; i++) sum += Number(d[i]) * (length+1-i);
    const remainder = (sum * 10) % 11;
    if ((remainder === 10 ? 0 : remainder) !== Number(d[length])) return false;
  }
  return true;
}
export function validCnpj(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9.\/\-\s]+$/.test(value)) return false;
  const d = canonicalDocument(value);
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(d) || /^(\d)\1{13}$/.test(d)) return false;
  for (const length of [12,13]) {
    let sum=0, weight=2;
    for (let i=length-1; i>=0; i--) { sum += (d.charCodeAt(i)-48)*weight; weight = weight === 9 ? 2 : weight+1; }
    const rest=sum%11;
    if ((rest < 2 ? 0 : 11-rest) !== Number(d[length])) return false;
  }
  return true;
}
