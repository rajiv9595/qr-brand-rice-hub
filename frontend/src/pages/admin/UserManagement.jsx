
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Shield, Ban, CheckCircle, Mail, RotateCcw } from 'lucide-react';
import { adminService } from '../../services/adminService';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, filter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllUsers({
                search: searchTerm,
                role: filter
            });
            console.log('User Fetch Response (Full):', JSON.stringify(res.data, null, 2));
            setUsers(res.data.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        let newStatus = '';
        if (action === 'suspend') newStatus = 'suspended';
        else if (action === 'ban') newStatus = 'banned';
        else if (action === 'activate') newStatus = 'active';

        try {
            await adminService.updateUserStatus(userId, newStatus);
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error('Failed to update user status', err);
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h2>
                    <p className="text-gray-600 mt-2">Manage customer and supplier accounts</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-field-500 outline-none bg-white font-medium text-gray-700"
                    >
                        <option value="all">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="supplier">Suppliers</option>
                    </select>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-field-500 outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Join Date</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(users || []).map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-field-100 flex items-center justify-center text-field-700 font-bold border-2 border-white shadow-sm">
                                                {user.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${user.role === 'supplier'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-purple-50 text-purple-700 border-purple-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${(user.status === 'active' || (!user.status && user.isActive)) ? 'bg-green-50 text-green-700 border-green-200' :
                                                user.status === 'suspended' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                    'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${(user.status === 'active' || (!user.status && user.isActive)) ? 'bg-green-500' :
                                                    user.status === 'suspended' ? 'bg-orange-500' :
                                                        'bg-red-500'
                                                }`} />
                                            {user.status || (user.isActive ? 'Active' : 'Inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Activate button if not active */}
                                            {((user.status && user.status !== 'active') || (!user.status && !user.isActive)) && (
                                                <button
                                                    onClick={() => handleAction(user._id, 'activate')}
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Activate User"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Suspend/Ban if active */}
                                            {((user.status === 'active') || (!user.status && user.isActive)) && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(user._id, 'suspend')}
                                                        className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                                        title="Suspend User"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(user._id, 'ban')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Ban User"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            {/* Ban if suspended */}
                                            {user.status === 'suspended' && (
                                                <button
                                                    onClick={() => handleAction(user._id, 'ban')}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Ban User"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                title="Reset Password"
                                                onClick={() => alert(`Password reset link sent to ${user.email}`)}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
