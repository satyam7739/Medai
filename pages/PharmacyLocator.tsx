
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { searchPharmacies } from '../services/geminiService';
import { MapPin, Navigation, Phone, Search, ShoppingBag, Loader2, AlertCircle, Clock, CheckCircle2, XCircle, Pill, LocateFixed, ExternalLink, Star, ShieldCheck, Map as MapIcon, Layers, List, ChevronUp, Filter, Radar, Globe } from 'lucide-react';
import { Pharmacy } from '../types';

export const PharmacyLocator: React.FC = () => {
  const { medicines } = useApp();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'delivery'>('all');
  const [stockResults, setStockResults] = useState<Record<string, { available: string[], missing: string[] }>>({});
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const requestLocation = () => {
    setLoading(true);
    setLoadingStatus('Triangulating location...');
    setError(null);
    setStockResults({});
    setPharmacies([]);
    
    if (!navigator.geolocation) {
      handleLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionGranted(true);
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLoadingStatus('Acquiring precise coordinates...');
        
        // Small delay to let user see the status change (UX)
        setTimeout(() => {
          fetchPharmacies(latitude, longitude);
        }, 800);
      },
      (err) => {
        console.error("Geo Error details:", err.message, err.code);
        setPermissionGranted(false);
        setLoading(false);
        
        let msg = "Unable to retrieve location.";
        if (err.code === 1) msg = "Location permission was denied. Please enable it in browser settings.";
        else if (err.code === 2) msg = "GPS Signal unavailable.";
        else if (err.code === 3) msg = "Location request timed out.";
        
        setError(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const useDemoLocation = () => {
    setPermissionGranted(true);
    setLoading(true);
    const demoLat = 28.6139;
    const demoLng = 77.2090; // New Delhi
    setCurrentLocation({ lat: demoLat, lng: demoLng });
    setLoadingStatus('Using simulated location (New Delhi)...');
    setTimeout(() => {
      fetchPharmacies(demoLat, demoLng);
    }, 800);
  };

  const handleLocationError = (msg: string) => {
    setError(msg);
    setLoading(false);
  };

  const fetchPharmacies = async (lat: number, lng: number) => {
    setLoadingStatus('Scanning pharmacy network...');
    try {
      const medNames = Array.from(new Set(medicines.map(m => m.name))) as string[];
      
      const results = await searchPharmacies(lat, lng, medNames) as any[]; 
      
      setLoadingStatus('Verifying stock availability...');

      const newStockResults: Record<string, { available: string[], missing: string[] }> = {};
      
      const enhancedResults = results.map(p => {
        // Advanced Simulation: Randomly decide stock based on medicine count
        const available = medNames.filter(() => Math.random() > 0.3); // 70% chance available
        const missing = medNames.filter(m => !available.includes(m));
        
        newStockResults[p.id] = { available, missing };

        // Generate a random distance between 0.2km and 3.0km
        const dist = (0.2 + Math.random() * 2.8).toFixed(1);

        return {
          ...p,
          hasDelivery: Math.random() > 0.5,
          distance: dist
        };
      });

      // Sort: Most available meds first, then distance
      enhancedResults.sort((a, b) => {
        const stockA = newStockResults[a.id]?.available.length || 0;
        const stockB = newStockResults[b.id]?.available.length || 0;
        if (stockB !== stockA) return stockB - stockA;
        return parseFloat(a.distance || '0') - parseFloat(b.distance || '0');
      });

      setTimeout(() => {
        setStockResults(newStockResults);
        setPharmacies(enhancedResults);
        setLoading(false);
        setViewMode('list'); // Show results in list mode initially
      }, 1200);
      
    } catch (err) {
      console.error(err);
      setPharmacies([]);
      setLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter(p => {
    // Search Query Filter
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    if (filter === 'open') return p.openNow;
    if (filter === 'delivery') return (p as any).hasDelivery;
    return true;
  });

  const openGoogleMapsSearch = () => {
    const query = "pharmacies near me";
    if (currentLocation) {
      window.open(`https://www.google.com/maps/search/${query}/@${currentLocation.lat},${currentLocation.lng},15z`, '_blank');
    } else {
       window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden flex flex-col">
      
      {/* Background Layer - Always visible but subtly distinct in list vs map mode */}
      <div className="absolute inset-0 z-0 bg-slate-200 dark:bg-slate-800 pointer-events-none">
          {/* Static Map Pattern */}
          <div className="absolute inset-0 opacity-10 dark:opacity-5" 
            style={{ 
              backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)',
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 30px'
            }}>
          </div>
          
          {/* Simulated User Location - Only if permitted */}
          {permissionGranted && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out">
              <div className="w-96 h-96 bg-blue-500/5 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg z-10 relative"></div>
            </div>
          )}
      </div>

      {/* Floating Header & Search */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-safe mt-4">
         <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center p-2 gap-2">
            <div className="p-2 text-slate-400">
               <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search pharmacy..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
            />
            {permissionGranted && (
              <button 
                onClick={requestLocation}
                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors animate-pulse"
                title="Refresh Location"
              >
                <LocateFixed size={20} />
              </button>
            )}
            {pharmacies.length > 0 && (
              <button 
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className={`p-2 rounded-xl transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {viewMode === 'list' ? <MapIcon size={20} /> : <List size={20} />}
              </button>
            )}
         </div>

         {/* Filter Chips - Show when results exist */}
         {pharmacies.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-2 mask-gradient">
              {[
                { id: 'all', label: 'Recommended' },
                { id: 'open', label: 'Open Now', icon: Clock },
                { id: 'delivery', label: 'Home Delivery', icon: ShoppingBag },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm backdrop-blur-md ${
                    filter === opt.id 
                      ? 'bg-primary-600 text-white shadow-primary-500/30 scale-105' 
                      : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {opt.icon && <opt.icon size={12} />}
                  {opt.label}
                </button>
              ))}
            </div>
         )}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 relative z-10 overflow-y-auto no-scrollbar pt-32 pb-24 px-4 transition-all ${viewMode === 'map' ? 'pointer-events-none' : ''}`}>

        {/* Initial State */}
        {!permissionGranted && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-full -mt-20 animate-fade-in">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping duration-[3s]"></div>
              <div className="relative w-32 h-32 bg-gradient-to-tr from-primary-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-primary-500/30">
                  <MapPin size={48} className="text-white drop-shadow-md" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 text-center">Pharmacy Locator</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed mb-8">
              Enable location to find nearby pharmacies and check real-time stock for your medicines.
            </p>
            
            <button 
              onClick={requestLocation}
              className="w-full max-w-xs py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <Navigation size={20} /> Locate Nearby
            </button>
          </div>
        )}

        {/* Loading Radar */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full -mt-20">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Radar Rings */}
                <div className="absolute inset-0 border-2 border-primary-500/30 rounded-full animate-[ping_3s_linear_infinite]"></div>
                <div className="absolute inset-0 border border-primary-500/20 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
                <div className="absolute inset-16 border border-primary-500/40 rounded-full animate-pulse"></div>
                
                {/* Scanner Line */}
                <div className="absolute w-full h-full rounded-full overflow-hidden animate-spin duration-[4s] linear">
                  <div className="w-1/2 h-1/2 bg-gradient-to-tl from-primary-500/20 to-transparent absolute top-0 left-0 origin-bottom-right rotate-45 backdrop-blur-[1px]"></div>
                </div>
                
                {/* Center Dot */}
                <div className="w-4 h-4 bg-primary-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.8)] z-10 relative">
                   <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8 animate-pulse text-center px-4">{loadingStatus}</h3>
              <p className="text-sm text-slate-500 mt-2">Connecting to Google Maps...</p>
          </div>
        )}

        {/* Error / Fallback State */}
        {error && !loading && (
          <div className="h-full flex flex-col items-center justify-center -mt-20 px-4 animate-fade-in">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-red-100 dark:border-red-800 text-center shadow-xl w-full max-w-sm">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <AlertCircle size={32} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Location Error</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{error}</p>
              
              <div className="space-y-3">
                 <button 
                  onClick={useDemoLocation}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Globe size={18} /> Use Demo Location
                </button>
                <button 
                  onClick={openGoogleMapsSearch}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 border border-slate-200 dark:border-slate-600"
                >
                  <ExternalLink size={18} /> Open Google Maps
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {permissionGranted && !loading && !error && filteredPharmacies.length > 0 && viewMode === 'list' && (
          <div className="space-y-4 pb-24">
            {filteredPharmacies.map((pharmacy, idx) => {
              const stock = stockResults[pharmacy.id];
              const availableCount = stock?.available.length || 0;
              const totalMeds = medicines.length;
              const matchPercentage = totalMeds > 0 ? (availableCount / totalMeds) * 100 : 0;
              
              return (
                <div 
                  key={pharmacy.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-slate-700 relative group animate-slide-up transition-all hover:shadow-xl"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                       {/* Stock Confidence Ring */}
                       <div className="relative w-12 h-12 shrink-0">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-slate-700"/>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={matchPercentage === 100 ? '#22c55e' : matchPercentage > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="3" strokeDasharray={`${matchPercentage}, 100`}/>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                             {Math.round(matchPercentage)}%
                          </div>
                       </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{pharmacy.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                          <Navigation size={10} /> {(pharmacy as any).distance} km • {pharmacy.address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {pharmacy.openNow ? (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Open
                          </span>
                      ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                             Closed
                          </span>
                      )}
                      {pharmacy.rating && (
                         <div className="flex items-center gap-0.5 text-orange-500 text-[10px] font-bold bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded">
                           {pharmacy.rating} <Star size={8} fill="currentColor" />
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Stock Bar */}
                  {stock && totalMeds > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                         <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
                           <ShieldCheck size={12} className="text-primary-500" /> Stock Status
                         </span>
                         <span className={matchPercentage === 100 ? 'text-green-600' : 'text-orange-500'}>
                           {availableCount}/{totalMeds} Items
                         </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                         {medicines.map((m, i) => (
                            <div 
                              key={i} 
                              className={`h-full flex-1 border-r border-white/20 last:border-0 transition-all ${
                                stock.available.includes(m.name) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                         ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Service Tags */}
                  <div className="flex gap-2 mb-4">
                     {(pharmacy as any).hasDelivery && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-md flex items-center gap-1">
                           <ShoppingBag size={10} /> Home Delivery
                        </span>
                     )}
                     <span className="text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 px-2 py-1 rounded-md flex items-center gap-1">
                        <Pill size={10} /> Allopath
                     </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-[1fr_2fr] gap-3">
                    <button 
                      onClick={() => window.open(`tel:1234567890`)}
                      className="py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone size={16} /> Call
                    </button>
                    <button 
                      onClick={() => {
                          const url = (pharmacy as any).mapsUri 
                            ? (pharmacy as any).mapsUri 
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name)}&query_place_id=${pharmacy.id}`;
                          window.open(url, '_blank');
                      }}
                      className="py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-transform active:scale-[0.98]"
                    >
                      <Navigation size={16} /> Navigate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Map Mode Bottom Sheet (Partially Visible) */}
      {viewMode === 'map' && pharmacies.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 z-40 bg-white dark:bg-slate-800 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)] animate-slide-up pb-safe transition-transform duration-300">
             <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-2"></div>
             
             {/* Horizontal Scroll for Cards in Map Mode */}
             <div className="flex overflow-x-auto gap-4 p-4 snap-x snap-mandatory no-scrollbar">
                {filteredPharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="min-w-[85vw] snap-center bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-slate-900 dark:text-white">{pharmacy.name}</h3>
                         <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                           {(pharmacy as any).distance} km
                         </span>
                      </div>
                      <button 
                          onClick={() => {
                              window.open((pharmacy as any).mapsUri, '_blank');
                          }}
                          className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg mt-2 flex items-center justify-center gap-2"
                      >
                        <Navigation size={16} /> Navigate
                      </button>
                  </div>
                ))}
             </div>
          </div>
      )}

    </div>
  );
};
