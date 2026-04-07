// ============================================================
// HRFlow — UI.JS
// UI — dark mode, nav, modal, saveTask, toggleTask, dll
// ============================================================

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
  
  // Reset field KPI baru
  const tgtStart = document.getElementById('f-tgt-start');
  if(tgtStart) tgtStart.value = todayISO;
  const estDur = document.getElementById('f-est-dur');
  if(estDur) estDur.value = '1';

  // Populate project dropdown dari data terkini
  const sel=document.getElementById('f-proj');
  sel.innerHTML=projects.map(p=>`<option value="${p.name}">${p.name}</option>`).join('');
  
  // Ubah judul modal balik ke Tambah (buat nge-reset setelah dipakai edit)
  const modalTitle = document.querySelector('#modal h3');
  if(modalTitle) modalTitle.textContent = 'Tambah Task Baru';
  const saveBtn = document.querySelector('#modal .btn.primary');
  if(saveBtn) {
    saveBtn.textContent = 'Simpan Task';
    saveBtn.onclick = saveTask;
  }

  document.getElementById('modal').style.display='flex';
  setTimeout(()=>document.getElementById('f-name').focus(),50);
}

function closeModal(){document.getElementById('modal').style.display='none';}
function closeModalOutside(e){if(e.target===document.getElementById('modal'))closeModal();}

async function saveTask(){
  const name=document.getElementById('f-name').value.trim();if(!name)return;
  
  // Tangkap value KPI baru
  const tgtStartInput = document.getElementById('f-tgt-start');
  const estDurInput = document.getElementById('f-est-dur');
  
  const task={
    id:'task_'+Date.now(),
    name,
    project:document.getElementById('f-proj').value,
    due:document.getElementById('f-due').value,
    prio:document.getElementById('f-prio').value,
    progress:0,
    done:false,
    notes:document.getElementById('f-notes').value.trim(),
    targetStart: tgtStartInput ? tgtStartInput.value : '',
    estDuration: estDurInput ? parseInt(estDurInput.value) || 0 : 0,
    actualStart: '',
    completedAt: ''
  };
  
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
  // Refresh panel if open
  if(document.getElementById('task-panel')) openTaskDetail(id);
  await dbPost({action:'updateTask',task:t});
}

