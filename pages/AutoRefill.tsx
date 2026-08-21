import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Repeat, ShoppingCart, AlertTriangle, MessageCircle, Package } from 'lucide-react';
import { MEDICINE_TYPES } from '../constants';

export const AutoRefill: React.FC = () => {
  const { medicines, user, t } = useApp();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    return MEDICINE_TYPES.find(t => t.type === type)?.icon || '💊';
  };

  const handleNotifyCaregiver = () => {
    if (user.caregiver?.phone) {
       alert(`Message sent to ${user.caregiver.name}: "Medicine stock running low. Please refill."`);
    } else {
       alert("No caregiver configured. Please add one in Profile.");
    }
  };

  const handleOrder = () => {
    alert("Redirecting to online pharmacy partner...");
    // window.open('https://pharmeasy.in', '_blank');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center gap-4">
         <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
           <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
         </button>
         <h1 className="text-xl font-bold dark:text-white">{t('auto_refill')}</h1>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex items-start gap-3">
        <Repeat className="text-orange-600 shrink-0 mt-1" size={20} />
        <div>
          <h3 className="font-bold text-orange-800 dark:text-orange-200 text-sm">{t('auto_refill')}</h3>
          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
            Track your medicine stock. We will notify your caregiver when you are running low.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white px-1">{t('inventory')}</h2>
        {medicines.map((med) => {
          const stock = med.currentStock ?? 0;
          const threshold = med.lowStockThreshold ?? 5;
          const isLow = stock <= threshold;

          return (
            <div key={med.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
               <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                      {getIcon(med.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{med.name}</h3>
                      <div className="flex gap-2 text-xs">
                         <span className={`font-bold px-2 py-0.5 rounded ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                           {stock} left
                         </span>
                      </div>
                    </div>
                 </div>
                 {isLow && <AlertTriangle size={18} className="text-red-500 animate-pulse" />}
               </div>

               {isLow && (
                 <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      onClick={handleNotifyCaregiver}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <MessageCircle size={14} /> Caregiver
                    </button>
                    <button 
                      onClick={handleOrder}
                      className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <ShoppingCart size={14} /> {t('order_online')}
                    </button>
                 </div>
               )}
               
               {!isLow && (
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '80%' }}></div>
                  </div>
               )}
            </div>
          );
        })}
        {medicines.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            <Package size={32} className="mx-auto mb-2 opacity-50" />
            No medicines to track.
          </div>
        )}
      </div>
    </div>
  );
};