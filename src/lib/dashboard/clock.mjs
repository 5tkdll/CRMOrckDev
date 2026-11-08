export function dashboardClock(now=new Date()) {
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
  const get=t=>parts.find(p=>p.type===t).value;
  const key=`${get("year")}-${get("month")}-${get("day")}`;
  const day=new Date(`${key}T00:00:00.000Z`), start=new Date(`${key}T00:00:00.000-03:00`);
  return {now,day,start,end:new Date(start.getTime()+86400000),horizon:new Date(day.getTime()+30*86400000),key};
}
export function daysUntil(date,day) { return Math.round((new Date(date).getTime()-new Date(day).getTime())/86400000); }
