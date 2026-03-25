// ============================================================
// HRFlow — KANBAN.JS
// Kanban drag & drop — pindahkan task antar kolom
// ============================================================

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
  if(colKey==='done')  { t.progress=100; t.done=true; }
  updateBadge(); render();
  await dbPost({action:'updateTask', task:t});
}
