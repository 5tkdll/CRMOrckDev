import {ImportsVisual} from '@/components/visual-crm/imports';
import {requireUser} from '@/server/auth/session';
import {importHistory} from '@/server/imports/actions';
export const dynamic='force-dynamic';
export default async function Page(){
 await requireUser();
 try{return <ImportsVisual history={await importHistory()}/>;}
 catch{return <ImportsVisual history={[]} setupError="Não foi possível consultar as importações. Confira conexão, permissões e os arquivos do Pacote 14."/>;}
}
