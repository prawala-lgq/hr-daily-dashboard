// ============================================================
// HRFlow — ACTIONS.JS
// Task actions — update progress
// ============================================================

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
