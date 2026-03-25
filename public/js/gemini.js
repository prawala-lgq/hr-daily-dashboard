// ============================================================
// HRFlow — GEMINI.JS
// Gemini AI — briefing harian, berita HC, dan newsletter
// ============================================================

async function fetchBriefing(forceRefresh=false){
  if(briefLoading) return;

  // Cek cache dulu — kalau ada dan masih hari ini, langsung pakai
  if(!forceRefresh){
    const cached = loadCache(CACHE_KEY_BRIEF);
    if(cached){ briefText=cached; render(); return; }
  }

  briefLoading=true; render();
  const open=tasks.filter(t=>!t.done);
  const overdue=open.filter(t=>isOverdue(t.due));
  const todayT=open.filter(t=>isToday(t.due));
  const high=open.filter(t=>t.prio==='high');
  const taskList=open.slice(0,7).map(t=>`- ${t.name} (${t.project}, due: ${t.due}, prioritas: ${t.prio})`).join('\n');
  const prompt=`Kamu adalah asisten HC cerdas untuk Araw di Logique. Hari ini ${todayFmt}.\n\nTask belum selesai:\n${taskList}\n\nRingkasan: ${open.length} task terbuka, ${overdue.length} overdue, ${todayT.length} due hari ini, ${high.length} high priority.\n\nTulis daily briefing singkat (3-4 kalimat). Isi:\n1. Sapa Araw\n2. Apa yang urgent\n3. Satu rekomendasi\n4. Semangat penutup\n\nMaksimal 75 kata. Langsung ke poin.`;

  try{
    briefText = await callGemini(prompt, false);
    saveCache(CACHE_KEY_BRIEF, briefText); // simpan ke cache
  } catch(e){
    briefText=`Gagal memuat briefing: ${e.message}`;
  }
  briefLoading=false; render();
}

// 2. UPDATE: Paksa JSON format saat menarik berita
async function fetchNews(forceRefresh=false){
  if(newsLoading) return;
  if(!forceRefresh && newsItems.length>0) return;

  // Cek cache — kalau ada dan masih hari ini, langsung pakai
  if(!forceRefresh){
    const cached = loadCache(CACHE_KEY_NEWS);
    if(cached){ newsItems=cached; render(); return; }
  }

  newsLoading=true; render();
  const prompt=`Buat 8 item berita relevan untuk HC manager di IT Indonesia. Hari ini ${todayFmt}.\nReturn HANYA JSON array valid dengan struktur: [{"title":"...","category":"HC","source":"...","timeAgo":"2 jam lalu","summary":"Satu kalimat max 15 kata."}]`;

  try{
    let raw = await callGemini(prompt, true);
    raw = raw.replace(/```json|```/g, '').trim();
    newsItems = JSON.parse(raw);
    saveCache(CACHE_KEY_NEWS, newsItems); // simpan ke cache
  }catch(e){
    newsItems=[{title:`Pesan Error: ${e.message}`,category:'System',source:'Log Error',timeAgo:'Sekarang',summary:'Gagal memproses data dari AI. Cek konfigurasi API Key atau kuota Anda.'}];
  }
  newsLoading=false; render();
}

// 3. UPDATE: Paksa JSON format saat memfilter berita
async function filterNews(cat){
  newsItems=[];newsLoading=true;render();
  const prompt=`Buat 6 berita relevan kategori "${cat}" untuk HC manager di perusahaan IT Indonesia, ${todayFmt}. Return HANYA JSON array: [{"title":"...","category":"${cat}","source":"...","timeAgo":"...","summary":"max 12 kata"}]`;
  
  try{
    let raw = await callGemini(prompt, true);
    raw = raw.replace(/```json|```/g,'').trim();
    newsItems = JSON.parse(raw);
  }catch(e){
    newsItems=[{title:`Pesan Error: ${e.message}`,category:'System',source:'Log Error',timeAgo:'Sekarang',summary:'Gagal memfilter kategori.'}];
  }
  newsLoading=false;render();
}
