// ============================================================
// HRFlow — DB.JS
// Fetch API ke Google Apps Script
// ============================================================

async function dbGet(action) {
  try {
    const res = await fetch(`${GAS_URL}?action=${action}`);
    return await res.json();
  } catch (e) { console.error('GET Error:', e); return null; }
}

async function dbPost(body) {
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) { console.error('POST Error:', e); return null; }
}

function showDBStatus(msg) {
  let el = document.getElementById('db-status');
  if (!el) {
    el = document.createElement('div');
    el.id = 'db-status';
    el.style.cssText = 'position:fixed;bottom:15px;right:20px;background:var(--bg1);border:1px solid var(--bd);padding:8px 14px;border-radius:8px;font-size:11.5px;color:var(--tx2);box-shadow:0 4px 12px rgba(0,0,0,0.08);z-index:9999;display:flex;align-items:center;gap:8px';
    document.body.appendChild(el);
  }
  el.innerHTML = `<span class="loading-pulse" style="width:8px;height:8px;background:var(--acc);border-radius:50%;display:inline-block"></span>${msg}`;
  el.style.display = 'flex';
}

function hideDBStatus() {
  const el = document.getElementById('db-status');
  if (el) el.style.display = 'none';
}

async function loadFromDB() {
  showDBStatus('Memuat data dari Google Sheets...');
  
  // UPDATE: Memanggil 3 API sekaligus (Tasks, Projects, Archive)
  const [tRes, pRes, aRes] = await Promise.all([
    dbGet('getTasks'),
    dbGet('getProjects'),
    dbGet('getArchive')
  ]);
  
  hideDBStatus();

  if (tRes && tRes.tasks) tasks = tRes.tasks;
  if (pRes && pRes.projects) projects = pRes.projects;
  if (aRes && aRes.archive) archive = aRes.archive;

  if (typeof rebuildProjectMaps === 'function') rebuildProjectMaps(); // Rebuild mapping warna
  renderSidebarProjects();
  if (typeof checkDueNotifications === 'function') checkDueNotifications();
  render();
}

function renderSidebarProjects() {
  const sp = document.getElementById('sidebar-projects');
  if (!sp) return;
  sp.innerHTML = projects.map(p => `
    <div class="ni" style="cursor:default">
      <div class="pdot" style="background:${p.color}"></div>
      <span style="font-size:11.5px;color:var(--tx2)">${p.name}</span>
    </div>
  `).join('');
}

function updateBadge() {
  const cnt = tasks.filter(t => !t.done).length;
  const el = document.getElementById('open-cnt');
  if (el) el.textContent = cnt;
}
