
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Save, ArrowLeft, ScanBarcode, PenTool, Package, Mic, Edit } from 'lucide-react';
import { Medicine, MedicineType } from '../types';
import { MEDICINE_TYPES } from '../constants';

export const AddMedicine: React.FC = () => {
  const { addMedicine, editMedicine, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine Mode (Add vs Edit)
  const editMode = location.state?.editMode || false;
  const existingMedicine = location.state?.medicine as Medicine | undefined;

  // Tabs
  const [activeTab, setActiveTab] = useState<'manual' | 'scan' | 'barcode'>('manual');

  // Initialize Data
  const initialData = location.state?.aiResult || {};
  
  const [name, setName] = useState(editMode ? existingMedicine?.name || '' : initialData.name || '');
  const [dose, setDose] = useState(editMode ? existingMedicine?.dose || '' : '');
  const [type, setType] = useState<MedicineType>(editMode ? existingMedicine?.type || MedicineType.Tablet : MedicineType.Tablet);
  const [frequency, setFrequency] = useState(editMode ? existingMedicine?.frequency || 1 : 1);
  const [notes, setNotes] = useState(editMode ? existingMedicine?.notes || '' : initialData.description || '');
  
  // Inventory
  const [currentStock, setCurrentStock] = useState(editMode && existingMedicine?.currentStock ? existingMedicine.currentStock.toString() : '');
  const [lowStockThreshold, setLowStockThreshold] = useState(editMode && existingMedicine?.lowStockThreshold ? existingMedicine.lowStockThreshold.toString() : '5');

  // Time Parsing Logic for Edit Mode
  const parseTimes = (timeStrings: string[]) => {
    if (!timeStrings || timeStrings.length === 0) return [{h: 9, m: 0, p: 'AM' as const}];
    return timeStrings.map(t => {
      const [hStr, mStr] = t.split(':');
      let h = parseInt(hStr);
      const m = parseInt(mStr);
      let p: 'AM'|'PM' = 'AM';
      
      if (h >= 12) {
        p = 'PM';
        if (h > 12) h -= 12;
      }
      if (h === 0) {
        h = 12;
        p = 'AM';
      }
      return { h, m, p };
    });
  };

  const [times, setTimes] = useState<{h: number, m: number, p: 'AM'|'PM'}[]>(
    editMode && existingMedicine?.times ? parseTimes(existingMedicine.times) : [{h: 9, m: 0, p: 'AM'}]
  );

  // Voice Input State
  const [listeningField, setListeningField] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check incoming state for mode switch (only if not editing)
    if (!editMode && location.state?.mode === 'scan') setActiveTab('scan');
  }, [location.state, editMode]);

  useEffect(() => {
     // Ensure times array matches frequency
     setTimes(prev => {
      const newTimes = [...prev];
      if (frequency > newTimes.length) {
        for (let i = newTimes.length; i < frequency; i++) {
          newTimes.push({h: 12, m: 0, p: 'PM'});
        }
      } else if (frequency < newTimes.length) {
        newTimes.splice(frequency);
      }
      return newTimes;
    });
  }, [frequency]);

  const updateTime = (index: number, field: 'h'|'m'|'p', value: any) => {
    const newTimes = [...times];
    // Validate Minutes
    if (field === 'm') {
      let val = Number(value);
      if (val < 0) val = 0;
      if (val > 59) val = 59;
      newTimes[index] = { ...newTimes[index], m: val };
    } else {
      newTimes[index] = { ...newTimes[index], [field]: value };
    }
    setTimes(newTimes);
  };

  const startListening = (fieldId: string, setVal: (val: string) => void) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (listeningField === fieldId && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    if (listeningField) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    const langMap: Record<string, string> = {
      'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN', 'ta': 'ta-IN', 'mr': 'mr-IN',
      'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'en': 'en-US', 'hinglish': 'en-IN'
    };
    
    recognition.lang = langMap[user.language] || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListeningField(fieldId);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVal(transcript);
      setListeningField(null);
    };
    recognition.onerror = (event: any) => setListeningField(null);
    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };
    recognition.start();
  };

  const handleSave = () => {
    if (!name || !dose) return;

    // Convert custom times to 24h format string HH:MM
    const timeStrings = times.map(t => {
      let hour = t.h;
      if (t.p === 'PM' && hour < 12) hour += 12;
      if (t.p === 'AM' && hour === 12) hour = 0;
      return `${hour.toString().padStart(2, '0')}:${t.m.toString().padStart(2, '0')}`;
    });

    const newMedData = {
      id: editMode && existingMedicine ? existingMedicine.id : crypto.randomUUID(),
      name,
      dose,
      type,
      frequency,
      times: timeStrings,
      notes,
      logs: editMode && existingMedicine ? existingMedicine.logs : {}, // Preserve logs if editing
      currentStock: currentStock ? parseInt(currentStock) : undefined,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined
    };

    if (editMode) {
       editMedicine(newMedData);
    } else {
       addMedicine(newMedData);
    }
    
    navigate('/');
  };

  const ModeButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => {
        if(editMode) return; // Disable tab switching in edit mode
        if(id === 'scan') navigate('/scan-pill');
        else if(id === 'barcode') navigate('/barcode-scan');
        else setActiveTab(id);
      }}
      disabled={editMode}
      className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
        activeTab === id 
        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700'
      } ${editMode ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={20} className="mb-1" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );

  const renderMicButton = (fieldId: string, setFn: (val: string) => void) => {
    const isListening = listeningField === fieldId;
    return (
      <button 
        onClick={() => startListening(fieldId, setFn)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 z-10 flex items-center justify-center ${
          isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
            : 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500'
        }`}
      >
        {isListening ? (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>
            <Mic size={16} className="relative z-10 animate-pulse" />
          </>
        ) : (
          <Mic size={16} />
        )}
      </button>
    );
  };

  const getInputClass = (fieldId: string) => `
    w-full p-3.5 pr-12 rounded-xl border transition-all duration-200 font-medium
    ${listeningField === fieldId
      ? 'border-red-400 ring-4 ring-red-500/10 dark:ring-red-500/20 shadow-sm' 
      : 'border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary-500'
    } 
    dark:bg-slate-700 dark:text-white outline-none
  `;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">{editMode ? 'Edit Medicine' : 'Add Medicine'}</h1>
      </div>

      {/* Input Method Tabs - Hidden or disabled in Edit Mode */}
      {!editMode && (
        <div className="flex gap-3">
          <ModeButton id="manual" label="Manual" icon={PenTool} />
          <ModeButton id="scan" label="AI Scan" icon={Camera} />
          <ModeButton id="barcode" label="Barcode" icon={ScanBarcode} />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
        
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Medicine Name</label>
          <div className="relative">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={getInputClass('name')}
              placeholder="e.g. Paracetamol"
            />
            {renderMicButton('name', setName)}
          </div>
        </div>

        {/* Medicine Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Medicine Type</label>
          <div className="grid grid-cols-4 gap-2">
            {MEDICINE_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => setType(t.type)}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                  type === t.type
                    ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400'
                }`}
              >
                <span className="text-lg mb-1">{t.icon}</span>
                <span className="text-[10px] font-bold text-center leading-none">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dose */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Dose Strength</label>
          <div className="relative">
            <input 
              type="text" 
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className={getInputClass('dose')}
              placeholder="e.g. 500mg, 10ml"
            />
            {renderMicButton('dose', setDose)}
          </div>
        </div>

        {/* Inventory Tracking */}
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Package size={14} className="text-primary-500" />
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Inventory Tracking</label>
           </div>
           <div className="flex gap-4">
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-400 mb-1">Current Stock</label>
               <input 
                  type="number" 
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none"
                  placeholder="Count"
               />
             </div>
             <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-400 mb-1">Low Stock Alert</label>
               <input 
                  type="number" 
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white outline-none"
                  placeholder="Min Limit"
               />
             </div>
           </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Frequency</label>
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setFrequency(n)}
                className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                  frequency === n
                    ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {n}x
              </button>
            ))}
          </div>
        </div>

        {/* Custom Time Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Schedule Times</label>
          <div className="space-y-3">
            {times.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-400 w-12 text-center">Dose {idx + 1}</span>
                
                {/* Hour */}
                <div className="flex-1 relative">
                  <select 
                    value={t.h}
                    onChange={(e) => updateTime(idx, 'h', Number(e.target.value))}
                    className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-3 pr-8 font-bold text-center dark:text-white"
                  >
                    {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                
                <span className="font-bold text-slate-300">:</span>

                {/* Minute */}
                <div className="flex-1 relative">
                  <input 
                    type="number"
                    min="0"
                    max="59"
                    value={t.m.toString().padStart(2, '0')}
                    onChange={(e) => updateTime(idx, 'm', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-1 font-bold text-center dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* AM/PM */}
                <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                   <button 
                    onClick={() => updateTime(idx, 'p', 'AM')}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${t.p === 'AM' ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                   >AM</button>
                   <button 
                    onClick={() => updateTime(idx, 'p', 'PM')}
                    className={`px-3 py-1.5 rounded text-xs font-bold ${t.p === 'PM' ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                   >PM</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Notes (Optional)</label>
          <div className="relative">
            <textarea 
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${getInputClass('notes')} resize-none`}
              placeholder="e.g. Take after food"
            />
            <div className="absolute right-3 top-3">
              {renderMicButton('notes', setNotes)}
            </div>
          </div>
        </div>

      </div>

      <button 
        onClick={handleSave}
        disabled={!name || !dose}
        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
      >
        {editMode ? <Edit size={20} /> : <Save size={20} />}
        {editMode ? 'Update Medicine' : 'Save Medicine'}
      </button>

    </div>
  );
};
