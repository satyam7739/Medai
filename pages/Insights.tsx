import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { ArrowLeft, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MedicineStatus } from '../types';
import { formatDate } from '../constants';

export const Insights: React.FC = () => {
  const { medicines, t } = useApp();
  const navigate = useNavigate();

  // Dynamic Data Generation for Last 7 Days
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStr = formatDate(d);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      let taken = 0;
      let missed = 0;

      medicines.forEach(med => {
        // Find logs that start with this date string
        // logs keys are like "YYYY-MM-DD-HH:MM"
        Object.entries(med.logs).forEach(([key, status]) => {
           if (key.startsWith(dayStr)) {
             if (status === MedicineStatus.Taken) taken++;
             if (status === MedicineStatus.Missed) missed++;
           }
        });
      });

      days.push({ day: dayLabel, taken, missed });
    }
    return days;
  }, [medicines]);

  // Totals Calculation
  const totalTaken = medicines.reduce((acc, med) => 
    acc + Object.values(med.logs).filter(s => s === MedicineStatus.Taken).length, 0);
  
  const totalMissed = medicines.reduce((acc, med) => 
    acc + Object.values(med.logs).filter(s => s === MedicineStatus.Missed).length, 0);

  const adherenceScore = totalTaken + totalMissed > 0 
    ? Math.round((totalTaken / (totalTaken + totalMissed)) * 100) 
    : 100; // Default to 100 if no data

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">{t('insights')}</h1>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
         <div className="flex justify-between items-start">
           <div>
             <p className="text-indigo-100 text-sm font-medium mb-1">Adherence Score</p>
             <h2 className="text-4xl font-bold">{adherenceScore}%</h2>
           </div>
           <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
             <TrendingUp size={24} className="text-white" />
           </div>
         </div>
         <p className="text-xs text-indigo-100 mt-4 bg-black/10 inline-block px-2 py-1 rounded">
           Based on total history
         </p>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Last 7 Days Activity</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="taken" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
           <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">Total Taken</p>
           <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{totalTaken}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
           <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Missed Doses</p>
           <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{totalMissed}</p>
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
         <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
           <AlertCircle size={18} className="text-primary-500" />
           Suggestions
         </h3>
         <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
           {totalMissed > 0 ? (
             <li className="flex gap-2">
               <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0"></span>
               You have missed {totalMissed} doses. Try enabling loud notifications.
             </li>
           ) : (
             <li className="flex gap-2">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></span>
               Perfect streak! Keep it up.
             </li>
           )}
           <li className="flex gap-2">
             <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0"></span>
             Check your auto-refill status for upcoming needs.
           </li>
         </ul>
      </div>

    </div>
  );
};