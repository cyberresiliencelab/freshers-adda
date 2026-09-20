#!/usr/bin/env node
/* =====================================================================
   Freshers Adda — auto-updater
   Runs on a timer (see .github/workflows/update-jobs.yml). Pulls live
   openings from companies that publish an OFFICIAL public jobs API
   (Greenhouse, Lever, Ashby, SmartRecruiters), keeps only Telangana/AP
   fresher-level roles, and writes jobs.json which the app reads.

   HONEST SCOPE
   - Only works for companies actually on those ATS platforms. Add real
     slugs in SOURCES below (find them in a company's careers-page URL).
   - Big MNCs (TCS, Infosys, Wipro, Cognizant, Accenture ...) use Workday/
     custom portals with no open feed — they stay curated in index.html.
   - This uses each ATS's own public/documented endpoint. It does NOT
     scrape LinkedIn/Naukri/Indeed (against their terms and brittle).
   - Auto-classifying department from a title is a best guess; hand-added
     entries via add-job.html are more accurate.
   ===================================================================== */

import { writeFileSync } from "node:fs";

/* ---- 1. CONFIGURE YOUR SOURCES ----
   ats: "greenhouse" | "lever" | "ashby" | "smartrecruiters"
   slug: the company token from its careers URL
   deptDefault: fallback department key if the title can't be classified
   These are EXAMPLES — replace with companies you've verified hire TG/AP freshers. */
const SOURCES = [
  // { co:"Example Startup", ats:"greenhouse", slug:"exampleco", deptDefault:"apps" },
  // { co:"Another Co",     ats:"lever",      slug:"anotherco", deptDefault:"data" },
  // { co:"Ashby Co",       ats:"ashby",      slug:"ashbyco",   deptDefault:"cyber" },
  // { co:"SR Co",          ats:"smartrecruiters", slug:"srco",  deptDefault:"euc" },
];

/* ---- 2. FILTERS ---- */
const LOC_RE  = /telangana|hyderabad|secunderabad|andhra|visakhapatnam|vizag|vijayawada|amaravati|guntur|tirupati|india/i;
const AP_RE   = /andhra|visakhapatnam|vizag|vijayawada|amaravati|guntur|tirupati/i;
const FRESH_RE= /fresher|graduate|entry.?level|trainee|intern|new.?grad|campus|0\s*[-–]\s*1\s*year|associate/i;

/* keyword → department (first match wins) */
const DEPT_RULES = [
  [/soc|security|cyber|siem|threat|incident|forensic|iam|pam|vapt|pentest|vulnerab/i,"cyber"],
  [/grc|governance|risk|compliance|audit/i,"grc"],
  [/network|noc|telecom|voip|firewall|lan|wan|sd-wan|wifi/i,"network"],
  [/desktop|service desk|help ?desk|end user|endpoint|m365|microsoft 365/i,"euc"],
  [/cloud|devops|kubernetes|container|aws|azure|gcp|automation|gen ?ai|\bai\b/i,"cloud"],
  [/data|analytics|bi\b|etl|ml|machine learning|scientist|analyst/i,"data"],
  [/server|storage|infra|virtualiz|vmware|dba|database/i,"infra"],
  [/itsm|incident management|change management|cmdb|itil/i,"itsm"],
  [/asset|license|vendor|procurement/i,"asset"],
  [/developer|engineer|software|full ?stack|backend|frontend|java|python|api|erp|sap|crm/i,"apps"],
];
function classifyDept(title, fallback){ for(const [re,k] of DEPT_RULES) if(re.test(title)) return k; return fallback||"apps"; }
function guessType(t){ if(/intern/i.test(t))return "Internship"; if(/trainee|graduate|fresher|campus/i.test(t))return "Trainee"; return "Full-time"; }
function guessState(loc){ return AP_RE.test(loc)?"AP":"TS"; }
function guessCity(loc){
  const l=(loc||"").toLowerCase();
  if(/visakhapatnam|vizag/.test(l))return "Visakhapatnam";
  if(/vijayawada/.test(l))return "Vijayawada";
  if(/amaravati/.test(l))return "Amaravati";
  if(/guntur/.test(l))return "Guntur";
  if(/tirupati/.test(l))return "Tirupati";
  return "Hyderabad";
}
const todayISO=()=>new Date().toISOString().slice(0,10);
const plusDays=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);

