
import React from 'react';
import { FaTrophy, FaLightbulb, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';

export const BestTips = () => (
  <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-yellow-100 p-3 rounded-2xl"><FaTrophy className="text-yellow-600 text-2xl" /></div>
      <h2 className="text-2xl font-black text-gray-800">Winning Strategies</h2>
    </div>
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <h3 className="text-sm font-black text-purple-700 uppercase mb-2">1. Research Pitches</h3>
        <p className="text-xs text-gray-600 font-medium">Always check if it's a batting paradise or a bowler's graveyard. Pick your C/VC accordingly.</p>
      </div>
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <h3 className="text-sm font-black text-purple-700 uppercase mb-2">2. Differential Picks</h3>
        <p className="text-xs text-gray-600 font-medium">Pick at least 2 players with selection percentage below 20%. They are the keys to winning Grand Leagues.</p>
      </div>
      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <h3 className="text-sm font-black text-purple-700 uppercase mb-2">3. All-Rounder Value</h3>
        <p className="text-xs text-gray-600 font-medium">All-rounders provide points with both bat and ball. They are safest options for Vice Captain.</p>
      </div>
    </div>
  </div>
);

export const HowToGenerate = () => (
  <div className="p-4 pb-24 max-w-md mx-auto space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="bg-blue-100 p-3 rounded-2xl"><FaLightbulb className="text-blue-600 text-2xl" /></div>
      <h2 className="text-2xl font-black text-gray-800">User Guide</h2>
    </div>
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-black shrink-0">1</div>
        <div>
          <h4 className="text-sm font-black uppercase text-gray-800">Select Match</h4>
          <p className="text-xs text-gray-500 font-medium">Pick a match from the home screen to start building your teams.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-black shrink-0">2</div>
        <div>
          <h4 className="text-sm font-black uppercase text-gray-800">Pick 22 Players</h4>
          <p className="text-xs text-gray-500 font-medium">Mark the playing 11 of both teams (total 22) for the algorithm.</p>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-black shrink-0">3</div>
        <div>
          <h4 className="text-sm font-black uppercase text-gray-800">Advanced Filtering</h4>
          <p className="text-xs text-gray-500 font-medium">Set Fixed players, Captain pools and generation settings.</p>
        </div>
      </div>
    </div>
  </div>
);

export const AboutUs = () => (
  <div className="p-4 pb-24 max-w-md mx-auto text-center space-y-6">
    <div className="text-xl font-black text-purple-900 px-4">MUKESH AI PRO</div>
    <h2 className="text-xl font-black text-gray-800">About Mukesh AI</h2>
    <p className="text-xs text-gray-500 font-medium leading-relaxed">
      Mukesh AI is the most advanced mathematical model for fantasy sports prediction, 
      developed exclusively by Mukesh.
    </p>
    <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border"><div className="text-lg mb-1">🛡️</div><div className="text-[10px] font-black uppercase">Reliable</div></div>
        <div className="bg-white p-4 rounded-2xl border"><div className="text-lg mb-1">🚀</div><div className="text-[10px] font-black uppercase">Fast</div></div>
    </div>
  </div>
);
