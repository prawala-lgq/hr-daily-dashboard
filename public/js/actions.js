// ============================================================
// HRFlow — ACTIONS.JS
// Task actions — update progress & Subtasks Logic
// ============================================================

function updateProgress(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;

  const val=prompt(`Update progress "${t.name}" (0-100%):`, t.progress);
  if(val===null)return;
  const num=Math.min(100,Math.max(0,parseInt(val)||0));
  
  // Logic Tracking KPI: Rekam kapan mulai dan kapan selesai
  if (num > 0 && !t.actualStart) {
    t.actualStart = new Date().toISOString();
  }
  
  if (num === 100) {
    t.done = true;
    t.completedAt = new Date().toISOString();
  } else {
    t.done = false;
    t.completedAt = ''; // Reset jika progress dibatalkan dari 100%
  }

  t.progress=num;
  
  if (typeof updateBadge === 'function') updateBadge(); 
  render();
  dbPost({action:'updateTask',task:t});
}

// ============================================================
// ── SUBTASK & CHECKLIST LOGIC (WITH AI & HISTORY) ───────────
// ============================================================

function renderSubtasks(tid) {
  const t = tasks.find(x => String(x.id) === String(tid));
  if(!t) return '';
  const subs = t.subtasks || [];
  const doneCnt = subs.filter(s => s.done).length;
  const pct = subs.length ? Math.round((doneCnt / subs.length) * 100) : 0;

  let html = `<div style="margin-top:20px; margin-bottom:20px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div style="font-size:11.5px; font-weight:600; color:var(--tx3); text-transform:uppercase; letter-spacing:0.05em;">☑ Action Items / Checklist</div>
      <div style="display:flex; gap:6px;">
        <button class="btn" style="font-size:10.5px; padding:3px 8px; background:var(--bg2);" onclick="copySubtasks('${tid}')">📋 Copas dari History</button>
        <button class="btn gem" style="font-size:10.5px; padding:3px 8px;" onclick="generateSubtasksAI('${tid}', event)">✦ Breakdown AI</button>
      </div>
    </div>`;

  if(subs.length > 0) {
    html += `<div style="margin-bottom:12px; height:6px; background:var(--bg3); border-radius:3px; overflow:hidden;"><div style="height:100%; background:var(--acc); width:${pct}%; transition:width 0.3s ease;"></div></div>`;
  }

  html += `<div id="st-list-${tid}" style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">`;
  subs.forEach((s, i) => {
    html += `
    <div style="display:flex; align-items:center; gap:10px; font-size:13px; color:${s.done ? 'var(--tx3)' : 'var(--tx1)'}; text-decoration:${s.done ? 'line-through' : 'none'}; background:var(--bg2); padding:8px 12px; border-radius:6px; border:1px solid var(--bd);">
      <input type="checkbox" ${s.done ? 'checked' : ''} onclick="toggleSubtask('${tid}', ${i})" style="cursor:pointer; width:15px; height:15px; accent-color:var(--acc);">
      <span style="flex:1;">${s.title}</span>
      <button onclick="deleteSubtask('${tid}', ${i})" style="background:none; border:none; cursor:pointer; color:var(--red-tx); opacity:0.6; font-size:12px;" title="Hapus">✕</button>
    </div>`;
  });
  html += `</div>
    <div style="display:flex; gap:8px;">
      <input type="text" id="new-st-${tid}" placeholder="Ketik subtask baru lalu Enter..." style="flex:1; border:1px solid var(--bd); background:var(--bg1); border-radius:6px; padding:8px 12px; font-size:12.5px; color:var(--tx1); outline:none;" onkeydown="if(event.key==='Enter') addSubtask('${tid}')">
      <button class="btn primary" onclick="addSubtask('${tid}')" style="font-size:11.5px; padding:0 14px;">+ Add</button>
    </div>
  </div>`;
  
  return html;
}

async function addSubtask(tid) {
  const t = tasks.find(x => String(x.id) === String(tid));
  const inp = document.getElementById(`new-st-${tid}`);
  if(!t || !inp || !inp.value.trim()) return;

  if(!t.subtasks) t.subtasks = [];
  t.subtasks.push({ title: inp.value.trim(), done: false });
  inp.value = '';
  
  updateTaskProgress(t);
  if(typeof openTaskDetail === 'function') openTaskDetail(tid); 
  await dbPost({action:'updateTask', task:t});
}

