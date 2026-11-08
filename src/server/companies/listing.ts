import "server-only";
import { getDb } from "@/server/db/client";
import { requireUser } from "@/server/auth/session";
import { assessments,type Assessment } from "@/lib/companies/types";
import { canonicalDocument,digits } from "@/lib/companies/identity.mjs";
import type { Prisma } from "@/generated/prisma/client";
export type ListingFilters={q?:string;assessment?:string;contact?:string;archive?:string;site?:string;page?:string;segment?:string;city?:string;phone?:string};
export async function getCompanyListing(filters:ListingFilters) {
  await requireUser();
  const db=getDb(), where:Prisma.CompanyWhereInput={};
  if(filters.archive==="archived") where.archivedAt={not:null}; else if(filters.archive!=="all") where.archivedAt=null;
  if(filters.assessment && Object.prototype.hasOwnProperty.call(assessments,filters.assessment)) where.assessment=filters.assessment as Assessment;
  if(filters.contact==="blocked") where.doNotContact=true;
  if(filters.contact==="unblocked") where.doNotContact=false;
  if(filters.segment) where.segment={equals:filters.segment.slice(0,120),mode:"insensitive"};
  if(filters.city) where.city={equals:filters.city.slice(0,120),mode:"insensitive"};
  const and:Prisma.CompanyWhereInput[]=[];
  if(filters.site==="missing") and.push({OR:[{website:null},{website:""}]});
  if(filters.site==="present") and.push({website:{not:null}},{website:{not:""}});
  if(filters.phone==="yes") and.push({phoneOriginal:{not:null}},{phoneOriginal:{not:""}});
  if(and.length) where.AND=and;
  const q=(filters.q??"").trim().slice(0,100);
  if(q) {
    where.OR=[{name:{contains:q,mode:"insensitive"}},{phoneOriginal:{contains:q,mode:"insensitive"}},{segment:{contains:q,mode:"insensitive"}}];
    const phone=digits(q), document=canonicalDocument(q);
    if(phone) where.OR.push({phoneNormalized:{contains:phone}});
    if(/^[A-Z0-9]{3,14}$/.test(document)) where.OR.push({documentNumber:{contains:document}});
  }
  const active={archivedAt:null};
  const [total,overview,segments,cities]=await Promise.all([
    db.company.count({where}),
    db.$transaction([
      db.company.count({where:active}),
      db.company.count({where:{...active,assessment:"POTENTIAL"}}),
      db.company.count({where:{...active,OR:[{website:null},{website:""}]}}),
      db.company.count({where:{...active,doNotContact:true}}),
    ]),
    db.company.findMany({where:{segment:{not:null}},select:{segment:true},distinct:["segment"],orderBy:{segment:"asc"},take:100}),
    db.company.findMany({where:{city:{not:null}},select:{city:true},distinct:["city"],orderBy:{city:"asc"},take:100}),
  ]);
  const pages=Math.max(1,Math.ceil(total/20));
  const requested=/^\d{1,6}$/.test(filters.page??"")?Math.max(1,Number(filters.page)):1,page=Math.min(requested,pages);
  const items=await db.company.findMany({where,orderBy:[{name:"asc"},{id:"asc"}],skip:(page-1)*20,take:20,select:{id:true,name:true,segment:true,neighborhood:true,city:true,state:true,phoneOriginal:true,website:true,instagram:true,assessment:true,doNotContact:true,archivedAt:true,createdAt:true}});
  return {items,total,pages,page,overview,segments:segments.map(s=>s.segment).filter((s):s is string=>!!s),cities:cities.map(c=>c.city).filter((c):c is string=>!!c)};
}
