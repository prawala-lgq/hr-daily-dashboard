// HRFlow — APP.JS
// Entry point

updateBadge();
loadFromDB();
// Close task panel with Escape key
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){
    document.getElementById('task-panel')?.remove();
    document.getElementById('modal').style.display='none';
  }
});
