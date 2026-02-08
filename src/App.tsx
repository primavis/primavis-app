import React, { useState, useEffect } from 'react';
import { Smartphone, BarChart3, Lock, CheckCircle, WifiOff, Loader2, Send, History } from 'lucide-react';

// 🔗 METS TON LIEN N8N ICI (Production)
const WEBHOOK_SEND = "https://ton-n8n.com/webhook/sms-send"; 

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [clientId, setClientId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cooldown'>('idle');
  
  // Stats fictives (Tu connecteras n8n plus tard pour les rendre réelles)
  const [stats, setStats] = useState({ sent: 124, clicks: 45 });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('client_id');
    setClientId(id);
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
      // On envoie à n8n. C'est n8n qui gérera les 3 mois et le délai !
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
        // Incrémente le compteur localement pour le plaisir du patron
        setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        
        // Anti-Spam VISUEL : On bloque le bouton pendant 5 secondes
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-24 select-none">
      
      {/* HEADER GLASSMORPHISM */}
      <div className="pt-12 pb-4 px-6 bg-white/80 backdrop-blur-xl sticky top-0 z-20 border-b border-slate-200/50 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black text-[#0F172A] tracking-tighter">Primavis<span className="text-blue-600">.</span></h1>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Espace Pro • {clientId}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
           {clientId.charAt(0).toUpperCase()}
        </div>
      </div>

      {activeTab === 'home' && (
        <div className="px-6 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ZONE AFFICHAGE NUMÉRO */}
          <div className="h-32 flex flex-col items-center justify-center mb-4 relative">
             <div className={`text-5xl font-bold tracking-widest transition-all duration-300 ${phoneNumber ? 'text-[#0F172A] scale-100' : 'text-slate-200 scale-95'}`}>
                {phoneNumber ? phoneNumber.replace(/(\d{2})(?=\d)/g, '$1 ') : '06 -- -- -- --'}
             </div>
             
             {/* NOTIFICATIONS */}
             <div className="absolute -bottom-2 h-8 flex items-center justify-center w-full">
               {status === 'loading' && <span className="text-blue-600 text-sm font-medium flex items-center gap-2 animate-pulse"><Loader2 className="animate-spin w-4 h-4"/> Sécurisation...</span>}
               {status === 'success' && <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm animate-bounce"><CheckCircle className="w-4 h-4"/> Programmé (1h)</span>}
               {status === 'error' && <span className="text-red-500 text-sm font-bold flex items-center gap-2"><WifiOff className="w-4 h-4"/> Erreur Réseau</span>}
             </div>
          </div>

          {/* CLAVIER PREMIUM */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handlePress(num.toString())}
                className="h-20 w-full rounded-[28px] bg-white text-[#0F172A] text-3xl font-medium shadow-[0_4px_0px_#E2E8F0] active:shadow-none active:translate-y-[4px] border border-slate-100 transition-all duration-100"
              >
                {num}
              </button>
            ))}
            <div className="flex items-center justify-center opacity-20"><Smartphone className="w-8 h-8"/></div>
            <button
              onClick={() => handlePress('0')}
              className="h-20 w-full rounded-[28px] bg-white text-[#0F172A] text-3xl font-medium shadow-[0_4px_0px_#E2E8F0] active:shadow-none active:translate-y-[4px] border border-slate-100 transition-all duration-100"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-20 w-full rounded-[28px] bg-slate-100 text-slate-500 shadow-[0_4px_0px_#CBD5E1] active:shadow-none active:translate-y-[4px] flex items-center justify-center transition-all duration-100"
            >
              ⌫
            </button>
          </div>

          {/* BOUTON D'ACTION */}
          <button
            onClick={handleSend}
            disabled={status === 'loading' || status === 'cooldown' || phoneNumber.length !== 10}
            className={`w-full h-16 rounded-2xl flex items-center justify-center text-lg font-bold shadow-xl transition-all duration-300 ${
              phoneNumber.length === 10 && status !== 'loading' && status !== 'cooldown'
                ? 'bg-[#0F172A] text-white shadow-blue-900/20 active:scale-95 hover:bg-[#1E293B]' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {status === 'loading' ? <Loader2 className="animate-spin" /> : 
             status === 'cooldown' ? <span className="text-sm">Veuillez patienter...</span> :
             <span className="flex items-center gap-2">ENVOYER LA DEMANDE <Send className="w-5 h-5"/></span>}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 mt-4 px-8 leading-tight">
            En cliquant, je confirme l'accord verbal du client. Un lien de désinscription sera inclus.
          </p>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="px-6 mt-6 animate-in fade-in slide-in-from-right-4 duration-500">
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

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-blue-100 rounded-xl text-blue-700"><History className="w-5 h-5"/></div>
                 <h3 className="font-bold text-slate-800">Activité Récente</h3>
              </div>
              <div className="space-y-4">
                 {[1,2,3].map((_,i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                       <span className="text-slate-500">06 12 •• •• 8{i}</span>
                       <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Envoyé</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-8 pt-4 px-12 flex justify-between items-center z-50 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'text-[#0F172A] -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <Smartphone strokeWidth={activeTab === 'home' ? 3 : 2} className="w-6 h-6" />
          {activeTab === 'home' && <div className="w-1 h-1 bg-[#0F172A] rounded-full mt-1"></div>}
        </button>

        <button 
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'stats' ? 'text-blue-600 -translate-y-1' : 'text-slate-300 hover:text-slate-400'}`}
        >
          <BarChart3 strokeWidth={activeTab === 'stats' ? 3 : 2} className="w-6 h-6" />
          {activeTab === 'stats' && <div className="w-1 h-1 bg-blue-600 rounded-full mt-1"></div>}
        </button>
      </div>

    </div>
  );
}

export default App;
