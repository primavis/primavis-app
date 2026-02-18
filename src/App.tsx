import React, { useState, useEffect } from 'react';
import { Smartphone, BarChart3, Lock, CheckCircle, WifiOff, Loader2, Send, History, Delete } from 'lucide-react';

// 🔗 TON LIEN N8N POUR ENVOYER LE SMS
const WEBHOOK_SEND = "https://automation.primavis.fr/webhook/sms-send";

function App() {
  // --- ÉTATS (DATA) ---
  const [activeTab, setActiveTab] = useState<'home' | 'stats'>('home');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'cooldown'>('idle');
  
  // Sécurité et Chargement
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({ sent: 0, clicks: 0 });

  // --- 1. LE CERVEAU (SÉCURITÉ + MÉMOIRE) ---
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let urlId = searchParams.get('client_id');
    const storedId = localStorage.getItem('primavis_client_id');

    if (urlId) {
      localStorage.setItem('primavis_client_id', urlId);
    } else if (storedId) {
      urlId = storedId;
    }

    setClientId(urlId);

    if (!urlId) {
      setIsLoadingAuth(false);
      return;
    }

    // ⚠️ REMPLACE BIEN PAR TON URL DASHBOARD ICI
    const API_URL = "https://automation.primavis.fr/webhook/dashboard"; 

    fetch(`${API_URL}?client_id=${urlId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message === "Client inconnu") {
           console.error("Client rejeté par n8n");
           setIsAuthenticated(false);
           localStorage.removeItem('primavis_client_id'); 
        } else {
           setIsAuthenticated(true);
           setStats({
             sent: data.envoyes || 0,
             clicks: data.clics || 0
           });
        }
      })
      .catch(err => {
        console.error("Erreur réseau", err);
        setIsAuthenticated(false); 
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  // --- 2. FONCTIONS DU PAVÉ NUMÉRIQUE ---
  
  // Gère l'appui sur une touche du pavé
  const handleKeyPress = (key: string | number) => {
    if (typeof key === 'number') {
      if (phoneNumber.length < 10) {
        setPhoneNumber(prev => prev + key);
      }
    } else if (key === 'del') {
      setPhoneNumber(prev => prev.slice(0, -1));
    }
  };

  // Formate le numéro pour l'affichage (ex: 06 12 34 56 78)
  const formatPhoneNumber = (num: string) => {
    return num.match(/.{1,2}/g)?.join(' ') || num;
  };

  // --- 3. FONCTION D'ENVOI SMS ---
  const handleSend = async () => {
    if (phoneNumber.length < 10) return;

    setStatus('loading');

    try {
      const response = await fetch(WEBHOOK_SEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber,
          client_id: clientId
        }), 
      });

      if (response.ok) {
        setStatus('success');
        setPhoneNumber('');
        setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // --- 4. LES ÉCRANS DE BLOCAGE ---

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="font-medium">Connexion sécurisée...</p>
      </div>
    );
  }

  if (!isAuthenticated || !clientId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-6">
          <Lock className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">
          Lien invalide ou abonnement expiré.
        </p>
        <div className="text-xs text-gray-600 font-mono bg-gray-900 px-3 py-1 rounded">
          ID: {clientId || "Aucun"}
        </div>
      </div>
    );
  }

  // Définition des touches du pavé
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'];

  // --- 5. L'APPLICATION PRINCIPALE ---
  // Utilisation de h-screen et flex-col pour occuper tout l'espace sans scroll
  return (
    <div className="h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      
      {/* HEADER */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Primavis
        </h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
          {clientId}
        </div>
      </div>

      {/* CONTENU PRINCIPAL (flex-grow occupe tout l'espace restant) */}
      <div className="flex-grow flex flex-col p-4 max-w-md mx-auto w-full overflow-hidden">
        
        {/* ONGLETS */}
        <div className="flex p-1 bg-gray-200 rounded-xl mb-4 shrink-0 relative">
          <div 
            className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${activeTab === 'stats' ? 'translate-x-full' : ''}`}
          />
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium relative z-10 transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <Smartphone size={18} />
            Nouveau SMS
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium relative z-10 transition-colors ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <BarChart3 size={18} />
            Statistiques
          </button>
        </div>

        {/* PAGE: ENVOI SMS AVEC PAVÉ NUMÉRIQUE */}
        {activeTab === 'home' && (
          <div className="flex-grow flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 h-full justify-between">
            
            {/* ZONE D'AFFICHAGE DU NUMÉRO */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 text-center shrink-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro du client
              </label>
              <div className={`text-4xl font-bold tracking-wider py-4 border-b-2 transition-colors ${phoneNumber ? 'text-gray-900 border-blue-500' : 'text-gray-300 border-gray-200'}`}>
                {phoneNumber ? formatPhoneNumber(phoneNumber) : '06 12 34 56 78'}
              </div>
            </div>

            {/* PAVÉ NUMÉRIQUE GÉANT (flex-grow pour remplir l'espace) */}
            <div className="grid grid-cols-3 gap-3 mb-4 flex-grow">
              {keys.map((key, index) => {
                if (key === '') return <div key={index}></div>; // Espace vide
                
                const isDelete = key === 'del';
                return (
                  <button
                    key={index}
                    onClick={() => handleKeyPress(key)}
                    className={`rounded-2xl text-3xl font-bold shadow-sm border transition-all active:scale-95 flex items-center justify-center h-full
                      ${isDelete 
                        ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-blue-200'
                      }`}
                  >
                    {isDelete ? <Delete size={32} /> : key}
                  </button>
                );
              })}
            </div>
              
            {/* BOUTON D'ENVOI */}
            <button
              onClick={handleSend}
              disabled={status === 'loading' || phoneNumber.length < 10}
              className={`w-full py-5 rounded-xl font-bold text-xl text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0
                ${status === 'success' ? 'bg-green-500 shadow-green-500/30' : 
                  status === 'error' ? 'bg-red-500 shadow-red-500/30' : 
                  'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === 'loading' ? (
                <Loader2 className="animate-spin w-8 h-8" />
              ) : status === 'success' ? (
                <> <CheckCircle className="w-8 h-8" /> Envoyé ! </>
              ) : status === 'error' ? (
                <> <WifiOff className="w-8 h-8" /> Erreur </>
              ) : (
                <> <Send size={28} /> Envoyer la demande </>
              )}
            </button>
          </div>
        )}

        {/* PAGE: STATS (Inchangée) */}
        {activeTab === 'stats' && (
          // ... (Code des stats identique à avant)
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Send size={24} />
                   </div>
                   <div className="text-4xl font-bold text-gray-900">{stats.sent}</div>
                   <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">SMS Envoyés</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                   <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                      <History size={24} />
                   </div>
                   <div className="text-4xl font-bold text-gray-900">{stats.clicks}</div>
                   <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mt-2">Clics Avis</div>
                </div>
             </div>
             
             <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
                <p className="text-lg text-blue-800">
                   Votre taux de conversion est de <strong>{stats.sent > 0 ? Math.round((stats.clicks / stats.sent) * 100) : 0}%</strong>
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
