import type { WritingStyle } from "../types.js";
export type IntegrityStatus = "clear"|"review"|"changed";
export type IntegrityCategory = "preserved"|"number"|"name-term"|"citation"|"quotation"|"meaning"|"causality"|"qualification"|"attribution"|"sequence"|"unverifiable";
export interface TextTrace { text:string; index:number; end:number; sentence?:string; }
export interface IntegrityFinding { id:string; category:IntegrityCategory; severity:"info"|"warning"|"error"; title:string; explanation:string; source?:TextTrace; result?:TextTrace; verifiable:boolean; }
export interface PreservedElement { kind:"quotation"|"author-year-citation"|"numeric-citation"|"doi"|"url"|"number"|"name-term"; value:string; sourceIndex:number; resultIndex:number; }
export interface IntegrityOptions { style:WritingStyle; technicalTerms?:string[]; properNames?:string[]; }
export interface IntegrityReport { status:IntegrityStatus; statusLabel:"Tidak ditemukan masalah pada pemeriksaan otomatis."|"Perlu pemeriksaan pengguna."|"Ditemukan perubahan yang perlu ditinjau."; preserved:PreservedElement[]; findings:IntegrityFinding[]; summary:{preserved:number;warnings:number;errors:number;}; disclaimer:string; }
