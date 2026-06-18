import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedBusRoute from '../../components/AnimatedBusRoute';

const API = '/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/admin/users`, { headers })
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedBusRoute />
      <div className="mb-8">
        <Link to="/admin" className="text-[#0099FF] text-sm hover:underline mb-2 block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 font-bold">Manage Users</h1>
        <p className="text-gray-500">Total: {users.length} users</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-gray-500 font-medium">Name</th>
                <th className="text-left p-4 text-gray-500 font-medium">Email</th>
                <th className="text-left p-4 text-gray-500 font-medium">Role</th>
                <th className="text-left p-4 text-gray-500 font-medium">Joined</th>
                <th className="text-right p-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-gray-800">{user.name}</td>
                  <td className="p-4 text-gray-700">{user.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin'
                          ? 'bg-[#0099FF]/10 text-[#0099FF]'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
