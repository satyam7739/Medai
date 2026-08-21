
import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_EMERGENCY_NUMBERS } from '../constants';
import { Phone, ArrowLeft, MessageCircle, MapPin, ShieldAlert, Radio, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SOS: React.FC = () => {
  const { user, triggerSOS } = useApp();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    triggerSOS(true);
    return () => {
      triggerSOS(false);
      stopAllAudio();
    };
  }, [triggerSOS]);

  // --- AUDIO LOGIC ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
  };

  const playBeep = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const playSiren = () => {
    if (!audioCtxRef.current) initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
  };

  const stopAllAudio = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().then(() => {
        audioCtxRef.current = null;
      });
    }
  };

  // --- INTERACTION LOGIC ---
  const handleSOSClick = () => {
    if (countdown !== null) return; // Already counting
    
    // Start Sequence
    initAudio();
    let count = 3;
    setCountdown(count);
    playBeep(); // First beep

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playBeep();
      } else {
        // Countdown finished
        clearInterval(interval);
        setCountdown(0);
        playSiren();
        handleAlertCaregiver();
        
        // Reset after short delay
        setTimeout(() => setCountdown(null), 3000);
      }
    }, 1000);

    // Store interval to clear on cancel
    (window as any).sosInterval = interval;
  };

  const cancelSOS = () => {
    if ((window as any).sosInterval) {
      clearInterval((window as any).sosInterval);
    }
    setCountdown(null);
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  const handleAlertCaregiver = () => {
    if (user.caregiver?.phone) {
       // Use custom message if available
       const msg = user.caregiver.sosMessage || "I need help immediately! Location: [My Current Location]";
       alert(`🚨 SOS SENT to ${user.caregiver.name} (${user.caregiver.phone})\n\nMessage: "${msg}"`);
    } else {
      alert("No caregiver configured in profile.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      
      {/* Background Radar Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[500px] h-[500px] border border-red-500 rounded-full animate-[ping_3s_linear_infinite]"></div>
        <div className="absolute w-[350px] h-[350px] border border-red-500 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
        <div className="absolute w-[200px] h-[200px] border border-red-500 rounded-full animate-[ping_3s_linear_infinite_2s]"></div>
      </div>

      <div className="p-6 z-10">
        <button onClick={() => navigate('/')} className="p-3 bg-white/10 text-white rounded-full backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 -mt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-red-500/30 mb-4 animate-pulse">
             <Radio size={12} className="animate-pulse" /> Emergency Mode Active
           </div>
           <h1 className="text-4xl font-black text-white tracking-tight">SOS ALERT</h1>
           <p className="text-slate-400 mt-2 text-sm">Tap button below to alert caregiver</p>
        </div>

        {/* Main SOS Button */}
        <div className="relative mb-12">
           {countdown !== null && countdown > 0 && (
             <div className="absolute inset-0 z-20 flex items-center justify-center">
                <span className="text-6xl font-black text-white drop-shadow-md animate-ping">{countdown}</span>
             </div>
           )}

           {countdown === null && (
             <>
                {/* Ripple layers */}
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-[-20px] bg-red-600 rounded-full animate-pulse opacity-10"></div>
             </>
           )}
           
           <button 
             onClick={handleSOSClick}
             disabled={countdown !== null}
             className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-transform border-4 ${
               countdown !== null 
                 ? 'bg-red-600 border-white scale-110' 
                 : 'bg-gradient-to-br from-red-500 to-red-700 border-red-400/30 shadow-[0_0_60px_rgba(239,68,68,0.5)] active:scale-95'
             }`}
           >
             {countdown === null ? (
               <>
                  <ShieldAlert size={64} className="text-white drop-shadow-md" />
                  <span className="text-white font-bold text-2xl mt-2 tracking-widest">HELP</span>
                  <span className="text-red-200 text-xs mt-1 font-medium">TAP TO SEND</span>
               </>
             ) : (
               <div className="w-full h-full rounded-full border-4 border-t-white border-transparent animate-spin"></div>
             )}
           </button>

           {/* Cancel Button (Visible during Countdown) */}
           {countdown !== null && countdown > 0 && (
             <button 
               onClick={cancelSOS}
               className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-white text-red-600 px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce"
             >
               <X size={18} /> CANCEL
             </button>
           )}
        </div>

        {/* Location Info */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full max-w-sm flex items-center gap-3 mb-6">
           <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
             <MapPin size={20} />
           </div>
           <div className="flex-1">
             <p className="text-xs text-slate-400 font-bold uppercase">Current Location</p>
             <p className="text-white text-sm truncate">Locating...</p>
           </div>
        </div>

        {/* Contacts Grid */}
        <div className="w-full max-w-sm space-y-3">
           {user.caregiver && (
             <button
              onClick={handleSOSClick}
              className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:border-red-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                   <MessageCircle size={20} />
                </div>
                <div className="text-left">
                   <span className="block text-white font-bold">{user.caregiver.name}</span>
                   <span className="text-xs text-slate-500">Caregiver</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded text-white group-hover:bg-red-500 transition-colors">ALERT</span>
            </button>
           )}

           <div className="grid grid-cols-2 gap-3">
             {MOCK_EMERGENCY_NUMBERS.slice(0,2).map((item) => (
               <button
                 key={item.number}
                 onClick={() => handleCall(item.number)}
                 className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 transition-colors"
               >
                 <Phone size={20} className="text-white mb-2" />
                 <span className="text-white font-bold text-sm">{item.name}</span>
                 <span className="text-xs text-slate-400">{item.number}</span>
               </button>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};
