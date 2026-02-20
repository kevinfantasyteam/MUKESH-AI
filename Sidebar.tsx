import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserPlus, FaUsers, FaChartBar, FaThLarge, 
         FaHashtag, FaLightbulb, FaTrophy, FaEnvelope, 
         FaYoutube, FaSave, FaLock, FaDatabase } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ userRole, onLogout }: { userRole: string; onLogout?: () => void }) => {
  const navigate = useNavigate();
  const sidenavRef = useRef<HTMLDivElement>(null);

  const openNav = () => {
    if (sidenavRef.current) sidenavRef.current.style.width = "280px";
  };

  const closeNav = () => {
    if (sidenavRef.current) sidenavRef.current.style.width = "0";
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeNav();
  };

  return (
    <>
      <div ref={sidenavRef} className="sidenav">
        <span className="closebtn" onClick={closeNav}>&times;</span>
        <div className="text-center mb-6 mt-4">
          <div className="text-xl font-black text-orange-600 px-4 uppercase tracking-tighter">Mukesh AI</div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Pro Generation Engine</div>
        </div>
        <div className="flex flex-col">
          {/* Admin Section */}
          {(userRole === 'admin' || userRole === 'superuser') ? (
            <>
              <div className="px-6 py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50">Admin Controls</div>
              <button onClick={() => handleNavigate('/admindecisionpanel')} className="list-group-item" id="side_bar">
                <FaThLarge /> Dashboard
              </button>
              <button onClick={() => handleNavigate('/manageuser')} className="list-group-item" id="side_bar">
                <FaUsers /> Manage Users
              </button>
              <button onClick={() => handleNavigate('/register')} className="list-group-item" id="side_bar">
                <FaUserPlus /> New Member
              </button>
              <button onClick={() => handleNavigate('/dream11hashvalue')} className="list-group-item" id="side_bar">
                <FaHashtag /> Hash Utility
              </button>
            </>
          ) : (
             <button onClick={() => handleNavigate('/login')} className="list-group-item text-orange-600 font-black" id="side_bar">
                <FaLock /> Admin Login
             </button>
          )}

          <div className="px-6 py-2 text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 mt-4">Tools & Guide</div>
          <button onClick={() => handleNavigate('/howtogenerate')} className="list-group-item" id="side_bar">
            <FaLightbulb /> User Guide
          </button>
          <button onClick={() => handleNavigate('/besttips')} className="list-group-item" id="side_bar">
            <FaTrophy /> Winning Tips
          </button>
          <button onClick={() => handleNavigate('/saved-teams')} className="list-group-item" id="side_bar">
            <FaSave /> Team History
          </button>
          <button onClick={() => handleNavigate('/data-management')} className="list-group-item" id="side_bar">
            <FaDatabase /> Backup / Restore
          </button>
          <button onClick={() => handleNavigate('/contactus')} className="list-group-item" id="side_bar">
            <FaEnvelope /> Support
          </button>
          <a href="https://www.youtube.com/@kevinfantasyteams" target="_blank" rel="noopener noreferrer" className="list-group-item" id="side_bar">
            <FaYoutube /> Tutorials
          </a>
          
          {onLogout && userRole === 'admin' && (
            <button onClick={onLogout} className="list-group-item text-red-600 font-bold border-t mt-4" id="side_bar">
               Sign Out
            </button>
          )}
        </div>
        <div className="text-center flex flex-col items-center p-6 mt-8 border-t border-gray-50 bg-gray-50/50">
          <small className="text-gray-400 font-bold uppercase text-[8px] tracking-widest mb-1">Developed by</small>
          <div className="font-black text-orange-600 text-sm tracking-tighter uppercase">Mukesh AI</div>
          <span className="text-[9px] text-gray-400 mt-2 font-medium">All Rights Reserved © 2024</span>
        </div>
      </div>

      <nav className="flex justify-between first-nav top-fix-one items-center bg-orange-600 shadow-lg">
        <FaBars onClick={openNav} className="text-white ml-2 cursor-pointer p-2 rounded-xl active:bg-white/10" size={36} />
        <span className="text-white font-black tracking-[0.2em] text-lg">MUKESH AI</span>
        <FaTimes onClick={() => window.location.reload()} className="text-white mr-2 cursor-pointer p-2 rounded-xl active:bg-white/10" size={36} />
      </nav>
    </>
  );
};

export default Sidebar;