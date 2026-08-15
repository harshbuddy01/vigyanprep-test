import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SystemCheck: React.FC = () => {
  const navigate = useNavigate();
  const [browserOk, setBrowserOk] = useState<boolean | null>(null);
  const [screenOk, setScreenOk] = useState<boolean | null>(null);
  const [networkOk, setNetworkOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Check browser
    setBrowserOk(typeof window !== 'undefined' && 'fetch' in window && 'localStorage' in window);

    // Check screen (supports Mobile, Tablet, iPad & PC)
    const checkScreen = () => {
      setScreenOk(window.innerWidth >= 320);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);

    // Check network
    setNetworkOk(typeof navigator !== 'undefined' ? navigator.onLine : true);

    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const allPass = browserOk && screenOk && networkOk;

  return (
    <div className="min-h-screen bg-[#120e08] flex items-center justify-center p-4">
      <div className="bg-[#1a150c] p-8 rounded-2xl border border-amber-900/30 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">System Check</h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between text-amber-100 p-2 rounded-lg bg-black/30 border border-amber-500/10">
            <span>Browser Compatibility</span>
            <span>{browserOk === null ? '...' : browserOk ? '✅ Supported' : '❌ Unsupported'}</span>
          </div>
          <div className="flex items-center justify-between text-amber-100 p-2 rounded-lg bg-black/30 border border-amber-500/10">
            <span>Device Compatibility (iPad / Tab / PC)</span>
            <span>{screenOk === null ? '...' : screenOk ? '✅ Ready' : '❌ Too Small'}</span>
          </div>
          <div className="flex items-center justify-between text-amber-100 p-2 rounded-lg bg-black/30 border border-amber-500/10">
            <span>Internet Connection</span>
            <span>{networkOk === null ? '...' : networkOk ? '✅ Connected' : '❌ Offline'}</span>
          </div>
        </div>
        <button
          disabled={!allPass}
          onClick={() => navigate('/instructions' + window.location.search)}
          className="mt-8 w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900/50 disabled:text-amber-700 text-black font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
        >
          Continue to Instructions →
        </button>
      </div>
    </div>
  );
};
