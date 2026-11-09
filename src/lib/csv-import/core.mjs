export const FIELDS = ['name','phone','instagram','website','location','segment','rating','sourceUrl','researchedAt','notes'];
export const LABELS = {name:'Nome do lead',phone:'Telefone',instagram:'Instagram',website:'Site / link',location:'Localização original',segment:'Segmento',rating:'Nota Google',sourceUrl:'Fonte URL',researchedAt:'Data da pesquisa',notes:'Observações'};
const aliases={name:['nome','nome_local','name','empresa','nome da empresa'],phone:['telefone','phone','telefone principal'],instagram:['instagram'],website:['site','website','url'],location:['local','localizacao','endereco'],segment:['segmento','categoria'],rating:['nota de avaliacao no google','nota google','avaliacao google'],sourceUrl:['fonte_url','fonte','origem_url'],researchedAt:['data_pesquisa','data da pesquisa'],notes:['observacoes','notes']};
export function canonical(s){return String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');}
export function parseCsv(text,separator='auto'){
 if(typeof text!=='string'||text.length>262144)throw Error('Arquivo acima de 256 KB.');
 text=text.replace(/^\uFEFF/,'');
 if(text.includes('\uFFFD')||text.includes('\0'))throw Error('Codificação inválida: salve o CSV como UTF-8.');
 if(!['auto',',',';','\t'].includes(separator))throw Error('Separador inválido.');
 if(separator==='auto'){
  let first='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){first+='""';i++;continue;}quoted=!quoted;}if(!quoted&&(c==='\r'||c==='\n'))break;first+=c;}
  const count=d=>{let n=0,q=false;for(let i=0;i<first.length;i++){if(first[i]==='"'){if(q&&first[i+1]==='"'){i++;continue;}q=!q;}else if(!q&&first[i]===d)n++;}return n;};
  separator=[',',';','\t'].sort((a,b)=>count(b)-count(a))[0];
 }
 const records=[];let fields=[],field='',quoted=false,closed=false,start=1,line=1;
 const save=()=>{fields.push(field);if(fields.some(v=>v.trim()!==''))records.push({line:start,cells:fields});fields=[];field='';closed=false;};
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else{field+=c;if(c==='\n')line++;}continue;}
  if(c==='"'){if(field!==''||closed)throw Error(`Aspas inesperadas na linha ${line}.`);quoted=true;}
  else if(c===separator){fields.push(field);field='';closed=false;}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;save();line++;start=line;}
  else{if(closed){if(c!==' '&&c!=='\t')throw Error(`Conteúdo após aspas na linha ${line}.`);}else field+=c;}
 }
 if(quoted)throw Error('Aspas não fechadas no CSV.');
 if(fields.length||field||closed)save();
 if(!records.length)throw Error('Arquivo vazio.');
 const headers=records.shift().cells.map(v=>v.trim());
 if(headers.length>40||headers.some(v=>!v)||new Set(headers.map(canonical)).size!==headers.length)throw Error('Cabeçalhos vazios, repetidos ou acima do limite de 40 colunas.');
 if(!records.length||records.length>1000)throw Error('Use entre 1 e 1.000 registros por lote.');
 return {headers,separator,records:records.map(r=>({...r,structuralError:r.cells.length!==headers.length?'Quantidade de campos diferente do cabeçalho.':''}))};
}
export function autoMap(headers){return Object.fromEntries(FIELDS.map(k=>[k,headers.findIndex(h=>aliases[k].includes(canonical(h)))]));}
export function validateMapping(mapping,headers){
 if(!mapping||typeof mapping!=='object')throw Error('Mapeamento inválido.');
 const result={};const used=new Set();
 for(const key of FIELDS){const n=mapping[key]??-1;if(!Number.isInteger(n)||n< -1||n>=headers.length)throw Error('Coluna inválida.');if(n>=0){if(used.has(n))throw Error('Uma coluna não pode alimentar dois campos.');used.add(n);}result[key]=n;}
 if(result.name<0)throw Error('Mapeie a coluna de nome.');return result;
}
export function safeLink(input){
 const value=String(input??'').trim();if(!value)return '';
 if(/^[a-z][a-z0-9+.-]*:/i.test(value)&&!/^https?:\/\//i.test(value))return '';
 try{const u=new URL(/^https?:\/\//i.test(value)?value:`https://${value}`);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||!u.hostname.includes('.'))return '';return u.href;}catch{return '';}
}
export function domain(value){try{return new URL(safeLink(value)).hostname.toLowerCase().replace(/^www\./,'');}catch{return '';}}
export function normalize(input){
 const data={};const errors=[],warnings=[];
 for(const key of FIELDS){if(typeof input?.[key]!=='string'&&input?.[key]!=null)errors.push(`${LABELS[key]} inválido.`);data[key]=String(input?.[key]??'').trim();if(data[key].length>(['notes','location'].includes(key)?2000:600))errors.push(`${LABELS[key]} muito longo.`);}
 if(!data.name)errors.push('Nome obrigatório.');
 const digits=data.phone.replace(/\D/g,'');
 data.phoneNormalized='';
 if(data.phone){const br=digits.startsWith('55')&&[12,13].includes(digits.length)?digits.slice(2):digits;if(/^[1-9]\d{9,10}$/.test(br))data.phoneNormalized='55'+br;else warnings.push('Telefone requer revisão; não será usado como contato válido.');}
 else warnings.push('Telefone não informado.');
 data.websiteUrl=safeLink(data.website);data.websiteDomain=domain(data.website);
 if(data.website&&!data.websiteUrl)warnings.push('Link de site inválido.');
 data.websiteKind=!data.website?'NOT_IDENTIFIED':!data.websiteUrl?'UNVERIFIED':/(^|\.)(facebook\.com|instagram\.com|wa\.me|linktr\.ee|tiktok\.com)$/.test(data.websiteDomain)?'SOCIAL':'WEBSITE';
 if(data.websiteKind==='SOCIAL')warnings.push('Rede social / agregador no campo site; não comprova site próprio.');
 if(!data.website)warnings.push('Site não identificado no arquivo.');
 const ig=data.instagram.startsWith('@')?'instagram.com/'+data.instagram.slice(1):data.instagram;
 data.instagramUrl=safeLink(ig);
 if(data.instagram&&(!data.instagramUrl||!/(^|\.)instagram\.com$/.test(domain(data.instagramUrl)))){data.instagramUrl='';warnings.push('Instagram requer revisão.');}
 if(data.instagramUrl){const u=new URL(data.instagramUrl);u.search='';u.hash='';data.instagramUrl=u.href;}
 if(!data.segment)warnings.push('Segmento não informado.');if(!data.location)warnings.push('Localização não informada.');
 data.ratingValue=null;
 if(data.rating){const n=Number(data.rating.replace(',','.'));if(!/^\d(?:[.,]\d+)?$/.test(data.rating)||!Number.isFinite(n)||n<0||n>5)warnings.push('Nota Google inválida; valor original preservado.');else data.ratingValue=n;}
 if(data.sourceUrl&&!safeLink(data.sourceUrl))warnings.push('URL da fonte requer revisão.');
 if(data.researchedAt&&!/^\d{4}-\d{2}-\d{2}$/.test(data.researchedAt))warnings.push('Data da pesquisa: prefira AAAA-MM-DD.');
 data.needsResearch=!data.phoneNormalized&&!data.instagramUrl&&!data.websiteUrl;
 if(data.needsResearch)warnings.push('Sem canal válido informado: complementar pesquisa.');
 return {data,errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}
export function compare(data,candidate){
 const why=[];
 if(data.phoneNormalized&&data.phoneNormalized===candidate.phoneNormalized)why.push('telefone');
 if(data.websiteDomain&&data.websiteDomain===candidate.websiteDomain)why.push('domínio');
 if(data.name&&canonical(data.name)===canonical(candidate.name))why.push('nome');
 if(data.instagramUrl&&data.instagramUrl===candidate.instagramUrl)why.push('Instagram');
 return why;
}
export function analyzeRows(inputs,existing=[]){
 const previous=[];
 return inputs.map(row=>{
  const checked=normalize(row.values);if(row.structuralError)checked.errors.push(row.structuralError);
  const conflicts=[];const addConflict=c=>{if(conflicts.length<30)conflicts.push(c);else if(c.doNotContact&&!conflicts.some(v=>v.doNotContact))conflicts[29]=c;};
  for(const c of existing){const reasons=compare(checked.data,c);if(reasons.length)addConflict({kind:c.kind??'LEAD',id:c.id,name:c.name,reasons,doNotContact:!!c.doNotContact,phone:c.phone??'',website:c.website??'',location:c.location??''});}
  for(const c of previous){const reasons=compare(checked.data,c.data);if(reasons.length)addConflict({kind:'CSV',id:String(c.line),name:c.data.name,reasons,doNotContact:false,phone:c.data.phone,website:c.data.website,location:c.data.location});}
  if(!checked.errors.length)previous.push({line:row.line,data:checked.data});
  return {line:row.line,raw:row.raw??{},...checked,conflicts,status:checked.errors.length?'INVALID':conflicts.length?'CONFLICT':checked.warnings.length?'WARNING':'READY'};
 });
}
