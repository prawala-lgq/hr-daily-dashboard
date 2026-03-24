// STATE
let dark=false,view='dashboard',briefText='',briefLoading=false,newsItems=[],newsLoading=false;
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
async function callGemini(prompt, requireJson = false){
  // API key aman — dipanggil via Netlify Function, tidak terekspos di browser
  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  if(requireJson) payload.generationConfig = { responseMimeType: 'application/json' };

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if(!res.ok || data.error) throw new Error(data.error?.message || 'Gagal menghubungi Gemini');
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── DAILY CACHE (localStorage) ────────────────────────────────
// Semua AI content di-cache per hari → hemat token, tidak generate ulang saat refresh
const CACHE_KEY_BRIEF = 'hrflow_brief';
const CACHE_KEY_NEWS  = 'hrflow_news';

function getCacheDate(){ return new Date().toISOString().split('T')[0];
}

function saveCache(key, data){
  try{
    localStorage.setItem(key, JSON.stringify({ date: getCacheDate(), data }));
  }catch(e){}
}

function loadCache(key){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(parsed.date !== getCacheDate()) return null; // expired (hari berbeda)
    return parsed.data;
  }catch(e){ return null;
  }
}

function clearTodayCache(){
  localStorage.removeItem(CACHE_KEY_BRIEF);
  localStorage.removeItem(CACHE_KEY_NEWS);
  briefText=''; newsItems=[];
  fetchBriefing(); fetchNews();
  showDBStatus('Cache direset, regenerating...');
  setTimeout(hideDBStatus, 2000);
}

async function fetchBriefing(forceRefresh=false){
  if(briefLoading) return;
  // Cek cache dulu — kalau ada dan masih hari ini, langsung pakai
  if(!forceRefresh){
    const cached = loadCache(CACHE_KEY_BRIEF);
    if(cached){ briefText=cached; render(); return; }
  }

  briefLoading=true; render();
  const open=tasks.filter(t=>!t.done);
  const overdue=open.filter(t=>isOverdue(t.due));
  const todayT=open.filter(t=>isToday(t.due));
  const high=open.filter(t=>t.prio==='high');
  const taskList=open.slice(0,7).map(t=>`- ${t.name} (${t.project}, due: ${t.due}, prioritas: ${t.prio})`).join('\n');
  const prompt=`Kamu adalah asisten HC cerdas untuk Araw di Logique.
  Hari ini ${todayFmt}.\n\nTask belum selesai:\n${taskList}\n\nRingkasan: ${open.length} task terbuka, ${overdue.length} overdue, ${todayT.length} due hari ini, ${high.length} high priority.\n\nTulis daily briefing singkat (3-4 kalimat).
  Isi:\n1. Sapa Araw\n2. Apa yang urgent\n3. Satu rekomendasi\n4. Semangat penutup\n\nMaksimal 75 kata. Langsung ke poin.`;
  try{
    briefText = await callGemini(prompt, false);
    saveCache(CACHE_KEY_BRIEF, briefText);
  // simpan ke cache
  } catch(e){
    briefText=`Gagal memuat briefing: ${e.message}`;
  }
  briefLoading=false; render();
}

