import React, { useState, useEffect } from 'react';
import { Home, Users, ListTodo, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [taskData, setTaskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // URL menggunakan Proxy untuk menembus batasan "Anyone with Google Account"
  const rawUrl = "https://script.google.com/macros/s/AKfycbwiOse88opduAoRo5wFzNNK1B8DdGayuXzbJv4KFa4Iaqt8aKp2M04c4DqvJ48g-mm7Pg/exec";
  const webAppUrl = "https://corsproxy.io/?" + encodeURIComponent(rawUrl);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(webAppUrl);
      if (!response.ok) throw new Error("Gagal terhubung ke API");
      const data = await response.json();
      
      // Jika Apps Script mengirimkan error
      if (data.error) throw new Error(data.error);
      
      setTaskData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorMsg("Koneksi gagal. Pastikan tab 'All 2026' sudah ada datanya dan Anda login ke Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (rowId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    // Update tampilan instan (Optimistic UI)
    setTaskData(prev => prev.map(t => t.id === rowId ? { ...t, ceklis: newStatus } : t));
    
    try {
      await fetch(webAppUrl, {
        method: 'POST',
        // mode: 'no-cors' digunakan karena limitasi Apps Script pada metode POST
        mode: 'no-cors', 
        body: JSON.stringify({ rowId, newStatus })
      });
      // Sinkronisasi ulang setelah jeda
      setTimeout(fetchData, 2000);
    } catch (e) {
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalTasks = taskData.length;
  const completedTasks = taskData.filter(t => t.ceklis === 'Done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex min-h-screen bg-[#1c1c1e] text-gray-300 font-sans">
      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#222225] border-r border-white/5 p-6 hidden md:block">
        <h1 className="text-white font-bold text-xl mb-10 tracking-tight text-blue-500">HR AGENTIC</h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400 bg-blue-500/10 p-2 rounded-lg cursor-default shadow-lg shadow-blue-500/5">
            <Home size={18}/> Dashboard
          </div>
          <div className="flex items-center gap-3 text-gray-500 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all">
            <Users size={18}/> Team Task
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Daily Schedule 2026</h1>
              <p className="text-gray-400 text-sm italic tracking-tight">Koneksi: {isLoading ? "Menghubungkan..." : "Terhubung via Proxy"}</p>
            </div>
            <button 
              onClick={fetchData} 
              className="bg-[#2b2b36] p-3 rounded-full hover:bg-[#3f3f46] transition-all active:scale-95 border border-white/5 shadow-xl"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin text-blue-400" : "text-white"} />
            </button>
          </header>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs shadow-lg animate-pulse">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {/* METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="TOTAL TASK" value={totalTasks} color="bg-blue-500" />
            <MetricCard label="DONE" value={completedTasks} color="bg-emerald-500" />
            <MetricCard label="PENDING" value={totalTasks - completedTasks} color="bg-red-500" />
            <MetricCard label="PROGRESS" value={`${progressPercent}%`} color="bg-amber-500" />
          </div>

          {/* TASK TABLE */}
          <div className="bg-[#242427] rounded-xl border border-white/5 overflow-hidden shadow-2xl mt-8">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <ListTodo size={16} className="text-blue-400"/> Task List Monitor
              </h3>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/20">TAB: ALL 2026</span>
            </div>
            
            <div className="divide-y divide-white/5">
              {!isLoading && taskData.length === 0 ? (
                <div className="p-20 text-center text-gray-500 italic">
                  Data tidak ditemukan. Pastikan Anda telah mengisi baris di Google Sheets.
                </div>
              ) : (
                taskData.map((task) => (
                  <div key={task.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] gap-4 transition-colors">
                    <div className="flex gap-4 items-start flex-1">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.ceklis === 'Done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold tracking-tight ${task.ceklis === 'Done' ? 'text-gray-500 line-through' : 'text-gray-100'}`}>
                          {task.taskList}
                        </p>
                        <p className="text-[11px] text-gray-500 leading-relaxed max-w-lg italic">
                          {task.detailTindakan}
                        </p>
                        <div className="flex gap-2 pt-1">
                          <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">{task.hariTanggal}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">{task.kategori}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleStatus(task.id, task.ceklis)}
                      className={`text-[10px] font-black px-4 py-2 rounded-md border transition-all uppercase w-full md:w-28 shadow-sm ${
                        task.ceklis === 'Done' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-red-500 text-white border-red-600 hover:bg-red-600 shadow-red-500/20'
                      }`}
                    >
                      {task.ceklis || 'Pending'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-[#242427] p-5 rounded-xl border border-white/5 text-center shadow-lg hover:border-white/10 transition-all">
      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-bold text-white mb-3 tracking-tighter">{value}</p>
      <div className={`h-1.5 w-10 mx-auto rounded-full ${color}`} />
    </div>
  );
}
