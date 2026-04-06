// --- TAMBAHKAN LOGIC HITUNG KPI INI DI ATAS c.innerHTML ---
    const doneTasksWithTime = tasks.filter(t => t.done && t.actualStart && t.completedAt);
    let avgCycleTime = 0;
    if (doneTasksWithTime.length > 0) {
      const totalDays = doneTasksWithTime.reduce((sum, t) => {
        const start = new Date(t.actualStart);
        const end = new Date(t.completedAt);
        const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        return sum + diffDays;
      }, 0);
      avgCycleTime = (totalDays / doneTasksWithTime.length).toFixed(1);
    }

    // --- CARI DAN GANTI BAGIAN <div class="stats"> INI ---
    <div class="stats">
      <div class="stat"><div class="stat-lbl">Task terbuka</div><div class="stat-val">${open.length}</div><div class="stat-note" style="color:var(--ylw-tx)">${high} high priority</div></div>
      <div class="stat"><div class="stat-lbl">Due hari ini</div><div class="stat-val" style="color:${todayT.length?'var(--red-tx)':'inherit'}">${todayT.length}</div><div class="stat-note" style="color:var(--red-tx)">${overdue.length} overdue</div></div>
      <div class="stat"><div class="stat-lbl">Selesai</div><div class="stat-val" style="color:var(--grn)">${done}</div><div class="stat-note" style="color:var(--grn-tx)">sprint ini</div></div>
      
      <div class="stat" title="Rata-rata hari yang dibutuhkan dari mulai sampai selesai"><div class="stat-lbl">Speed (KPI)</div><div class="stat-val" style="color:var(--acc)">${avgCycleTime}</div><div class="stat-note" style="color:var(--tx3)">hari/task</div></div>
      
      <div class="stat"><div class="stat-lbl">Projects</div><div class="stat-val">${projects.length}</div><div class="stat-note" style="color:var(--blu-tx)">aktif</div></div>
    </div>