// 2. UPDATE: Paksa JSON format saat menarik berita
async function fetchNews(forceRefresh=false){
  if(newsLoading) return;
  if(!forceRefresh && newsItems.length>0) return;
  // Cek cache — kalau ada dan masih hari ini, langsung pakai
  if(!forceRefresh){
    const cached = loadCache(CACHE_KEY_NEWS);
    if(cached){ newsItems=cached; render(); return; }
  }

  newsLoading=true; render();
  const prompt=`Buat 8 item berita relevan untuk HC manager di IT Indonesia.
  Hari ini ${todayFmt}.\nReturn HANYA JSON array valid dengan struktur: [{"title":"...","category":"HC","source":"...","timeAgo":"2 jam lalu","summary":"Satu kalimat max 15 kata."}]`;
  try{
    let raw = await callGemini(prompt, true);
    raw = raw.replace(/```json|```/g, '').trim();
    newsItems = JSON.parse(raw);
    saveCache(CACHE_KEY_NEWS, newsItems);
  // simpan ke cache
  }catch(e){
    newsItems=[{title:`Pesan Error: ${e.message}`,category:'System',source:'Log Error',timeAgo:'Sekarang',summary:'Gagal memproses data dari AI.
  Cek konfigurasi API Key atau kuota Anda.'}];
  }
  newsLoading=false; render();
}

// 3. UPDATE: Paksa JSON format saat memfilter berita
async function filterNews(cat){
  newsItems=[];newsLoading=true;render();
  const prompt=`Buat 6 berita relevan kategori "${cat}" untuk HC manager di perusahaan IT Indonesia, ${todayFmt}.
  Return HANYA JSON array: [{"title":"...","category":"${cat}","source":"...","timeAgo":"...","summary":"max 12 kata"}]`;
  
  try{
    let raw = await callGemini(prompt, true);
    raw = raw.replace(/```json|```/g,'').trim();
    newsItems = JSON.parse(raw);
  }catch(e){
    newsItems=[{title:`Pesan Error: ${e.message}`,category:'System',source:'Log Error',timeAgo:'Sekarang',summary:'Gagal memfilter kategori.'}];
  }
  newsLoading=false;render();
}

function toggleDark(){dark=!dark;document.getElementById('app').classList.toggle('dark',dark);document.getElementById('theme-btn').textContent=dark?'☀️':'🌙'}
function nav(v){
  view=v;
  document.querySelectorAll('.ni[id^="nav-"]').forEach(el=>el.classList.remove('active'));
  const el=document.getElementById('nav-'+v);if(el)el.classList.add('active');
  document.getElementById('pg-title').textContent={dashboard:'Dashboard',tasks:'My Tasks',kanban:'Kanban Board',projects:'Projects',news:'HC News & Learning'}[v]||v;
  render();
  if(v==='news'&&!newsItems.length&&!newsLoading)fetchNews();
}
function triggerBriefing(force=false){nav('dashboard');fetchBriefing(force);}
function openModal(){
  document.getElementById('f-name').value='';
  document.getElementById('f-due').value=todayISO;
  document.getElementById('f-notes').value='';
  document.getElementById('f-prio').value='med';
  // Populate project dropdown dari data terkini
  const sel=document.getElementById('f-proj');
  sel.innerHTML=projects.map(p=>`<option value="${p.name}">${p.name}</option>`).join('');
  document.getElementById('modal').style.display='flex';
  setTimeout(()=>document.getElementById('f-name').focus(),50);
}
function closeModal(){document.getElementById('modal').style.display='none';}
function closeModalOutside(e){if(e.target===document.getElementById('modal'))closeModal();}
async function saveTask(){
  const name=document.getElementById('f-name').value.trim();if(!name)return;
  const task={id:'task_'+Date.now(),name,project:document.getElementById('f-proj').value,due:document.getElementById('f-due').value,prio:document.getElementById('f-prio').value,progress:0,done:false,notes:document.getElementById('f-notes').value.trim()};
  tasks.unshift(task);
  closeModal();updateBadge();render();
  showDBStatus('Menyimpan task...');
  const res=await dbPost({action:'addTask',task});
  if(res&&res.id){task.id=res.id;}
  hideDBStatus();
}
async function toggleTask(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  t.done=!t.done;if(t.done)t.progress=100;
  updateBadge();render();
  await dbPost({action:'updateTask',task:t});
}

function taskRow(t){
  const tid = JSON.stringify(t.id);
  return`<div class="tr" onclick="openTaskDetail(${tid})" style="cursor:pointer">
    <div class="chk${t.done?' done':''}" onclick="event.stopPropagation();toggleTask(${tid})">${t.done?'✓':''}</div>
    <div class="tname${t.done?' done':''}">${t.name}</div>
    <span class="ptag" style="background:${pBg[t.project]||'var(--bg2)'};color:${pTx[t.project]||'var(--tx2)'}">${t.project}</span>
    <span class="dtag">${fmtDue(t.due)}</span>
    <span class="prio ${t.prio==='high'?'ph-prio':t.prio==='med'?'pm-prio':'pl-prio'}">${t.prio==='high'?'High':t.prio==='med'?'Med':'Low'}</span>
    <div class="pbar" title="Klik % untuk update" style="cursor:pointer" onclick="event.stopPropagation();updateProgress(${tid})"><div class="pbar-fill" style="width:${t.progress}%"></div></div>
    <span class="pct" style="cursor:pointer" onclick="event.stopPropagation();updateProgress(${tid})">${t.progress}%</span>
  </div>`;
}

function render(){
  const c=document.getElementById('content');
  const open=tasks.filter(t=>!t.done);
  const todayT=open.filter(t=>isToday(t.due));
  const overdue=open.filter(t=>isOverdue(t.due));
  document.getElementById('pg-sub').textContent=`${open.length} task terbuka · ${todayT.length} due hari ini${overdue.length?` · ${overdue.length} overdue`:''}`;

  if(view==='dashboard'){
    const done=tasks.filter(t=>t.done).length;
    const high=open.filter(t=>t.prio==='high').length;
    const briefSection=briefLoading?`<div class="ai-body loading-pulse">✦ Gemini sedang membuat briefing harian kamu...</div>`:briefText?`<div class="ai-body">${briefText}</div>`:`<div class="ai-body" style="color:var(--tx3)">Klik "Gemini Briefing" di atas untuk AI summary harian.</div>`;
    const priorityTasks=[...open.filter(t=>isOverdue(t.due)||isToday(t.due)||t.prio==='high')].slice(0,5);
    c.innerHTML=`
    <div class="ai-brief">
      <div class="ai-header"><div class="ai-orb">✦</div><div><div class="ai-title">Daily Briefing by Gemini</div><div class="ai-date">${todayFmt}</div></div></div>
      ${briefSection}
      <div class="ai-chips">
        <span class="chip" onclick="triggerBriefing(true)">↻ Refresh briefing</span>
        <span class="chip" onclick="nav('news')">📰 Berita HC hari ini</span>
        <span class="chip" onclick="nav('kanban')">📋 Lihat Kanban</span>
        <span class="chip" onclick="generateNewsletter()">✉ Generate Newsletter</span>
        <span class="chip" onclick="clearTodayCache()" style="color:var(--tx3)">↺ Reset cache hari ini</span>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-lbl">Task terbuka</div><div class="stat-val">${open.length}</div><div class="stat-note" style="color:var(--ylw-tx)">${high} high priority</div></div>
      <div class="stat"><div class="stat-lbl">Due hari ini</div><div class="stat-val" style="color:${todayT.length?'var(--red-tx)':'inherit'}">${todayT.length}</div><div class="stat-note" style="color:var(--red-tx)">${overdue.length} overdue</div></div>
      <div class="stat"><div class="stat-lbl">Selesai</div><div class="stat-val" style="color:var(--grn)">${done}</div><div class="stat-note" style="color:var(--grn-tx)">sprint ini</div></div>
      <div class="stat"><div class="stat-lbl">Projects</div><div class="stat-val">${projects.length}</div><div class="stat-note" style="color:var(--blu-tx)">aktif</div></div>
    </div>
    <div class="panels">
      <div><div class="panel">
        <div class="ph"><span class="ph-title">Task prioritas hari ini</span><button class="btn" onclick="openModal()" style="font-size:11px;padding:4px 9px">+ 
  Tambah</button></div>
        ${[...priorityTasks,...tasks.filter(t=>t.done).slice(0,1)].map(taskRow).join('')}
        <div style="padding:8px 14px;font-size:11px;color:var(--tx3);text-align:center;cursor:pointer;border-top:1px solid var(--bd)" onclick="nav('tasks')">Lihat semua ${tasks.length} task →</div>
      </div></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="panel">
          <div class="ph"><span class="ph-title">Projects</span><span class="ph-link" onclick="nav('projects')">Lihat semua</span></div>
          ${projects.map(p=>{const total=Number(p.totalTasks||p.tasks||0);const doneN=Number(p.doneTasks||p.done||0);const pct=total>0?Math.round(doneN/total*100):0;return`<div class="proj-item"><div class="pdot" style="background:${p.color}"></div><div class="proj-info"><div class="proj-name">${p.name}</div><div class="proj-meta">${doneN}/${total} task · ${(p.deadline||'').replace(/T.*/,'') ||
  p.deadline || '—'}</div><div class="proj-bar"><div class="proj-bar-fill" style="background:${p.color};width:${pct}%"></div></div></div><div class="proj-pct">${pct}%</div></div>`;}).join('')}
        </div>
        <div class="panel">
          <div class="ph"><span class="ph-title">📰 HC News</span><span class="ph-link" onclick="nav('news')">Semua</span></div>
          ${newsItems.length?newsItems.slice(0,3).map((n, i)=>`<div class="news-item" onclick="openNewsDetail(${i})"><span class="ncat" style="${catStyle[n.category]||''}">${n.category}</span><div class="ntitle">${n.title}</div><div class="nsumm">${n.summary||''}</div><div class="nmeta">${n.source} · ${n.timeAgo}</div></div>`).join(''):newsLoading?`<div style="padding:14px;text-align:center;font-size:11px;color:var(--tx3)" class="loading-pulse">Memuat berita...</div>`:`<div style="padding:14px;text-align:center;font-size:11px;color:var(--tx3);cursor:pointer" onclick="fetchNews()">Klik untuk muat berita HC →</div>`}
        </div>
      </div>
    </div>`;
    if(!briefText&&!briefLoading)fetchBriefing();
    if(!newsItems.length&&!newsLoading)fetchNews();

  } else if(view==='tasks'){
    const sorted=[...tasks.filter(t=>isOverdue(t.due)&&!t.done),...tasks.filter(t=>isToday(t.due)&&!t.done),...tasks.filter(t=>!isOverdue(t.due)&&!isToday(t.due)&&!t.done),...tasks.filter(t=>t.done)];
    c.innerHTML=`<div class="panel"><div class="ph"><span class="ph-title">Semua task (${tasks.length})</span><button class="btn primary" onclick="openModal()" style="font-size:11px;padding:4px 12px">+ Tambah task</button></div>${sorted.map(taskRow).join('')}</div>`;
  } else if(view==='kanban'){
  document.getElementById('pg-title').textContent='Kanban Board';
  const colDefs=[
    {label:'To Do',key:'todo',filter:t=>t.progress===0&&!t.done,prog:0,done:false},
    {label:'In Progress',key:'prog',filter:t=>t.progress>0&&t.progress<100&&!t.done,prog:50,done:false},
    {label:'Done',key:'done',filter:t=>t.done,prog:100,done:true}
  ];
  c.innerHTML=`
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px">
    ${colDefs.map(col=>`
    <div class="panel" style="overflow:visible" id="kancol-${col.key}"
      ondragover="event.preventDefault();document.getElementById('kancol-${col.key}').style.outline='2px dashed var(--acc)'"
      ondragleave="document.getElementById('kancol-${col.key}').style.outline=''"
      ondrop="dropTask(event,'${col.key}');document.getElementById('kancol-${col.key}').style.outline=''">
      <div class="ph">
        <span class="ph-title" style="text-transform:uppercase;font-size:10px;letter-spacing:.06em">${col.label}</span>
        <span class="col-cnt" style="background:var(--bg2);border:1px solid var(--bd);border-radius:7px;padding:1px 7px;font-size:10px;color:var(--tx3)">${tasks.filter(col.filter).length}</span>
      </div>
      <div style="padding:8px">
        ${tasks.filter(col.filter).map(t=>`
        <div class="kcard" draggable="true"
     
          ondragstart="dragTask(event,${JSON.stringify(t.id)})"
          style="cursor:grab;user-select:none">
          <div class="kcard-title">${t.name}</div>
          <div style="margin-bottom:5px">
            <span class="ptag" style="font-size:10px;background:${pBg[t.project]||'var(--bg2)'};color:${pTx[t.project]||'var(--tx2)'}">${t.project}</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span class="prio ${t.prio==='high'?'ph-prio':t.prio==='med'?'pm-prio':'pl-prio'}" style="font-size:9.5px">${t.prio}</span>
            <span 
  class="kcard-meta">${fmtDue(t.due)}</span>
          </div>
          <div style="display:flex;gap:4px">
            <button onclick="moveTask(${JSON.stringify(t.id)},'prev')" style="flex:1;padding:3px;border-radius:5px;border:1px solid var(--bd);background:var(--bg2);cursor:pointer;font-size:10px;color:var(--tx2)" title="Mundur">←</button>
            <button onclick="moveTask(${JSON.stringify(t.id)},'next')" style="flex:1;padding:3px;border-radius:5px;border:1px solid var(--bd);background:var(--acc);cursor:pointer;font-size:10px;color:#fff" title="Maju">→</button>
          </div>
          ${t.progress>0&&!t.done?`<div class="kcard-bar" style="margin-top:6px"><div class="kcard-bar-fill" style="width:${t.progress}%"></div></div>`:''}
        </div>`).join('')}
        ${tasks.filter(col.filter).length===0?`<div style="padding:20px;text-align:center;color:var(--tx3);font-size:11px;border:1.5px dashed var(--bd);border-radius:8px">Kosong</div>`:''}
  
      </div>
    </div>`).join('')}
  </div>`;
  } else if(view==='projects'){
    c.innerHTML=`<div class="panel"><div class="ph"><span class="ph-title">Projects aktif (${projects.length})</span><button class="btn primary" style="font-size:11px;padding:4px 12px">+ Project baru</button></div>${projects.map(p=>{const total=Number(p.totalTasks||p.tasks||0);const doneN=Number(p.doneTasks||p.done||0);const pct=total>0?Math.round(doneN/total*100):0;return`<div class="proj-item" style="padding:13px 16px"><div class="pdot" style="background:${p.color};width:10px;height:10px"></div><div class="proj-info"><div class="proj-name">${p.name}</div><div class="proj-meta">${doneN} dari ${total} task selesai · Deadline: ${p.deadline||'—'}</div><div class="proj-bar" style="height:5px;margin-top:7px"><div class="proj-bar-fill" style="background:${p.color};width:${pct}%"></div></div></div><div class="proj-pct" style="font-size:14px">${pct}%</div></div>`;}).join('')}</div>`;
  } else if(view==='news'){
    c.innerHTML=`
    <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
      ${['HC','Gen-AI','Learning','Industry'].map(cat=>`<button class="btn" style="font-size:11px;padding:5px 11px" onclick="filterNews('${cat}')">${cat}</button>`).join('')}
      <button class="btn gem" style="font-size:11px;padding:5px 12px;margin-left:auto" onclick="generateNewsletter()">✦ Generate Newsletter</button>
    </div>
    <div style="background:var(--acc-bg);border:1px solid var(--bd);border-radius:var(--radius);padding:10px 14px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:500;color:var(--acc-tx);margin-bottom:3px">📧 Daily Newsletter</div>
      <div style="font-size:11px;color:var(--tx2)">Klik "Generate Newsletter" — Gemini akan buatkan rangkuman dalam format siap kirim.</div>
    </div>
    <div class="panel">
      <div class="ph"><span class="ph-title">HC Intelligence · ${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long'})}</span><span style="font-size:10.5px;color:var(--tx3)">Dikurasi Gemini AI</span></div>
   
      ${newsLoading?`<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px" class="loading-pulse">Gemini sedang mengkurasi berita...</div>`:newsItems.map((n, i)=>`<div class="news-item" onclick="openNewsDetail(${i})"><span class="ncat" style="${catStyle[n.category]||''}">${n.category}</span><div class="ntitle">${n.title}</div><div class="nsumm">${n.summary||''}</div><div class="nmeta">${n.source} · ${n.timeAgo}</div></div>`).join('')}
    </div>`;
    if(!newsItems.length&&!newsLoading)fetchNews();
  }
}

function openNewsDetail(index) {
  const news = newsItems[index];
  if(!news) return;
  
  document.getElementById('dm-title').textContent = news.title;
  if (news.category === 'System') {
    document.getElementById('dm-meta').innerHTML = `<span class="ncat" style="${catStyle['System']}">${news.category}</span>`;
    document.getElementById('dm-content').textContent = news.summary + "\n\nPastikan API Key Anda aktif dan memiliki kuota yang cukup.";
    document.getElementById('dm-action-container').innerHTML = `<button class="btn" onclick="document.getElementById('detail-modal').style.display='none'">Tutup</button>`;
  } else {
    document.getElementById('dm-meta').innerHTML = `<span class="ncat" style="${catStyle[news.category]||''}">${news.category}</span> · ${news.source} · ${news.timeAgo}`;
    document.getElementById('dm-content').textContent = news.summary + "\n\n✦ Di-generate oleh Gemini. Klik 'Cari Artikel' untuk membaca berita selengkapnya di Google.";
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(news.title + ' ' + news.source)}`;
    document.getElementById('dm-action-container').innerHTML = `
      <button class="btn" onclick="document.getElementById('detail-modal').style.display='none'">Tutup</button>
      <a href="${searchUrl}" target="_blank" class="btn primary" style="text-decoration:none;">Cari Artikel ↗</a>
    `;
  }
  
  document.getElementById('detail-modal').style.display = 'flex';
}

async function generateNewsletter(){
  const taskList=tasks.filter(t=>!t.done).slice(0,5).map(t=>`- ${t.name}`).join('\n');
  const prompt=`Buatkan daily HC newsletter dalam Bahasa Indonesia untuk Araw.
  Hari ini: ${todayFmt}\nTask terbuka: ${tasks.filter(t=>!t.done).length} task:\n${taskList}\n\nFormat:\n📌 Subject line menarik\n\nSalam pembuka personal untuk Araw\n\n3 headline berita HC/AI terkini\n\n💡 Tips HC minggu ini\n\n📚 1 rekomendasi kursus gratis\n\nPenutup motivasi\n\n— HRFlow · Logique\n\nBahasa santai tapi profesional, max 250 kata.`;
  try {
    document.getElementById('detail-modal').style.display = 'flex';
    document.getElementById('dm-title').textContent = "Membuat Newsletter...";
    document.getElementById('dm-meta').textContent = "Mohon tunggu sebentar, Gemini sedang mengetik ✦";
    document.getElementById('dm-content').innerHTML = '<div class="loading-pulse">Generating konten...</div>';
    document.getElementById('dm-action-container').innerHTML = '';
    const result = await callGemini(prompt, false);
    
    document.getElementById('dm-title').textContent = "📧 Daily HC Newsletter";
    document.getElementById('dm-meta').textContent = "Dikurasi khusus untuk Araw oleh Gemini AI";
    document.getElementById('dm-content').textContent = result;
    document.getElementById('dm-action-container').innerHTML = `
      <button class="btn" onclick="document.getElementById('detail-modal').style.display='none'">Tutup</button>
      <button class="btn primary" onclick="alert('Fitur kirim ke prawala@logique.co.id akan dikerjakan di tahap integrasi Google Workspace!')">Kirim Email</button>
    `;
  } catch(e) {
    document.getElementById('dm-title').textContent = "Error";
    document.getElementById('dm-content').textContent = "Gagal memuat: " + e.message;
    document.getElementById('dm-action-container').innerHTML = `<button class="btn" onclick="document.getElementById('detail-modal').style.display='none'">Tutup</button>`;
  }
}


// ── KANBAN DRAG & DROP + MOVE ─────────────────────────────────
let draggedTaskId = null;
function dragTask(event, id){
  draggedTaskId = id;
  event.dataTransfer.effectAllowed = 'move';
}

function dropTask(event, colKey){
  event.preventDefault();
  if(!draggedTaskId) return;
  moveTaskToCol(draggedTaskId, colKey);
  draggedTaskId = null;
}

function moveTask(id, direction){
  const t = tasks.find(x=>String(x.id)===String(id));
  if(!t) return;
  const cols = ['todo','prog','done'];
  const cur = t.done ? 'done' : t.progress===0 ? 'todo' : 'prog';
  const idx = cols.indexOf(cur);
  if(direction==='next' && idx<2) moveTaskToCol(id, cols[idx+1]);
  if(direction==='prev' && idx>0) moveTaskToCol(id, cols[idx-1]);
}

async function moveTaskToCol(id, colKey){
  const t = tasks.find(x=>String(x.id)===String(id));
  if(!t) return;
  if(colKey==='todo')  { t.progress=0;  t.done=false; }
  if(colKey==='prog')  { t.progress=t.progress>0&&t.progress<100?t.progress:50; t.done=false; }
  if(colKey==='done')  { t.progress=100;
  t.done=true; }
  updateBadge(); render();
  await dbPost({action:'updateTask', task:t});
}


function updateProgress(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  const val=prompt(`Update progress "${t.name}" (0-100%):`, t.progress);
  if(val===null)return;
  const num=Math.min(100,Math.max(0,parseInt(val)||0));
  t.progress=num;
  if(num===100){t.done=true;}
  updateBadge();render();
  dbPost({action:'updateTask',task:t});
}


function openTaskDetail(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  const tid=JSON.stringify(id);
  const catStyle_=pBg[t.project]||'var(--bg2)';
  const catTx_=pTx[t.project]||'var(--tx2)';
  let el=document.getElementById('task-detail-modal');
  if(el)el.remove();
  el=document.createElement('div');
  el.id='task-detail-modal';
  el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:300;padding:20px';
  el.onclick=function(e){if(e.target===el)el.remove();};
  const prioLabel=t.prio==='high'?'High':t.prio==='med'?'Medium':'Low';
  const prioStyle=t.prio==='high'?'background:var(--red-bg);color:var(--red-tx)':t.prio==='med'?'background:var(--ylw-bg);color:var(--ylw-tx)':'background:var(--grn-bg);color:var(--grn-tx)';
  el.innerHTML=`<div style="background:var(--bg1);border:1px solid var(--bd);border-radius:16px;padding:0;width:100%;max-width:480px;overflow:hidden">
    <div style="padding:16px 20px;border-bottom:1px solid var(--bd);display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
      <div>
        <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
          <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:5px;background:${catStyle_};color:${catTx_}">${t.project}</span>
          <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:5px;${prioStyle}">${prioLabel}</span>
          ${t.done?'<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:5px;background:var(--grn-bg);color:var(--grn-tx)">✓ Done</span>':''}
        </div>
        <div style="font-size:16px;font-weight:600;color:var(--tx1);line-height:1.35">${t.name}</div>
      </div>
      <button onclick="document.getElementById('task-detail-modal').remove()" style="background:none;border:none;cursor:pointer;font-size:22px;color:var(--tx3);flex-shrink:0;line-height:1">×</button>
    </div>
  
    <div style="padding:16px 20px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div style="font-size:10px;color:var(--tx3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em">Due Date</div>
          <div style="font-size:13px;font-weight:500;color:var(--tx1)">${fmtDue(t.due)||'—'}</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div style="font-size:10px;color:var(--tx3);margin-bottom:3px;text-transform:uppercase;letter-spacing:.05em">Progress</div>
          <div style="font-size:13px;font-weight:500;color:var(--tx1)">${t.progress}%</div>
        </div>
      </div>
   
      <div style="background:var(--bg2);border-radius:8px;padding:10px;margin-bottom:14px">
        <div style="height:6px;background:var(--bg3);border-radius:4px;overflow:hidden">
          <div style="height:100%;background:var(--grn);width:${t.progress}%;border-radius:4px;transition:width .3s"></div>
        </div>
      </div>
      ${t.notes?`<div style="background:var(--bg2);border-radius:8px;padding:10px;margin-bottom:14px;font-size:12.5px;color:var(--tx2);line-height:1.6">${t.notes}</div>`:''}
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--bd);display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="event.stopPropagation();toggleTask(${tid});document.getElementById('task-detail-modal').remove()" 
        class="btn ${t.done?'':'primary'}" style="font-size:11px;flex:1">
        ${t.done?'↩ Tandai belum selesai':'✓ Tandai selesai'}
      </button>
     
      <button onclick="event.stopPropagation();document.getElementById('task-detail-modal').remove();updateProgress(${tid})" 
        class="btn" style="font-size:11px">
        📊 Update %
      </button>
      <button onclick="event.stopPropagation();deleteTaskConfirm(${tid})" 
        class="btn" style="font-size:11px;color:var(--red-tx);border-color:var(--red-bg)">
        🗑 Hapus
      </button>
    </div>
  </div>`;
  document.body.appendChild(el);
}

async function deleteTaskConfirm(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  if(!confirm('Hapus task "'+t.name+'"?'))return;
  tasks=tasks.filter(x=>String(x.id)!==String(id));
  document.getElementById('task-detail-modal')?.remove();
  updateBadge();render();
  await dbPost({action:'deleteTask',id});
}

loadFromDB();
