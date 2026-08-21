import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ScanBarcode, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BarcodeScanner: React.FC = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  // Simulate scanning process
  useEffect(() => {
    const timer = setTimeout(() => {
      setScanning(false);
    }, 3000); // 3 seconds scan simulation
    return () => clearTimeout(timer);
  }, []);

  const handleManualEntry = () => {
     navigate('/add-medicine');
  };

  const handleSimulatedDetect = () => {
    // Mock result
    const mockResult = {
      name: "Dolo 650",
      description: "Fever and Pain Relief. Contains Paracetamol 650mg."
    };
    navigate('/add-medicine', { state: { aiResult: mockResult } });
  };

  return (
    <div className="h-screen bg-black flex flex-col text-white">
      <div className="absolute top-4 left-4 z-20">
        <button onClick={() => navigate(-1)} className="p-3 bg-black/40 rounded-full backdrop-blur-md">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Camera Feed Placeholder */}
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
            <span className="text-slate-600">Camera Feed Active</span>
        </div>

        {/* Overlay Scanner UI */}
        <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-3xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 border-[4px] border-primary-500 rounded-3xl opacity-50"></div>
          
          {scanning && (
            <div className="absolute w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
          )}
        </div>
        
        <p className="relative z-10 mt-8 font-medium text-white/80 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
          Align barcode within frame
        </p>

        {!scanning && (
           <div className="absolute bottom-32 animate-fade-in flex flex-col items-center gap-4 w-full px-8">
             <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center w-full">
               <ScanBarcode size={32} className="mx-auto mb-2 text-primary-400" />
               <p className="font-bold">Barcode Detected</p>
               <p className="text-xs text-slate-300">8901023004561</p>
               <button 
                 onClick={handleSimulatedDetect}
                 className="mt-3 w-full bg-primary-600 py-2 rounded-lg font-bold shadow-lg"
               >
                 Add Medicine
               </button>
             </div>
             <button onClick={() => setScanning(true)} className="text-sm underline text-slate-300">Rescan</button>
           </div>
        )}
      </div>

      {scanning && (
         <div className="absolute bottom-10 w-full text-center">
           <button onClick={handleManualEntry} className="text-sm font-medium text-white/70 hover:text-white">
             Enter Manually
           </button>
         </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};