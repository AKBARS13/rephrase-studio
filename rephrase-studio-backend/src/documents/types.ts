export type DocumentFormat = "txt"|"docx"|"pdf";
export type BlockType = "heading"|"paragraph"|"table";
export interface DocumentBlock { id:string; order:number; type:BlockType; text:string; level?:number; page?:number; processable:boolean; }
export interface ImportedDocument { filename:string; format:DocumentFormat; size:number; blocks:DocumentBlock[]; text:string; pageCount?:number; scannedPages:number[]; requiresOcr:boolean; warnings:string[]; }
export interface DocumentChunk { id:string; order:number; blockIds:string[]; text:string; }
export interface ExportResult { buffer:Buffer; mimeType:string; filename:string; warnings:string[]; }
