// ============================================================
// HRFlow — CACHE.JS
// Daily cache — simpan AI content di localStorage agar hemat token
// ============================================================

// ── DAILY CACHE (localStorage) ────────────────────────────────
// Semua AI content di-cache per hari → hemat token, tidak generate ulang saat refresh
const CACHE_KEY_BRIEF = 'hrflow_brief';
const CACHE_KEY_NEWS  = 'hrflow_news';

function getCacheDate(){ return new Date().toISOString().split('T')[0]; }

function saveCache(key, data){
  try{
    localStorage.setItem(key, JSON.stringify({ date: getCacheDate(), data }));
  }catch(e){}
}

function loadCache(key){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(parsed.date !== getCacheDate()) return null; // expired (hari berbeda)
    return parsed.data;
  }catch(e){ return null; }
}

function clearTodayCache(){
  localStorage.removeItem(CACHE_KEY_BRIEF);
  localStorage.removeItem(CACHE_KEY_NEWS);
  briefText=''; newsItems=[];
  fetchBriefing(); fetchNews();
  showDBStatus('Cache direset, regenerating...');
  setTimeout(hideDBStatus, 2000);
}
