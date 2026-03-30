// ============================================================
// HRFlow — CONFIG.JS
// State, konstanta, project colors, data default
// ============================================================

// STATE
let dark=false,view='dashboard',briefText='',briefLoading=false,newsItems=[],newsLoading=false;
let searchQuery='',filterProject='',filterPrio='',filterStatus='all';
const today=new Date();
const todayISO=today.toISOString().split('T')[0];
const todayFmt=today.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const FIXED_pBg={'Recruitment 2024':'var(--acc-bg)','Onboarding Flow':'var(--grn-bg)','Policy Review':'var(--red-bg)','Payroll Audit':'var(--blu-bg)','Training Program':'var(--ylw-bg)'};
const FIXED_pTx={'Recruitment 2024':'var(--acc-tx)','Onboarding Flow':'var(--grn-tx)','Policy Review':'var(--red-tx)','Payroll Audit':'var(--blu-tx)','Training Program':'var(--ylw-tx)'};
const BG_VARS=['var(--acc-bg)','var(--grn-bg)','var(--red-bg)','var(--blu-bg)','var(--ylw-bg)','var(--acc-bg)','var(--grn-bg)','var(--blu-bg)'];
const TX_VARS=['var(--acc-tx)','var(--grn-tx)','var(--red-tx)','var(--blu-tx)','var(--ylw-tx)','var(--acc-tx)','var(--grn-tx)','var(--blu-tx)'];
let pBg={...FIXED_pBg};
let pTx={...FIXED_pTx};

function rebuildProjectMaps(){
  projects.forEach((p,i)=>{
    if(!pBg[p.name]) pBg[p.name]=BG_VARS[i%BG_VARS.length];
    if(!pTx[p.name]) pTx[p.name]=TX_VARS[i%TX_VARS.length];
  });
}
const catStyle={'HC':'background:var(--acc-bg);color:var(--acc-tx)','Gen-AI':'background:var(--grn-bg);color:var(--grn-tx)','Learning':'background:var(--ylw-bg);color:var(--ylw-tx)','Industry':'background:var(--blu-bg);color:var(--blu-tx)','System':'background:var(--red-bg);color:var(--red-tx)'};

// ── GANTI dengan URL Google Apps Script kamu setelah deploy ──
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwFrlKUVAPQfXCqdrA0RAr6IImrQzKhUBzJQ3TIRjXScLK6_lvRZxVa6xH6owf_i8mKcw/exec';
const HAS_DB  = GAS_URL !== 'MASUKKAN_APPS_SCRIPT_URL_DISINI';

let tasks=[];
let projects=[
  {name:'Recruitment 2024',color:'#6C63D4',tasks:12,done:7,deadline:'Apr 2026'},
  {name:'Onboarding Flow',color:'#1a9e72',tasks:8,done:5,deadline:'Mar 2026'},
  {name:'Policy Review',color:'#c85428',tasks:15,done:4,deadline:'May 2026'},
  {name:'Payroll Audit',color:'#2e7dd6',tasks:6,done:1,deadline:'Mar 2026'},
  {name:'Training Program',color:'#b07010',tasks:10,done:3,deadline:'Jun 2026'},
];
const DEFAULT_TASKS=[
  {id:'t1',name:'Review 5 kandidat CV Frontend Dev',project:'Recruitment 2024',due:'2026-03-13',prio:'high',progress:40,done:false,notes:''},
  {id:'t2',name:'Finalisasi onboarding checklist Q1',project:'Onboarding Flow',due:'2026-03-13',prio:'high',progress:75,done:false,notes:''},
  {id:'t3',name:'Update employee handbook v2',project:'Policy Review',due:'2026-03-15',prio:'med',progress:30,done:false,notes:''},
  {id:'t4',name:'Prepare Q1 payroll report',project:'Payroll Audit',due:'2026-03-17',prio:'med',progress:20,done:false,notes:''},
  {id:'t5',name:'Kirim offer letter — Anisa S.',project:'Recruitment 2024',due:'2026-03-15',prio:'med',progress:90,done:false,notes:''},
  {id:'t6',name:'Setup Google Meet orientasi karyawan baru',project:'Onboarding Flow',due:'2026-03-18',prio:'low',progress:10,done:false,notes:''},
];
