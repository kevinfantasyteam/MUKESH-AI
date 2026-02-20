import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlus, FaTrash, FaPlay, FaUserCheck } from 'react-icons/fa';
import { Player, SportType } from './types';
import { ROLE_LABELS } from './constants';
import { supabase, getCurrentUser } from './services/supabase';

const CustomMatch = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'setup' | 'players'>('setup');
  const [sport, setSport] = useState<SportType>('cricket');
  const [teamNames, setTeamNames] = useState({ left: 'Team A', right: 'Team B' });
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTeamIdx, setActiveTeamIdx] = useState<0 | 1>(0);

  const [form, setForm] = useState({ name: '', role: 0, credits: 9.0 });
  const [loading, setLoading] = useState(false);

  const addPlayer = () => {
    if (!form.name) return alert('Enter player name');
    const newPlayer: Player = {
        id: `cp_${Date.now()}`,
        name: form.name,
        image: `https://placehold.co/100x100?text=${form.name.charAt(0)}`,
        role: form.role,
        teamIndex: activeTeamIdx,
        credits: form.credits,
        selectedBy: 50,
        points: 0,
        isPlaying: true
    };
    setPlayers([...players, newPlayer]);
    setForm({ ...form, name: '' });
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const roles = ROLE_LABELS[sport];
  const t1Players = players.filter(p => p.teamIndex === 0);
  const t2Players = players.filter(p => p.teamIndex === 1);

  const startGeneration = async () => {
    if (players.length < 22) {
        if (!window.confirm(`Only ${players.length}/22 players added. Continue anyway?`)) return;
    }
    setLoading(true);
    const customMatchId = `custom_${Date.now()}`;
    const customMatch = {
        id: customMatchId,
        seriesName: 'CUSTOM MATCH',
        matchTime: new Date(Date.now() + 3600000).toISOString(),
        leftTeam: { name: teamNames.left, shortName: teamNames.left.substring(0, 3).toUpperCase(), image: 'https://placehold.co/100x100?text=T1' },
        rightTeam: { name: teamNames.right, shortName: teamNames.right.substring(0, 3).toUpperCase(), image: 'https://placehold.co/100x100?text=T2' },
        sport,
        lineupOut: true,
        automatic: false,
        isExpert: true,
        isPrime: false
    };

    try {
        const user = await getCurrentUser();
        
        // Save to Supabase
        const { error } = await supabase.from('matches').insert({
            id: customMatchId,
            data: customMatch,
            players: players, // Storing players in a separate column or JSONB
            user_id: user?.id
        });

        if (error) {
            console.error('Supabase error:', error);
            // Fallback to localStorage if table doesn't exist or error
            const mockPlayers = JSON.parse(localStorage.getItem('custom_players_cache') || '{}');
            mockPlayers[customMatchId] = players;
            localStorage.setItem('custom_players_cache', JSON.stringify(mockPlayers));
            
            // Also save match metadata to local storage if needed, but TeamWizard reads from custom_players_cache mostly
        } else {
            // Also cache locally for immediate access in Wizard without refetching
            const mockPlayers = JSON.parse(localStorage.getItem('custom_players_cache') || '{}');
            mockPlayers[customMatchId] = players;
            localStorage.setItem('custom_players_cache', JSON.stringify(mockPlayers));
        }

        navigate(`/wizard/${customMatchId}`);
    } catch (err) {
        console.error(err);
        alert('Error saving match');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-5 pb-32 animate-fade-in bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-xl shadow-sm"><FaChevronLeft className="text-orange-600" /></button>
        <h2 className="text-xl font-black uppercase tracking-tight">Manual Builder</h2>
        <div className="w-5"></div>
      </div>

      {view === 'setup' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-8">
            <div className="text-center">
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Initial Setup</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configure teams & sport</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sport Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['cricket', 'football', 'basketball', 'kabaddi'] as SportType[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setSport(s)}
                                className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${sport === s ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Team 1 Name</label>
                        <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm" value={teamNames.left} onChange={e => setTeamNames({...teamNames, left: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase">Team 2 Name</label>
                        <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm" value={teamNames.right} onChange={e => setTeamNames({...teamNames, right: e.target.value})} />
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setView('players')}
                className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
            >
                START ADDING PLAYERS <FaChevronLeft className="rotate-180" />
            </button>
        </div>
      )}

      {view === 'players' && (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black text-gray-800 uppercase">Roster Builder</h3>
                    <div className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{players.length} / 22 ADDED</div>
                </div>

                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => setActiveTeamIdx(0)}
                        className={`flex-1 py-3 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${activeTeamIdx === 0 ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-gray-50 border-gray-50 text-gray-400'}`}
                    >
                        {teamNames.left}
                    </button>
                    <button 
                        onClick={() => setActiveTeamIdx(1)}
                        className={`flex-1 py-3 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${activeTeamIdx === 1 ? 'bg-black text-white border-black shadow-md' : 'bg-gray-50 border-gray-50 text-gray-400'}`}
                    >
                        {teamNames.right}
                    </button>
                </div>

                <div className="space-y-3">
                    <input 
                        placeholder="Player Name" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-4 focus:ring-orange-50"
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <select 
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-xs"
                            value={form.role}
                            onChange={e => setForm({...form, role: Number(e.target.value)})}
                        >
                            {roles.map((r, i) => <option key={i} value={i}>{r}</option>)}
                        </select>
                        <input 
                            type="number" 
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-xs"
                            value={form.credits}
                            onChange={e => setForm({...form, credits: parseFloat(e.target.value)})}
                        />
                    </div>
                    <button 
                        onClick={addPlayer}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <FaPlus /> ADD TO {activeTeamIdx === 0 ? teamNames.left : teamNames.right}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{teamNames.left} ({t1Players.length})</h4>
                    <div className="space-y-2">
                        {t1Players.map(p => (
                            <div key={p.id} className="bg-white p-3 rounded-xl border flex justify-between items-center group">
                                <div className="truncate">
                                    <div className="text-[11px] font-black text-gray-800 truncate">{p.name}</div>
                                    <div className="text-[8px] text-gray-400 font-bold uppercase">{roles[p.role]} • {p.credits} CR</div>
                                </div>
                                <button onClick={() => removePlayer(p.id)} className="text-red-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash size={10}/></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-right">{teamNames.right} ({t2Players.length})</h4>
                    <div className="space-y-2">
                        {t2Players.map(p => (
                            <div key={p.id} className="bg-white p-3 rounded-xl border flex justify-between items-center group">
                                <button onClick={() => removePlayer(p.id)} className="text-red-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash size={10}/></button>
                                <div className="truncate text-right">
                                    <div className="text-[11px] font-black text-gray-800 truncate">{p.name}</div>
                                    <div className="text-[8px] text-gray-400 font-bold uppercase">{roles[p.role]} • {p.credits} CR</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-24 left-0 right-0 px-6 max-w-lg mx-auto pointer-events-none">
                <button 
                    onClick={startGeneration}
                    className="pointer-events-auto w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group"
                >
                    LAUNCH WIZARD
                    <FaPlay size={10} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CustomMatch;