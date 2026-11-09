export const STAGES:Record<string,string>;
export const PROJECT_STAGES:Record<string,string>;
export function nextStages(stage:string):string[];
export function nextProjectStages(stage:string):string[];
export function money(value:unknown):number;
export type DealCheck={stage:string;layoutUrl:string|null;layoutVersion:string|null;companyId:string|null;planName:string;scope:string|null;paymentTerms:string|null;creationPriceCents:number;monthlyPriceCents:number;initialPaymentCents:number;paidCents:number;contractConfirmed:boolean;lostReason:string|null};
export function checkFlow(current:{stage:string;layoutApprovedAt:Date|null;layoutUrl:string|null;layoutVersion:string|null},input:DealCheck):void;
