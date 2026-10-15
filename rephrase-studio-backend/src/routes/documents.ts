import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { importDocument, DocumentImportError } from "../documents/import.js";
import { chunkBlocks } from "../documents/chunk.js";
import { exportDocument } from "../documents/export.js";
import type { DocumentBlock } from "../documents/types.js";
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});export const documentRouter=Router();
documentRouter.post("/import",upload.single("file"),async(req,res,next)=>{try{if(!req.file)return res.status(400).json({error:{code:"missing_file",message:"Pilih file DOCX, PDF, atau TXT."}});const doc=await importDocument(req.file.buffer,req.file.originalname,req.file.mimetype);res.json({...doc,chunks:chunkBlocks(doc.blocks)});}catch(e){if(e instanceof DocumentImportError)return res.status(e.code==="file_too_large"?413:422).json({error:{code:e.code,message:e.message}});next(e);}});
const exportSchema=z.object({format:z.enum(["txt","docx","pdf"]),filename:z.string().max(100).optional(),blocks:z.array(z.object({id:z.string(),order:z.number().int().nonnegative(),type:z.enum(["heading","paragraph","table"]),text:z.string(),level:z.number().int().min(1).max(6).optional(),page:z.number().int().positive().optional(),processable:z.boolean()})).min(1).max(5000)});
documentRouter.post("/export",expressJson(),async(req,res,next)=>{try{const parsed=exportSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:{code:"invalid_export",message:"Data ekspor tidak valid."}});const out=await exportDocument(parsed.data.format,parsed.data.blocks as DocumentBlock[],parsed.data.filename?.replace(/\.[^.]+$/,"")||undefined);res.setHeader("content-type",out.mimeType);res.setHeader("content-disposition",`attachment; filename="${out.filename}"`);res.setHeader("x-document-warnings",encodeURIComponent(JSON.stringify(out.warnings)));res.send(out.buffer);}catch(e){next(e);}});
function expressJson(){return (req:any,res:any,next:any)=>{if(req.is("application/json"))return next();res.status(415).json({error:{code:"unsupported_media_type",message:"Ekspor memerlukan application/json."}})}}
