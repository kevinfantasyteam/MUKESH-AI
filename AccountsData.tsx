
import React from 'react';
import { FaChartBar, FaUsers, FaMoneyBill } from 'react-icons/fa';

const AccountsData = () => {
  return (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-black text-gray-800 mb-6">Accounts Statistics</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="bg-purple-100 p-4 rounded-full mb-4">
                <FaUsers size={32} className="text-purple-700" />
            </div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Users</div>
            <div className="text-4xl font-black text-gray-900 mt-1">1,234</div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
                <FaChartBar size={32} className="text-green-700" />
            </div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Subs</div>
            <div className="text-4xl font-black text-gray-900 mt-1">856</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <FaMoneyBill size={32} className="text-yellow-700" />
            </div>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Revenue</div>
            <div className="text-4xl font-black text-gray-900 mt-1">₹1,23,456</div>
        </div>
      </div>
    </div>
  );
};

export default AccountsData;
