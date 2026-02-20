import React, { useState } from 'react';
import { FaHashtag, FaCopy } from 'react-icons/fa';

const Dream11Hash = () => {
  const [matchId, setMatchId] = useState('');
  const [hashValue, setHashValue] = useState('');

  const generateHash = () => {
    const hash = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    setHashValue(hash);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hashValue);
    alert('Hash value copied to clipboard!');
  };

  return (
    <div className="p-4 pb-24">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-sm mx-auto">
          <h2 className="text-xl font-black text-center mb-6 flex items-center justify-center gap-2">
            <FaHashtag className="text-orange-600" />
            Hash Generator
          </h2>
          
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Match ID (Dream11)</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all font-bold"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  placeholder="Ex: 82931"
                />
            </div>

            <button
              className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
              onClick={generateHash}
              disabled={!matchId}
            >
              GENERATE HASH
            </button>

            {hashValue && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                    <div className="text-[10px] font-mono break-all text-orange-900 pr-2">{hashValue}</div>
                    <button
                        className="bg-white p-2 rounded-lg shadow-sm text-orange-600 hover:text-orange-900"
                        onClick={copyToClipboard}
                    >
                        <FaCopy size={16} />
                    </button>
                </div>
            )}

            <div className="pt-4 border-t mt-4">
                <h5 className="text-[10px] font-black uppercase text-gray-400 mb-2">Instructions:</h5>
                <ol className="text-[10px] text-gray-500 font-medium space-y-1 ml-4 list-decimal">
                    <li>Enter the Match ID from Dream11.</li>
                    <li>Click on Generate Hash button.</li>
                    <li>Copy the generated hash value.</li>
                    <li>Use this hash in verification.</li>
                </ol>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dream11Hash;