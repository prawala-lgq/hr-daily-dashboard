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
