
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User, Moon, Sun, LogOut, Phone, Languages, UserPlus, Edit2, Camera, ChevronRight, X, Trash2, BellRing, MessageSquare, FileText, AlertOctagon, Info } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../constants';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, updateUser, updateProfilePic, theme, toggleTheme, resetData, logout, t } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingCaregiver, setIsEditingCaregiver] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  
  const [caregiverName, setCaregiverName] = useState(user.caregiver?.name || '');
  const [caregiverPhone, setCaregiverPhone] = useState(user.caregiver?.phone || '');
  const [caregiverRelationship, setCaregiverRelationship] = useState(user.caregiver?.relationship || '');
  
  // Alert Settings
  const [sosMessage, setSosMessage] = useState(user.caregiver?.sosMessage || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCaregiver = () => {
    updateUser({
      caregiver: {
        name: caregiverName,
        phone: caregiverPhone,
        relationship: caregiverRelationship,
        sosMessage: sosMessage
      }
    });
    setIsEditingCaregiver(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleResetData = () => {
    if(confirm("DANGER: Are you sure you want to permanently delete all your data? This cannot be undone.")) {
      resetData();
      navigate('/onboarding');
    }
  }

  const currentLanguageLabel = INDIAN_LANGUAGES.find(l => l.code === user.language)?.label || 'English';

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('profile')}</h1>

      {/* Profile Header & Picture */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-700 shadow-md">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 dark:bg-slate-600 flex items-center justify-center text-primary-600 dark:text-primary-300">
                <User size={40} />
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          >
            <Camera size={14} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
        <h2 className="text-xl font-bold dark:text-white mt-3">{user.name}</h2>
        <p className="text-slate-500 dark:text-slate-400">{user.age} Years • {user.gender}</p>
      </div>

      {/* Settings Group */}
      <div className="space-y-4">
        
        {/* Language Selector */}
        <button 
          onClick={() => setShowLanguageModal(true)}
          className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Languages size={18} />
            </div>
            <div className="text-left">
              <span className="block font-medium leading-none">{t('language')}</span>
              <span className="text-xs text-slate-400 mt-1">{currentLanguageLabel}</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
             <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-slate-700 flex items-center justify-center text-purple-600 dark:text-purple-400">
               {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
             </div>
            <span className="font-medium">{t('appearance')}</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium transition-colors dark:text-white"
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Medical Reports Option - Navigate Only */}
        <button 
          onClick={() => navigate('/medical-reports-history')}
          className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <FileText size={18} />
            </div>
            <span className="font-medium">Medical Report</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* Caregiver Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
               <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-slate-700 flex items-center justify-center text-green-600 dark:text-green-400">
                 <Phone size={18} />
               </div>
               <span className="font-medium">{t('caregiver')}</span>
             </div>
             {!isEditingCaregiver && user.caregiver && (
               <button 
                 onClick={() => setIsEditingCaregiver(true)} 
                 className="text-primary-600 hover:text-primary-700 p-2 bg-primary-50 dark:bg-slate-700 rounded-full transition-colors"
               >
                  <Edit2 size={16} />
               </button>
             )}
          </div>
          
          {isEditingCaregiver ? (
            <div className="space-y-4 animate-fade-in bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <input 
                type="text" 
                value={caregiverName} 
                onChange={e => setCaregiverName(e.target.value)}
                placeholder="Name"
                className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none"
              />
              <input 
                type="text" 
                value={caregiverRelationship} 
                onChange={e => setCaregiverRelationship(e.target.value)}
                placeholder="Relationship (e.g. Spouse)"
                className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none"
              />
              <input 
                type="tel" 
                value={caregiverPhone} 
                onChange={e => setCaregiverPhone(e.target.value)}
                placeholder="Phone"
                className="w-full p-3 border rounded-lg dark:bg-slate-800 dark:border-slate-600 dark:text-white outline-none"
              />

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                   <label className="flex items-center gap-2 text-xs font-bold text-red-500">
                      <AlertOctagon size={14} /> SOS CUSTOM MESSAGE
                   </label>
                   <textarea 
                     rows={2}
                     value={sosMessage}
                     onChange={e => setSosMessage(e.target.value)}
                     placeholder="e.g. I need urgent help! Location shared."
                     className="w-full p-3 text-sm border border-red-200 dark:border-red-900/30 rounded-lg dark:bg-slate-800 dark:text-white outline-none focus:ring-1 focus:ring-red-500"
                   />
                   <p className="text-[10px] text-slate-400">Sent when you trigger SOS.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSaveCaregiver} 
                  disabled={!caregiverName || !caregiverPhone}
                  className="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-bold shadow"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditingCaregiver(false)} 
                  className="px-6 py-3 bg-white dark:bg-slate-800 border text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
             <div>
               {user.caregiver?.name ? (
                 <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center font-bold text-lg">
                        {user.caregiver.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white leading-tight">
                         {user.caregiver.name}
                       </p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">
                         {user.caregiver.relationship || 'Caregiver'}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg text-sm font-mono border border-slate-100 dark:border-slate-700 mb-3">
                      <Phone size={14} />
                      {user.caregiver.phone}
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                   <button 
                    onClick={() => setIsEditingCaregiver(true)}
                    className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-primary-200 dark:border-slate-600 text-primary-600 dark:text-primary-400 px-5 py-2 rounded-full text-sm font-bold shadow-sm"
                   >
                     <UserPlus size={16} /> Add Caregiver
                   </button>
                 </div>
               )}
             </div>
          )}
        </div>

        {/* About App - NEW SECTION */}
        <button 
          onClick={() => navigate('/about')}
          className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Info size={18} />
            </div>
            <span className="font-medium">About App</span>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </button>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button 
            onClick={handleLogout}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
          
          <button 
            onClick={handleResetData}
            className="w-full bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <Trash2 size={16} />
            {t('reset_data')}
          </button>
        </div>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl max-h-[80vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Select Language</h3>
              <button onClick={() => setShowLanguageModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-4">
              <input 
                type="text" 
                placeholder="Search language..." 
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl outline-none dark:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 no-scrollbar">
              {INDIAN_LANGUAGES.filter(l => l.label.toLowerCase().includes(languageSearch.toLowerCase()) || l.nativeName.includes(languageSearch)).map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    updateUser({ language: lang.code });
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                    user.language === lang.code 
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="text-left">
                    <span className={`block font-bold ${user.language === lang.code ? 'text-primary-700 dark:text-primary-300' : 'text-slate-800 dark:text-white'}`}>
                      {lang.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{lang.nativeName}</span>
                  </div>
                  {user.language === lang.code && (
                    <div className="w-4 h-4 rounded-full bg-primary-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
