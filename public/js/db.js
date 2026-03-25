// ============================================================
// HRFlow — DB.JS
// Database functions — koneksi ke Google Apps Script & Google Sheets
// ============================================================

async function loadFromDB(){
  if(!HAS_DB){tasks=[...DEFAULT_TASKS];updateBadge();render();return;}
  showDBStatus('Memuat data...');
  // Load tasks dan projects selalu fresh dari Sheets
  const [res, pres] = await Promise.all([dbGet('getTasks'), dbGet('getProjects')]);
  if(res&&res.tasks&&res.tasks.length>0){tasks=res.tasks;}else{tasks=[...DEFAULT_TASKS];}
  if(pres&&pres.projects&&pres.projects.length>0){
    projects=pres.projects;
    rebuildProjectMaps();
    renderSidebarProjects();
  }
  hideDBStatus();updateBadge();render();
}
