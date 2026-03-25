// ============================================================
// HRFlow — MODAL.JS
// Task detail popup dan delete confirm
// ============================================================

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
