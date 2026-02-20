import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaMoneyBill, FaCog, FaChartLine, FaUserPlus, FaLayerGroup, FaPlusCircle, FaShieldAlt, FaTrash, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import './AdminDashboard.css';
import { Match, SportType, LegacySeries } from './types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [matchForm, setMatchForm] = useState<Partial<Match>>({
    seriesName: '',
    sport: 'cricket',
    matchTime: new Date(Date.now() + 3600000).toISOString(),
    contestTag: 'MEGA CONTEST',
    lineupOut: true
  });
  const [teams, setTeams] = useState({ left: 'Team A', right: 'Team B', leftShort: 'T1', rightShort: 'T2' });

  const registeredUsersCount = JSON.parse(localStorage.getItem('tg_registered_users') || '[]').length;
  const seriesData = JSON.parse(localStorage.getItem('series_data') || '{"req_data": []}');
  const seriesList: LegacySeries[] = seriesData.req_data;
  const seriesCount = seriesList.length;

  const handlePublish = () => {
    if (!matchForm.seriesName || !teams.left || !teams.right) return alert('Fill all fields');
    
    const newMatch: Match = {
        id: `m_${Date.now()}`,
        seriesName: matchForm.seriesName!,
        matchTime: matchForm.matchTime!,
        leftTeam: { name: teams.left, shortName: teams.leftShort, image: `https://placehold.co/100x100?text=${teams.leftShort}` },
        rightTeam: { name: teams.right, shortName: teams.rightShort, image: `https://placehold.co/100x100?text=${teams.rightShort}` },
        sport: matchForm.sport as SportType,
        lineupOut: matchForm.lineupOut!,
        automatic: true,
        isExpert: true,
        isPrime: false,
        contestTag: matchForm.contestTag
    };

    const currentLive = JSON.parse(localStorage.getItem('live_matches') || '[]');
    localStorage.setItem('live_matches', JSON.stringify([newMatch, ...currentLive]));
    setShowPublishModal(false);
    alert('Match published to Home Screen!');
  };

  const clearLiveMatches = () => {
    if (window.confirm('Clear all published matches from Home?')) {
        localStorage.setItem('live_matches', '[]');
        alert('All matches cleared.');
    }
  };

  return (
    <div className="admin-dashboard pb-32 animate-fade-in bg-gray-50 min-h-screen">
      <div className="mb-8 px-2 pt-6">
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Command Center</h2>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em] bg-orange-50 px-3 py-1 rounded-full">System Admin v4.5</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div onClick={() => navigate('/manageuser')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-center cursor-pointer active:scale-95 transition-all">
            <div className="bg-orange-600 w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-orange-50">
                <FaUsers size={24} />
            </div>
            <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Members</div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{registeredUsersCount}</div>
        </div>
        <div onClick={() => navigate('/manage-matches')} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-center cursor-pointer active:scale-95 transition-all">
            <div className="bg-green-600 w-14 h-14 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-xl shadow-green-50">
                <FaLayerGroup size={24} />
            </div>
            <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Series Database</div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">{seriesCount}</div>
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <button 
            onClick={() => navigate('/manage-matches')}
            className="w-full bg-white text-gray-900 p-8 rounded-[2.5rem] flex items-center justify-between shadow-sm border border-gray-100 active:scale-95 transition-all group"
        >
            <div className="flex items-center gap-6">
                <div className="bg-orange-50 p-4 rounded-3xl text-orange-600">
                    <FaLayerGroup size={28} />
                </div>
                <div className="text-left">
                    <div className="text-lg font-black uppercase tracking-tight">Series Manager</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Add teams & players</div>
                </div>
            </div>
            <FaChevronRight size={16} className="text-gray-200 group-hover:text-orange-600 transition-colors" />
        </button>

        <button 
            onClick={() => setShowPublishModal(true)}
            className="w-full bg-orange-600 text-white p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-orange-100 active:scale-95 transition-all group"
        >
            <div className="flex items-center gap-6">
                <div className="bg-white/20 p-4 rounded-3xl">
                    <FaPlusCircle size={28} />
                </div>
                <div className="text-left">
                    <div className="text-lg font-black uppercase tracking-tight">Match Publisher</div>
                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Push live fixtures now</div>
                </div>
            </div>
            <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                <FaCheckCircle />
            </div>
        </button>

        <button 
            onClick={clearLiveMatches}
            className="w-full bg-red-50 text-red-500 p-8 rounded-[2.5rem] flex items-center justify-between border-2 border-red-100 active:scale-95 transition-all group"
        >
            <div className="flex items-center gap-6">
                <div className="bg-red-100 p-4 rounded-3xl">
                    <FaTrash size={24} />
                </div>
                <div className="text-left">
                    <div className="text-lg font-black uppercase tracking-tight">Purge System</div>
                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Clear all active home fixtures</div>
                </div>
            </div>
        </button>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20">
                <div className="bg-orange-600 p-8 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Fixture Portal</h3>
                        <p className="text-[10px] opacity-60 font-black uppercase tracking-widest">Manual Match Configuration</p>
                    </div>
                    <button onClick={() => setShowPublishModal(false)} className="bg-white/10 hover:bg-white/30 p-3 rounded-full transition-colors text-xl">✕</button>
                </div>
                <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Series Label</label>
                        <input 
                            placeholder="e.g. World Cup 2024"
                            className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 font-bold outline-none focus:ring-4 focus:ring-orange-50 transition-all"
                            value={matchForm.seriesName}
                            onChange={(e) => setMatchForm({...matchForm, seriesName: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sport</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 font-bold"
                                value={matchForm.sport}
                                onChange={(e) => setMatchForm({...matchForm, sport: e.target.value as any})}
                            >
                                <option value="cricket">Cricket</option>
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="kabaddi">Kabaddi</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contest Type</label>
                            <input 
                                placeholder="MEGA GL"
                                className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 font-bold"
                                value={matchForm.contestTag}
                                onChange={(e) => setMatchForm({...matchForm, contestTag: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Identity Setup</h4>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <input placeholder="IND Name" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 font-bold text-xs" value={teams.left} onChange={(e) => setTeams({...teams, left: e.target.value})} />
                                <input placeholder="IND Code" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 font-bold text-xs" value={teams.leftShort} onChange={(e) => setTeams({...teams, leftShort: e.target.value})} />
                            </div>
                            <div className="space-y-4">
                                <input placeholder="AUS Name" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 font-bold text-xs text-right" value={teams.right} onChange={(e) => setTeams({...teams, right: e.target.value})} />
                                <input placeholder="AUS Code" className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 font-bold text-xs text-right" value={teams.rightShort} onChange={(e) => setTeams({...teams, rightShort: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handlePublish}
                        className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black text-sm shadow-2xl shadow-orange-100 hover:bg-black active:scale-95 transition-all"
                    >
                        DEPLOY LIVE FIXTURE
                    </button>
                    
                    <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">Note: Use Series Manager for roster-synced matches</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;