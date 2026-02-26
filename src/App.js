import React, { useState, useEffect } from 'react';
import { Home, ListTodo, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [taskData, setTaskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // MASUKKAN URL DEPLOYMENT TERBARU ANDA DI SINI
  const webAppUrl = "https://script.google.com/macros/s/AKfycbzzMP2mf3YQH0O02CRzHAZnEVKy8RJ4uV9QnTxDI17JCHLgiYvH7a-7ZdFN8pojZg/exec";

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(webAppUrl);
      if (!response.ok) throw new Error("Respon server tidak ok");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setTaskData(data);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (rowId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';
    setTaskData(prev => prev.map(t => t.id === rowId ? { ...t, ceklis: newStatus } : t));
    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ rowId, newStatus })
      });
      setTimeout(fetchData, 2000);
    } catch (e) { fetchData(); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-[#1c1c1e] text-gray-300 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Daily Schedule 2026</h1>
          <button onClick={fetchData} className="p-3 bg-[#2b2b36] rounded-full hover:bg-[#3f3f46]">
            <RefreshCw size={20} className={isLoading ? "animate-spin text-blue-400" : ""} />
          </button>
        </header>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={18} /> Error: {errorMsg}. Pastikan Apps Script sudah di-deploy sebagai "Anyone".
          </div>
        )}

        <div className="bg-[#242427] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <ListTodo size={16} className="text-blue-400"/>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Live Tasks</h3>
          </div>
          
          <div className="divide-y divide-white/5">
            {isLoading && taskData.length === 0 ? (
              <div className="p-20 text-center text-gray-500 italic">Menghubungkan ke API...</div>
            ) : taskData.length === 0 && !errorMsg ? (
              <div className="p-20 text-center text-gray-500">Tidak ada data di tab "All 2026". Isi baris di Sheets dulu!</div>
            ) : (
              taskData.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                  <div className="flex gap-4 items-start">
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.ceklis === 'Done' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="space-y-0.5">
                      <p className={`text-sm font-semibold ${task.ceklis === 'Done' ? 'text-gray-500 line-through' : 'text-gray-100'}`}>{task.taskList}</p>
                      <p className="text-[11px] text-gray-500 italic">{task.detailTindakan}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStatus(task.id, task.ceklis)}
                    className={`text-[10px] font-black px-4 py-2 rounded-md border uppercase ${
                      task.ceklis === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500 text-white'
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
    </div>
  );
}
