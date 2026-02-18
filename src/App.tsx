import React, { useState, useEffect } from 'react';
import { Smartphone, BarChart3, Lock, CheckCircle, WifiOff, Loader2, Send, History } from 'lucide-react';

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
    // A. On cherche l'ID partout (URL d'abord, Mémoire ensuite)
    const searchParams = new URLSearchParams(window.location.search);
    let urlId = searchParams.get('client_id');
    const storedId = localStorage.getItem('primavis_client_id');

    // Si on a un ID dans l'URL (première fois), on le sauvegarde pour toujours
    if (urlId) {
      localStorage.setItem('primavis_client_id', urlId);
    } 
    // Si pas d'ID dans l'URL mais qu'on en a un en mémoire, on l'utilise
    else if (storedId) {
      urlId = storedId;
    }

    setClientId(urlId);

    // B. Si on a trouvé aucun ID nul part -> Bloqué direct
    if (!urlId) {
      setIsLoadingAuth(false);
      return;
    }

    // C. Si on a un ID, on vérifie chez n8n qu'il est valide
    // ⚠️ REMPLACE BIEN PAR TON URL DASHBOARD ICI
    const API_URL = "https://automation.primavis.fr/webhook/dashboard"; 

    fetch(`${API_URL}?client_id=${urlId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message === "Client inconnu") {
           console.error("Client rejeté par n8n");
           setIsAuthenticated(false);
           // Si l'ID est faux, on le nettoie de la mémoire pour pas rester bloqué
           localStorage.removeItem('primavis_client_id'); 
        } else {
           // SUCCÈS !
           setIsAuthenticated(true);
           setStats({
             sent: data.envoyes || 0, // Protection contre l'écran blanc (si undefined, met 0)
             clicks: data.clics || 0
           });
        }
      })
      .catch(err => {
        console.error("Erreur réseau", err);
        // En cas d'erreur réseau, on peut choisir de laisser entrer ou non. 
        // Ici on bloque par sécurité, mais tu pourrais mettre setIsAuthenticated(true) pour le mode hors ligne.
        setIsAuthenticated(false); 
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  // --- 2. FONCTION D'ENVOI SMS ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;

    setStatus('loading');

    try {
      // On envoie à n8n avec l'ID du client sécurisé
      const response = await fetch(WEBHOOK_SEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phoneNumber,
          client_id: clientId // On utilise l'ID mémorisé
        }), 
      });

      if (response.ok) {
        setStatus('success');
        setPhoneNumber('');
        // On met à jour le compteur localement pour l'effet immédiat
        setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  // --- 3. LES ÉCRANS DE BLOCAGE (Rendu conditionnel) ---

  // Écran de chargement
  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="font-medium">Connexion sécurisée...</p>
      </div>
    );
  }

  // Écran Cadenas (Si refusé)
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

  // --- 4. L'APPLICATION (Si tout est OK) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      
      {/* HEADER */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Primavis
        </h1>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
          {clientId} {/* Affiche l'ID du client connecté */}
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-6 max-w-md mx-auto">
        
        {/* ONGLETS */}
        <div className="flex p-1 bg-gray-200 rounded-xl mb-8 relative">
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

        {/* PAGE: ENVOI SMS */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro du client
              </label>
              <form onSubmit={handleSend}>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-2xl font-bold text-center tracking-wider py-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none transition-colors placeholder-gray-300 bg-transparent"
                  autoFocus
                />
                
                <button
                  disabled={status === 'loading' || phoneNumber.length < 10}
                  className={`w-full mt-8 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2
                    ${status === 'success' ? 'bg-green-500 shadow-green-500/30' : 
                      status === 'error' ? 'bg-red-500 shadow-red-500/30' : 
                      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/40'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status === 'loading' ? (
                    <Loader2 className="animate-spin" />
                  ) : status === 'success' ? (
                    <> <CheckCircle /> Envoyé ! </>
                  ) : status === 'error' ? (
                    <> <WifiOff /> Erreur </>
                  ) : (
                    <> <Send size={20} /> Envoyer la demande </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PAGE: STATS */}
        {activeTab === 'stats' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <Send size={20} />
                   </div>
                   <div className="text-3xl font-bold text-gray-900">{stats.sent}</div>
                   <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">SMS Envoyés</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                   <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                      <History size={20} />
                   </div>
                   <div className="text-3xl font-bold text-gray-900">{stats.clicks}</div>
                   <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Clics Avis</div>
                </div>
             </div>
             
             <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                <p className="text-sm text-blue-800">
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
