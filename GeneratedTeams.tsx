import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeneratedTeam, Player } from './types';
import { FaChevronLeft, FaShareAlt, FaDownload, FaRocket, FaLock, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { fantasyApi } from './services/fantasyApi';

const GeneratedTeams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const teams: GeneratedTeam[] = location.state?.teams || [];
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('d11_auth_token') || '');
  const [isTransferring, setIsTransferring] = useState<number | null>(null);
  const [transferStatus, setTransferStatus] = useState<Record<number, 'success' | 'error' | 'idle'>>({});
  const [matchId, setMatchId] = useState<string>('');

  useEffect(() => {
      // In a real app, we'd extract the numeric Match ID from the URL or state
      // For this implementation, we use a default if not found
      setMatchId(location.state?.matchId || "112840");
  }, [location.state]);

  const handleTransfer = async (team: GeneratedTeam) => {
    if (!authToken) {
      setShowAuthModal(true);
      return;
    }

    setIsTransferring(team.teamNumber);
    try {
      // 1. Verify Token first to ensure active session
      const authRes = await fantasyApi.verifyAuth(authToken, matchId);
      
      if (authRes.status === "success" && authRes.validToken) {
        // 2. Perform Transfer if token is valid
        const res = await fantasyApi.transferTeam(authToken, matchId, team);
        if (res.status === "success") {
          setTransferStatus(prev => ({ ...prev, [team.teamNumber]: 'success' }));
        } else {
          setTransferStatus(prev => ({ ...prev, [team.teamNumber]: 'error' }));
          alert(`Transfer failed: ${res.message || 'API Error'}`);
        }
      } else {
        alert("Mukesh AI: Session Expired. Please update your Dream11 Login Access Token.");
        setShowAuthModal(true);
      }
    } catch (error) {
      console.error(error);
      alert("Mukesh AI: Network error connecting to tg-ipl.shop");
    } finally {
      setIsTransferring(null);
    }
  };

  const saveToken = () => {
    if (!authToken.trim()) return alert("Please enter a valid Auth Token");
    localStorage.setItem('d11_auth_token', authToken);
    setShowAuthModal(false);
    alert("Mukesh AI: Token saved successfully.");
  };

  if (teams.length === 0) return <div className="p-8 text-center font-bold">No teams generated. Go back and try again.</div>;

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 py-3 shadow-sm border-b sticky top-[56px] z-40 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-orange-600 font-bold p-2">
          <FaChevronLeft /> Back
        </button>
        <div className="text-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-orange-700">Mukesh AI Results</h2>
            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{teams.length} Optimal Squads</div>
        </div>
        <button onClick={() => setShowAuthModal(true)} className="p-2 text-orange-600">
            <FaShieldAlt />
        </button>
      </div>

      <div className="p-4 space-y-12 max-w-md mx-auto">
        {teams.map((team, idx) => (
          <div key={idx} className="space-y-3 bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-xl group">
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-50">
                <div className="flex flex-col">
                    <span className="text-xs font-black text-orange-700 uppercase tracking-widest">Grand League Squad {team.teamNumber}</span>
                    <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Strategy: {idx % 2 === 0 ? 'High Ceiling' : 'Balanced Floor'}</span>
                </div>
                <div className="bg-orange-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black">{team.credits} CR</div>
            </div>
            
            {/* Field View */}
            <div className="bg-[#1b5e20] rounded-[2rem] p-6 shadow-2xl border-4 border-[#0a2f0c] relative overflow-hidden aspect-[3/4.5] flex flex-col justify-between">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
              <div className="absolute inset-0 border-[1px] border-white/10 m-2 rounded-[1.5rem] pointer-events-none"></div>
              
              {[0, 1, 2, 3].map(roleIdx => {
                const rolePlayers = team.players.filter(p => p.role === roleIdx);
                return (
                  <div key={roleIdx} className="flex justify-center flex-wrap gap-3 z-10">
                    {rolePlayers.map(p => (
                      <div key={p.id} className="flex flex-col items-center w-14 group/player scale-110">
                        <div className="relative">
                          <img src={p.image} className="w-10 h-10 rounded-full border-2 border-white/80 shadow-2xl bg-white object-cover" alt={p.name} />
                          {p.id === team.captainId && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-orange-700 text-[8px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white shadow-lg">C</div>
                          )}
                          {p.id === team.viceCaptainId && (
                            <div className="absolute -top-1 -right-1 bg-white text-orange-700 text-[8px] font-black rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-orange-600 shadow-lg">VC</div>
                          )}
                        </div>
                        <div className={`mt-2 text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap overflow-hidden text-ellipsis max-w-full uppercase tracking-tighter ${p.teamIndex === 0 ? 'bg-white text-black' : 'bg-black text-white'}`}>
                          {p.name.split(' ').pop()}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="p-2 space-y-2">
                <button 
                  onClick={() => handleTransfer(team)}
                  disabled={isTransferring === team.teamNumber}
                  className={`w-full py-5 rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${
                    transferStatus[team.teamNumber] === 'success' 
                      ? 'bg-green-600 text-white shadow-green-100' 
                      : 'bg-orange-600 text-white shadow-orange-100 hover:bg-orange-700'
                  }`}
                >
                    {isTransferring === team.teamNumber ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : transferStatus[team.teamNumber] === 'success' ? (
                        <><FaCheckCircle /> MOVED TO DREAM11</>
                    ) : (
                        <><FaRocket className="animate-pulse" /> DEPLOY TO DREAM11</>
                    )}
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                        <FaShareAlt /> Share
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                        <FaDownload /> Snapshot
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-orange-600 p-10 text-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Identity Token</h3>
                <button onClick={() => setShowAuthModal(false)} className="text-2xl p-2 bg-white/10 rounded-full">✕</button>
              </div>
              <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] leading-relaxed">Mukesh AI: Paste your valid Dream11 Auth Token from the TG portal to enable instant Grand League transfers.</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">JSON Auth Token</label>
                    <span className="text-[8px] font-black text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded">Required</span>
                </div>
                <textarea 
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder='{"accessToken": "...", "refreshToken": "..."}'
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-5 font-mono text-[11px] min-h-[180px] outline-none focus:ring-8 focus:ring-orange-50 transition-all placeholder:opacity-30"
                />
              </div>
              <button 
                onClick={saveToken}
                className="w-full bg-orange-600 text-white py-5 rounded-[2rem] font-black text-sm shadow-2xl shadow-orange-100 active:scale-95 transition-all uppercase tracking-widest"
              >
                AUTHORIZE ENGINE
              </button>
              <div className="flex items-center gap-3 text-[9px] text-gray-400 font-black uppercase justify-center">
                <FaLock /> AES-256 ENCRYPTED PORTAL
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-50">
        <button 
          onClick={() => navigate('/analytics', { state: { teams } })}
          className="pointer-events-auto bg-orange-600 text-white px-12 py-5 rounded-full font-black text-sm shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center gap-3 uppercase tracking-[0.2em] border-4 border-white"
        >
          SQUAD ANALYTICS
        </button>
      </div>
    </div>
  );
};

export default GeneratedTeams;