
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
// Removed AIStudio from imports as it's now defined globally in this file
import { Match, SportType, Player, User } from './types';
import { MOCK_MATCHES, MOCK_PLAYERS, SPORT_TABS, ROLE_LABELS } from './constants';
import { FaKey, FaRocket, FaRobot, FaSearch, FaTimes, FaExternalLinkAlt, FaChartLine } from 'react-icons/fa';
import { getDeepDiveAnalysis } from './services/gemini';
import { supabase } from './services/supabase';

import Promotions from './Promotions';

// --- COMPONENTS ---
import Sidebar from './Sidebar';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import ManageUser from './ManageUser';
import AccountsData from './AccountsData';
import Dream11Hash from './Dream11Hash';
import TeamWizard from './TeamWizard';
import GeneratedTeams from './GeneratedTeams';
import Analytics from './Analytics';
import Register from './Register';
import MatchSeriesManager from './MatchSeriesManager';
import CustomMatch from './CustomMatch';
import SavedTeams from './SavedTeams';
import DataManagement from './DataManagement';
import { BestTips, HowToGenerate, AboutUs } from './StaticPages';

const BottomNav = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 max-w-lg mx-auto shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <button onClick={() => navigate('/')} className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition-colors">
        <span className="text-xl">🏠</span>
        <span className="text-[10px] font-medium mt-1 uppercase tracking-tighter">Home</span>
      </button>
      <button onClick={() => navigate('/saved-teams')} className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition-colors">
        <span className="text-xl">📅</span>
        <span className="text-[10px] font-medium mt-1 uppercase tracking-tighter">History</span>
      </button>
      <button onClick={() => navigate('/custom-match')} className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition-colors relative">
        <span className="text-xl text-orange-600">➕</span>
        <span className="text-[10px] font-bold mt-1 text-orange-600 uppercase tracking-tighter">Custom</span>
      </button>
      <button onClick={() => navigate('/profile')} className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition-colors">
        <span className="text-xl">👤</span>
        <span className="text-[10px] font-medium mt-1 uppercase tracking-tighter">Profile</span>
      </button>
    </div>
  );
};

