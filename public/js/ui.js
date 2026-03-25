// ============================================================
// HRFlow — UI.JS
// UI — dark mode, nav, modal, saveTask, toggleTask
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
