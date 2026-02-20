
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GeneratedTeam, Player } from './types';
import { FaChevronLeft, FaChartBar } from 'react-icons/fa';

const Analytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const teams: GeneratedTeam[] = location.state?.teams || [];

  if (teams.length === 0) return <div className="p-8 text-center">No data to analyze.</div>;

  // Calculate selection frequency
  const stats: Record<string, { name: string; count: number; cCount: number; vcCount: number }> = {};
  
  teams.forEach(t => {
    t.players.forEach(p => {
      if (!stats[p.id]) stats[p.id] = { name: p.name, count: 0, cCount: 0, vcCount: 0 };
      stats[p.id].count++;
      if (p.id === t.captainId) stats[p.id].cCount++;
      if (p.id === t.viceCaptainId) stats[p.id].vcCount++;
    });
  });

  const sortedStats = Object.values(stats).sort((a, b) => b.count - a.count);

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 py-3 shadow-sm border-b sticky top-[56px] z-40 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-700 font-bold">
          <FaChevronLeft /> Back
        </button>
        <h2 className="text-sm font-black uppercase">Team Analytics</h2>
        <div className="w-10"></div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-purple-700 text-white px-4 py-3 flex items-center gap-3">
            <FaChartBar />
            <span className="text-xs font-black uppercase">Player Selection Frequency</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400">Player</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">Teams</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">C %</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">VC %</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedStats.map(s => (
                  <tr key={s.name}>
                    <td className="px-4 py-3">
                        <div className="text-xs font-bold text-gray-800">{s.name}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-black text-purple-700">
                        {s.count} <span className="text-[8px] opacity-50">/ {teams.length}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-orange-600">
                        {((s.cCount / teams.length) * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-blue-600">
                        {((s.vcCount / teams.length) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <h3 className="text-[10px] font-black text-indigo-900 uppercase mb-2">Generation Insights</h3>
            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                Our algorithm prioritized players with high selection percentage while maintaining a differential balance. 
                Captaincy spread is optimized based on consistency and current form.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
