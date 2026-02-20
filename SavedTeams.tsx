import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaHistory, FaTrophy, FaTrash, FaGlobe } from 'react-icons/fa';
import { MatchAttempt } from './types';
import { supabase } from './services/supabase';

const SavedTeams = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<MatchAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
        // Fetch from Supabase (publicly visible teams as per requirement)
        const { data, error } = await supabase
            .from('saved_teams')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
            const mappedHistory: MatchAttempt[] = data.map((item: any) => ({
                id: item.id,
                matchId: item.match_id,
                timestamp: item.created_at,
                teams: item.teams,
                settings: item.settings
            }));
            setHistory(mappedHistory);
        }
    } catch (err) {
        console.error('Error fetching history:', err);
        // Fallback to local storage
        const stored = JSON.parse(localStorage.getItem('match_history') || '[]');
        setHistory(stored);
    } finally {
        setLoading(false);
    }
  };

  const deleteHistory = async (id: string) => {
    if (window.confirm('Delete this history record?')) {
        try {
            const { error } = await supabase.from('saved_teams').delete().eq('id', id);
            if (error) throw error;
            setHistory(history.filter(h => h.id !== id));
        } catch (err) {
            console.error('Error deleting:', err);
            // Fallback local delete
            const updated = history.filter(h => h.id !== id);
            setHistory(updated);
            localStorage.setItem('match_history', JSON.stringify(updated));
        }
    }
  };

  return (
    <div className="p-5 pb-32 animate-fade-in bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-xl shadow-sm"><FaChevronLeft className="text-orange-600" /></button>
        <h2 className="text-xl font-black uppercase tracking-tight">Generation History</h2>
        <div className="w-5"></div>
      </div>

      <div className="space-y-4">
        {history.length > 0 ? (
            history.map(item => (
                <div key={item.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-6xl"><FaHistory /></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{new Date(item.timestamp).toLocaleString()}</div>
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Generated {item.teams.length} Teams</h3>
                        </div>
                        <button onClick={() => deleteHistory(item.id)} className="p-2 text-red-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><FaTrash size={14} /></button>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Count</div>
                            <div className="text-lg font-black text-gray-800">{item.settings?.teamCount || 0}</div>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Strategies</div>
                            <div className="text-lg font-black text-gray-800">
                                {item.settings?.selectionMixes?.length || (item.settings?.credits ? 'Custom' : 'N/A')}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/generated-teams', { state: { teams: item.teams } })}
                        className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        VIEW TEAMS <FaTrophy size={10} className="text-yellow-400" />
                    </button>
                </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-40 text-gray-300 bg-white rounded-[3rem] border border-dashed m-4">
                <FaHistory size={64} className="mb-4 opacity-20" />
                <p className="font-black text-sm uppercase tracking-widest">No history records found</p>
                <button onClick={() => navigate('/')} className="mt-6 text-orange-600 font-black text-[10px] uppercase border-b-2 border-orange-600 pb-1">Start Generating</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default SavedTeams;