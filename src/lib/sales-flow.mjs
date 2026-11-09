export const STAGES={INTERESTED:'Interesse confirmado',BRIEFING:'Proposta / briefing',LAYOUT_PREPARING:'Layout em preparação',LAYOUT_SENT:'Layout enviado — aguardando aprovação',LAYOUT_CHANGES:'Ajustes solicitados no layout',LAYOUT_APPROVED:'Layout aprovado',FORMALIZATION:'Em formalização',AWAITING_PAYMENT:'Aguardando pagamento',WON:'Ganha — projeto criado',LOST:'Perdida'};
const routes={INTERESTED:['BRIEFING','FORMALIZATION'],BRIEFING:['LAYOUT_PREPARING','LAYOUT_SENT','FORMALIZATION'],LAYOUT_PREPARING:['LAYOUT_SENT','BRIEFING'],LAYOUT_SENT:['LAYOUT_CHANGES','LAYOUT_APPROVED'],LAYOUT_CHANGES:['LAYOUT_PREPARING','LAYOUT_SENT'],LAYOUT_APPROVED:['LAYOUT_CHANGES','FORMALIZATION'],FORMALIZATION:['AWAITING_PAYMENT','LAYOUT_PREPARING'],AWAITING_PAYMENT:['FORMALIZATION','WON'],WON:[],LOST:[]};
export function nextStages(stage){return [stage,...(routes[stage]??[]),...(!['WON','LOST'].includes(stage)?['LOST']:[])];}
export const PROJECT_STAGES={AWAITING_PAYMENT:'Aguardando pagamento',AWAITING_CONTENT:'Aguardando conteúdo',IN_PRODUCTION:'Em desenvolvimento',CLIENT_REVIEW:'Site enviado — aguardando aprovação',ADJUSTMENTS:'Ajustes solicitados',READY_TO_PUBLISH:'Aprovado para publicação',PUBLISHED:'Publicado / entregue'};
const projectRoutes={AWAITING_PAYMENT:['AWAITING_CONTENT'],AWAITING_CONTENT:['IN_PRODUCTION'],IN_PRODUCTION:['CLIENT_REVIEW'],CLIENT_REVIEW:['ADJUSTMENTS','READY_TO_PUBLISH'],ADJUSTMENTS:['IN_PRODUCTION','CLIENT_REVIEW'],READY_TO_PUBLISH:['ADJUSTMENTS','PUBLISHED'],PUBLISHED:[]};
export function nextProjectStages(stage){return [stage,...(projectRoutes[stage]??[])];}
export function money(value){const s=String(value??'').trim().replace(',','.');if(!/^\d{1,7}(\.\d{1,2})?$/.test(s))throw Error('Informe valores não negativos com até duas casas decimais.');const [a,b='']=s.split('.');return Number(a)*100+Number(b.padEnd(2,'0'));}
export function checkFlow(current,input){
 if(['WON','LOST'].includes(current.stage))throw Error('Negociação encerrada: consulte o histórico.');
 if(!nextStages(current.stage).includes(input.stage))throw Error('Transição comercial inválida.');
 if(['LAYOUT_SENT','LAYOUT_APPROVED'].includes(input.stage)&&!input.layoutUrl)throw Error('Informe o link da versão do layout enviada ao cliente.');
 if(current.layoutApprovedAt&&(input.layoutUrl!==current.layoutUrl||input.layoutVersion!==current.layoutVersion)&&!['LAYOUT_CHANGES','LAYOUT_PREPARING','LAYOUT_SENT','LOST'].includes(input.stage))throw Error('O layout aprovado foi alterado. Registre ajustes e uma nova aprovação.');
 if(input.stage==='LOST'&&!input.lostReason)throw Error('Informe o motivo da perda.');
 if(['AWAITING_PAYMENT','WON'].includes(input.stage)){
 if(!input.companyId)throw Error('Vincule o cadastro completo da empresa na formalização.');
 if(!input.planName||!input.scope||!input.paymentTerms||input.creationPriceCents<=0)throw Error('Informe plano, escopo, valor e condições acordadas.');
 if(input.initialPaymentCents<=0||input.initialPaymentCents>input.creationPriceCents)throw Error('A condição inicial deve ser maior que zero e não superar o valor da criação.');
 }
 if(input.paidCents>input.creationPriceCents)throw Error('O recebimento supera o valor da criação.');
 if(input.stage==='WON'&&(!input.contractConfirmed||input.paidCents<input.initialPaymentCents))throw Error('Confirme a contratação e o recebimento da condição inicial antes de ganhar a venda.');
}
