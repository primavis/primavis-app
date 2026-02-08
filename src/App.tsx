import React, { useState, useEffect } from 'react';
import { Smartphone, BarChart3, Lock, CheckCircle, WifiOff, Loader2, Send, History } from 'lucide-react';

// 🔗 METS TON LIEN N8N ICI
const WEBHOOK_SEND = "https://automation.primavis.fr/webhook/sms-send"; 

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [clientId, setClientId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cooldown'>('idle');
  
  // Stats fictives
  const [stats, setStats] = useState({ sent: 124, clicks: 45 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('client_id');

    if (idFromUrl) {
      setClientId(idFromUrl);
      localStorage.setItem('primavis_client_id', idFromUrl);
    } else {
      const savedId = localStorage.getItem('primavis_client_id');
      if (savedId) setClientId(savedId);
    }
  }, []);

  const handlePress = (num: string) => {
    if (phoneNumber.length < 10) setPhoneNumber(prev => prev + num);
  };
  
  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleSend = async () => {
    if (phoneNumber.length !== 10) return;
    setStatus('loading');

    try {
      const response = await fetch(WEBHOOK_SEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          client_id: clientId,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setStatus('success');
        setPhoneNumber('');
        setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        setTimeout(() => setStatus('cooldown'), 2000);
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // --- ECRAN DE BLOCAGE ---
  if (!clientId) {
    return (
      <div className="h-[100dvh] bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-sm">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès Sécurisé</h1>
          <p className="text-slate-400">Veuillez utiliser votre lien unique <strong>Primavis</strong>.</p>
        </div>
      </div>
    );
  }

  // --- APP ---
  return (
    <div className="h-[100dvh] bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden flex flex-col relative select-none">
      
      {/* HEADER */}
      <div className="pt-8 pb-3 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex justify-between items-center shrink-0 z-10">
        <div>
           <h1 className="text-xl font-black text-[#0F172A] tracking-tighter">Primavis<span className="text-blue-600">.</span></h1>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Espace Pro • {clientId}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-900/20">
           {clientId.charAt(0).toUpperCase()}
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="flex-1 flex flex-col px-6 overflow-hidden animate-in fade-in duration-500 font-sans">
          
          {/* ZONE ROUGE : AFFICHAGE NUMÉRO (Plus gros) */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[120px]">
             {/* Changement ici : text-5xl au lieu de text-4xl */}
             <div className={`text-5xl font-bold tracking-widest transition-all duration-300 ${phoneNumber ? 'text-[#0F172A]' : 'text-slate-200'}`}>
                {phoneNumber ? phoneNumber.replace(/(\d{2})(?=\d)/g, '$1 ') : '06 -- -- -- --'}
             </div>
             
             {/* NOTIFICATIONS */}
             <div className="absolute bottom-4 h-6 flex items-center justify-center w-full">
               {status === 'loading' && <span className="text-blue-600 text-xs font-medium flex items-center gap-1 animate-pulse"><Loader2 className="animate-spin w-3 h-3"/> Sécurisation...</span>}
               {status === 'success' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounce shadow-sm"><CheckCircle className="w-3 h-3"/> Programmé (1h)</span>}
               {status === 'error' && <span className="text-red-500 text-xs font-bold flex items-center gap-1"><WifiOff className="w-3 h-3"/> Erreur Réseau</span>}
             </div>
          </div>

          {/* ZONE BLEUE : CLAVIER (Touches plus grosses) */}
          <div className="shrink-0 mb-6">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePress(num.toString())}
                  // Changements ici : h-16 (plus haut) et text-3xl (texte plus gros)
                  className="h-16 w-full rounded-[24px] bg-white text-[#0F172A] text-3xl font-medium shadow-[0_3px_0px_#E2E8F0] active:shadow-none active:translate-y-[3px] border border-slate-100 transition-all duration-100"
                >
                  {num}
                </button>
              ))}
              <div className="flex items-center justify-center opacity-10"><Smartphone className="w-7 h-7"/></div>
              <button
                onClick={() => handlePress('0')}
                 // Changements ici : h-16 et text-3xl
                className="h-16 w-full rounded-[24px] bg-white text-[#0F172A] text-3xl font-medium shadow-[0_3px_0px_#E2E8F0] active:shadow-none active:translate-y-[3px] border border-slate-100 transition-all duration-100"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                 // Changement ici : h-16
                className="h-16 w-full rounded-[24px] bg-slate-100 text-slate-500 shadow-[0_3px_0px_#CBD5E1] active:shadow-none active:translate-y-[3px] flex items-center justify-center transition-all duration-100"
              >
                ⌫
              </button>
            </div>

            {/* ZONE VERTE : BOUTON ENVOYER (Plus gros) */}
            <button
              onClick={handleSend}
              disabled={status === 'loading' || status === 'cooldown' || phoneNumber.length !== 10}
              // Changements ici : h-16 (plus haut) et text-lg (texte plus gros)
              className={`w-full h-16 rounded-2xl flex items-center justify-center text-lg font-bold shadow-xl transition-all duration-300 ${
                phoneNumber.length === 10 && status !== 'loading' && status !== 'cooldown'
                  ? 'bg-[#0F172A] text-white shadow-blue-900/20 active:scale-95 hover:bg-[#1E293B]' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : 
               status === 'cooldown' ? <span className="text-sm">Veuillez patienter...</span> :
               <span className="flex items-center gap-2 uppercase tracking-wider text-sm font-bold">Envoyer la demande <Send className="w-5 h-5"/></span>}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-3 px-8 leading-tight">
              En cliquant, je confirme l'accord du client.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="flex-1 px-6 mt-6 animate-in fade-in duration-500 overflow-y-auto font-sans">
           <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Envoyés</p>
                <p className="text-4xl font-black text-[#0F172A]">{stats.sent}</p>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-50 rounded-full opacity-50"></div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Clics (Est.)</p>
                <p className="text-4xl font-black text-green-600">{stats.clicks}</p>
              </div>
           </div>
        </div>
      )}

      {/* ZONE JAUNE : BOTTOM BAR (Icônes et texte plus gros) */}
      <div className="shrink-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-8 pt-3 px-8 flex justify-between items-center rounded-t-[24px] z-20">
        <button 
          onClick={() => setActiveTab('home')}
          // Changement ici : w-6 h-6 pour l'icône, text-[10px] pour le texte
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-[#0F172A] -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <Smartphone strokeWidth={3} className="w-6 h-6" />
          <span className="text-[10px] font-bold">Clavier</span>
          {activeTab === 'home' && <div className="w-1 h-1 bg-[#0F172A] rounded-full mt-0.5"></div>}
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          // Changement ici : w-6 h-6 pour l'icône, text-[10px] pour le texte
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'stats' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <BarChart3 strokeWidth={3} className="w-6 h-6" />
          <span className="text-[10px] font-bold">Stats</span>
          {activeTab === 'stats' && <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"></div>}
        </button>
      </div>

    </div>
  );
}

export default App;
