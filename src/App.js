import React, { useState, useEffect } from 'react';
import { Home, Users, ListTodo, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [taskData, setTaskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // URL Web App Terbaru Anda
  const webAppUrl = "https://script.google.com/macros/s/AKfycbwiOse88opduAoRo5wFzNNK1B8DdGayuXzbJv4KFa4Iaqt8aKp2M04c4DqvJ48g-mm7Pg/exec";

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(webAppUrl);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setTaskData(data);
    } catch (error) {
      setErrorMsg("Gagal menarik data. Pastikan Anda sudah login ke Google Account Logique.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (rowId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    // Update tampilan instan
    setTaskData(prev => prev.map(t => t.id === rowId ? { ...t, ceklis: newStatus } : t));
    
    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({ rowId, newStatus })
      });
      setTimeout(fetchData, 1500);
    } catch (e) {
      fetchData();
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalTasks = taskData.length;
  const completedTasks = taskData.filter(t => t.ceklis === 'Done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex min-h-screen bg-[#1c1c1e] text-gray-300 font-sans">
      <aside className="w-[240px] bg-[#222225] border-r border-white/5 p-6 hidden md:block">
        <h1 className="text-white font-bold text-xl mb-10">HR AGENTIC</h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400 bg-blue-500/10 p-2 rounded-lg"><Home size={18}/> Dashboard</div>
          <div className="flex items-center gap-3 text-gray-500 p-2 hover:bg-white/5 rounded-md cursor-pointer"><Users size={18}/> Team Task</div>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Daily Schedule 2026</h1>
              <p className="text-gray-400 text-sm">Status: {isLoading ? "Syncing..." : "Connected to Sheets"}</p>
            </div>
            <button onClick={fetchData} className="bg-[#2b2b36] p-3 rounded-full hover:bg-[#3f3f46] transition-all active:scale-95 border border-white/5">
              <RefreshCw size={20} className={isLoading ? "animate-spin text-blue-400" : "text-white"} />
            </button>
          </header>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="TOTAL" value={totalTasks} color="bg-blue-500" />
            <MetricCard label="DONE" value={completedTasks} color="bg-emerald-500" />
            <MetricCard label="PROGRESS" value={`${progressPercent}%`} color="bg-amber-500" />
            <div className="bg-[#242427] p-5 rounded-xl border border-white/5 text-center">
               <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">RELOAD</p>
               <button onClick={() => window.location.reload()} className="text-xs text-blue-400 hover:underline">Refresh App</button>
            </div>
          </div>

          <div className="bg-[#242427] rounded-xl border border-white/5 overflow-hidden shadow-2xl mt-8">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><ListTodo size={16} className="text-blue-400"/> Task List Live</h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">TAB: ALL 2026</span>
            </div>
            <div className="divide-y divide-white/5">
              {!isLoading && taskData.length === 0 ? (
                <div className="p-20 text-center text-gray-500 italic">Sheet Anda kosong atau tidak terbaca. Isi data di kolom A-I[cite: 3].</div>
              ) : (
                taskData.map((task) => (
                  <div key={task.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.02] gap-4">
                    <div className="flex gap-4 items-start flex-1">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${task.ceklis === 'Done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold ${task.ceklis === 'Done' ? 'text-gray-500 line-through' : 'text-gray-100'}`}>{task.taskList}</p>
                        <p className="text-[11px] text-gray-500 italic">{task.detailTindakan}</p>
                        <div className="flex gap-2 pt-1">
                          <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">{task.kategori}</span>
                          {task.urgent === 'Y' && <span className="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 font-bold tracking-tighter">URGENT</span>}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleStatus(task.id, task.ceklis)}
                      className={`text-[10px] font-black px-4 py-2 rounded-md border transition-all uppercase w-full md:w-28 ${
                        task.ceklis === 'Done' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500 text-white border-red-600 hover:bg-red-600'
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
    <div className="bg-[#242427] p-5 rounded-xl border border-white/5 text-center shadow-lg">
      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-bold text-white mb-3">{value}</p>
      <div className={`h-1.5 w-10 mx-auto rounded-full ${color}`} />
    </div>
  );
}
