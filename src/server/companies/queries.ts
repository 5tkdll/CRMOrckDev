import "server-only";
import { notFound } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { getDb } from "@/server/db/client";
import { assessments,type Assessment } from "@/lib/companies/types";
import { validId,normalizePhone } from "@/lib/companies/validation.mjs";
import { canonicalDocument } from "@/lib/companies/identity.mjs";
import type { Prisma } from "@/generated/prisma/client";
export type Filters={q?:string;assessment?:string;contact?:string;archive?:string;site?:string;page?:string};
export async function listCompanies(filters:Filters) {
  await requireUser();
  const where:Prisma.CompanyWhereInput={};
  if(filters.archive==="archived") where.archivedAt={not:null}; else if(filters.archive!=="all") where.archivedAt=null;
  if(filters.assessment && Object.prototype.hasOwnProperty.call(assessments,filters.assessment)) where.assessment=filters.assessment as Assessment;
  if(filters.contact==="blocked") where.doNotContact=true;
  if(filters.contact==="unblocked") where.doNotContact=false;
  if(filters.site==="missing") where.AND=[{OR:[{website:null},{website:""}]}];
  if(filters.site==="present") where.AND=[{website:{not:null}},{website:{not:""}}];
  const q=(filters.q??"").trim().slice(0,100);
  if(q) {
    where.OR=[{name:{contains:q,mode:"insensitive"}},{phoneOriginal:{contains:q,mode:"insensitive"}}];
    const phone=normalizePhone(q), doc=canonicalDocument(q);
    if(phone) where.OR.push({phoneNormalized:{contains:phone}});
    if(/^[A-Z0-9]{3,14}$/.test(doc)) where.OR.push({documentNumber:{contains:doc}});
  }
  const total=await getDb().company.count({where}), pages=Math.max(1,Math.ceil(total/20));
  const requested=/^\d{1,6}$/.test(filters.page??"") ? Math.max(1,Number(filters.page)) : 1, page=Math.min(requested,pages);
  const items=await getDb().company.findMany({where,orderBy:[{name:"asc"},{id:"asc"}],skip:(page-1)*20,take:20,select:{id:true,name:true,segment:true,phoneOriginal:true,city:true,state:true,website:true,assessment:true,doNotContact:true,archivedAt:true,documentType:true,documentNumber:true}});
  return {items,total,pages,page};
}
export async function getCompany(id:string) {
  await requireUser(); if(!validId(id)) notFound();
  const company=await getDb().company.findUnique({where:{id}});
  if(!company) notFound(); return company;
}
