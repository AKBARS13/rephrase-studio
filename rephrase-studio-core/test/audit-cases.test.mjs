import test from"node:test";import assert from"node:assert/strict";import{IndonesianRewriteEngine,EnglishRewriteEngine}from"../dist/src/index.js";
const idCases=[
 ["academic","academic","Selain itu, hasil penelitian mencapai 81,4% (Putra, 2023).","81,4%","(Putra, 2023)"],
 ["lab report","lab-report","Perlu dicatat bahwa larutan dipanaskan pada 80°C selama 15 menit.","80°C","15"],
 ["intelligent system","technical-report","Selain itu, model CNN mengklasifikasikan 120 citra milik Universitas Sriwijaya.","120","CNN"],
 ["technical","technical-report","Ke depannya, fungsi loss() memakai learning_rate 0,001.","0,001","loss()"],
 ["informal","casual","Selain itu, aku pakai aplikasi ini 2 kali kemarin.","2",null],
 ["citation and name","academic","Selain itu, Siregar melaporkan nilai 92% [1].","92%","[1]"],
 ["blacklisted vocabulary","general","Pada intinya, pendekatan komprehensif ini memfasilitasi analisis.",null,null],
];
for(const[name,style,source,a,b]of idCases)test(`Indonesian audit case: ${name}`,async()=>{const r=await new IndonesianRewriteEngine().rewrite(source,{language:"id",style,intensity:"medium",technicalTerms:["CNN","loss()","learning_rate"],properNames:["Universitas Sriwijaya","Siregar"]});if(a)assert.ok(r.text.includes(a),`missing ${a}`);if(b)assert.ok(r.text.includes(b),`missing ${b}`);assert.equal(r.validation.issues.some(i=>i.severity==="error"),false);assert.ok(r.text.length>0);});
const enCases=[
 ["business jargon","Moving forward, we will circle back after a deep dive into 42 records.","42"],
 ["throat clearing","Here's the thing: the BERT model reached 87% accuracy (Lee, 2023).","(Lee, 2023)"],
 ["formulaic structure","The answer isn't speed. It's accuracy.",null],
 ["passive voice","The samples were measured at 20°C.","20°C"],
 ["academic","It may be associated with a 5% increase (Lee, 2023).","5%"],
 ["technical","The API used max_tokens=512 and SHA256.","512"],
 ["quote/reference",'Lee wrote “results remain limited” [2].',"[2]"],
];
test("Indonesian prohibited filler is reduced rather than blindly deleting technical content",async()=>{const r=await new IndonesianRewriteEngine().rewrite("Pada intinya, pendekatan komprehensif ini memfasilitasi analisis 10 sampel.",{language:"id",style:"general",intensity:"medium"});assert.equal(/pada intinya|memfasilitasi/iu.test(r.text),false);assert.ok(r.text.includes("10"));assert.ok(r.finalFindings.length<r.sourceFindings.length);});
for(const[name,source,protectedValue]of enCases)test(`English audit case: ${name}`,async()=>{const r=await new EnglishRewriteEngine().rewrite(source,{language:"en",style:name==="academic"?"academic":"technical-report",intensity:"medium",technicalTerms:["BERT","API","max_tokens","SHA256"]});if(protectedValue)assert.ok(r.text.includes(protectedValue));assert.equal(r.validation.issues.some(i=>i.severity==="error"),false);if(name==="formulaic structure")assert.ok(r.sourceFindings.some(f=>f.ruleId==="en.binary-contrast"));if(name==="business jargon")assert.equal(/moving forward|circle back|deep dive/iu.test(r.text),false);if(name==="throat clearing")assert.equal(/here's the thing/iu.test(r.text),false);});
