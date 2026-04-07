// ============================================================
// HRFlow — RENDER.JS
// Render semua views + AI Tools
// ============================================================

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
    
    const isDueWithin7=(d)=>{if(!d)return false;const dt=new Date(d),t=new Date();t.setHours(0,0,0,0);dt.setHours(0,0,0,0);const diff=Math.round((dt-t)/86400000);return diff>0&&diff<=7;};
    const priorityTasks=[
      ...open.filter(t=>isOverdue(t.due)),
      ...open.filter(t=>isToday(t.due)),
      ...open.filter(t=>t.prio==='high'&&!isOverdue(t.due)&&!isToday(t.due)),
      ...open.filter(t=>isDueWithin7(t.due)&&t.prio!=='high'),
    ].filter((t,i,arr)=>arr.findIndex(x=>String(x.id)===String(t.id))===i).slice(0,6);

    const doneTasksWithTime = tasks.filter(t => t.done && t.actualStart && t.completedAt);
    let avgCycleTime = 0;
    if (doneTasksWithTime.length > 0) {
      const totalDays = doneTasksWithTime.reduce((sum, t) => {
        const start = new Date(t.actualStart);
        const end = new Date(t.completedAt);
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        return sum + diffDays;
      }, 0);
      avgCycleTime = (totalDays / doneTasksWithTime.length).toFixed(1);
    }

    c.innerHTML=`
    <div class="ai-brief">
      <div class="ai-header"><div class="ai-orb">✦</div><div><div class="ai-title">Daily Briefing by Gemini</div><div class="ai-date">${todayFmt}</div></div></div>
      ${briefSection}
      <div class="ai-chips">
        <span class="chip" onclick="triggerBriefing(true)">↻ Refresh briefing</span>
        <span class="chip" onclick="nav('news')">📰 Berita HC hari ini</span>
        <span class="chip" onclick="nav('kanban')">📋 Lihat Kanban</span>
        <span class="chip" onclick="generateNewsletter()">✉ Generate Newsletter</span>
        <span class="chip" onclick="generateWeeklyReport()">📊 Weekly KPI Report</span>
        <span class="chip" onclick="clearTodayCache()" style="color:var(--tx3)">↺ Reset cache hari ini</span>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat"><div class="stat-lbl">Task terbuka</div><div class="stat-val">${open.length}</div><div class="stat-note" style="color:var(--ylw-tx)">${high} high priority</div></div>
      <div class="stat"><div class="stat-lbl">Due hari ini</div><div class="stat-val" style="color:${todayT.length?'var(--red-tx)':'inherit'}">${todayT.length}</div><div class="stat-note" style="color:var(--red-tx)">${overdue.length} overdue</div></div>
      <div class="stat"><div class="stat-lbl">Selesai</div><div class="stat-val" style="color:var(--grn)">${done}</div><div class="stat-note" style="color:var(--grn-tx)">sprint ini</div></div>
      <div class="stat" title="Rata-rata hari yang dibutuhkan dari mulai sampai selesai"><div class="stat-lbl">Speed (KPI)</div><div class="stat-val" style="color:var(--acc)">${avgCycleTime}</div><div class="stat-note" style="color:var(--tx3)">hari/task</div></div>
      <div class="stat"><div class="stat-lbl">Projects</div><div class="stat-val">${projects.length}</div><div class="stat-note" style="color:var(--blu-tx)">aktif</div></div>
    </div>
    
    <div class="panels">
      <div><div class="panel">
        <div class="ph"><span class="ph-title">Task prioritas & upcoming <span style="font-size:10px;font-weight:400;color:var(--tx3)">(overdue · hari ini · 7 hari ke depan)</span></span><button class="btn" onclick="openModal()" style="font-size:11px;padding:4px 9px">+ Tambah</button></div>
        ${priorityTasks.length>0
        ? priorityTasks.map(taskRow).join('')
        : `<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12.5px">
            <div style="font-size:22px;margin-bottom:8px">🎉</div>
            <div style="font-weight:500;color:var(--tx2);margin-bottom:4px">Semua task beres!</div>
            <div style="font-size:11.5px">Tidak ada task overdue, due hari ini, atau dalam 7 hari ke depan.</div>
          </div>`
      }
        <div style="padding:8px 14px;font-size:11px;color:var(--tx3);text-align:center;cursor:pointer;border-top:1px solid var(--bd)" onclick="nav('tasks')">Lihat semua ${tasks.length} task →</div>
      </div></div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="panel">
          <div class="ph"><span class="ph-title">Projects</span><span class="ph-link" onclick="nav('projects')">Lihat semua</span></div>
          ${projects.map(p=>{const total=Number(p.totalTasks||p.tasks||0);const doneN=Number(p.doneTasks||p.done||0);const pct=total>0?Math.round(doneN/total*100):0;return`<div class="proj-item"><div class="pdot" style="background:${p.color}"></div><div class="proj-info"><div class="proj-name">${p.name}</div><div class="proj-meta">${doneN}/${total} task · ${(p.deadline||'').replace(/T.*/,'') || p.deadline || '—'}</div><div class="proj-bar"><div class="proj-bar-fill" style="background:${p.color};width:${pct}%"></div></div></div><div class="proj-pct">${pct}%</div></div>`;}).join('')}
        </div>
        <div class="panel">
          <div class="ph"><span class="ph-title">📰 HC News</span><span class="ph-link" onclick="nav('news')">Semua</span></div>
          ${newsItems.length?newsItems.slice(0,3).map((n, i)=>`<div class="news-item" onclick="openNewsDetail(${i})"><span class="ncat" style="${catStyle[n.category]||''}">${n.category}</span><div class="ntitle">${n.title}</div><div class="nmeta">${n.source} · ${n.timeAgo}</div></div>`).join(''):newsLoading?`<div style="padding:14px;text-align:center;font-size:11px;color:var(--tx3)" class="loading-pulse">Memuat berita...</div>`:`<div style="padding:14px;text-align:center;font-size:11px;color:var(--tx3);cursor:pointer" onclick="fetchNews()">Klik untuk muat berita HC →</div>`}
        </div>
      </div>
    </div>`;
    if(!briefText&&!briefLoading)fetchBriefing();
    if(!newsItems.length&&!newsLoading)fetchNews();

  } else if(view==='tasks'){
    const filtered=getFilteredTasks();
    const sorted=[
      ...filtered.filter(t=>isOverdue(t.due)&&!t.done),
      ...filtered.filter(t=>isToday(t.due)&&!t.done),
      ...filtered.filter(t=>!isOverdue(t.due)&&!isToday(t.due)&&!t.done),
      ...filtered.filter(t=>t.done)
    ];
    c.innerHTML=`<div class="panel">
      <div class="ph"><span class="ph-title">My Tasks</span><button class="btn primary" onclick="openModal()" style="font-size:11px;padding:4px 12px">+ Tambah task</button></div>
      ${renderFilterBar()}
      ${sorted.length>0?sorted.map(taskRow).join(''):`<div style="padding:32px;text-align:center;color:var(--tx3);font-size:13px">Tidak ada task yang sesuai filter</div>`}
    </div>`;
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
            <span class="kcard-meta">${fmtDue(t.due)}</span>
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
    c.innerHTML=`<div class="panel"><div class="ph"><span class="ph-title">Projects aktif (${projects.length})</span><button class="btn primary" onclick="openProjModal()" style="font-size:11px;padding:4px 12px">+ Project baru</button></div>${projects.map(p=>{const total=Number(p.totalTasks||p.tasks||0);const doneN=Number(p.doneTasks||p.done||0);const pct=total>0?Math.round(doneN/total*100):0;return`<div class="proj-item" style="padding:13px 16px"><div class="pdot" style="background:${p.color};width:10px;height:10px"></div><div class="proj-info"><div class="proj-name">${p.name}</div><div class="proj-meta">${doneN} dari ${total} task selesai · Deadline: ${p.deadline||'—'}</div><div class="proj-bar" style="height:5px;margin-top:7px"><div class="proj-bar-fill" style="background:${p.color};width:${pct}%"></div></div></div><div class="proj-pct" style="font-size:14px">${pct}%</div></div>`;}).join('')}</div>`;
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
  const prompt=`Buatkan daily HC newsletter dalam Bahasa Indonesia untuk Araw.\nHari ini: ${todayFmt}\nTask terbuka: ${tasks.filter(t=>!t.done).length} task:\n${taskList}\n\nFormat:\n📌 Subject line menarik\n\nSalam pembuka personal untuk Araw\n\n3 headline berita HC/AI terkini\n\n💡 Tips HC minggu ini\n\n📚 1 rekomendasi kursus gratis\n\nPenutup motivasi\n\n— HRFlow · Logique\n\nBahasa santai tapi profesional, max 250 kata.`;
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

// ── AI WEEKLY KPI REPORT ───────────────────────────────────────
async function generateWeeklyReport() {
  const doneTasks = tasks.filter(t => t.done && t.actualStart && t.completedAt);
  const openTasks = tasks.filter(t => !t.done);
  
  let avgTime = 0;
  if (doneTasks.length > 0) {
    const totalDays = doneTasks.reduce((sum, t) => {
      const start = new Date(t.actualStart);
      const end = new Date(t.completedAt);
      return sum + Math.max(1, Math.round((end - start) / 86400000));
    }, 0);
    avgTime = (totalDays / doneTasks.length).toFixed(1);
  }
  
  const prompt = `Buatkan evaluasi performa mingguan (Weekly Performance Report) bergaya Project Manager untuk Araw.\n\nData minggu ini:\n- Task selesai: ${doneTasks.length}\n- Rata-rata kecepatan (Cycle Time): ${avgTime} hari/task\n- Sisa task terbuka: ${openTasks.length}\n\nBerikan 3 poin:\n1. Apresiasi kinerja\n2. Analisa singkat (apakah kecepatan ${avgTime} hari per task ini bagus)\n3. Saran untuk sisa ${openTasks.length} task terbuka.\n\nGunakan Bahasa Indonesia, santai tapi profesional, max 200 kata.`;
  
  try {
    document.getElementById('detail-modal').style.display = 'flex';
    document.getElementById('dm-title').textContent = "Membuat Weekly Report...";
    document.getElementById('dm-meta').textContent = "Gemini sedang menganalisa data KPI kamu ✦";
    document.getElementById('dm-content').innerHTML = '<div class="loading-pulse">Menganalisa performa kecepatan pengerjaan...</div>';
    document.getElementById('dm-action-container').innerHTML = '';
    
    const result = await callGemini(prompt, false);
    
    document.getElementById('dm-title').textContent = "📊 Weekly Performance Report";
    document.getElementById('dm-meta').textContent = "AI Analysis by Gemini";
    document.getElementById('dm-content').textContent = result;
    document.getElementById('dm-action-container').innerHTML = `<button class="btn" onclick="document.getElementById('detail-modal').style.display='none'">Tutup</button>`;
  } catch(e) {
    document.getElementById('dm-title').textContent = "Error";
    document.getElementById('dm-content').textContent = "Gagal memuat AI: " + e.message;
    document.getElementById('dm-action-container').innerHTML = `<button class="btn" onclick="document.getElementById('detail-modal').style.display='none'">Tutup</button>`;
  }
}
