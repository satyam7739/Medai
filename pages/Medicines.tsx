
import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Plus, Trash2, Edit2 } from 'lucide-react';
import { MEDICINE_TYPES } from '../constants';

export const Medicines: React.FC = () => {
  const { medicines, removeMedicine, t } = useApp();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    return MEDICINE_TYPES.find(t => t.type === type)?.icon || '💊';
  };

  const handleEdit = (med: any) => {
    navigate('/add-medicine', { state: { editMode: true, medicine: med } });
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
             <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
           </button>
           <h1 className="text-2xl font-bold dark:text-white">Medicines</h1>
        </div>
        <button 
          onClick={() => navigate('/add-medicine')}
          className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <Plus size={24} />
        </button>
      </div>

      {medicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
           <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl">
             💊
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Medicines Added</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm">Tap the + button to add your first medicine.</p>
           </div>
           <button 
             onClick={() => navigate('/add-medicine')}
             className="px-6 py-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold rounded-xl"
           >
             Add Now
           </button>
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map((med) => (
            <div key={med.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                  {getIcon(med.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{med.name}</h3>
                  <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium bg-slate-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">{med.dose}</span>
                    <span>• {med.frequency}x Daily</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(med)}
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => {
                    if(confirm(`Delete ${med.name}?`)) removeMedicine(med.id);
                  }}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
