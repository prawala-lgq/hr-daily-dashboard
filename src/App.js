import React, { useState, useEffect } from 'react';
import { 
  Home, Zap, Users, Brain, Folder, Settings, 
  Clock, Box, Activity, DollarSign, CheckSquare, 
  AlertTriangle, ArrowUp, BarChart2, GitCommit, ListTodo, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const activityData = Array.from({ length: 30 }, (_, i) => ({ day: i, value: Math.floor(Math.random() * 50) + 10 }));
const workHoursData = Array.from({ length: 15 }, (_, i) => ({ hour: i + 6, value: i < 5 ? Math.random() * 20 : Math.random() * 80 + 20 }));

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
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (rowId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    // Optimistic UI Update
    setTaskData(prev => prev.map(t => t.id === rowId ? { ...t, ceklis: newStatus } : t));
    
    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk Google Apps Script POST
        body: JSON.stringify({ rowId, newStatus })
      });
      // Beri jeda sebentar agar Sheets sempat memproses sebelum fetch ulang
      setTimeout(fetchData, 1500);
    } catch (error) {
      console.error("Update error:", error);
      fetchData(); // Reset jika gagal
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalTasks = taskData.length;
  const completedTasks = taskData.filter(t => t.ceklis === 'Done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex h-screen bg-[#1c1c1e] text-gray-300 font-sans">
      <aside className="w-[240px] bg-[#222225] border-r border-white/5 flex flex-col overflow-y-auto">
        <div className="p-6">
          <h1 className="text-white font-bold mb-6">HR Workspace</h1>
          <nav className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-blue-500/20 text-blue-400 rounded-md"><Home size={18}/> Dashboard</div>
            <div className="flex items-center gap-3 p-2 text-gray-500 hover:bg-white/5 rounded-md"><Users size={18}/> Recruitment</div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-[#1c1c1e]">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Good morning, HR Team</h1>
              <p className="text-gray-400 text-sm">Progress harian: {progressPercent}% selesai[cite: 19].</p>
            </div>
            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-[#2b2b36] rounded-lg text-sm">
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Sync Sheets
            </button>
          </header>

          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="TOTAL" value={totalTasks} color="bg-blue-500" />
            <MetricCard label="DONE" value={completedTasks} color="bg-emerald-500" />
            <MetricCard label="PENDING" value={totalTasks - completedTasks} color="bg-red-500" />
            <MetricCard label="PROGRESS" value={`${progressPercent}%`} color="bg-amber-500" />
          </div>

          <div className="bg-[#242427] border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><ListTodo size={18} className="text-blue-400"/> Live Tasks Timeline</h3>
            <div className="space-y-2">
              {taskData.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.ceklis === 'Done' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm text-gray-200 font-medium">{task.taskList}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{task.kategori} • {task.detailTindakan}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStatus(task.id, task.ceklis)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border ${
                      task.ceklis === 'Done' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {task.ceklis || 'Pending'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-[#242427] border border-white/5 p-5 rounded-xl text-center">
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">{label}</p>
      <h2 className="text-2xl font-bold text-white mb-2">{value}</h2>
      <div className={`h-1 w-8 mx-auto rounded-full ${color}`} />
    </div>
  );
}
