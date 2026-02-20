
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LegacySeries, LegacyTeam, SportType, Player } from './types';
import { ROLE_LABELS, SPORT_TABS } from './constants';
import { FaPlus, FaTrash, FaEdit, FaChevronLeft, FaSave, FaUserPlus, FaSync, FaMagic, FaCheckCircle, FaChevronRight, FaGlobe, FaKeyboard, FaCloudDownloadAlt, FaInfoCircle } from 'react-icons/fa';
import { syncMatchDataFromText } from './services/gemini';
import { fantasyApi } from './services/fantasyApi';

const MatchSeriesManager = () => {
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState<SportType>('cricket');
  const [seriesList, setSeriesList] = useState<LegacySeries[]>([]);
  const [view, setView] = useState<'list' | 'add-series' | 'edit-series' | 'edit-team' | 'auto-sync' | 'import-id'>('list');
  
  const [selectedSeriesIdx, setSelectedSeriesIdx] = useState<number>(-1);
  const [selectedTeamIdx, setSelectedTeamIdx] = useState<number>(-1);

  // Form States
  const [quickPlayerInput, setQuickPlayerInput] = useState('');
  const [syncInput, setSyncInput] = useState('');
  const [matchIdInput, setMatchIdInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('series_data') || '{"req_data": []}');
    setSeriesList(data.req_data);
  }, []);

  const saveToStorage = (updatedList: LegacySeries[]) => {
    localStorage.setItem('series_data', JSON.stringify({ req_data: updatedList }));
    setSeriesList(updatedList);
  };

  const handleImportById = async () => {
    if (!matchIdInput) return alert('Enter a valid Match ID');
    setIsSyncing(true);
    try {
      const res = await fantasyApi.getMatchDetails(matchIdInput);
      if (res.status === "success") {
          const newSeries: LegacySeries = {
            series_name: `Imported Match ${res.data.id}`,
            series_code: `M${res.data.id}`,
            team_list: [res.data.left_team_name, res.data.right_team_name],
            sport: activeSport,
            teams: [
                { team_name: res.data.left_team_name, players: [] },
                { team_name: res.data.right_team_name, players: [] }
            ]
          };
          const updated = [...seriesList, newSeries];
          saveToStorage(updated);
          setView('list');
          alert('Match structure imported! Use Bulk Update to add players.');
      }
    } catch (err) {
      alert('Import failed. Check Match ID.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSync = async () => {
    if (!syncInput) return alert('Enter URL or paste match text');
    setIsSyncing(true);
    try {
      const data = await syncMatchDataFromText(syncInput, activeSport);
      
      const newSeries: LegacySeries = {
        series_name: data.seriesName,
        series_code: data.leftTeam.shortName + "v" + data.rightTeam.shortName,
        team_list: [data.leftTeam.name, data.rightTeam.name],
        sport: activeSport,
        teams: [
          {
            team_name: data.leftTeam.name,
            players: data.players
              .filter((p: any) => p.teamIndex === 0)
              .map((p: any) => ({
                player_name: p.name,
                player_role: p.role,
                player_credits: p.credits,
                player_id: `p_${Math.random().toString(36).substr(2, 9)}`,
                player_image: '0',
                selectedBy: p.selectedBy
              }))
          },
          {
            team_name: data.rightTeam.name,
            players: data.players
              .filter((p: any) => p.teamIndex === 1)
              .map((p: any) => ({
                player_name: p.name,
                player_role: p.role,
                player_credits: p.credits,
                player_id: `p_${Math.random().toString(36).substr(2, 9)}`,
                player_image: '0',
                selectedBy: p.selectedBy
              }))
          }
        ]
      };

      const updated = [...seriesList, newSeries];
      saveToStorage(updated);
      setView('list');
      alert('Data synced successfully! Mukesh AI roster generated.');
    } catch (err) {
      alert('Failed to sync. Ensure URL is correct or text is valid match data.');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * BULK UPDATE LOGIC
   * Replaces entire roster based on user input block
   */
  const parseAndAddPlayers = () => {
    if (!quickPlayerInput.trim()) return;
    const lines = quickPlayerInput.trim().split('\n');
    const upd = [...seriesList];
    
    // Hard Wipe current roster to ensure 'Update' behavior
    upd[selectedSeriesIdx].teams[selectedTeamIdx].players = [];
    
    let addedCount = 0;
    lines.forEach(line => {
        const text = line.trim();
        if (!text) return;
        
        // Split by whitespace/tab
        const parts = text.split(/\s+/);
        
        // Logic for extracting data:
        // We look for name parts first, then role, then numbers
        let nameParts = [];
        let role = '';
        let selection = 50;
        let credits = 9.0;
        
        const knownRoles = ['WK', 'BAT', 'ALL', 'BOW', 'AL', 'BOWL', 'GK', 'DEF', 'MID', 'ST', 'PG', 'SG', 'SF', 'PF', 'CE', 'RAID'];
        
        let foundRoleIdx = -1;
        for(let i=0; i<parts.length; i++) {
            if (knownRoles.includes(parts[i].toUpperCase())) {
                foundRoleIdx = i;
                role = parts[i].toUpperCase();
                break;
            }
        }
        
        if (foundRoleIdx !== -1) {
            nameParts = parts.slice(0, foundRoleIdx);
            const stats = parts.slice(foundRoleIdx + 1);
            if (stats.length >= 1) selection = parseFloat(stats[0].replace('%', ''));
            if (stats.length >= 2) credits = parseFloat(stats[1]);
            
            const name = nameParts.join(' ');
            const roleLabels = ROLE_LABELS[activeSport];
            
            // Map string role to numeric index
            let roleIdx = 1; // Default BAT/DEF
            if (['WK', 'GK', 'PG'].includes(role)) roleIdx = 0;
            else if (['ALL', 'AL', 'MID', 'SF', 'RAID'].includes(role)) roleIdx = 2;
            else if (['BOW', 'BOWL', 'ST', 'PF', 'CE'].includes(role)) roleIdx = 3;

            upd[selectedSeriesIdx].teams[selectedTeamIdx].players.push({
                player_name: name,
                player_role: roleIdx,
                player_credits: isNaN(credits) ? 9.0 : credits,
                player_id: `p_${Date.now()}_${addedCount}`,
                player_image: '0',
                selectedBy: isNaN(selection) ? 50 : selection
            } as any);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        saveToStorage(upd);
        setQuickPlayerInput('');
        alert(`MUKESH AI: Bulk update complete! ${addedCount} players added to ${upd[selectedSeriesIdx].teams[selectedTeamIdx].team_name}.`);
    } else {
        alert("FORMAT ERROR\n\nEnsure Role (WK/BAT/ALL/BOW) is correct.\nFormat: Player Name ROLE SELECT% CREDITS");
    }
  };

  const handlePushToHome = (seriesIdx: number) => {
    const s = seriesList[seriesIdx];
    if (s.teams.length < 2) return alert('Need 2 teams to push');
    const totalPlayersCount = s.teams.reduce((acc, t) => acc + t.players.length, 0);
    const matchId = `live_${Date.now()}`;
    const newMatch = {
      id: matchId,
      seriesName: s.series_name,
      matchTime: new Date(Date.now() + 3600000).toISOString(),
      leftTeam: { 
        name: s.teams[0].team_name, 
        shortName: s.teams[0].team_name.substring(0,3).toUpperCase(), 
        image: `https://placehold.co/100x100?text=${s.teams[0].team_name.substring(0,1)}` 
      },
      rightTeam: { 
        name: s.teams[1].team_name, 
        shortName: s.teams[1].team_name.substring(0,3).toUpperCase(), 
        image: `https://placehold.co/100x100?text=${s.teams[1].team_name.substring(0,1)}` 
      },
      sport: s.sport || 'cricket',
      lineupOut: true,
      automatic: true,
      isExpert: true,
      isPrime: false,
      contestTag: 'MEGA GRAND LEAGUE'
    };
    const livePlayers = [
        ...s.teams[0].players.map(p => ({
            id: p.player_id.toString(),
            name: p.player_name,
            role: p.player_role,
            credits: p.player_credits,
            selectedBy: (p as any).selectedBy || 50,
            teamIndex: 0 as 0,
            image: `https://placehold.co/100x100?text=${p.player_name.charAt(0)}`,
            isPlaying: true,
            points: 0
        })),
        ...s.teams[1].players.map(p => ({
            id: p.player_id.toString(),
            name: p.player_name,
            role: p.player_role,
            credits: p.player_credits,
            selectedBy: (p as any).selectedBy || 50,
            teamIndex: 1 as 1,
            image: `https://placehold.co/100x100?text=${p.player_name.charAt(0)}`,
            isPlaying: true,
            points: 0
        }))
    ];
    const currentLive = JSON.parse(localStorage.getItem('live_matches') || '[]');
    localStorage.setItem('live_matches', JSON.stringify([newMatch, ...currentLive]));
    const playerCache = JSON.parse(localStorage.getItem('custom_players_cache') || '{}');
    playerCache[matchId] = livePlayers;
    localStorage.setItem('custom_players_cache', JSON.stringify(playerCache));
    alert(`MUKESH AI: Successfully deployed ${totalPlayersCount} players to Home Page!`);
    navigate('/');
  };

  const filteredSeries = seriesList.filter(s => s.sport === activeSport || (!s.sport && activeSport === 'cricket'));

  return (
    <div className="p-4 pb-24 max-w-md mx-auto animate-fade-in bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => view === 'list' ? navigate('/admindecisionpanel') : setView('list')} className="p-2 bg-white rounded-xl shadow-sm">
          <FaChevronLeft className="text-orange-600" />
        </button>
        <h2 className="text-xl font-black uppercase tracking-tight">Match Inventory</h2>
        <div className="w-5"></div>
      </div>

      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide py-1">
            {SPORT_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveSport(tab.value)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all border-2 ${
                  activeSport === tab.value ? 'bg-orange-600 text-white border-orange-600 shadow-xl' : 'bg-white text-gray-400 border-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setView('import-id')}
                className="bg-white text-gray-800 py-4 rounded-3xl font-black text-[10px] uppercase flex flex-col items-center justify-center gap-2 border-2 border-gray-100 hover:border-orange-200 transition-all"
              >
                <div className="bg-orange-50 p-3 rounded-full text-orange-600"><FaCloudDownloadAlt /></div>
                Import Match
              </button>
              <button 
                onClick={() => setView('auto-sync')}
                className="bg-orange-600 text-white py-4 rounded-3xl font-black text-[10px] uppercase flex flex-col items-center justify-center gap-2 shadow-xl shadow-orange-100 active:scale-95 transition-all"
              >
                <div className="bg-white/20 p-3 rounded-full"><FaGlobe /></div>
                Auto Sync
              </button>
          </div>

          <div className="space-y-4">
            {filteredSeries.map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">{s.series_code || 'MATCH'}</div>
                        <div className="text-lg font-black text-gray-900 tracking-tight leading-tight">{s.series_name}</div>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="bg-gray-100 px-3 py-1.5 rounded-xl text-[8px] font-black text-gray-400 uppercase tracking-wider">{s.teams.length} Teams</span>
                            <span className="bg-green-50 px-3 py-1.5 rounded-xl text-[8px] font-black text-green-600 uppercase tracking-wider">{s.teams.reduce((acc, t) => acc + t.players.length, 0)} Squad</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => { setSelectedSeriesIdx(seriesList.indexOf(s)); setView('edit-series'); }} className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><FaEdit size={14} /></button>
                         <button onClick={() => { if(confirm('Delete?')) saveToStorage(seriesList.filter((_, idx) => idx !== seriesList.indexOf(s))); }} className="p-3 bg-red-50 text-red-400 rounded-2xl"><FaTrash size={14} /></button>
                    </div>
                </div>
                
                <button 
                    onClick={() => handlePushToHome(seriesList.indexOf(s))}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black active:scale-95 transition-all"
                >
                    PUSH LIVE TO HOME <FaChevronRight size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'import-id' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
           <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-3xl flex items-center justify-center text-orange-600 mx-auto mb-4 text-2xl shadow-lg shadow-orange-50"><FaCloudDownloadAlt /></div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">API Import</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Direct from tg-ipl.shop/match/ID</p>
           </div>
           
           <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Match ID</label>
                <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-3xl px-6 py-5 font-bold text-sm focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                    placeholder="e.g. 112840"
                    value={matchIdInput}
                    onChange={(e) => setMatchIdInput(e.target.value)}
                />
           </div>

           <button 
            onClick={handleImportById}
            disabled={isSyncing}
            className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-sm shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
           >
            {isSyncing ? (
                <>
                    <FaSync className="animate-spin" /> FETCHING MATCH...
                </>
            ) : (
                <>
                    <FaCloudDownloadAlt /> IMPORT MATCH STRUCTURE
                </>
            )}
           </button>
        </div>
      )}

      {view === 'auto-sync' && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6">
           <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-3xl flex items-center justify-center text-orange-600 mx-auto mb-4 text-2xl shadow-lg shadow-orange-50"><FaGlobe /></div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Mukesh AI Sync</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sync from URL or Roster Text</p>
           </div>
           
           <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">URL or Player List</label>
                <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-3xl px-6 py-5 font-bold text-sm min-h-[200px] focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                    placeholder="Paste Crex/Cricbuzz URL or player data..."
                    value={syncInput}
                    onChange={(e) => setSyncInput(e.target.value)}
                />
           </div>

           <button 
            onClick={handleAutoSync}
            disabled={isSyncing}
            className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-sm shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
           >
            {isSyncing ? (
                <>
                    <FaSync className="animate-spin" /> MUKESH AI SYNCING...
                </>
            ) : (
                <>
                    <FaSync /> START AUTO SYNC
                </>
            )}
           </button>
        </div>
      )}

      {view === 'edit-series' && (
        <div className="space-y-6">
          <div className="bg-orange-600 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none uppercase">{seriesList[selectedSeriesIdx].series_code || 'M'}</div>
             <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em] mb-2">Series Control</div>
             <div className="text-2xl font-black leading-tight tracking-tight">{seriesList[selectedSeriesIdx].series_name}</div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
             <div className="grid grid-cols-2 gap-4">
                {seriesList[selectedSeriesIdx].teams.map((t, i) => (
                    <button 
                        key={i}
                        onClick={() => { setSelectedTeamIdx(i); setView('edit-team'); }}
                        className="bg-gray-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-orange-200 hover:bg-white transition-all text-center group"
                    >
                        <div className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase truncate">{t.team_name}</div>
                        <div className="text-[9px] font-black text-orange-400 uppercase mt-1 tracking-widest">{t.players.length} Players</div>
                    </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {view === 'edit-team' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center">
            <div className="flex-1 min-w-0 pr-4">
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{seriesList[selectedSeriesIdx].series_code}</span>
              <div className="text-lg font-black text-gray-900 truncate uppercase">{seriesList[selectedSeriesIdx].teams[selectedTeamIdx].team_name}</div>
            </div>
            <button onClick={() => setView('edit-series')} className="text-[10px] font-black text-white bg-orange-600 px-5 py-2.5 rounded-2xl shrink-0">Back</button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="bg-orange-50 p-4 rounded-2xl flex gap-3">
                <FaInfoCircle className="text-orange-600 shrink-0 mt-1" />
                <div className="text-[9px] font-bold text-orange-900 leading-relaxed uppercase">
                    Format: Player Role Select Credits<br/>
                    Example: Virat Kohli BAT 88.5 9.5
                </div>
            </div>
            <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-3xl px-6 py-5 font-bold text-sm min-h-[180px] outline-none focus:ring-4 focus:ring-orange-50 transition-all" 
                placeholder="Name Role Selection Credits"
                value={quickPlayerInput}
                onChange={e => setQuickPlayerInput(e.target.value)}
            />
            <button 
                onClick={parseAndAddPlayers}
                className="w-full bg-orange-600 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all uppercase text-[10px] tracking-widest"
            >
                <FaUserPlus /> Replace with Bulk Update
            </button>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Current Squad ({seriesList[selectedSeriesIdx].teams[selectedTeamIdx].players.length})</h4>
            <div className="grid grid-cols-1 gap-2">
                {seriesList[selectedSeriesIdx].teams[selectedTeamIdx].players.map((p, pIdx) => (
                    <div key={pIdx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-xs font-black text-gray-800 uppercase">{p.player_name}</div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase">{ROLE_LABELS[activeSport][p.player_role]} • {p.player_credits} CR</div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchSeriesManager;
