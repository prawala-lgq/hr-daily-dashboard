// ============================================================
// HRFlow — DB.JS
// Database — Google Apps Script, loadFromDB, helpers
// ============================================================

async function dbGet(action){
  if(!HAS_DB)return null;
  try{const r=await fetch(GAS_URL+'?action='+action);return await r.json();}catch(e){return null;}
}
async function dbPost(body){
  if(!HAS_DB)return null;
  try{const r=await fetch(GAS_URL,{method:'POST',body:JSON.stringify(body)});return await r.json();}catch(e){return null;}
}
async function loadFromDB(){
  if(!HAS_DB){tasks=[...DEFAULT_TASKS];updateBadge();render();return;}
  showDBStatus('Memuat data...');
  // Load tasks dan projects selalu fresh dari Sheets
  const [res, pres] = await Promise.all([dbGet('getTasks'), dbGet('getProjects')]);
  if(res&&res.tasks&&res.tasks.length>0){tasks=res.tasks;}else{tasks=[...DEFAULT_TASKS];}
  if(pres&&pres.projects&&pres.projects.length>0){
    projects=pres.projects;
    rebuildProjectMaps();
    renderSidebarProjects();
  }
  hideDBStatus();updateBadge();render();
}

function renderSidebarProjects(){
  const container=document.getElementById('sidebar-projects');
  if(!container)return;
  const pColors2=['#6C63D4','#1a9e72','#c85428','#2e7dd6','#b07010','#7F77DD','#D4547A','#0F9D9D'];
  container.innerHTML=projects.map((p,i)=>{
    const color=p.color||pColors2[i%pColors2.length];
    return`<div class="ni" onclick="nav('projects')"><div class="pdot" style="background:${color}"></div>${p.name}</div>`;
  }).join('');
}
function showDBStatus(msg){
  let el=document.getElementById('db-status');
  if(!el){el=document.createElement('div');el.id='db-status';el.style.cssText='position:fixed;bottom:16px;right:16px;background:var(--tx1);color:var(--bg1);padding:8px 14px;border-radius:8px;font-size:12px;z-index:999';document.body.appendChild(el);}
  el.textContent=msg;el.style.display='block';
}
function hideDBStatus(){const el=document.getElementById('db-status');if(el)el.style.display='none';}

function isToday(d){if(!d)return false;const a=new Date(d),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);return a.getTime()===b.getTime()}
function isOverdue(d){if(!d)return false;const a=new Date(d),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);return a<b}
function fmtDue(d){
  if(!d)return'—';const dt=new Date(d),t=new Date();dt.setHours(0,0,0,0);t.setHours(0,0,0,0);
  const diff=Math.round((dt-t)/86400000);
  if(diff<0)return'<span style="color:var(--red-tx);font-weight:500">Overdue</span>';
  if(diff===0)return'<span style="color:var(--red-tx);font-weight:500">Hari ini</span>';
  if(diff===1)return'<span style="color:var(--ylw-tx)">Besok</span>';
  return dt.toLocaleDateString('id-ID',{day:'numeric',month:'short'});
}
function updateBadge(){document.getElementById('open-cnt').textContent=tasks.filter(t=>!t.done).length}

// 1. UPDATE: Panggil API Netlify dengan penanganan Error yang lebih baik
