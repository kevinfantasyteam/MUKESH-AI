import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaDownload, FaUpload, FaCheckCircle, FaExclamationTriangle, FaDatabase } from 'react-icons/fa';

const DataManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleBackup = () => {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        match_history: localStorage.getItem('match_history'),
        custom_players_cache: localStorage.getItem('custom_players_cache'),
        live_matches: localStorage.getItem('live_matches'),
        // Add other keys if necessary
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mukesh-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Backup created successfully!' });
    } catch (error) {
      console.error('Backup failed:', error);
      setMessage({ type: 'error', text: 'Failed to create backup.' });
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (!data.timestamp) {
          throw new Error('Invalid backup file format');
        }

        if (data.match_history) localStorage.setItem('match_history', data.match_history);
        if (data.custom_players_cache) localStorage.setItem('custom_players_cache', data.custom_players_cache);
        if (data.live_matches) localStorage.setItem('live_matches', data.live_matches);

        setMessage({ type: 'success', text: 'Data restored successfully! Reloading...' });
        
        // Reload after a short delay to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error('Restore failed:', error);
        setMessage({ type: 'error', text: 'Failed to restore data. Invalid file.' });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  return (
    <div className="p-5 pb-32 animate-fade-in bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-xl shadow-sm">
          <FaChevronLeft className="text-orange-600" />
        </button>
        <h2 className="text-xl font-black uppercase tracking-tight">Data Management</h2>
        <div className="w-5"></div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaDatabase className="text-3xl text-orange-600" />
          </div>
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter mb-2">Backup & Restore</h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed mb-8">
            Save your generated teams, custom matches, and history to a file. Restore it later to resume your session on another device or browser.
          </p>

          <div className="space-y-4">
            <button 
              onClick={handleBackup}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FaDownload className="text-orange-500" /> Save Data to File
            </button>

            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleRestore}
                accept=".json"
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white text-gray-900 border-2 border-gray-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-orange-200 hover:bg-orange-50 transition-all flex items-center justify-center gap-3"
              >
                <FaUpload className="text-orange-600" /> Load Data from File
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <span className="text-xs font-bold uppercase tracking-wide">{message.text}</span>
          </div>
        )}

        <div className="text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                Note: Restoring data will overwrite your current history.
            </p>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