const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(match.matchTime).getTime() - now;
      if (distance < 0) {
        setTimeLeft('LIVE');
        clearInterval(timer);
      } else {
        const h = Math.floor(distance / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [match.matchTime]);

  return (
    <div 
      onClick={() => navigate(`/match/${match.id}`)}
      className="bg-white rounded-3xl shadow-sm mb-5 overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative"
    >
      <div className="px-5 py-2 bg-gray-50/80 border-b flex justify-between items-center">
        <div className="flex items-center gap-1.5">
           <span className="text-[8px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{match.sport}</span>
        </div>
        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{match.seriesName}</div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
            <div className="w-5/12">
                <div className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none break-words">
                    {match.leftTeam.name}
                </div>
                <div className="text-[10px] font-black text-orange-600 mt-1 uppercase tracking-widest">{match.leftTeam.shortName}</div>
            </div>
            <div className="w-2/12 flex flex-col items-center">
                <div className="text-xs font-black text-gray-200 italic">VS</div>
            </div>
            <div className="w-5/12 text-right">
                <div className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none break-words">
                    {match.rightTeam.name}
                </div>
                <div className="text-[10px] font-black text-orange-600 mt-1 uppercase tracking-widest">{match.rightTeam.shortName}</div>
            </div>
        </div>

        <div className="flex justify-between items-center px-2">
          <img src={match.leftTeam.image} className="w-12 h-12 rounded-xl border border-gray-100 shadow-sm object-cover" alt="" />
          <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black tracking-widest ${timeLeft === 'LIVE' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-800'}`}>
            {timeLeft}
          </div>
          <img src={match.rightTeam.image} className="w-12 h-12 rounded-xl border border-gray-100 shadow-sm object-cover" alt="" />
        </div>
      </div>
      
      <div className="px-5 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100">
        <div className="flex gap-2">
            <div className="px-3 py-1 rounded-full bg-white border border-gray-100 text-orange-600 text-[8px] font-black uppercase shadow-sm">
                🏆 {match.contestTag || 'MEGA CONTEST'}
            </div>
            {match.lineupOut && (
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> LINEUPS OUT
                </div>
            )}
        </div>
        {match.isPrime && <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em]">PRIME ★</span>}
      </div>
    </div>
  );
};

const Home = () => {
  const [activeSport, setActiveSport] = useState<SportType>('cricket');
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [hasKey, setHasKey] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedAnalysisMatch, setSelectedAnalysisMatch] = useState<Match | null>(null);
  const [analysisData, setAnalysisData] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [adminMatches, setAdminMatches] = useState<Match[]>([]);

  useEffect(() => {
    // Only use MOCK_MATCHES or DB matches, ignoring local storage "saved" matches
    setLiveMatches(MOCK_MATCHES);
    
    // Check API Key
    const checkKey = async () => {
        // @ts-ignore - aistudio is globally defined by the environment
        if (window.aistudio) {
            // @ts-ignore
            const result = await window.aistudio.hasSelectedApiKey();
            setHasKey(result);
        }
    };
    checkKey();

    // Fetch Admin Updated Matches from Supabase
    const fetchAdminMatches = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data && !error) {
                const matches = data.map((m: any) => {
                    // If data column exists, use it, otherwise construct from fields
                    if (m.data) return m.data as Match;
                    
                    return {
                        id: m.id,
                        seriesName: m.series || 'Unknown Series',
                        matchTime: m.date_time_gmt || new Date().toISOString(),
                        leftTeam: { 
                            name: m.t1 || 'Team 1', 
                            shortName: m.t1s || 'T1', 
                            image: m.t1_img || '' 
                        },
                        rightTeam: { 
                            name: m.t2 || 'Team 2', 
                            shortName: m.t2s || 'T2', 
                            image: m.t2_img || '' 
                        },
                        sport: 'cricket', // Defaulting to cricket as per schema limitations
                        lineupOut: m.status === 'Live' || m.status === 'Completed',
                        automatic: true,
                        isExpert: true,
                        isPrime: false
                    } as Match;
                });
                // Combine MOCK matches with DB matches
                setLiveMatches(prev => {
                    const dbIds = matches.map((m: Match) => m.id);
                    const filteredMock = MOCK_MATCHES.filter(m => !dbIds.includes(m.id));
                    return [...matches, ...filteredMock];
                });
                setAdminMatches(matches);
            }
        } catch (err) {
            console.error("Error fetching admin matches:", err);
        }
    };
    fetchAdminMatches();
  }, []);

  const handleConnectKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
          // @ts-ignore
          await window.aistudio.openSelectKey();
          setHasKey(true);
      }
  };

  const handleDeepDive = async (m: Match) => {
    setSelectedAnalysisMatch(m);
    setIsAnalysisLoading(true);
    setAnalysisData(null);
    try {
        // Look up players for this match
        let players = MOCK_PLAYERS[m.id];
        
        // If not in MOCK_PLAYERS, check local storage cache (for custom matches)
        if (!players) {
            const customPlayers = JSON.parse(localStorage.getItem('custom_players_cache') || '{}');
            players = customPlayers[m.id];
        }

        // If still no players, we can't do a deep dive effectively, but we'll try with just match info
        const result = await getDeepDiveAnalysis(m, players || []);
        setAnalysisData(result);
    } catch (err) {
        setAnalysisData("Failed to fetch analysis. Check API Key.");
    } finally {
        setIsAnalysisLoading(false);
    }
  };

  const filteredMatches = liveMatches.filter(m => m.sport === activeSport);

  return (
    <div className="pb-40 bg-gray-50 min-h-screen">
      <div className="bg-white sticky top-[56px] z-40 border-b flex overflow-x-auto scrollbar-hide shadow-sm px-2">
        {SPORT_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveSport(tab.value)}
            className={`flex flex-col items-center flex-1 min-w-[80px] py-4 px-1 transition-all border-b-4 ${
              activeSport === tab.value ? 'border-orange-600 text-orange-600 bg-orange-50/30' : 'border-transparent text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-black mt-1.5 uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <Promotions />
      
      <div className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Upcoming Fixtures</h2>
          <button 
            onClick={() => setShowAnalysisModal(true)}
            className="text-[10px] font-black text-white bg-orange-600 px-4 py-2 rounded-2xl shadow-lg shadow-orange-100 flex items-center gap-2 uppercase animate-pulse"
          >
            <FaRobot /> Mukesh AI Analisis
          </button>
        </div>
        
        {filteredMatches.length > 0 ? (
          filteredMatches.map(m => <MatchCard key={m.id} match={m} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 m-4">
            <span className="text-4xl mb-4">🏜️</span>
            <p className="font-black text-xs uppercase tracking-widest text-gray-300">No matches for this sport</p>
          </div>
        )}
      </div>

      {/* Mukesh AI Analysis Modal */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex flex-col items-center justify-end animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-t-[3rem] h-[90vh] flex flex-col overflow-hidden">
                <div className="p-8 border-b flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">AI Deep Dive</h3>
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Mukesh AI Multi-Source Engine</p>
                    </div>
                    <button onClick={() => { setShowAnalysisModal(false); setAnalysisData(null); setSelectedAnalysisMatch(null); }} className="p-4 bg-gray-100 rounded-full text-xl"><FaTimes /></button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-6">
                    {!selectedAnalysisMatch ? (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Select match for live research</h4>
                            {adminMatches.length === 0 && (
                                <div className="text-center text-xs text-gray-400 font-bold py-10">
                                    No Admin-managed matches found. <br/> Please create a custom match first.
                                </div>
                            )}
                            {adminMatches.filter(m => m.sport === activeSport).map(m => (
                                <button 
                                    key={m.id}
                                    onClick={() => handleDeepDive(m)}
                                    className="w-full bg-gray-50 p-6 rounded-3xl border-2 border-transparent hover:border-orange-200 transition-all text-left flex items-center justify-between"
                                >
                                    <div>
                                        <div className="text-sm font-black text-gray-900 uppercase">{m.leftTeam.shortName} vs {m.rightTeam.shortName}</div>
                                        <div className="text-[8px] font-bold text-gray-400 uppercase mt-1">{m.seriesName}</div>
                                    </div>
                                    <FaSearch className="text-orange-300" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-orange-600 text-white p-6 rounded-3xl flex justify-between items-center shadow-xl">
                                <div>
                                    <div className="text-[8px] font-black opacity-60 uppercase mb-1">Analyzing Fixture</div>
                                    <div className="text-lg font-black uppercase tracking-tighter">{selectedAnalysisMatch.leftTeam.shortName} VS {selectedAnalysisMatch.rightTeam.shortName}</div>
                                </div>
                                <button onClick={() => { setSelectedAnalysisMatch(null); setAnalysisData(null); }} className="text-[8px] font-black bg-white/20 px-3 py-1.5 rounded-full uppercase">Change Match</button>
                            </div>

                            {isAnalysisLoading ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                                    <div className="text-center">
                                        <div className="text-xs font-black text-gray-900 uppercase tracking-widest">Searching Crex & Cricbuzz...</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mt-2">Checking match timing and pitch data</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 prose prose-sm max-w-none">
                                        <div className="text-sm text-orange-900 font-medium whitespace-pre-wrap leading-relaxed">
                                            {analysisData}
                                        </div>
                                    </div>
                                    <div className="mt-8 flex items-center justify-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600 border"><FaChartLine /></div>
                                            <span className="text-[8px] font-black uppercase text-gray-400 mt-2">Recent Form</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600 border"><FaSearch /></div>
                                            <span className="text-[8px] font-black uppercase text-gray-400 mt-2">Pitch Report</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-600 border"><FaExternalLinkAlt /></div>
                                            <span className="text-[8px] font-black uppercase text-gray-400 mt-2">Expert View</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

const MatchView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const liveMatches = JSON.parse(localStorage.getItem('live_matches') || '[]');
  const match = [...liveMatches, ...MOCK_MATCHES].find(m => m.id === id);
  
  const customPlayers = JSON.parse(localStorage.getItem('custom_players_cache') || '{}');
  const players = customPlayers[id || ''] || MOCK_PLAYERS[id || ''] || [];
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState(0);

  if (!match) return <div className="p-4">Match not found</div>;

  const roles = ROLE_LABELS[match.sport];
  const currentRolePlayers = players.filter((p: Player) => p.role === activeRole);

  const togglePlayer = (pId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(pId) ? prev.filter(i => i !== pId) : [...prev, pId]
    );
  };

  return (
    <div className="bg-white min-h-screen pb-48">
      <div className="bg-orange-600 text-white p-4 rounded-b-[2.5rem] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate('/')} className="p-2 bg-white/10 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="text-center">
            <div className="text-[8px] uppercase font-black opacity-60 tracking-[0.2em] mb-0.5">{match.seriesName}</div>
            <div className="text-lg font-black tracking-tighter">{match.leftTeam.shortName} VS {match.rightTeam.shortName}</div>
          </div>
          <div className="w-10"></div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
            <div className="text-[7px] opacity-60 font-black uppercase mb-0.5">Squad</div>
            <div className="text-lg font-black">{selectedPlayers.length}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
            <div className="text-[7px] opacity-60 font-black uppercase mb-0.5">{match.leftTeam.shortName}</div>
            <div className="text-lg font-black">{players.filter((p: Player) => selectedPlayers.includes(p.id) && p.teamIndex === 0).length}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 text-center border border-white/5">
            <div className="text-[7px] opacity-60 font-black uppercase mb-0.5">{match.rightTeam.shortName}</div>
            <div className="text-lg font-black">{players.filter((p: Player) => selectedPlayers.includes(p.id) && p.teamIndex === 1).length}</div>
          </div>
        </div>
      </div>

      <div className="flex bg-white border-b sticky top-[56px] z-30 shadow-sm overflow-x-auto scrollbar-hide">
        {roles.map((label, idx) => (
          <button
            key={label}
            onClick={() => setActiveRole(idx)}
            className={`flex-1 min-w-[80px] py-4 text-[9px] font-black uppercase tracking-widest transition-all ${
              activeRole === idx ? 'text-orange-600 bg-orange-50 border-b-2 border-orange-600' : 'text-gray-400'
            }`}
          >
            {label} ({players.filter((p: Player) => p.role === idx).length})
          </button>
        ))}
      </div>

      <div className="space-y-1.5 px-3 py-3">
            {currentRolePlayers.map((p: Player) => (
            <div 
                key={p.id} 
                onClick={() => togglePlayer(p.id)}
                className={`flex items-center p-2.5 rounded-2xl cursor-pointer transition-all border ${selectedPlayers.includes(p.id) ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-gray-100'}`}
            >
                <div className="w-2/3 flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-xl border border-white shadow-sm bg-gray-50 object-cover" />
                    <div>
                        <div className="text-xs font-black text-gray-800 uppercase tracking-tighter truncate max-w-[120px]">{p.name}</div>
                        <div className="text-[8px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">{p.credits} CR</div>
                    </div>
                </div>
                <div className="flex-1 text-right">
                    <div className="text-[10px] font-black text-gray-800">{p.selectedBy}%</div>
                    <div className={`mt-1 p-1 rounded-lg inline-block ${selectedPlayers.includes(p.id) ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-200'}`}>
                        {selectedPlayers.includes(p.id) ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                    </div>
                </div>
            </div>
            ))}
      </div>

      {selectedPlayers.length >= 11 && (
        <div className="fixed bottom-24 left-0 right-0 px-6 max-w-lg mx-auto pointer-events-none z-[60]">
          <button 
            onClick={() => navigate(`/wizard/${id}`)}
            className="pointer-events-auto w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            MUKESH AI GENERATOR
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m-7 7h18" /></svg>
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

const Profile = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') || 'customer';
    const [dream11Mobile, setDream11Mobile] = useState('');
    const [dream11Otp, setDream11Otp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isDream11Connected, setIsDream11Connected] = useState(false);
    const [connectedNumber, setConnectedNumber] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('dream11_mobile').eq('id', user.id).single();
                if (data?.dream11_mobile) {
                    setIsDream11Connected(true);
                    setConnectedNumber(data.dream11_mobile);
                }
            }
        };
        fetchProfile();
    }, []);

    const generateMobile = () => {
        const prefix = ['9', '8', '7', '6'];
        const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
        const randomRest = Math.floor(100000000 + Math.random() * 900000000).toString().substring(0, 9);
        setDream11Mobile(randomPrefix + randomRest);
    };

    const handleSendOtp = () => {
        if (dream11Mobile.length !== 10) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        setIsOtpSent(true);
        alert(`OTP sent to ${dream11Mobile}. (Simulation: Use 123456)`);
    };

    const handleVerifyOtp = async () => {
        if (dream11Otp === '123456') {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ dream11_mobile: dream11Mobile }).eq('id', user.id);
                setIsDream11Connected(true);
                setConnectedNumber(dream11Mobile);
                setIsOtpSent(false);
                setDream11Mobile('');
                setDream11Otp('');
            } else {
                // Fallback for demo without auth
                setIsDream11Connected(true);
                setConnectedNumber(dream11Mobile);
                setIsOtpSent(false);
            }
        } else {
            alert('Invalid OTP');
        }
    };

    const handleDisconnect = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ dream11_mobile: null }).eq('id', user.id);
        }
        setIsDream11Connected(false);
        setConnectedNumber('');
    };

    return (
    <div className="p-6 pb-32 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 mb-6 flex flex-col items-center border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none uppercase">MUKESH AI</div>
            <img src="https://picsum.photos/id/64/150/150" className="w-28 h-28 rounded-[2rem] border-8 border-orange-50 mb-4 shadow-xl" />
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Welcome Back</h2>
            <div className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-200">
                {role === 'admin' ? 'System Administrator' : 'Mukesh AI Member'}
            </div>
        </div>

        {/* Dream11 Integration Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">🏏</div>
                <div>
                    <div className="font-black text-sm text-gray-900 uppercase">Dream11 Connect</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Link Account for Auto-Join</div>
                </div>
            </div>

            {isDream11Connected ? (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Connected Number</div>
                            <div className="text-lg font-black text-gray-800">+91 {connectedNumber}</div>
                        </div>
                        <button onClick={handleDisconnect} className="bg-white text-red-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border border-red-100 shadow-sm">Disconnect</button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {!isOtpSent ? (
                        <>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Mobile Number" 
                                    value={dream11Mobile}
                                    onChange={(e) => setDream11Mobile(e.target.value)}
                                    maxLength={10}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-100"
                                />
                                <button onClick={generateMobile} className="bg-gray-100 text-gray-600 px-3 rounded-xl text-lg" title="Generate Random Number">🎲</button>
                            </div>
                            <button onClick={handleSendOtp} className="w-full bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-100">
                                Send OTP
                            </button>
                        </>
                    ) : (
                        <>
                            <input 
                                type="text" 
                                placeholder="Enter OTP (123456)" 
                                value={dream11Otp}
                                onChange={(e) => setDream11Otp(e.target.value)}
                                maxLength={6}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-100"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setIsOtpSent(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-[10px] uppercase">
                                    Back
                                </button>
                                <button onClick={handleVerifyOtp} className="flex-[2] bg-red-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-red-100">
                                    Verify & Login
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        
        <div className="space-y-4">
            {role === 'admin' && (
                <div onClick={() => navigate('/admindecisionpanel')} className="bg-orange-600 text-white rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-orange-100 cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🛠️</div>
                        <div>
                            <div className="font-black text-sm uppercase">Mukesh Admin</div>
                            <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Manage Roster & Users</div>
                        </div>
                    </div>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
            )}
            
            {role !== 'admin' && (
                <div onClick={() => navigate('/login')} className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl">🔑</div>
                        <div>
                            <div className="font-black text-sm text-gray-800 uppercase">Expert Login</div>
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Access AI Portal</div>
                        </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
            )}
        </div>
        
        {role === 'admin' && (
            <button 
                onClick={() => {
                    localStorage.removeItem('userRole');
                    window.location.reload();
                }} 
                className="w-full mt-10 bg-red-50 text-red-600 py-5 rounded-3xl font-black text-xs border-2 border-red-100 uppercase tracking-widest active:bg-red-600 active:text-white transition-all shadow-sm"
            >
                Terminate AI Session
            </button>
        )}
    </div>
    );
};

const App = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'customer');

  const handleLoginSuccess = (role: string) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setUserRole('customer');
  };

  return (
    <HashRouter>
      <div className="max-w-lg mx-auto bg-gray-100 min-h-screen relative shadow-2xl overflow-x-hidden border-x border-gray-200">
        <Sidebar userRole={userRole} onLogout={handleLogout} />
        
        <div className="mt-[56px]">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/match/:id" element={<MatchView />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/wizard/:id" element={<TeamWizard />} />
            <Route path="/generated-teams" element={<GeneratedTeams />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/custom-match" element={<CustomMatch />} />
            <Route path="/saved-teams" element={<SavedTeams />} />
            <Route path="/data-management" element={<DataManagement />} />
            
            {/* STATIC PAGES */}
            <Route path="/besttips" element={<BestTips />} />
            <Route path="/howtogenerate" element={<HowToGenerate />} />
            <Route path="/aboutus" element={<AboutUs />} />
            
            {/* ADMIN ROUTES */}
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/manage-matches" element={userRole === 'admin' ? <MatchSeriesManager /> : <Navigate to="/login" />} />
            <Route path="/admindecisionpanel" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
            <Route path="/manageuser" element={userRole === 'admin' ? <ManageUser /> : <Navigate to="/login" />} />
            <Route path="/accountsdata" element={userRole === 'admin' || userRole === 'superuser' ? <AccountsData /> : <Navigate to="/login" />} />
            <Route path="/adminaccountsdata" element={userRole === 'admin' ? <AccountsData /> : <Navigate to="/login" />} />
            <Route path="/dream11hashvalue" element={userRole === 'admin' ? <Dream11Hash /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Home />} />
            </Routes>
        </div>
        
        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
