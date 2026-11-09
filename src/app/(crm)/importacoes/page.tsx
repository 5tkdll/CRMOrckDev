import {ImportsVisual} from "@/components/visual-crm/imports";
import {requireUser} from "@/server/auth/session";
import {getDb} from "@/server/db/client";
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireUser();
 try{
 const batches=await getDb().csvBatch.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},take:50,select:{id:true,filename:true,status:true,totalRows:true,importedRows:true,skippedRows:true,createdAt:true}});
 return <ImportsVisual history={batches.map(b=>({...b,createdAt:b.createdAt.toISOString()}))}/>;
 }catch{return <ImportsVisual history={[]} setupError="Não foi possível consultar as importações. Confira a migration do Pacote 13, as permissões e a conexão com o banco."/>;}
}