// ── NOTIFIKASI DUE DATE ───────────────────────────────────────
function checkDueNotifications(){
  const overdue = tasks.filter(t=>!t.done&&isOverdue(t.due));
  const dueToday = tasks.filter(t=>!t.done&&isToday(t.due));

  if(overdue.length===0&&dueToday.length===0) return;
  // Don't show if already dismissed today
  const dismissKey = 'hrflow_notif_dismissed';
  const dismissed = localStorage.getItem(dismissKey);
  if(dismissed===new Date().toISOString().split('T')[0]) return;

  let el=document.getElementById('due-notif');
  if(el) el.remove();
  el=document.createElement('div');
  el.id='due-notif';

  const hasOverdue = overdue.length>0;
  const bg = hasOverdue ? 'var(--red-bg)' : 'var(--ylw-bg)';
  const tx = hasOverdue ? 'var(--red-tx)' : 'var(--ylw-tx)';
  const bd = hasOverdue ? 'var(--red-tx)' : 'var(--ylw-tx)';

  let msg = '';
  if(overdue.length>0) msg += `<strong>${overdue.length} task overdue</strong>`;
  if(overdue.length>0&&dueToday.length>0) msg += ' · ';
  if(dueToday.length>0) msg += `<strong>${dueToday.length} task due hari ini</strong>`;

  const taskNames = [...overdue,...dueToday].slice(0,3).map(t=>
    `<span style="cursor:pointer;text-decoration:underline" onclick="openTaskDetail(${JSON.stringify(t.id)})">${t.name}</span>`
  ).join(', ');

  el.style.cssText=`position:fixed;top:0;left:0;right:0;z-index:200;background:${bg};border-bottom:1px solid ${bd};padding:10px 20px;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:${tx}`;
  el.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:16px">${hasOverdue?'🔴':'🟡'}</span>
      <span>${msg}: ${taskNames}${([...overdue,...dueToday].length>3?` <em>+${[...overdue,...dueToday].length-3} lainnya</em>`:'')}</span>
    </div>
    <div style="display:flex;gap:8px;flex-shrink:0">
      <button onclick="nav('tasks')" style="background:${tx};color:${bg};border:none;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;font-family:inherit">Lihat tasks</button>
      <button onclick="dismissNotif()" style="background:none;border:1px solid ${bd};border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;color:${tx};font-family:inherit">Tutup</button>
    </div>`;
  document.body.prepend(el);

  // Offset topbar
  const topbar=document.querySelector('.topbar');
  if(topbar) topbar.style.marginTop='43px';
}

function dismissNotif(){
  const el=document.getElementById('due-notif');
  if(el){
    el.remove();
    const topbar=document.querySelector('.topbar');
    if(topbar) topbar.style.marginTop='';
  }
  localStorage.setItem('hrflow_notif_dismissed', new Date().toISOString().split('T')[0]);
}

// ── SEARCH & FILTER ───────────────────────────────────────────
function getFilteredTasks(){
  return tasks.filter(t=>{
    const q=searchQuery.toLowerCase();
    const matchSearch=!q||t.name.toLowerCase().includes(q)||t.project.toLowerCase().includes(q)||t.notes.toLowerCase().includes(q);
    const matchProject=!filterProject||t.project===filterProject;
    const matchPrio=!filterPrio||t.prio===filterPrio;
    const matchStatus=
      filterStatus==='all'||
      (filterStatus==='open'&&!t.done)||
      (filterStatus==='done'&&t.done)||
      (filterStatus==='overdue'&&!t.done&&isOverdue(t.due))||
      (filterStatus==='today'&&!t.done&&isToday(t.due));
    return matchSearch&&matchProject&&matchPrio&&matchStatus;
  });
}

function clearFilters(){
  searchQuery='';filterProject='';filterPrio='';filterStatus='all';
  const si=document.getElementById('search-input');
  if(si)si.value='';
  render();
}

function renderFilterBar(){
  const activeFilters=[searchQuery,filterProject,filterPrio,filterStatus!=='all'?filterStatus:''].filter(Boolean);
  return`<div style="display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid var(--bd);flex-wrap:wrap;align-items:center">
    <div style="flex:1;min-width:180px;display:flex;align-items:center;gap:6px;background:var(--bg2);border:1px solid var(--bd);border-radius:8px;padding:5px 10px">
      <span style="color:var(--tx3);font-size:13px">🔍</span>
      <input id="search-input" type="text" placeholder="Cari task..." value="${searchQuery}"
        style="border:none;background:none;outline:none;font-size:12.5px;color:var(--tx1);width:100%;font-family:inherit"
        oninput="searchQuery=this.value;render()">
    </div>
    <select onchange="filterProject=this.value;render()" style="padding:5px 8px;border-radius:8px;border:1px solid var(--bd);background:var(--bg2);font-size:12px;color:var(--tx1);font-family:inherit;cursor:pointer">
      <option value="">Semua project</option>
      ${projects.map(p=>`<option value="${p.name}"${filterProject===p.name?' selected':''}>${p.name}</option>`).join('')}
    </select>
    <select onchange="filterPrio=this.value;render()" style="padding:5px 8px;border-radius:8px;border:1px solid var(--bd);background:var(--bg2);font-size:12px;color:var(--tx1);font-family:inherit;cursor:pointer">
      <option value="">Semua prioritas</option>
      <option value="high"${filterPrio==='high'?' selected':''}>🔴 High</option>
      <option value="med"${filterPrio==='med'?' selected':''}>🟡 Medium</option>
      <option value="low"${filterPrio==='low'?' selected':''}>🟢 Low</option>
    </select>
    <select onchange="filterStatus=this.value;render()" style="padding:5px 8px;border-radius:8px;border:1px solid var(--bd);background:var(--bg2);font-size:12px;color:var(--tx1);font-family:inherit;cursor:pointer">
      <option value="all"${filterStatus==='all'?' selected':''}>Semua status</option>
      <option value="open"${filterStatus==='open'?' selected':''}>Open</option>
      <option value="today"${filterStatus==='today'?' selected':''}>Due hari ini</option>
      <option value="overdue"${filterStatus==='overdue'?' selected':''}>Overdue</option>
      <option value="done"${filterStatus==='done'?' selected':''}>Selesai</option>
    </select>
    ${activeFilters.length>0?`<button onclick="clearFilters()" style="padding:5px 10px;border-radius:8px;border:1px solid var(--bd);background:var(--red-bg);color:var(--red-tx);font-size:11px;cursor:pointer;font-family:inherit">✕ Reset filter</button>`:''}
    <span style="font-size:11px;color:var(--tx3);margin-left:auto">${getFilteredTasks().length} dari ${tasks.length} task</span>
  </div>`;
}
