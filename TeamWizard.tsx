
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player, Match } from './types';
import { MOCK_MATCHES, MOCK_PLAYERS, SIDE_DISTRIBUTIONS, OLD_COMBINATIONS, NEW_COMBINATIONS, ROLE_LABELS } from './constants';
import { FaCheckCircle, FaChevronRight, FaChevronLeft, FaStar, FaShieldAlt, FaFlag, FaCogs, FaRobot, FaPercent, FaSearchPlus, FaMagic, FaPlusCircle, FaTrophy, FaUserShield, FaGem, FaSlidersH, FaTimes } from 'react-icons/fa';
import { generateLegacyTeams } from './utils/generator';
import { getMegaGLAnalysis, getDeepDiveAnalysis } from './services/gemini';
import { supabase, getCurrentUser } from './services/supabase';

type WizardStep = 'fixed' | 'captain' | 'vice-captain' | 'selection-mix' | 'distribution' | 'combinations' | 'generate';

const TeamWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  
  const [step, setStep] = useState<WizardStep>('fixed');
  const [fixedPlayers, setFixedPlayers] = useState<string[]>([]);
  const [captainOptions, setCaptainOptions] = useState<string[]>([]);
  const [vcOptions, setVcOptions] = useState<string[]>([]);
  const [sideDistIndices, setSideDistIndices] = useState<number[]>([]);
  const [selectionMixes, setSelectionMixes] = useState<[number, number][]>([[4, 7]]);
  const [selectedCombinations, setSelectedCombinations] = useState<number[][]>([]);
  const [teamCount, setTeamCount] = useState(11);
  const [genMode, setGenMode] = useState<'sl' | 'gl'>('gl');
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<string | null>(null);
  const [isDeepDiveLoading, setIsDeepDiveLoading] = useState(false);
  const [combTab, setCombTab] = useState<'old' | 'new'>('old');
  
  // Custom Combination Modal State
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [roleRanges, setRoleRanges] = useState({
    wk: { min: 1, max: 2 },
    bat: { min: 3, max: 4 },
    al: { min: 2, max: 3 },
    bowl: { min: 4, max: 5 }
  });

  useEffect(() => {
    const loadMatchData = async () => {
        const customPlayers = JSON.parse(localStorage.getItem('custom_players_cache') || '{}');
        
        if (customPlayers[id || '']) {
            setAllPlayers(customPlayers[id || '']);
            setMatch({
                id: id!,
                seriesName: 'SMART GL BUILD',
                matchTime: '',
                leftTeam: { name: 'Team A', shortName: 'T1', image: '' },
                rightTeam: { name: 'Team B', shortName: 'T2', image: '' },
                sport: 'cricket',
                lineupOut: true,
                automatic: false,
                isExpert: true,
                isPrime: false
            });
        } else {
            // Try fetching from Supabase if not in local cache
            try {
                const { data, error } = await supabase
                    .from('matches')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (data && !error) {
                    setMatch(data.data); // data column stores the match object
                    setAllPlayers(data.players || []); // players column stores the array
                    return;
                }
            } catch (err) {
                console.error("Supabase fetch error", err);
            }

            // Fallback to mock/live matches
            const liveMatches = JSON.parse(localStorage.getItem('live_matches') || '[]');
            const m = [...liveMatches, ...MOCK_MATCHES].find(x => x.id === id);
            if (m) {
                setMatch(m);
                setAllPlayers(MOCK_PLAYERS[id || ''] || []);
            }
        }
    };
    loadMatchData();
  }, [id]);

  const loadAiInsights = async () => {
    if (!match) return;
    setAiAnalysis(null);
    setIsAiLoading(true);
    const analysis = await getMegaGLAnalysis(match, allPlayers, step);
    setAiAnalysis(analysis);
    setIsAiLoading(false);
  };

  const autoSelectRecommended = () => {
    if (!aiAnalysis) return;

    if (step === 'combinations') {
      const matchStructures = aiAnalysis.match(/\[(.*?)\]/g);
      if (matchStructures) {
        const newCombs = matchStructures.map(s => JSON.parse(s));
        setSelectedCombinations(newCombs);
        alert(`Mukesh AI: Selected ${newCombs.length} recommended combinations!`);
      }
      return;
    }

    const lines = aiAnalysis.split('\n');
    const recommendedNames = lines
        .map(l => l.replace(/^[-*•]\s*/, '').trim())
        .filter(l => l.length > 0);
    
    const foundIds = allPlayers
        .filter(p => recommendedNames.some(name => p.name.toLowerCase().includes(name.toLowerCase())))
        .map(p => p.id);
    
    if (foundIds.length > 0) {
        if (step === 'fixed') setFixedPlayers(foundIds);
        else if (step === 'captain') setCaptainOptions(foundIds);
        else if (step === 'vice-captain') setVcOptions(foundIds);
        alert(`Mukesh AI: Selected ${foundIds.length} recommended players!`);
    }
  };

  const loadDeepDive = async () => {
    if (!match) return;
    setIsDeepDiveLoading(true);
    const research = await getDeepDiveAnalysis(match, allPlayers);
    setDeepDiveData(research);
    setIsDeepDiveLoading(false);
  };

  const handleAddCustomRanges = () => {
    const allC = [...OLD_COMBINATIONS, ...NEW_COMBINATIONS];
    const filtered = allC.filter(c => 
      c[0] <= roleRanges.wk.max &&
      c[1] <= roleRanges.bat.max &&
      c[2] <= roleRanges.al.max &&
      c[3] <= roleRanges.bowl.max
    );
    
    if (filtered.length === 0) {
        alert("No standard combinations found. Adding your range as a single rule.");
        setSelectedCombinations([[roleRanges.wk.max, roleRanges.bat.max, roleRanges.al.max, roleRanges.bowl.max]]);
    } else {
        setSelectedCombinations(filtered);
    }
    setShowRangeModal(false);
  };

  if (!match) return <div className="p-4">Syncing roster...</div>;

  const sportIdMap: Record<string, number> = { cricket: 0, football: 1, basketball: 2, kabaddi: 3 };
  const sportId = sportIdMap[match.sport];

  const handleGenerate = async () => {
    const teams = generateLegacyTeams(
      allPlayers,
      fixedPlayers,
      captainOptions,
      vcOptions,
      genMode === 'sl' ? 1 : teamCount,
      sportId,
      sideDistIndices,
      selectionMixes,
      selectedCombinations,
      genMode
    );

    if (teams.length === 0) {
        alert("Mukesh AI: Failed to find valid teams. This is usually due to credit limit (Formula: Avg*11 +/- 2). Try picking fewer fixed players or more combinations.");
        return;
    }

    const historyId = `h_${Date.now()}`;
    const historyItem = {
        id: historyId,
        matchId: id,
        timestamp: new Date().toISOString(),
        teams,
        settings: { teamCount, selectionMixes, mode: genMode, combinations: selectedCombinations }
    };

    // Save to Local Storage (Backup)
    const history = JSON.parse(localStorage.getItem('match_history') || '[]');
    localStorage.setItem('match_history', JSON.stringify([historyItem, ...history]));

    // Save to Supabase
    try {
        const user = await getCurrentUser();
        await supabase.from('saved_teams').insert({
            id: historyId,
            match_id: id,
            teams: teams,
            settings: historyItem.settings,
            user_id: user?.id
        });
    } catch (err) {
        console.error("Supabase save error", err);
    }

    navigate('/generated-teams', { state: { teams, matchId: id } });
  };

  const steps: { key: WizardStep; label: string; icon: any }[] = [
    { key: 'fixed', label: 'Fixed', icon: <FaShieldAlt /> },
    { key: 'captain', label: 'C Pool', icon: <FaStar /> },
    { key: 'vice-captain', label: 'VC Pool', icon: <FaFlag /> },
    { key: 'selection-mix', label: 'Mix %', icon: <FaPercent /> },
    { key: 'distribution', label: 'Ratio', icon: <FaCogs /> },
    { key: 'combinations', label: 'Comb', icon: <FaTrophy /> },
    { key: 'generate', label: 'Launch', icon: <FaChevronRight /> },
  ];

  const toggleCombination = (comb: number[]) => {
      setSelectedCombinations(prev => {
          const exists = prev.find(p => p.join(',') === comb.join(','));
          if (exists) return prev.filter(p => p.join(',') !== comb.join(','));
          return [...prev, comb];
      });
  };

  return (
    <div className="pb-40 bg-gray-50 min-h-screen">
      <div className="bg-[#512da8] px-2 py-4 shadow-sm sticky top-[56px] z-40 border-b border-white/10 flex justify-between overflow-x-auto scrollbar-hide">
        {steps.map((s) => (
          <button 
            key={s.key} 
            onClick={() => { setStep(s.key); setAiAnalysis(null); }}
            className={`flex flex-col items-center min-w-[65px] transition-all ${step === s.key ? 'opacity-100 scale-110' : 'opacity-50 grayscale'}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm ${step === s.key ? 'bg-white text-[#512da8] shadow-lg' : 'bg-white/10 text-white'}`}>
              {s.icon}
            </div>
            <span className="text-[8px] mt-1.5 font-black uppercase tracking-widest text-white">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 max-w-md mx-auto">
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                {step === 'fixed' ? 'Fixed Squad' : step === 'captain' ? 'Captain Candidates' : step === 'vice-captain' ? 'VC Candidates' : step === 'selection-mix' ? 'Ownership Mix' : step === 'distribution' ? 'Side Ratio' : step === 'combinations' ? 'Team Combinations' : 'Final Engine'}
            </h2>
            {(['fixed', 'captain', 'vice-captain', 'distribution', 'selection-mix', 'combinations'].includes(step)) && (
                <button 
                    onClick={loadAiInsights}
                    className="bg-orange-600 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 text-[9px] font-black uppercase"
                >
                    <FaRobot /> {isAiLoading ? 'SYNCING...' : 'AI ADVICE'}
                </button>
            )}
        </div>

        {aiAnalysis && (
            <div className="mb-6 p-5 bg-white border-2 border-orange-100 rounded-[2rem] shadow-xl relative animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[9px] font-black text-orange-900 uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span> AI STRATEGY
                    </h3>
                    <button onClick={() => setAiAnalysis(null)} className="text-gray-300">✕</button>
                </div>
                <div className="text-[11px] text-gray-800 font-bold whitespace-pre-wrap leading-relaxed mb-4">
                    {aiAnalysis}
                </div>
                {(['fixed', 'captain', 'vice-captain', 'combinations'].includes(step)) && (
                    <button onClick={autoSelectRecommended} className="w-full bg-orange-600 text-white py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2">
                        <FaMagic /> AUTO-SELECT AI PICKS
                    </button>
                )}
            </div>
        )}

        {/* --- PLAYER SELECTION STEPS (Fixed, C, VC) --- */}
        {(['fixed', 'captain', 'vice-captain'].includes(step)) && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
                {[0, 1].map(tIdx => (
                    <div key={tIdx} className="space-y-2">
                        <h3 className={`text-[10px] font-black mb-3 uppercase tracking-widest px-3 py-1.5 rounded-xl inline-block ${tIdx === 0 ? 'bg-white text-black border' : 'bg-black text-white'}`}>
                            {tIdx === 0 ? match.leftTeam.shortName : match.rightTeam.shortName}
                        </h3>
                        {allPlayers.filter(p => p.teamIndex === tIdx).map(p => {
                            const list = step === 'fixed' ? fixedPlayers : step === 'captain' ? captainOptions : vcOptions;
                            const setList = step === 'fixed' ? setFixedPlayers : step === 'captain' ? setCaptainOptions : setVcOptions;
                            const isSelected = list.includes(p.id);
                            return (
                                <div 
                                    key={p.id}
                                    onClick={() => setList(prev => isSelected ? prev.filter(i => i !== p.id) : [...prev, p.id])}
                                    className={`flex items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-orange-600 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white'}`}
                                >
                                    <img src={p.image} className="w-8 h-8 rounded-lg border bg-gray-50 object-cover" />
                                    <div className="ml-3 overflow-hidden">
                                        <div className="text-[10px] font-black text-gray-800 truncate uppercase tracking-tighter">{p.name}</div>
                                        <div className="text-[8px] text-gray-400 font-bold uppercase">{p.selectedBy}% SEL</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        )}

        {/* --- SELECTION MIX STEP --- */}
        {step === 'selection-mix' && (
            <div className="space-y-3 animate-fade-in">
                {[ [3,8], [4,7], [5,6], [6,5], [7,4], [8,3] ].map(([low, high]) => {
                    const isSelected = selectionMixes.find(m => m[0] === low && m[1] === high);
                    return (
                        <button
                            key={`${low}-${high}`}
                            onClick={() => {
                                const mix: [number, number] = [low, high];
                                setSelectionMixes(prev => {
                                    const exists = prev.find(m => m[0] === mix[0] && m[1] === mix[1]);
                                    if (exists) return prev.length > 1 ? prev.filter(m => !(m[0] === mix[0] && m[1] === mix[1])) : prev;
                                    return [...prev, mix];
                                });
                            }}
                            className={`w-full p-6 rounded-[2rem] border-2 flex justify-between items-center transition-all ${isSelected ? 'border-orange-600 bg-orange-50' : 'border-white bg-white'}`}
                        >
                            <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{low} Low Selection : {high} High Selection</span>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-100 text-transparent'}`}>
                                <FaCheckCircle size={14} />
                            </div>
                        </button>
                    );
                })}
            </div>
        )}

        {/* --- DISTRIBUTION STEP --- */}
        {step === 'distribution' && (
            <div className="space-y-3 animate-fade-in">
                {(SIDE_DISTRIBUTIONS[sportId] || []).map((dist, idx) => {
                    const isSelected = sideDistIndices.includes(idx);
                    return (
                        <button
                            key={idx}
                            onClick={() => setSideDistIndices(prev => isSelected ? prev.filter(i => i !== idx) : [...prev, idx])}
                            className={`w-full p-8 rounded-[2.5rem] border-2 flex justify-between items-center transition-all ${isSelected ? 'border-orange-600 bg-orange-50' : 'border-white bg-white'}`}
                        >
                            <div className="text-2xl font-black text-gray-900">{dist[0]} : {dist[1]}</div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase text-orange-600 tracking-widest">{match.leftTeam.shortName} / {match.rightTeam.shortName}</div>
                                <div className={`text-[8px] font-black uppercase mt-1 tracking-widest ${isSelected ? 'text-green-600' : 'text-gray-300'}`}>
                                    {isSelected ? 'SELECTED' : 'SELECT RATIO'}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        )}

        {/* --- COMBINATIONS STEP (FROM IMAGES) --- */}
        {step === 'combinations' && (
            <div className="animate-fade-in space-y-4">
                <div className="text-center mb-6">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Proper Combinations for Winning Teams</p>
                    <p className="text-[8px] text-gray-400 mt-1 uppercase tracking-tighter">Follow instructions and select 1 or More Combinations</p>
                </div>

                <div className="bg-white rounded-t-3xl border-b flex mb-1 sticky top-[160px] z-30">
                    <button 
                        onClick={() => setCombTab('old')} 
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${combTab === 'old' ? 'text-[#512da8] border-b-4 border-[#512da8]' : 'text-gray-400'}`}
                    >
                        Old Combinations
                    </button>
                    <button 
                        onClick={() => setCombTab('new')} 
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${combTab === 'new' ? 'text-[#512da8] border-b-4 border-[#512da8]' : 'text-gray-400'}`}
                    >
                        New Combinations
                    </button>
                </div>

                <div className="space-y-1 bg-white border border-gray-100 rounded-b-3xl overflow-hidden mb-20">
                    {(combTab === 'old' ? OLD_COMBINATIONS : NEW_COMBINATIONS).map((comb, idx) => {
                        const isSelected = selectedCombinations.some(p => p.join(',') === comb.join(','));
                        return (
                            <div 
                                key={idx} 
                                onClick={() => toggleCombination(comb)}
                                className={`flex items-center justify-between px-6 py-4 border-b border-gray-50 transition-all cursor-pointer ${isSelected ? 'bg-purple-50' : ''}`}
                            >
                                <div className="flex gap-12">
                                    {comb.map((val, cIdx) => (
                                        <div key={cIdx} className="flex flex-col items-center">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{ROLE_LABELS.cricket[cIdx]}</span>
                                            <span className="text-lg font-black text-gray-800">{val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={`text-2xl ${isSelected ? 'text-green-600' : 'text-green-600 opacity-20'}`}>
                                    {isSelected ? <FaCheckCircle /> : <FaPlusCircle />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="fixed bottom-24 left-0 right-0 px-6 max-w-lg mx-auto flex gap-2 z-50">
                    <button onClick={() => setShowRangeModal(true)} className="flex-1 bg-[#512da8] text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-xl"><FaSlidersH /> Custom</button>
                    <button onClick={loadAiInsights} className="flex-1 bg-[#6a1b9a] text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-xl"><FaGem /> Suggestion</button>
                    <button onClick={() => setStep('generate')} className="flex-1 bg-[#2e7d32] text-white py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-xl">Continue</button>
                </div>
            </div>
        )}

        {/* --- GENERATE / LAUNCH STEP --- */}
        {step === 'generate' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tighter text-center">Engine Parameters</h3>
                    
                    <div className="flex gap-4 mb-10">
                        <button 
                            onClick={() => setGenMode('sl')}
                            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${genMode === 'sl' ? 'bg-[#512da8] text-white border-[#512da8]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                            <FaUserShield size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">SL / H2H</span>
                        </button>
                        <button 
                            onClick={() => setGenMode('gl')}
                            className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${genMode === 'gl' ? 'bg-[#512da8] text-white border-[#512da8]' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                        >
                            <FaTrophy size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">Grand League</span>
                        </button>
                    </div>

                    {genMode === 'gl' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-4 px-2">
                                    <span>Squad Count</span>
                                    <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{teamCount} Teams</span>
                                </div>
                                <input type="range" min="1" max="100" value={teamCount} onChange={e => setTeamCount(parseInt(e.target.value))} className="w-full h-2 bg-gray-100 rounded-full appearance-none accent-orange-600 cursor-pointer" />
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleGenerate}
                    className="w-full bg-[#512da8] text-white py-6 rounded-3xl font-black text-sm shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all uppercase tracking-widest"
                >
                    {genMode === 'sl' ? 'GENERATE SL TEAM' : 'GENERATE GL TEAMS'} <FaChevronRight size={12} />
                </button>
            </div>
        )}
      </div>

      {/* --- MODALS & FOOTER --- */}
      {showRangeModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="bg-[#512da8] p-6 text-white text-center">
                    <h3 className="text-lg font-black uppercase tracking-tight">Select Combination Range</h3>
                </div>
                <div className="p-8 space-y-8">
                    {[
                      { key: 'wk', label: 'Wicket Keeper', max: 4 },
                      { key: 'bat', label: 'Batsman', max: 6 },
                      { key: 'al', label: 'All-Rounder', max: 6 },
                      { key: 'bowl', label: 'Bowler', max: 6 }
                    ].map((role) => (
                      <div key={role.key} className="space-y-3">
                        <h4 className="text-[10px] font-black text-[#512da8] uppercase flex items-center gap-2">
                             <FaChevronRight className="rotate-90 scale-75" /> {role.label}
                        </h4>
                        <div className="px-2">
                            <input 
                              type="range" 
                              min="1" 
                              max={role.max} 
                              // @ts-ignore
                              value={roleRanges[role.key].max} 
                              onChange={e => setRoleRanges({...roleRanges, [role.key]: { ...roleRanges[role.key as keyof typeof roleRanges], max: parseInt(e.target.value) }})} 
                              className="w-full accent-[#512da8]" 
                            />
                            <div className="flex justify-between text-[10px] font-black text-gray-400 mt-2 px-1">
                                {Array.from({ length: role.max }).map((_, i) => <span key={i}>{i+1}</span>)}
                            </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-4">
                        <button onClick={() => setShowRangeModal(false)} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-black text-[10px] uppercase">Cancel</button>
                        <button onClick={() => setRoleRanges({wk:{min:1,max:1}, bat:{min:3,max:3}, al:{min:2,max:2}, bowl:{min:5,max:5}})} className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-black text-[10px] uppercase">Reset</button>
                        <button onClick={handleAddCustomRanges} className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase">Add</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-5 flex justify-between gap-4 max-w-lg mx-auto z-[45] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => {
                const stepOrder: WizardStep[] = ['fixed', 'captain', 'vice-captain', 'selection-mix', 'distribution', 'combinations', 'generate'];
                const idx = stepOrder.indexOf(step);
                if (idx > 0) setStep(stepOrder[idx - 1]); else navigate(-1);
            }}
            className="flex-1 bg-gray-100 text-gray-800 font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
        >
            <FaChevronLeft /> Prev
        </button>
        {step !== 'generate' && step !== 'combinations' && (
            <button 
                onClick={() => {
                    const stepOrder: WizardStep[] = ['fixed', 'captain', 'vice-captain', 'selection-mix', 'distribution', 'combinations', 'generate'];
                    const idx = stepOrder.indexOf(step);
                    if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
                }}
                className="flex-[2] bg-[#512da8] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest shadow-xl shadow-purple-100"
            >
                Next Step <FaChevronRight />
            </button>
        )}
      </div>
    </div>
  );
};

export default TeamWizard;
