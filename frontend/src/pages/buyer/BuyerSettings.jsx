import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, Moon, Sun, Monitor, AlertTriangle, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

const BuyerSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('security');
    const [loading, setLoading] = useState(false);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notifications State (Mock)
    const [notifications, setNotifications] = useState({
        marketing: true,
        security: true,
        updates: false
    });

    // Theme (Mock)
    const [theme, setTheme] = useState('light');

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("New passwords don't match!");
            return;
        }

        setLoading(true);
        try {
            const res = await authService.updateProfile({
                password: passwordForm.newPassword,
                currentPassword: passwordForm.currentPassword
            });
            if (res.success) {
                alert("Password updated successfully!");
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            const res = await authService.deleteAccount();
            if (res.success) {
                alert("Your account has been successfully deleted.");
                navigate('/');
            }
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert(error.response?.data?.message || 'Failed to delete account');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your security and preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'security' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <ShieldCheck size={20} /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'notifications' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Bell size={20} /> Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'preferences' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Monitor size={20} /> Preferences
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="card p-8 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                                <Lock className="text-primary-600" size={24} /> Change Password
                            </h2>
                            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        className="input-field w-full"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-bold text-gray-700">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className="input-field w-full"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="card p-8 animate-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                                <Bell className="text-primary-600" size={24} /> Notification Preferences
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Marketing Emails</h3>
                                        <p className="text-sm text-gray-500">Receive offers and promotions</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.marketing} onChange={() => setNotifications(n => ({ ...n, marketing: !n.marketing }))} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-4 ring-primary-100/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 transition-colors"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Security Alerts</h3>
                                        <p className="text-sm text-gray-500">Identify login attempts and password changes</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={notifications.security} disabled className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-4 ring-primary-100/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 opacity-60 cursor-not-allowed transition-colors"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Order Updates</h3>
                                        <p className="text-sm text-gray-500">Get updates on your order status</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={true} disabled className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-4 ring-primary-100/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 opacity-60 cursor-not-allowed transition-colors"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="card p-8">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                                    <Monitor className="text-primary-600" size={24} /> Appearance
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                    >
                                        <Sun size={32} />
                                        <span className="font-bold">Light Mode</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-primary-600 bg-gray-800 text-white' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                                        disabled // Assuming dark mode not fully supported globally yet
                                    >
                                        <Moon size={32} />
                                        <span className="font-bold">Dark Mode (Soon)</span>
                                    </button>
                                </div>
                            </div>

                            <div className="card bg-red-50 border border-red-100 p-8">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-2 text-red-700">
                                    <AlertTriangle size={24} /> Danger Zone
                                </h2>
                                <p className="text-red-600/80 mb-6 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                                <button
                                    className="px-6 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors shadow-sm active:scale-95"
                                    onClick={handleDeleteAccount}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyerSettings;
