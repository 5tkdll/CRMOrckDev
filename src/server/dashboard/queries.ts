import "server-only";
import {getDb} from "@/server/db/client";
import {requireUser} from "@/server/auth/session";
import {dashboardClock} from "@/lib/dashboard/clock.mjs";
import type {Prisma} from "@/generated/prisma/client";
export async function getDashboard() {
  const user=await requireUser(),db=getDb(),clock=dashboardClock();
  const company={archivedAt:null};
  const open:Prisma.OpportunityWhereInput={company,stage:{notIn:["WON","LOST"]}};
  const taskBase:Prisma.TaskWhereInput={status:"PENDING",OR:[{companyId:null},{company}]};
  const today:Prisma.TaskWhereInput={...taskBase,AND:[{OR:[{dueAt:{gte:clock.start,lt:clock.end}},{dueAt:null,dueDate:clock.day}]}]};
  const late:Prisma.TaskWhereInput={...taskBase,AND:[{OR:[{dueAt:{lt:clock.now}},{dueAt:null,dueDate:{lt:clock.day}}]}]};
  const project:Prisma.ProjectWhereInput={company,stage:{not:"PUBLISHED"}};
  const expiring:Prisma.ServiceWhereInput={company,archivedAt:null,dueOn:{lte:clock.horizon}};
  const [unreviewed,openCount,todayCount,lateCount,proposalCount,projectCount,serviceCount,todayTasks,lateTasks,pipeline,opportunities,projects,services,activities]=await db.$transaction([
    db.company.count({where:{...company,assessment:"UNREVIEWED"}}),
    db.opportunity.count({where:open}),
    db.task.count({where:today}),
    db.task.count({where:late}),
    db.opportunity.count({where:{company,stage:"PROPOSAL_SENT"}}),
    db.project.count({where:project}),
    db.service.count({where:expiring}),
    db.task.findMany({where:today,orderBy:[{dueAt:"asc"},{dueDate:"asc"},{createdAt:"asc"}],take:6,select:{id:true,title:true,dueAt:true,dueDate:true,company:{select:{id:true,name:true,doNotContact:true}}}}),
    db.task.findMany({where:late,orderBy:[{dueDate:"asc"},{dueAt:"asc"},{createdAt:"asc"}],take:4,select:{id:true,title:true,dueAt:true,dueDate:true,company:{select:{id:true,name:true,doNotContact:true}}}}),
    db.opportunity.groupBy({by:["stage"],where:open,_count:{_all:true},_sum:{creationPriceCents:true}}),
    db.opportunity.findMany({where:open,orderBy:{updatedAt:"desc"},take:5,select:{id:true,title:true,stage:true,creationPriceCents:true,planNameSnapshot:true,company:{select:{id:true,name:true,doNotContact:true}}}}),
    db.project.findMany({where:project,orderBy:[{confirmedDeadline:"asc"},{updatedAt:"desc"}],take:4,select:{id:true,name:true,stage:true,confirmedDeadline:true,planNameSnapshot:true,company:{select:{id:true,name:true}},_count:{select:{checklist:true}},checklist:{where:{completedAt:{not:null}},select:{id:true}}}}),
    db.service.findMany({where:expiring,orderBy:{dueOn:"asc"},take:5,select:{id:true,identifier:true,kind:true,dueOn:true,renewalResponsible:true,followUpStatus:true,company:{select:{id:true,name:true}}}}),
    db.activity.findMany({where:{company},orderBy:{occurredAt:"desc"},take:5,select:{id:true,kind:true,description:true,occurredAt:true,company:{select:{id:true,name:true}}}}),
  ],{isolationLevel:"RepeatableRead"});
  return {user,clock,unreviewed,openCount,todayCount,lateCount,proposalCount,projectCount,serviceCount,todayTasks,lateTasks,pipeline,opportunities,projects,services,activities};
}
