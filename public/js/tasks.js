// ============================================================
// HRFlow — TASKS.JS
// Task row rendering (With Traffic Light KPI)
// ============================================================

function taskRow(t){
  const tid = JSON.stringify(t.id);
  
  // LOGIC TRAFFIC LIGHT: Hijau (aman), Kuning (hari ini), Merah (overdue)
  let barColor = 'var(--grn)'; 
  if (!t.done && t.progress < 100) {
    if (typeof isOverdue === 'function' && isOverdue(t.due)) {
      barColor = 'var(--red-tx)';
    } else if (typeof isToday === 'function' && isToday(t.due)) {
      barColor = 'var(--ylw-tx)';
    }
  }

  return `<div class="tr" onclick='openTaskDetail(${tid})' style="position: relative; cursor: pointer;">
    <div class="chk${t.done?' done':''}" onclick="event.stopPropagation(); toggleTask(${tid})">${t.done?'✓':''}</div>
    <div class="tname${t.done?' done':''}">${t.name}</div>
    <span class="ptag" style="background:${pBg[t.project]||'var(--bg2)'};color:${pTx[t.project]||'var(--tx2)'}">${t.project}</span>
    <span class="dtag">${fmtDue(t.due)}</span>
    <span class="prio ${t.prio==='high'?'ph-prio':t.prio==='med'?'pm-prio':'pl-prio'}">${t.prio==='high'?'High':t.prio==='med'?'Med':'Low'}</span>
    <div class="pbar" title="Klik % untuk update" onclick="event.stopPropagation(); updateProgress(${tid})">
      <div class="pbar-fill" style="width:${t.progress}%; background:${barColor};"></div>
    </div>
    <span class="pct" onclick="event.stopPropagation(); updateProgress(${tid})">${t.progress}%</span>
  </div>`;
}
