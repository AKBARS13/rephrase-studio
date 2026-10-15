import type { DocumentBlock, DocumentChunk } from "./types.js";
function splitSentences(text:string,max:number):string[]{
 const sentences=text.match(/[^.!?\n]+(?:[.!?]+[”"']?|$)/gu)?.map(s=>s.trim()).filter(Boolean)??[text]; const out:string[]=[];let current="";
 for(const sentence of sentences){if(sentence.length>max){if(current)out.push(current);for(let i=0;i<sentence.length;i+=max)out.push(sentence.slice(i,i+max));current="";continue;}if(current && current.length+1+sentence.length>max){out.push(current);current=sentence}else current=current?`${current} ${sentence}`:sentence}if(current)out.push(current);return out;
}
export function chunkBlocks(blocks:DocumentBlock[],maxChars=9000):DocumentChunk[]{
 if(maxChars<500)throw new Error("maxChars must be at least 500");const chunks:DocumentChunk[]=[];let text="",ids:string[]=[];
 const flush=()=>{if(!text)return;chunks.push({id:`chunk-${chunks.length}`,order:chunks.length,blockIds:[...ids],text});text="";ids=[]};
 for(const block of blocks.sort((a,b)=>a.order-b.order)){if(!block.processable||!block.text.trim())continue;for(const part of splitSentences(block.text,maxChars)){const addition=text?`\n\n${part}`:part;if(text&&text.length+2+part.length>maxChars)flush();text+=text?`\n\n${part}`:part;if(!ids.includes(block.id))ids.push(block.id);if(text.length>=maxChars)flush();}}flush();return chunks;
}
