import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Pill, Activity, User, MessageSquare, AlertCircle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MedAILogo } from './Logo';
import { NotificationBanner } from './NotificationBanner';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on onboarding or auth pages
  const hideNav = !isAuthenticated || !user.onboardingComplete || location.pathname === '/auth';

  if (hideNav) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">{children}</div>;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/medicines', icon: Pill, label: 'Meds' },
    { path: '/reports', icon: FileText, label: 'Reports' }, // Changed Map to Reports
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors relative">
      {/* Global Notification Overlay */}
      <NotificationBanner />

      {/* Top Header - Added pt-safe for Notch */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm px-4 py-3 pt-safe flex justify-between items-center transition-colors">
        <div className="flex items-center gap-2 mt-2">
          <MedAILogo className="w-10 h-10 drop-shadow-sm" />
          <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Med AI</h1>
        </div>
        <button 
          onClick={() => navigate('/sos')}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-500/30 animate-pulse transition-transform active:scale-95 mt-2"
        >
          <AlertCircle size={14} /> SOS
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation - Added pb-safe for Gesture Bar */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe z-30 transition-colors">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-[1px] w-8 h-1 bg-primary-600 dark:bg-primary-400 rounded-b-full transition-all" />
                )}
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};