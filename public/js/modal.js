function openTaskDetail(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;
  const tid=JSON.stringify(id);
  document.getElementById('task-panel')?.remove();

  const prioLabel=t.prio==='high'?'High':t.prio==='med'?'Medium':'Low';
  const prioStyle=t.prio==='high'?'ph-prio':t.prio==='med'?'pm-prio':'pl-prio';
  const projBgC=pBg[t.project]||'var(--bg2)';
  const projTxC=pTx[t.project]||'var(--tx2)';
  
  // Format tanggal
  const dueStr=t.due?new Date(t.due).toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'Belum diset';
  const createdStr=t.createdAt?new Date(t.createdAt).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'—';
  const links=t.links?JSON.parse(t.links):[];

  // Logic Hitung KPI untuk Panel
  let kpiStatus = 'Belum Dimulai';
  let kpiColor = 'var(--tx3)';
  
  if (t.actualStart) {
    if (t.done && t.completedAt) {
      // Hitung durasi penyelesaian
      const start = new Date(t.actualStart);
      const end = new Date(t.completedAt);
      const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      const est = t.estDuration || 0;
      
      if (est > 0 && diffDays > est) {
        kpiStatus = `Selesai (${diffDays} hari, over target)`;
        kpiColor = 'var(--red-tx)';
      } else {
        kpiStatus = `Selesai (${diffDays} hari, on-track)`;
        kpiColor = 'var(--grn)';
      }
    } else {
       kpiStatus = 'Sedang Dikerjakan';
       kpiColor = 'var(--ylw-tx)';
    }
  }

  const tgtStr = t.targetStart ? new Date(t.targetStart).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}) : '—';
  const estStr = t.estDuration ? `${t.estDuration} hari` : '—';

  const overlay=document.createElement('div');
  overlay.id='task-panel';
  overlay.className='task-modal-overlay';
  overlay.onclick=function(e){if(e.target===overlay)closeTaskPanel();};
  
  // Ubah grid template jadi 3 kolom x 2 baris (6 kotak)
  overlay.innerHTML=`
  <div class="task-modal-panel">
    <div class="task-modal-header">
      <button onclick="closeTaskPanel()" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--tx3);padding:2px 6px;border-radius:6px" title="Tutup">←</button>
      <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:5px;background:${projBgC};color:${projTxC}">${t.project}</span>
      <span class="prio ${prioStyle}" style="font-size:10px">${prioLabel}</span>
      ${t.done?'<span style="background:var(--grn-bg);color:var(--grn-tx);font-size:10px;font-weight:600;padding:2px 8px;border-radius:5px">✓ Done</span>':''}
      <span style="font-size:10px;color:var(--tx3);margin-left:auto">#${String(t.id).replace('task_','')}</span>
    </div>

    <div class="task-modal-body">
      <div style="margin-bottom:16px">
        <div id="task-title-display" style="font-size:18px;font-weight:600;color:var(--tx1);line-height:1.35;cursor:pointer;padding:6px 8px;border-radius:8px;margin:-6px -8px" 
          onclick="toggleTitleEdit(${tid})" title="Klik untuk edit">${t.name}</div>
        <input id="task-title-input" type="text" value="${t.name.replace(/"/g,'&quot;')}" 
          style="display:none;width:100%;font-size:18px;font-weight:600;padding:6px 8px;border-radius:8px;border:2px solid var(--acc);background:var(--bg2);color:var(--tx1);font-family:inherit;outline:none"
          onblur="saveTitleEdit(${tid},this.value)"
          onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape')cancelTitleEdit()">
      </div>

      <div style="margin-bottom:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <span class="task-field-label">Progress</span>
          <span style="font-size:12px;font-weight:600;color:var(--tx1)">${t.progress}%</span>
        </div>
        <input type="range" min="0" max="100" value="${t.progress}" step="5"
          style="width:100%;accent-color:var(--grn)"
          onchange="quickUpdateProgress(${tid},this.value)"
          oninput="this.nextElementSibling.textContent=this.value+'%'">
        <span style="display:none"></span>
        <div style="height:6px;background:var(--bg3);border-radius:4px;margin-top:5px;overflow:hidden">
          <div id="prog-bar-fill" style="height:100%;background:var(--grn);width:${t.progress}%;border-radius:4px;transition:width .2s"></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:18px">
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div class="task-field-label">Due date</div>
          <div class="task-field-val" style="color:${t.due&&new Date(t.due)<new Date()?'var(--red-tx)':'var(--tx1)'}">${dueStr}</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div class="task-field-label">Target Start</div>
          <div class="task-field-val">${tgtStr}</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div class="task-field-label">Estimasi</div>
          <div class="task-field-val">${estStr}</div>
        </div>
        
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div class="task-field-label">Project</div>
          <div class="task-field-val" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.project}</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:10px">
          <div class="task-field-label">Dibuat</div>
          <div class="task-field-val">${createdStr}</div>
        </div>
        <div style="background:var(--bg2);border-radius:8px;padding:10px;grid-column: span 1;">
          <div class="task-field-label">Perfomance</div>
          <div class="task-field-val" style="color:${kpiColor}; font-size:11.5px; font-weight:500;">${kpiStatus}</div>
        </div>
      </div>

      <div class="task-section">
        <div class="task-section-title">📝 Deskripsi & Catatan</div>
        <textarea class="desc-area" id="task-desc-${t.id}" placeholder="Tambahkan deskripsi, catatan, atau konteks task ini..."
          onblur="saveTaskDesc(${tid},this.value)">${t.notes||''}</textarea>
        <div style="font-size:10.5px;color:var(--tx3);margin-top:4px">Klik di luar untuk simpan otomatis</div>
      </div>

      <div class="task-section">
        <div class="task-section-title">🔗 Links & Referensi</div>
        <div id="links-list-${t.id}">
          ${links.map((l,i)=>`<a class="link-chip" href="${l.url}" target="_blank" title="${l.url}">
            ${l.type==='jira'?'🔵':l.type==='trello'?'🟦':l.type==='gdrive'?'📄':'🔗'} ${l.label||l.url}
            <span onclick="event.preventDefault();removeLink(${tid},${i})" style="margin-left:4px;color:var(--tx3);font-size:10px">×</span>
          </a>`).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          <button onclick="addLink(${tid},'jira')" class="btn" style="font-size:11px;padding:4px 8px">🔵 + Jira</button>
          <button onclick="addLink(${tid},'trello')" class="btn" style="font-size:11px;padding:4px 8px">🟦 + Trello</button>
          <button onclick="addLink(${tid},'gdrive')" class="btn" style="font-size:11px;padding:4px 8px">📄 + Drive</button>
          <button onclick="addLink(${tid},'other')" class="btn" style="font-size:11px;padding:4px 8px">🔗 + Link lain</button>
        </div>
      </div>

      <div class="task-section">
        <div class="task-section-title">📋 Activity</div>
        <div id="activity-list-${t.id}">
          ${(t.activity?JSON.parse(t.activity):[]).length>0
            ?(t.activity?JSON.parse(t.activity):[]).map(a=>`<div class="activity-item"><div class="activity-dot"></div><div><span style="color:var(--tx2)">${a.text}</span> <span style="color:var(--tx3);font-size:10.5px">· ${a.time}</span></div></div>`).join('')
            :`<div style="font-size:12px;color:var(--tx3)">Belum ada activity.</div>`
          }
        </div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <input id="activity-input-${t.id}" type="text" placeholder="Tambah catatan activity..." 
            style="flex:1;padding:6px 10px;border-radius:7px;border:1px solid var(--bd);background:var(--bg2);font-size:12px;color:var(--tx1);font-family:inherit;outline:none"
            onkeydown="if(event.key==='Enter')addActivity(${tid},this.value)">
          <button onclick="addActivity(${tid},document.getElementById('activity-input-${t.id}').value)" class="btn primary" style="font-size:11px;padding:5px 10px">+ Add</button>
        </div>
      </div>
    </div>

    <div class="task-modal-footer">
      <button onclick="toggleTask(${tid})" class="btn ${t.done?'':'primary'}" style="font-size:12px;flex:1">
        ${t.done?'↩ Tandai belum selesai':'✓ Tandai selesai'}
      </button>
      <button onclick="closeTaskPanel();editTask(${tid})" class="btn" style="font-size:12px">✏️ Edit</button>
      <button onclick="deleteTaskConfirm(${tid})" class="btn" style="font-size:12px;color:var(--red-tx);border-color:var(--red-bg)">🗑</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
}

// Update fungsi editTask biar nangkap field baru
async function editTask(id){
  const t=tasks.find(x=>String(x.id)===String(id));
  if(!t)return;

  document.getElementById('f-name').value=t.name||'';
  document.getElementById('f-due').value=t.due||todayISO;
  document.getElementById('f-notes').value=t.notes||'';
  document.getElementById('f-prio').value=t.prio||'med';
  
  // Set value KPI
  const tgtStart = document.getElementById('f-tgt-start');
  if(tgtStart) tgtStart.value = t.targetStart || '';
  const estDur = document.getElementById('f-est-dur');
  if(estDur) estDur.value = t.estDuration || '';

  const sel=document.getElementById('f-proj');
  sel.innerHTML=projects.map(p=>`<option value="${p.name}"${p.name===t.project?' selected':''}>${p.name}</option>`).join('');
  
  document.querySelector('#modal h3').textContent='Edit Task';
  const saveBtn=document.querySelector('#modal .btn.primary');
  
  saveBtn.textContent='Simpan Perubahan';
  saveBtn.onclick=async function(){
    const name=document.getElementById('f-name').value.trim();
    if(!name)return;
    t.name=name;
    t.project=document.getElementById('f-proj').value;
    t.due=document.getElementById('f-due').value;
    t.prio=document.getElementById('f-prio').value;
    t.notes=document.getElementById('f-notes').value.trim();
    
    // Save KPI changes
    const tgtInput = document.getElementById('f-tgt-start');
    if (tgtInput) t.targetStart = tgtInput.value;
    const estInput = document.getElementById('f-est-dur');
    if (estInput) t.estDuration = parseInt(estInput.value) || 0;

    closeModal();
    document.querySelector('#modal h3').textContent='Tambah Task Baru';
    saveBtn.textContent='Simpan Task';
    saveBtn.onclick=saveTask;
    updateBadge();render();
    showDBStatus('Menyimpan perubahan...');
    await dbPost({action:'updateTask',task:t});
    hideDBStatus();
  };

  document.getElementById('modal').style.display='flex';
  setTimeout(()=>document.getElementById('f-name').focus(),50);
}
