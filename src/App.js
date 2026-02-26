import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Clock, BarChart2, ListTodo, RefreshCw, CheckSquare, AlertTriangle
} from 'lucide-react';

export default function App() {
  const [taskData, setTaskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const webAppUrl = "https://script.google.com/macros/s/AKfycbzzMP2mf3YQH0O02CRzHAZnEVKy8RJ4uV9QnTxDI17JCHLgiYvH7a-7ZdFN8pojZg/exec";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(webAppUrl);
      const data = await response.json();
      setTaskData(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (rowId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    
    // Update tampilan secara instan (Optimistic)
    setTaskData(prev => prev.map(t => t.id === rowId ? { ...t, ceklis: newStatus } : t));
    
    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({ rowId, newStatus })
      });
      // Refresh data setelah 2 detik untuk sinkronisasi ulang
      setTimeout(fetchData, 2000);
    } catch (error) {
      alert("Gagal update ke Sheets");
      fetchData();
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalTasks = taskData.length;
  const completedTasks = taskData.filter(t => t.ceklis === 'Done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex h-screen bg-[#1c1c1e] text-gray-300 font-sans">
      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#222225] border-r border-white/5 p-6 hidden md:block">
        <h1 className="text-white font-bold text-xl mb-10">HR Dashboard</h1>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400 bg-blue-500/10 p-2 rounded-lg cursor-pointer"><Home size={18}/> Dashboard</div>
          <div className="flex items-center gap-3 text-gray-500 hover:text-white p-2 cursor-pointer transition-colors"><Users size={18}/> Team Task</div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#1c1c1e]">
        <div className="max-w-4xl mx-auto space-y-6">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Daily Tasks Monitor</h1>
              <p className="text-gray-400 text-sm">Update langsung ke Google Sheets.</p>
            </div>
            <button onClick={fetchData} className="bg-[#2b2b36] p-2 rounded-lg hover:bg-[#3f3f46] transition-colors">
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
          </header>

          {/* METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#242427] p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Task</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
            </div>
            <div className="bg-[#242427] p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1">Selesai</p>
              <p className="text-2xl font-bold text-white">{completedTasks}</p>
            </div>
            <div className="bg-[#242427] p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-red-500 font-bold uppercase mb-1">Pending</p>
              <p className="text-2xl font-bold text-white">{totalTasks - completedTasks}</p>
            </div>
            <div className="bg-[#242427] p-4 rounded-xl border border-white/5 text-center">
              <p className="text-[10px] text-amber-500 font-bold uppercase mb-1">Progress</p>
              <p className="text-2xl font-bold text-white">{progressPercent}%</p>
            </div>
          </div>

          {/* TASK LIST */}
          <div className="bg-[#242427] rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white"><ListTodo size={16}/> Task List (Live)</h3>
            </div>
            <div className="divide-y divide-white/5">
              {isLoading && taskData.length === 0 ? (
                <div className="p-10 text-center text-gray-500 animate-pulse">Menghubungkan ke Sheets...</div>
              ) : (
                taskData.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex gap-3 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${task.ceklis === 'Done' ? 'bg-emerald-500' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                      <div>
                        <p className={`text-sm font-medium ${task.ceklis === 'Done' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{task.taskList}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">{task.hariTanggal} • {task.kategori}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleStatus(task.id, task.ceklis)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                        task.ceklis === 'Done' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
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