/* default sub-department per department (first in the app's list) */
const SUB={apps:"Application Development",cyber:"Security Engineering",network:"LAN/WAN",euc:"Service Desk / Help Desk",
  cloud:"Cloud Operations",data:"Data Analytics",infra:"Servers",itsm:"Incident Management",asset:"Software Asset Management",grc:"Governance, Risk & Compliance"};

function toEntry(co,title,url,loc,deptDefault,postedISO){
  const dept=classifyDept(title,deptDefault);
  return {
    co, role:title.trim(), dept, sub:SUB[dept]||"Application Development",
    type:guessType(title), state:guessState(loc), city:guessCity(loc), vac:"Multiple",
    note:`Live from ${co} careers — ${loc||"India"}. Confirm eligibility & batch on the apply page.`,
    apply:url, posted:postedISO||todayISO(), last:plusDays(30),
    interview:{mode:"Online",venue:"",venueQuery:""},
    contact:{name:"Talent Acquisition — Fresher Hiring",title:"",phone:"",email:""}
  };
}

async function getJSON(url){ const r=await fetch(url,{headers:{"accept":"application/json"}}); if(!r.ok) throw new Error(url+" -> "+r.status); return r.json(); }

async function fromGreenhouse(s){
  const d=await getJSON(`https://boards-api.greenhouse.io/v1/boards/${s.slug}/jobs`);
  return (d.jobs||[]).map(j=>({title:j.title,url:j.absolute_url,loc:(j.location&&j.location.name)||"",posted:(j.updated_at||"").slice(0,10)}));
}
async function fromLever(s){
  const d=await getJSON(`https://api.lever.co/v0/postings/${s.slug}?mode=json`);
  return (d||[]).map(j=>({title:j.text,url:j.hostedUrl,loc:(j.categories&&j.categories.location)||"",posted:j.createdAt?new Date(j.createdAt).toISOString().slice(0,10):""}));
}
async function fromAshby(s){
  const d=await getJSON(`https://api.ashbyhq.com/posting-api/job-board/${s.slug}`);
  return (d.jobs||[]).map(j=>({title:j.title,url:j.jobUrl,loc:j.locationName||j.location||"",posted:(j.publishedDate||"").slice(0,10)}));
}
async function fromSmartRecruiters(s){
  const d=await getJSON(`https://api.smartrecruiters.com/v1/companies/${s.slug}/postings`);
  return (d.content||[]).map(j=>({title:j.name,url:`https://jobs.smartrecruiters.com/${s.slug}/${j.id}`,loc:[j.location&&j.location.city,j.location&&j.location.region].filter(Boolean).join(", "),posted:(j.releasedDate||"").slice(0,10)}));
}
const FETCHERS={greenhouse:fromGreenhouse,lever:fromLever,ashby:fromAshby,smartrecruiters:fromSmartRecruiters};

async function main(){
  const out=[];
  for(const s of SOURCES){
    const fn=FETCHERS[s.ats];
    if(!fn){ console.warn("Unknown ats for",s.co); continue; }
    try{
      const rows=await fn(s);
      let kept=0;
      for(const r of rows){
        if(!r.title||!r.url) continue;
        if(!LOC_RE.test(r.loc||"")) continue;                 // Telangana/AP/India only
        if(!FRESH_RE.test(r.title)) continue;                  // fresher-level only
        out.push(toEntry(s.co,r.title,r.url,r.loc,s.deptDefault,r.posted));
        kept++;
      }
      console.log(`${s.co} (${s.ats}): ${kept} kept of ${rows.length}`);
    }catch(e){ console.warn(`${s.co}: skipped — ${e.message}`); }
  }
  // newest first, cap to keep the file small
  out.sort((a,b)=>(b.posted||"").localeCompare(a.posted||""));
  const capped=out.slice(0,200);
  writeFileSync("jobs.json", JSON.stringify(capped,null,0));
  console.log(`Wrote jobs.json with ${capped.length} auto-fetched listings.`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
