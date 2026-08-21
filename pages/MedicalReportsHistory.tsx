
import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Trash2, ChevronRight, Activity } from 'lucide-react';

export const MedicalReportsHistory: React.FC = () => {
  const { savedReports, removeReport } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-20 animate-fade-in p-4">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-2xl font-bold dark:text-white">Medical Reports</h1>
      </div>

      {savedReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
            <FileText size={48} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No medical report yet.</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
            Upload and analyze reports in the Health Reports section to have them appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
           {savedReports.map(report => (
             <div key={report.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                     <Activity size={20} />
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-900 dark:text-white">{report.title}</h3>
                     <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <Calendar size={12} />
                        {new Date(report.savedAt).toLocaleDateString()}
                     </div>
                   </div>
                 </div>
                 <button 
                   onClick={() => {
                     if(confirm("Delete this report?")) removeReport(report.id);
                   }}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
               
               <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-300 italic">
                 "{report.summary}"
               </div>

               <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-500">{report.metrics.length} Metrics Found</span>
                  {/* Logic to view details could be added here if needed */}
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
