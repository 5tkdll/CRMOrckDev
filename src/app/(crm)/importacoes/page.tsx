import {ImportsVisual} from '@/components/visual-crm/imports';
import {requireUser} from '@/server/auth/session';
import {importHistory} from '@/server/imports/actions';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await requireUser();
 try{return <ImportsVisual userId={user.id} history={await importHistory()}/>;}
 catch{return <ImportsVisual userId={user.id} history={[]} setupError="Não foi possível consultar o histórico. Confira conexão e permissões do banco."/>;}
}
