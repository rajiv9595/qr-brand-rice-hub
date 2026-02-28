import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon, User, Bell, Shield, Database, Globe,
    Moon, Sun, Save, RefreshCw, X, ChevronRight, Check
} from 'lucide-react';
import { authService } from '../../services/authService';
import { adminService } from '../../services/adminService';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [settings, setSettings] = useState({
        siteName: 'QR Brand Rice Hub',
        siteDescription: 'Premium Rice Intelligence Platform',
        maintenanceMode: false,
        emailNotifications: true,
        pushNotifications: false,
        twoFactorAuth: false,
        sessionTimeout: '30',
        theme: 'light',
        language: 'en'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await adminService.getSettings();
            if (res.data?.data) {
                setSettings(prev => ({
                    ...prev,
                    ...res.data.data
                }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await adminService.updateSettings(settings);
            setSuccessMessage('Settings saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        try {
            const res = await adminService.triggerBackup();
            setSuccessMessage(res.data.message || 'Backup initiated successfully');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            alert('Failed to initiate backup');
        }
    };

    const handleClearCache = async () => {
        try {
            const res = await adminService.clearCache();
            setSuccessMessage(res.data.message || 'Cache cleared successfully');
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (error) {
            alert('Failed to clear cache');
        }
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'system', label: 'System', icon: Database },
    ];

    const user = authService.getCurrentUser() || { name: 'Admin User', email: 'admin@qrbrand.com' };
    const firstName = user.name.split(' ')[0] || '';
    const lastName = user.name.split(' ').slice(1).join(' ') || '';

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 font-display">Platform Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your application preferences and system configurations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 h-full">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
                        <nav className="flex flex-col p-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                        ? 'bg-field-50 text-field-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-field-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto text-field-400" />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 relative min-h-[500px]">

                        {/* Success Notification */}
                        {successMessage && (
                            <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
                                <Check className="w-4 h-4" />
                                {successMessage}
                            </div>
                        )}

                        {/* Content Rendering */}
                        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'general' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">General Settings</h2>
                                        <p className="text-sm text-gray-500 mb-6">Configure basic site information and preferences.</p>

                                        <div className="space-y-6">
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Platform Name</label>
                                                <input
                                                    type="text"
                                                    value={settings.siteName}
                                                    onChange={(e) => handleChange('siteName', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-field-500 focus:ring-2 focus:ring-field-200 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Tagline / Description</label>
                                                <textarea
                                                    value={settings.siteDescription}
                                                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-field-500 focus:ring-2 focus:ring-field-200 transition-all outline-none resize-none"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                                                    <p className="text-xs text-gray-500 mt-1">Prevent users from accessing the site during updates.</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('maintenanceMode')}
                                                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-field-500 ${settings.maintenanceMode ? 'bg-field-600' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`block w-5 h-5 bg-white rounded-full shadow transform transition duration-200 ease-in-out ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                                            } top-1 absolute`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">Account & Profile</h2>
                                        <p className="text-sm text-gray-500 mb-6">Manage your administrator profile details.</p>

                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="w-20 h-20 rounded-full bg-field-100 flex items-center justify-center text-field-600 text-2xl font-bold border-4 border-white shadow-lg uppercase">
                                                {firstName ? firstName.charAt(0) : 'A'}
                                            </div>
                                            <div>
                                                <button className="text-sm font-medium text-field-600 hover:text-field-700 bg-field-50 px-4 py-2 rounded-lg transition-colors">
                                                    Change Avatar
                                                </button>
                                                <p className="text-xs text-gray-400 mt-2">Recommended size: 400x400px</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                                    <input type="text" value={firstName} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" disabled />
                                                </div>
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                                    <input type="text" value={lastName} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" disabled />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                                <input type="email" value={user.email} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" disabled />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">Notification Preferences</h2>
                                        <p className="text-sm text-gray-500 mb-6">Control how and when you receive alerts.</p>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                                                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time updates on your desktop or mobile device.' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">{item.label}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => toggleSetting(item.key)}
                                                        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-field-500 ${settings[item.key] ? 'bg-field-600' : 'bg-gray-200'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`block w-5 h-5 bg-white rounded-full shadow transform transition duration-200 ease-in-out ${settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                                                                } top-1 absolute`}
                                                        />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">Security Settings</h2>
                                        <p className="text-sm text-gray-500 mb-6">Enhance your account security.</p>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-5 bg-orange-50 rounded-xl border border-orange-100">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                                        <Shield className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h3>
                                                        <p className="text-xs text-gray-600 mt-1 max-w-sm">Add an extra layer of security to your account by requiring more than just a password to log in.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('twoFactorAuth')}
                                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${settings.twoFactorAuth
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-field-600 text-white hover:bg-field-700'
                                                        }`}
                                                >
                                                    {settings.twoFactorAuth ? 'Disable' : 'Enable 2FA'}
                                                </button>
                                            </div>

                                            <div className="grid gap-2">
                                                <label className="text-sm font-medium text-gray-700">Auto-Logout Timer (Minutes)</label>
                                                <select
                                                    value={settings.sessionTimeout}
                                                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-field-500 focus:ring-2 focus:ring-field-200 transition-all outline-none bg-white"
                                                >
                                                    <option value="15">15 Minutes</option>
                                                    <option value="30">30 Minutes</option>
                                                    <option value="60">1 Hour</option>
                                                    <option value="120">2 Hours</option>
                                                </select>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100">
                                                <button className="text-sm text-field-600 font-medium hover:text-field-700 hover:underline">
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'system' && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">System Administration</h2>
                                        <p className="text-sm text-gray-500 mb-6">Advanced system controls and maintenance.</p>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div onClick={handleBackup} className="p-4 border border-gray-200 rounded-xl hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer group active:scale-[0.98]">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                        <Database className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-medium text-gray-900">Backup Data</h3>
                                                </div>
                                                <p className="text-xs text-gray-500">Create a full backup of the database and system files.</p>
                                            </div>

                                            <div onClick={handleClearCache} className="p-4 border border-gray-200 rounded-xl hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer group active:scale-[0.98]">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                                        <RefreshCw className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="font-medium text-gray-900">Clear Cache</h3>
                                                </div>
                                                <p className="text-xs text-gray-500">Clear application cache to resolve potential loading issues.</p>
                                            </div>
                                        </div>

                                        <div className="mt-8 p-4 bg-gray-900 rounded-xl overflow-hidden">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-green-400" /> System Status
                                                </h3>
                                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-medium">Operational</span>
                                            </div>
                                            <div className="space-y-2 font-mono text-xs text-gray-400">
                                                <div className="flex justify-between">
                                                    <span>Server Uptime:</span>
                                                    <span className="text-gray-300">14d 2h 12m</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Last Backup:</span>
                                                    <span className="text-gray-300">Today, 04:00 AM</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Version:</span>
                                                    <span className="text-gray-300">v2.4.1 (Stable)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                                    Discard Changes
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-field-600 hover:bg-field-700 shadow-lg shadow-field-600/20 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Preferences
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
