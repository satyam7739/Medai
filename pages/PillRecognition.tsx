
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { identifyPill } from '../services/geminiService';
import { Camera, Upload, RefreshCw, Check, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';

export const PillRecognition: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{name: string; description: string; confidence: number} | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await identifyPill(base64);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      navigate('/add-medicine', { state: { aiResult: result } });
    }
  };

  const getConfidenceStyle = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Identify Pill</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {/* Image Preview / Placeholder */}
        <div className="w-full max-w-sm aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-6">
              <Camera size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Take a photo or upload an image of the pill.</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center flex-col text-white">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="font-medium">Analyzing...</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-8 w-full max-w-sm space-y-4">
          {!result && !loading && (
             <div className="grid grid-cols-2 gap-4">
               <label className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-700 rounded-xl shadow cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                 <Camera className="text-primary-600 dark:text-primary-400 mb-2" />
                 <span className="text-sm font-medium dark:text-white">Camera</span>
                 <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
               </label>
               <label className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-700 rounded-xl shadow cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                 <Upload className="text-primary-600 dark:text-primary-400 mb-2" />
                 <span className="text-sm font-medium dark:text-white">Upload</span>
                 <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
               </label>
             </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center text-sm">
              {error}
              <button onClick={() => setImage(null)} className="block mx-auto mt-2 font-bold underline">Try Again</button>
            </div>
          )}

          {result && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg animate-slide-up">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{result.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${getConfidenceStyle(result.confidence)}`}>
                  {Math.round(result.confidence)}% Match
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{result.description}</p>
              
              {/* Low Confidence Warning */}
              {result.confidence < 70 && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 p-3 rounded-lg flex items-start gap-3">
                   <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                   <div>
                     <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">Verification Needed</p>
                     <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                       AI confidence is low ({Math.round(result.confidence)}%). Please verify details carefully before using.
                     </p>
                   </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setImage(null)}
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <RefreshCw size={18} /> Retry
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium flex justify-center items-center gap-2 hover:bg-primary-700"
                >
                  <Check size={18} /> {result.confidence < 70 ? 'Verify & Edit' : 'Use Info'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
