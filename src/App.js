import React, { useState, useEffect } from "react";
import {
  Home,
  Zap,
  Users,
  Brain,
  Folder,
  Settings,
  Clock,
  Box,
  Activity,
  DollarSign,
  CheckSquare,
  AlertTriangle,
  ArrowUp,
  BarChart2,
  GitCommit,
  ListTodo,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Data dummy untuk grafik visual (karena ini butuh log data harian yang panjang)
const activityData = Array.from({ length: 30 }, (_, i) => ({
  day: i,
  value: Math.floor(Math.random() * 50) + 10,
}));

const workHoursData = Array.from({ length: 15 }, (_, i) => ({
  hour: i + 6,
  value: i < 5 ? Math.random() * 20 : Math.random() * 80 + 20,
}));

export default function App() {
  // --- STATE UNTUK DATA LIVE ---
  const [taskData, setTaskData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FUNGSI MENGAMBIL DATA DARI GOOGLE SHEETS ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // URL Web App Apps Script kamu
      const url =
        "https://script.google.com/macros/s/AKfycbzzMP2mf3YQH0O02CRzHAZnEVKy8RJ4uV9QnTxDI17JCHLgiYvH7a-7ZdFN8pojZg/exec";
      const response = await fetch(url);
      const data = await response.json();
      setTaskData(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan fungsi fetchData saat aplikasi pertama kali dibuka
  useEffect(() => {
    fetchData();
  }, []);

  // --- CALCULATIONS ---
  const totalTasks = taskData.length;
  // Ceklis di Sheets mu memakai kata 'Done'
  const completedTasks = taskData.filter((t) => t.ceklis === "Done").length;
  const pendingTasks = totalTasks - completedTasks;
  const doFirstTasks = taskData.filter(
    (t) => t.urgent === "Y" && t.important === "Y"
  ).length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="flex h-screen bg-[#1c1c1e] text-gray-300 font-sans selection:bg-blue-500/30">
      {/* --- SIDEBAR --- */}
      <aside className="w-[240px] bg-[#222225] border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex gap-2 p-4 pt-5 mb-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        </div>

        <div className="px-4 pb-2">
          <h1 className="text-sm font-bold text-white mb-6 px-2">
            HR Workspace
          </h1>

          <div className="mb-6">
            <h2 className="text-[10px] font-bold text-gray-500 tracking-widest px-2 mb-2 uppercase">
              Overview
            </h2>
            <nav className="space-y-0.5">
              <NavItem icon={<Home size={16} />} label="Dashboard" active />
            </nav>
          </div>

          <div className="mb-6">
            <h2 className="text-[10px] font-bold text-gray-500 tracking-widest px-2 mb-2 uppercase">
              Modules
            </h2>
            <nav className="space-y-0.5">
              <NavItem icon={<Users size={16} />} label="Recruitment" />
              <NavItem icon={<CheckSquare size={16} />} label="Daily Tasks" />
              <NavItem icon={<Clock size={16} />} label="Attendance" />
              <NavItem
                icon={<AlertTriangle size={16} />}
                label="Leave Requests"
              />
              <NavItem icon={<BarChart2 size={16} />} label="KPI Metrics" />
            </nav>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto bg-[#1c1c1e] p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* HEADER */}
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-2">
                Good morning, HR Team
              </h1>
              <p className="text-gray-400 text-sm">
                You have{" "}
                <span className="text-white font-medium">
                  {totalTasks} tasks
                </span>{" "}
                set up,{" "}
                <span className="text-emerald-400 font-medium">
                  {completedTasks} completed
                </span>{" "}
                and{" "}
                <span className="text-[#e2b740] font-medium">
                  {doFirstTasks} critical (Do First)
                </span>
                . You've cleared{" "}
                <span className="text-emerald-400 font-medium">
                  {progressPercent}%
                </span>{" "}
                of your work.
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#2b2b36] hover:bg-[#3f3f46] text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              {isLoading ? "Syncing..." : "Sync Sheets"}
            </button>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <RefreshCw
                size={32}
                className="animate-spin mb-4 text-blue-500"
              />
              <p>Menarik data dari Google Sheets...</p>
            </div>
          ) : (
            <>
              {/* TOP CARDS */}
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  value={totalTasks}
                  label="TOTAL TASKS"
                  color="bg-blue-500"
                />
                <MetricCard
                  value={completedTasks}
                  label="COMPLETED"
                  color="bg-emerald-500"
                />
                <MetricCard
                  value={pendingTasks}
                  label="PENDING"
                  color="bg-red-500"
                />
                <MetricCard
                  value={doFirstTasks}
                  label="DO FIRST"
                  color="bg-[#e2b740]"
                />
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#242427] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-blue-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Activity Timeline
                      </h3>
                    </div>
                  </div>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {activityData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === activityData.length - 1
                                  ? "#60a5fa"
                                  : "#3b82f6"
                              }
                              fillOpacity={
                                index === activityData.length - 1 ? 1 : 0.6
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#242427] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-emerald-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Work Intensity
                      </h3>
                    </div>
                  </div>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workHoursData}>
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {workHoursData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.value > 60 ? "#34d399" : "#e2b740"}
                              fillOpacity={0.8}
                            />
                          ))}
                        </Bar>
                        <XAxis
                          dataKey="hour"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 10 }}
                          dy={10}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#242427] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={16} className="text-[#e2b740]" />
                      <h3 className="text-sm font-semibold text-white">
                        Task Completion Progress
                      </h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">Overall Progress</span>
                        <span className="text-gray-400">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-[#1c1c1e] rounded-full h-3">
                        <div
                          className="bg-[#e2b740] h-3 rounded-full"
                          style={{
                            width: `${progressPercent}%`,
                            transition: "width 1s ease-in-out",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Tasks Timeline Live */}
                <div className="bg-[#242427] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ListTodo size={16} className="text-blue-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Live Tasks Timeline
                      </h3>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      LIVE FROM SHEETS
                    </span>
                  </div>

                  <div className="space-y-1 h-[250px] overflow-y-auto custom-scrollbar pr-2">
                    {taskData.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Tidak ada task ditemukan di Sheets.
                      </p>
                    ) : (
                      taskData.map((task, index) => {
                        const isDone = task.ceklis === "Done";
                        const isUrgent =
                          task.urgent === "Y" && task.important === "Y";
                        return (
                          <div
                            key={index}
                            className="group flex items-start justify-between p-3 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-1.5 w-1.5 h-1.5 rounded-full ${
                                  isDone ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              ></div>
                              <div>
                                <p className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">
                                  {task.taskList}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(
                                    task.hariTanggal
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                  })}{" "}
                                  • {task.kategori}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`px-2 py-[2px] text-[10px] font-medium rounded uppercase tracking-wider ${
                                  isDone
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}
                              >
                                {isDone ? "Done" : "Pending"}
                              </span>
                              {isUrgent && !isDone && (
                                <span className="text-[9px] text-[#e2b740] font-bold">
                                  DO FIRST
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46;
          border-radius: 20px;
        }
      `,
        }}
      />
    </div>
  );
}

// --- SUB COMPONENTS ---
function NavItem({ icon, label, active = false }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-sm transition-colors ${
        active
          ? "bg-[#3b82f6]/20 text-blue-400 font-medium"
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function MetricCard({ value, label, color }) {
  return (
    <div className="bg-[#242427] border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl font-semibold text-white mb-2">{value}</h3>
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
        <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
          {label}
        </p>
      </div>
    </div>
  );
}
