
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getGreeting, formatDate } from '../constants';
import { Plus, CheckCircle, Clock, Calendar, Pill, ChevronDown, BarChart2, Repeat, Trophy, Flame, Star, Zap, MapPin, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MedicineStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { user, medicines, updateMedicineStatus, snoozeMedicine, activeSnoozes, t } = useApp();
  const navigate = useNavigate();
  const [showHeroSnoozeMenu, setShowHeroSnoozeMenu] = useState(false);
  
  // Date State
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = formatDate(selectedDate);
  const isToday = selectedDateStr === formatDate(new Date());
  
  // --- Calendar Strip Logic ---
  const weekDays = useMemo(() => {
    // Show a 5-day window centered on the selected date
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // --- Medicine Logic ---
  const todaysMeds = useMemo(() => {
    return medicines.flatMap(med => {
      // Medicines have `times` (HH:MM). We map them to the *Selected Date*.
      return med.times.map(time => {
        const logKey = `${selectedDateStr}-${time}`;
        const status = med.logs[logKey] || MedicineStatus.Pending;
        
        // Snooze is relevant primarily for TODAY. 
        const snoozeEntry = activeSnoozes.find(s => s.medicineId === med.id && s.timeSlot === time);
        const isSnoozed = isToday && snoozeEntry && snoozeEntry.snoozedUntil > Date.now();
        
        return { ...med, time, status, logKey, isSnoozed, snoozedUntil: snoozeEntry?.snoozedUntil };
      });
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [medicines, activeSnoozes, selectedDateStr, isToday]);

  const pendingMeds = todaysMeds.filter(m => m.status === MedicineStatus.Pending && !m.isSnoozed);
  const takenCount = todaysMeds.filter(m => m.status === MedicineStatus.Taken).length;
  const missedCount = todaysMeds.filter(m => m.status === MedicineStatus.Missed).length;
  const totalCount = todaysMeds.length;
  const progressPercentage = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;
  
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  // Next dose logic only relevant if viewing Today
  const nextDose = isToday ? (pendingMeds.find(m => m.time >= currentTimeStr) || pendingMeds[0]) : null;
                   
  const handleHeroSnooze = (min: number) => {
    if (nextDose) {
      snoozeMedicine(nextDose.id, nextDose.time, min);
      setShowHeroSnoozeMenu(false);
    }
  };

  const formatTimeDisplay = (time24: string) => {
    const [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header & Greetings */}
      <div className="flex justify-between items-end px-1">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">
            {isToday 
              ? t(getGreeting() === "Good Morning" ? 'greeting_morning' : getGreeting() === "Good Afternoon" ? 'greeting_afternoon' : 'greeting_evening')
              : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            }
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {user.name.split(' ')[0]}
          </h1>
        </div>
        <div 
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all border-2 border-white dark:border-slate-600"
        >
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Strip */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar gap-2">
        {weekDays.map((date, i) => {
          const isSelected = formatDate(date) === selectedDateStr;
          const isTodayDate = formatDate(date) === formatDate(new Date());
          return (
            <button 
              key={i} 
              onClick={() => handleDateClick(date)}
              className={`flex flex-col items-center justify-center min-w-[3.5rem] py-3 rounded-xl transition-all ${
                isSelected 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105' 
                  : 'bg-transparent text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-xs font-medium uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <span className={`text-lg font-bold ${isSelected ? 'mt-1' : ''}`}>{date.getDate()}</span>
              {isTodayDate && !isSelected && <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5"></span>}
              {isTodayDate && isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></span>}
            </button>
          )
        })}
      </div>

      {/* Hero Section */}
      {!isToday ? (
        /* Summary Card for Past/Future Dates */
        <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
             Summary for {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short'})}
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-white dark:bg-slate-700 p-4 rounded-2xl flex items-center gap-3">
               <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
               <div>
                 <span className="block text-2xl font-bold text-slate-900 dark:text-white">{takenCount}</span>
                 <span className="text-xs text-slate-500 dark:text-slate-400">Taken</span>
               </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-700 p-4 rounded-2xl flex items-center gap-3">
               <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Clock size={20} /></div>
               <div>
                 <span className="block text-2xl font-bold text-slate-900 dark:text-white">{missedCount}</span>
                 <span className="text-xs text-slate-500 dark:text-slate-400">Missed</span>
               </div>
            </div>
          </div>
        </div>
      ) : nextDose ? (
        /* Next Dose Card (Only Today) */
        <div className="bg-gradient-to-br from-primary-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-visible">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Clock size={12} /> Up Next
              </span>
              <span className="text-3xl font-bold tracking-tighter">{formatTimeDisplay(nextDose.time)}</span>
            </div>

            <h2 className="text-2xl font-bold mb-1">{nextDose.name}</h2>
            <p className="text-blue-100 text-sm mb-6 flex items-center gap-2 opacity-90">
              <span className="font-semibold bg-white/20 px-2 py-0.5 rounded text-xs">{nextDose.dose}</span>
              <span>{nextDose.notes || 'Take as prescribed'}</span>
            </p>

            <div className="flex gap-3 relative">
              <button 
                onClick={() => updateMedicineStatus(nextDose.id, nextDose.time, MedicineStatus.Taken)}
                className="flex-1 bg-white text-primary-600 py-3.5 rounded-xl font-bold shadow-lg hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> {t('take_now')}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowHeroSnoozeMenu(!showHeroSnoozeMenu)}
                  className="px-4 h-full bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors backdrop-blur-sm flex items-center gap-1"
                >
                  {t('snooze')} <ChevronDown size={14} />
                </button>
                
                {showHeroSnoozeMenu && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-1 z-50 animate-fade-in text-slate-800 dark:text-white overflow-hidden ring-1 ring-black/5">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">Snooze For</div>
                    {[15, 30, 60].map(min => (
                      <button
                        key={min}
                        onClick={() => handleHeroSnooze(min)}
                        className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                      >
                        {min} Mins <Clock size={14} className="opacity-50" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GAMIFIED ALL CAUGHT UP CARD (Today Only) */
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-40 h-40 bg-yellow-400/10 rounded-full blur-2xl"></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute animate-[float_3s_ease-in-out_infinite]" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.3
                }}>
                  <Star size={10} fill="white" className="text-yellow-200" />
                </div>
              ))}
           </div>

           <div className="relative z-10 flex flex-col items-center text-center">
             <div className="mb-4 relative">
               <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full animate-pulse"></div>
               <div className="relative bg-gradient-to-b from-yellow-300 to-yellow-500 p-4 rounded-full shadow-lg border-2 border-yellow-200 animate-[bounce_2s_infinite]">
                 <Trophy size={40} className="text-yellow-900 drop-shadow-sm" />
               </div>
               <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
                  <Zap size={8} fill="currentColor" /> XP
               </div>
             </div>

             <h2 className="text-2xl font-bold mb-1">Daily Goal Reached!</h2>
             <p className="text-emerald-50 text-sm mb-6 max-w-[200px] leading-relaxed">
               Amazing work! You've taken all your medicines for the day.
             </p>

             <div className="flex gap-3 w-full">
               <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex flex-col items-center justify-center gap-1">
                 <div className="flex items-center gap-1 text-orange-300 font-bold text-sm">
                   <Flame size={14} fill="currentColor" /> Streak
                 </div>
                 <span className="text-xl font-bold">12 Days</span>
               </div>
               
               <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-1 text-yellow-300 font-bold text-sm">
                   <Star size={14} fill="currentColor" /> Points
                 </div>
                 <span className="text-xl font-bold">+150</span>
               </div>
             </div>

             <div className="w-full mt-4">
                <div className="flex justify-between text-[10px] uppercase font-bold text-emerald-100 mb-1">
                   <span>Health Level 5</span>
                   <span>450/1000 XP</span>
                </div>
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 w-[45%] rounded-full shadow-sm"></div>
                </div>
             </div>

           </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-1">{t('quick_actions')}</h3>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={() => navigate('/add-medicine')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shadow-sm border border-blue-100 dark:border-blue-800">
              <Plus size={24} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{t('add_med')}</span>
          </button>
          
          <button onClick={() => navigate('/auto-refill')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform shadow-sm border border-orange-100 dark:border-orange-800">
              <Repeat size={24} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{t('auto_refill')}</span>
          </button>

          <button onClick={() => navigate('/pharmacy')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shadow-sm border border-emerald-100 dark:border-emerald-800">
              <MapPin size={24} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{t('pharmacy')}</span>
          </button>

          <button onClick={() => navigate('/insights')} className="flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform shadow-sm border border-teal-100 dark:border-teal-800">
              <BarChart2 size={24} />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 text-center leading-tight">{t('insights')}</span>
          </button>
        </div>
      </div>

      {/* Timeline / Today's Schedule */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isToday ? t('todays_schedule') : `Schedule for ${selectedDate.toLocaleDateString('en-US', {weekday:'short'})}`}
          </h3>
          <button onClick={() => navigate('/medicines')} className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:bg-primary-50 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors">
            {t('view_all')}
          </button>
        </div>

        {/* Daily Progress Bar (Gamification) */}
        {todaysMeds.length > 0 && (
           <div className="bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-8 mx-1">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              />
           </div>
        )}

        {todaysMeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <Calendar className="text-slate-300 dark:text-slate-600 mb-3" size={32} />
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('no_meds')}</p>
          </div>
        ) : (
          /* UPDATED TIMELINE LAYOUT to fix overlapping */
          <div className="space-y-6 relative before:absolute before:left-[5rem] before:top-6 before:bottom-6 before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-700">
            {todaysMeds.map((med, idx) => {
              const isTaken = med.status === MedicineStatus.Taken;
              const isSkipped = med.status === MedicineStatus.Skipped;
              const isMissed = med.status === MedicineStatus.Missed;
              const isPending = med.status === MedicineStatus.Pending;
              
              const timeParts = formatTimeDisplay(med.time).split(' ');
              
              return (
                <div key={`${med.id}-${med.time}`} className="relative pl-28 group">
                  
                  {/* Timeline Dot (Centered on line at left-[5rem]) */}
                  {/* 5rem = 80px. Dot w-3.5 (14px). Left = 80 - 7 = 73px approx 4.55rem */}
                  <div className={`absolute left-[4.55rem] top-8 w-3.5 h-3.5 rounded-full border-[3px] z-10 box-content transition-colors ${
                    isTaken ? 'bg-green-500 border-white dark:border-slate-900 ring-2 ring-green-200 dark:ring-green-900/50' :
                    isMissed ? 'bg-red-500 border-white dark:border-slate-900 ring-2 ring-red-200 dark:ring-red-900/50' :
                    isSkipped ? 'bg-orange-400 border-white dark:border-slate-900' :
                    med.isSnoozed ? 'bg-yellow-400 border-white dark:border-slate-900 animate-pulse' :
                    'bg-white dark:bg-slate-800 border-primary-300 dark:border-primary-600'
                  }`} />
                  
                  {/* Time Display (Left Column) */}
                  <div className="absolute left-4 top-6 w-14 text-right flex flex-col items-end leading-tight">
                    <span className={`font-bold text-lg tracking-tight ${isTaken ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {timeParts[0]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {timeParts[1]}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className={`p-5 rounded-3xl border transition-all duration-300 ${
                    isTaken 
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-transparent opacity-80' 
                      : med.isSnoozed 
                      ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                      : isPending
                      ? 'bg-white dark:bg-slate-800 border-primary-200 dark:border-primary-700 shadow-md shadow-primary-500/5 hover:scale-[1.01]'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                  }`}>
                    <div className="flex justify-between items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <h4 className={`font-bold text-xl ${isTaken ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
                             {med.name}
                           </h4>
                           {isTaken && <CheckCircle size={20} className="text-green-500 animate-pop" />}
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <Pill size={14} /> {med.dose} 
                        </p>
                         {med.notes && <p className="text-xs text-slate-400 mt-1 italic">{med.notes}</p>}
                      </div>

                      {/* Large Action Button for Elderly Friendly UX */}
                      {med.status === MedicineStatus.Pending && !med.isSnoozed && isToday ? (
                        <button 
                          onClick={() => updateMedicineStatus(med.id, med.time, MedicineStatus.Taken)}
                          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-2xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all font-bold text-sm"
                        >
                          <Check size={20} strokeWidth={3} />
                          TAKE
                        </button>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                          isTaken ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' :
                          isMissed ? 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400' :
                          med.status === MedicineStatus.Skipped ? 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400' :
                          'text-slate-500 bg-slate-100 dark:bg-slate-700'
                        }`}>
                          {t(med.status.toLowerCase())}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-pop {
          animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};
