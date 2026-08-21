import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Gender, LanguageCode } from '../types';
import { INDIAN_LANGUAGES, DISCLAIMER_TEXT } from '../constants';
import { MedAILogo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Languages, Heart, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { updateUser, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user.name || '',
    age: user.age || '',
    gender: user.gender || Gender.PreferNotToSay,
    language: user.language || 'en' as LanguageCode
  });

  // Pre-fill name if it becomes available (e.g. from Signup/Google)
  useEffect(() => {
    if (user.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user.name]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateUser({ ...formData, onboardingComplete: true });
      navigate('/');
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.name.length > 0 && formData.age.toString().length > 0;
    return true;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-green-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full text-center mb-8 flex flex-col items-center relative z-10">
        <div className="mb-6 filter drop-shadow-xl animate-fade-in">
          <MedAILogo className="w-24 h-24" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Med AI</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
          Complete your profile to get personalized health assistance.
        </p>
      </div>

      <div className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 relative z-10 transition-all duration-300">
        
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Basic Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tell us a bit about yourself.</p>
            </div>
            
            <div className="space-y-4">
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <User size={16} className="text-primary-500" /> Name
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
                  placeholder="Your Name"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                  We use this to address you personally.
                </p>
              </div>

              <div className="group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Calendar size={16} className="text-primary-500" /> Age
                </label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
                  placeholder="Years"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                  Helps our AI check for age-related medication risks.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personalize</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tailor Med AI to your needs.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Heart size={16} className="text-pink-500" /> Gender
                </label>
                <div className="relative">
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                  >
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-4 text-slate-400 pointer-events-none rotate-90" size={16} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                  Used to provide accurate physiological health insights.
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Languages size={16} className="text-blue-500" /> Preferred Language
                </label>
                <div className="relative">
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value as LanguageCode})}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                  >
                    {INDIAN_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} ({l.nativeName})</option>)}
                  </select>
                  <ChevronRight className="absolute right-4 top-4 text-slate-400 pointer-events-none rotate-90" size={16} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                  The entire app interface and AI chat will adapt to this language.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-slide-up text-center py-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-[bounce_1s_infinite]">
              <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Completed!</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We are ready to assist you. Remember, you can update these details anytime in your Profile.
            </p>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-800 text-left">
              <strong>Note:</strong> {DISCLAIMER_TEXT}
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
              isStepValid() 
                ? 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/25 transform hover:scale-[1.02]' 
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'Get Started' : 'Next Step'}
            {step !== 3 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
      
      {/* Progress Dots */}
      <div className="mt-8 flex gap-3">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              i === step 
                ? 'w-10 bg-primary-600 shadow-md shadow-primary-500/40' 
                : 'w-2.5 bg-slate-300 dark:bg-slate-700'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};