async function toggleSubtask(tid, idx) {
  const t = tasks.find(x => String(x.id) === String(tid));
  if(!t || !t.subtasks || !t.subtasks[idx]) return;
  
  t.subtasks[idx].done = !t.subtasks[idx].done;
  updateTaskProgress(t);
  
  if(typeof openTaskDetail === 'function') openTaskDetail(tid); 
  render(); 
  await dbPost({action:'updateTask', task:t});
}

async function deleteSubtask(tid, idx) {
  const t = tasks.find(x => String(x.id) === String(tid));
  if(!t || !t.subtasks) return;
  
  t.subtasks.splice(idx, 1);
  updateTaskProgress(t);
  
  if(typeof openTaskDetail === 'function') openTaskDetail(tid);
  await dbPost({action:'updateTask', task:t});
}

// Fitur Magic: Progress Bar ngikutin Checklist!
function updateTaskProgress(t) {
  if(!t.subtasks || t.subtasks.length === 0) return;
  const doneCnt = t.subtasks.filter(s => s.done).length;
  t.progress = Math.round((doneCnt / t.subtasks.length) * 100);
  
  // Update Tracking KPI
  if (t.progress > 0 && !t.actualStart) {
    t.actualStart = new Date().toISOString();
  }
  
  if(t.progress === 100) {
    t.done = true;
    if (!t.completedAt) t.completedAt = new Date().toISOString();
  } else {
    t.done = false;
    t.completedAt = '';
  }
}

// ── FITUR COPAS (0 RUPIAH) ──────────────────────────
async function copySubtasks(tid) {
  const t = tasks.find(x => String(x.id) === String(tid));
  if(!t) return;
  
  const match = t.name.match(/^\[.*?\]/);
  if(!match) {
    alert("Oops! Task ini belum pakai prefix Glosarium (misal: [OFFBOARDING]). Ubah nama tasknya dulu ya biar sistem bisa nyari kembarannya di history.");
    return;
  }
  const keyword = match[0].toLowerCase();
  
  const allTasks = [...archive, ...tasks];
  // Cari task yg keywordnya sama DAN punya subtask
  const sourceTask = allTasks.find(x => String(x.id) !== String(tid) && x.name.toLowerCase().includes(keyword) && x.subtasks && x.subtasks.length > 0);
  
  if(!sourceTask) {
    alert(`Belum ada riwayat checklist untuk kategori ${keyword}. Gunakan tombol '✦ Breakdown AI' buat bikin template pertama kamu!`);
    return;
  }
  
  if(!t.subtasks) t.subtasks = [];
  sourceTask.subtasks.forEach(st => {
    t.subtasks.push({ title: st.title, done: false });
  });
  
  updateTaskProgress(t);
  if(typeof openTaskDetail === 'function') openTaskDetail(tid);
  await dbPost({action:'updateTask', task:t});
}

// ── FITUR KONSULTAN AI (PAKAI GEMINI) ───────────────
async function generateSubtasksAI(tid, event) {
  const t = tasks.find(x => String(x.id) === String(tid));
  if(!t) return;
  
  const btn = event.currentTarget;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="loading-pulse">✦ AI Berpikir...</span>';
  btn.disabled = true;
  btn.style.opacity = '0.7';
  
  const prompt = `Saya adalah seorang HR di perusahaan IT Logique. Tolong breakdown task HR berikut menjadi 4-7 checklist langkah kerja berurutan (subtasks).\n\nNama Task: "${t.name}"\nProject: "${t.project}"\n\nKEMBALIKAN HANYA dalam format JSON Array of Strings murni, tanpa backtick markdown, tanpa penjelasan apapun. Contoh format yang diizinkan:\n["Langkah 1", "Langkah 2", "Langkah 3"]`;
  
  try {
    let result = await callGemini(prompt, false);
    // Bersihkan hasil jika AI ngeyel pakai markdown JSON
    result = result.replace(/```json/gi, '').replace(/```/g, '').trim();
    const newSubs = JSON.parse(result);
    
    if(!t.subtasks) t.subtasks = [];
    newSubs.forEach(st => t.subtasks.push({ title: st, done: false }));
    
    updateTaskProgress(t);
    if(typeof openTaskDetail === 'function') openTaskDetail(tid);
    await dbPost({action:'updateTask', task:t});
    
  } catch(e) {
    console.error(e);
    alert("Gagal memecah task dengan AI. Coba lagi dalam beberapa detik. Detail: " + e.message);
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}
