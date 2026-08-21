
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MedicineStatus, Medicine } from '../types';
import { formatDate, timeToMinutes } from '../constants';
import { Bell, Check, Clock, X, Pill, AlertTriangle } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { medicines, updateMedicineStatus, snoozeMedicine, activeSnoozes, notifyCaregiver } = useApp();
  
  // State for different alert levels
  const [preAlert, setPreAlert] = useState<{name: string, time: string} | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<{med: Medicine, time: string} | null>(null);
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  
  // Ref to track if we already alerted/notified for a specific slot to avoid spam
  const notifiedRef = useRef<Record<string, {pre: boolean, due: boolean, late: boolean}>>({});
  
  const audioIntervalRef = useRef<any>(null);

  // --- LOUD ALARM SOUND ENGINE ---
  const playAlarmSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      
      // Create oscillator for a louder "Square" wave alarm
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square'; // Aggressive sound
      
      const now = ctx.currentTime;
      
      // Pattern: High-Low-High-Low (Urgent)
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(440, now + 0.2); // A4
      osc.frequency.setValueAtTime(880, now + 0.4); 
      osc.frequency.setValueAtTime(440, now + 0.6);

      // Volume Envelope (High gain)
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
      
      // Vibrate device if supported
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
      
    } catch (e) {
      console.error("Audio playback blocked:", e);
    }
  };

  // --- SOUND LOOP EFFECT ---
  useEffect(() => {
    if (activeAlarm) {
      playAlarmSound();
      audioIntervalRef.current = setInterval(playAlarmSound, 1500); // Fast loop
    } else {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
        audioIntervalRef.current = null;
      }
    }
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, [activeAlarm]);

  // --- CHECKER LOGIC ---
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = formatDate(now);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      medicines.forEach(med => {
        med.times.forEach(time => {
          const medTimeMinutes = timeToMinutes(time);
          const diff = currentMinutes - medTimeMinutes; // Positive = Late, Negative = Early
          const logKey = `${todayStr}-${time}-${med.id}`;
          
          // Initialize ref for this slot if needed
          if (!notifiedRef.current[logKey]) {
             notifiedRef.current[logKey] = { pre: false, due: false, late: false };
          }
          const tracker = notifiedRef.current[logKey];

          // Check Status from logs
          const statusKey = `${todayStr}-${time}`;
          const currentStatus = med.logs[statusKey] || MedicineStatus.Pending;
          
          // If already Taken/Skipped/Missed, do nothing
          if (currentStatus !== MedicineStatus.Pending) return; 

          // Check if Snoozed
          const snoozeEntry = activeSnoozes.find(s => s.medicineId === med.id && s.timeSlot === time);
          if (snoozeEntry && snoozeEntry.snoozedUntil > Date.now()) return;

          // 1. PRE-ALERT (5 mins before)
          if (diff === -5 && !tracker.pre) {
            setPreAlert({ name: med.name, time });
            tracker.pre = true;
            // Auto dismiss pre-alert after 8s
            setTimeout(() => setPreAlert(null), 8000);
          }

          // 2. DUE ALERT (Actual Time) - Trigger Full Screen
          if (diff === 0 && !tracker.due) {
             // Only trigger once in the minute
             setActiveAlarm({ med, time });
             tracker.due = true;
          }

          // 3. LATE / CAREGIVER ALERT (+7 mins late)
          if (diff === 7 && !tracker.late) {
             // Mark tracker as late to avoid repeated triggers
             tracker.late = true;
             
             // AUTOMATICALLY NOTIFY CAREGIVER
             notifyCaregiver(med.name, "Missed dose by 7 minutes (No Response)", time);
             
             // Also optionally update status to Missed? 
             // updateMedicineStatus(med.id, time, MedicineStatus.Missed);
          }
        });
      });
    };

    const interval = setInterval(checkReminders, 2000); // Check frequently
    checkReminders(); 

    return () => clearInterval(interval);
  }, [medicines, activeSnoozes, notifyCaregiver, updateMedicineStatus]);

  const handleTake = () => {
    if (activeAlarm) {
      updateMedicineStatus(activeAlarm.med.id, activeAlarm.time, MedicineStatus.Taken);
      setActiveAlarm(null);
    }
  };

  const handleSkip = () => {
    if (activeAlarm) {
      updateMedicineStatus(activeAlarm.med.id, activeAlarm.time, MedicineStatus.Skipped);
      setActiveAlarm(null);
    }
  };

  const handleSnooze = (minutes: number) => {
    if (activeAlarm) {
      snoozeMedicine(activeAlarm.med.id, activeAlarm.time, minutes);
      setActiveAlarm(null);
      setShowSnoozeMenu(false);
    }
  };

  // --- RENDER ---

  // 1. Full Screen Overlay (Active Alarm)
  if (activeAlarm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-fade-in p-6">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative">
          
          {/* Pulsing Background */}
          <div className="absolute inset-0 bg-primary-500/10 animate-pulse pointer-events-none"></div>

          {/* Header */}
          <div className="bg-red-500 text-white p-4 text-center font-bold text-lg flex items-center justify-center gap-2 animate-[pulse_1s_infinite]">
            <Bell size={24} className="fill-current" /> Medicine Time!
          </div>

          <div className="p-8 text-center relative z-10">
            {/* Image or Icon - LARGE AND CENTRAL */}
            <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-600 shadow-xl overflow-hidden flex items-center justify-center relative group">
               {activeAlarm.med.image ? (
                 <img src={activeAlarm.med.image} alt="Pill" className="w-full h-full object-cover" />
               ) : (
                 <Pill size={64} className="text-slate-400" />
               )}
               <div className="absolute inset-0 rounded-full border-4 border-primary-500/50 animate-ping pointer-events-none"></div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{activeAlarm.med.name}</h2>
            <div className="inline-block bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 mb-6">
              {activeAlarm.med.dose} • {activeAlarm.time}
            </div>

            {/* Actions - Direct Buttons including Snooze 5m */}
            <div className="space-y-3">
              <button 
                onClick={handleTake}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Check size={24} /> Take Now
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => handleSnooze(5)}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                  >
                    <Clock size={20} /> Snooze 5m
                </button>

                <button 
                  onClick={handleSkip}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <X size={20} /> Skip
                </button>
              </div>
              
              {/* Extra Snooze Options */}
              <button 
                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                className="text-xs text-slate-400 dark:text-slate-500 font-bold underline mt-2"
              >
                More Snooze Options
              </button>
              
              {showSnoozeMenu && (
                 <div className="flex gap-2 justify-center mt-2 animate-fade-in">
                    <button onClick={() => handleSnooze(15)} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">15m</button>
                    <button onClick={() => handleSnooze(30)} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">30m</button>
                    <button onClick={() => handleSnooze(60)} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold">1h</button>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Pre-Alert Banner (Non-intrusive)
  if (preAlert) {
    return (
      <div className="fixed top-4 left-4 right-4 z-40 animate-slide-down">
         <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur shadow-lg rounded-2xl p-4 flex items-center gap-3 border-l-4 border-yellow-500">
            <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase">Upcoming in 5 min</p>
              <p className="font-bold text-slate-800 dark:text-white">{preAlert.name}</p>
            </div>
         </div>
      </div>
    );
  }

  return null;
};
