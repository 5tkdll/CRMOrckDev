import type {Values,Normalized} from './core.mjs';
export const ASSESSMENTS:string[];
export const VALUE_FIELDS:string[];
export function isDeleted(value:unknown):boolean;
export function markDeleted(value:string):string;
export function restoreAssessment(value:string):string;
export function validateEdit(payload:string):{values:Values;assessment:string;version:string};
export type SavedDecision={selected:boolean;allowDuplicate:boolean;reason:string;values:Values};
export function restoreSelection(rows:{id:string;locked:boolean;errors:string[];conflicts:unknown[];data:Normalized}[],saved?:Record<string,SavedDecision>):Record<string,SavedDecision>;
