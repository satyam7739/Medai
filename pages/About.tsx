
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Zap, Code, Cpu, Palette, Trophy, Heart } from 'lucide-react';
import { MedAILogo } from '../components/Logo';

export const About: React.FC = () => {
  const navigate = useNavigate();

  const team = [
    { 
      name: 'Shubham', 
      role: 'Lead Developer', 
      class: 'Tech Wizard',
      level: 99, 
      icon: Code,
      gradient: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-500/40'
    },
    { 
      name: 'Yash', 
      role: 'AI Specialist', 
      class: 'Data Mage',
      level: 98, 
      icon: Cpu,
      gradient: 'from-purple-500 to-pink-400',
      shadow: 'shadow-purple-500/40'
    },
    { 
      name: 'Satyam', 
      role: 'UI/UX Designer', 
      class: 'Pixel Artist',
      level: 97, 
      icon: Palette,
      gradient: 'from-orange-500 to-red-400',
      shadow: 'shadow-orange-500/40'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden font-sans selection:bg-primary-500 selection:text-white">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-[float_10s_linear_infinite]"
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-6">
        <button 
          onClick={() => navigate(-1)} 
          className="self-start p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all active:scale-95 group border border-white/5"
        >
          <ArrowLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex-1 flex flex-col items-center pt-8 pb-12">
          
          {/* Hero Logo Section */}
          <div className="relative mb-8 group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-green-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
            <div className="relative p-8 bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl transform transition-transform duration-500 hover:rotate-3 hover:scale-105">
              <MedAILogo className="w-28 h-28 drop-shadow-lg" />
            </div>
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg rotate-12 animate-bounce">
              v1.0
            </div>
          </div>

          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight mb-2 text-center drop-shadow-sm">
            Med AI
          </h1>
          
          <div className="flex items-center gap-2 mb-12 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
             <Star size={14} className="text-yellow-400 fill-yellow-400" />
             <p className="text-sm font-medium text-slate-300 italic">"because every dose matters"</p>
             <Star size={14} className="text-yellow-400 fill-yellow-400" />
          </div>

          {/* Credits "Hall of Fame" */}
          <div className="w-full max-w-md">
            <div className="flex items-center gap-4 mb-6 px-4">
               <div className="h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
               <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Trophy size={14} className="text-yellow-500" /> Hall of Fame
               </span>
               <div className="h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            </div>

            <div className="grid gap-4 perspective-1000">
              {team.map((member, index) => (
                <div 
                  key={member.name}
                  className="group relative bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Hover Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${member.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    {/* Avatar / Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${member.gradient} p-0.5 shadow-lg ${member.shadow}`}>
                      <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                         <member.icon className="text-white" size={24} />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
                          {member.name}
                        </h3>
                        <span className="text-[10px] font-black uppercase bg-white/10 px-2 py-0.5 rounded text-slate-300">
                          Lvl {member.level}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{member.role}</p>
                      <div className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${member.gradient}`}></div>
                         <span className="text-[10px] text-slate-500 font-mono">{member.class}</span>
                      </div>
                    </div>
                    
                    <Zap size={20} className="text-slate-700 group-hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100 transform group-hover:scale-110 duration-300" fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center py-6 relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-white/5 backdrop-blur-sm hover:bg-black/40 transition-colors cursor-pointer">
              <Heart size={12} className="text-red-500 animate-pulse fill-red-500" />
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">CRAFTED WITH PASSION</span>
           </div>
        </div>

      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -20px); }
        }
      `}</style>
    </div>
  );
};
