
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaUserCheck, FaUserTimes, FaClock } from 'react-icons/fa';
import { User } from './types';
import { supabase } from './services/supabase';

const ManageUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
            const mappedUsers: User[] = data.map((p: any) => ({
                id: p.id,
                name: p.username || 'Unknown',
                email: p.email || '',
                role: p.role || 'customer',
                status: p.status || 'active',
                createdAt: p.created_at,
                subscriptionDays: p.subscription_days || 30,
                subscriptionEndDate: p.subscription_end_date || new Date().toISOString()
            }));
            setUsers(mappedUsers);
        }
    } catch (err) {
        console.error('Error fetching users:', err);
        // Fallback to local storage
        const stored = JSON.parse(localStorage.getItem('tg_registered_users') || '[]');
        setUsers(stored);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this user permanently?')) {
        try {
            // Delete from profiles (auth user deletion requires service role, so we just delete profile)
            const { error } = await supabase.from('profiles').delete().eq('id', id);
            if (error) throw error;
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            // Fallback local delete
            const updated = users.filter(u => u.id !== id);
            setUsers(updated);
            localStorage.setItem('tg_registered_users', JSON.stringify(updated));
        }
    }
  };

  const getDaysLeft = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="p-4 pb-24 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Active Members</h2>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
          Total: {users.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
            <div className="p-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Loading Users...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-500 tracking-widest">Subscriber</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-500 tracking-widest">Validity</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length > 0 ? (
                users.map(user => {
                  const daysLeft = getDaysLeft(user.subscriptionEndDate);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">{user.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{user.email}</span>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${user.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <div className={`flex items-center gap-1 text-xs font-black ${daysLeft < 5 ? 'text-red-600' : 'text-green-600'}`}>
                            <FaClock size={10} />
                            {daysLeft} Days
                          </div>
                          <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Ends: {new Date(user.subscriptionEndDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">No users registered yet</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default ManageUser;
