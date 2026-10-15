import type { RewriteIntensity, RewriteResult, WritingStyle } from "@rephrase-studio/core";
export type UiLanguage = "auto" | "id" | "en";
export type WorkState = "idle" | "loading" | "success" | "error" | "quota" | "offline";
export interface UserSettings { interfaceLanguage:"id"|"en"; defaultLanguage:UiLanguage; defaultStyle:WritingStyle; defaultIntensity:RewriteIntensity; historyEnabled:boolean; saveSourceText:boolean; persistDraft:boolean; }
export interface DocumentBlock { id:string; order:number; type:"heading"|"paragraph"|"table"; text:string; level?:number; page?:number; processable:boolean; }
export interface ImportedDocument { filename:string; format:"txt"|"docx"|"pdf"; size:number; blocks:DocumentBlock[]; text:string; pageCount?:number; scannedPages:number[]; requiresOcr:boolean; warnings:string[]; }
export interface HistoryItem { id: string; date: string; source: string; result: string; language: UiLanguage; style: WritingStyle; intensity: RewriteIntensity; report?: RewriteResult; }
