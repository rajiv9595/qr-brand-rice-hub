import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const [mfaData, setMfaData] = useState({
        required: false,
        email: '',
        userId: '',
        code: ''
    });

    const handleChange = (e) => {
        if (mfaData.required) {
            setMfaData({ ...mfaData, code: e.target.value.replace(/\D/g, '').slice(0, 6) });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            const res = await authService.login(formData.email, formData.password);

            if (res.mfaRequired) {
                setMfaData({
                    required: true,
                    email: res.email,
                    userId: res.userId,
                    code: ''
                });
            } else {
                const user = authService.getCurrentUser();
                if (user && user.role === 'admin') {
                    navigate('/admin');
                } else {
                    authService.logout();
                    setError('Access Denied. Admin privileges required.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            const status = err.response?.status;
            const message = err.response?.data?.message || 'Authentication failed.';

            if (status === 403) {
                setError(message); // Locked message
            } else if (status === 401 && message.includes('/3')) {
                setError(message); // Attempt count message
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMFAVerify = async (e) => {
        e.preventDefault();
        if (mfaData.code.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await authService.verifyMFA(mfaData.userId, mfaData.code);
            const user = authService.getCurrentUser();
            if (user && user.role === 'admin') {
                navigate('/admin');
            } else {
                authService.logout();
                setError('Invalid session. Please try logging in again.');
                setMfaData({ required: false, email: '', userId: '', code: '' });
            }
        } catch (err) {
            console.error('MFA error:', err);
            setError(err.response?.data?.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-2xl mb-4 border border-gray-700 shadow-xl">
                        <ShieldCheck className="w-8 h-8 text-primary-500" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-gray-400 mt-2">Secure access for system administrators</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {!mfaData.required ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="admin@qrbrand.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Access System
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleMFAVerify} className="space-y-6 text-center">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-white">Verification Required</h2>
                                <p className="text-sm text-gray-400">
                                    We've sent a 6-digit code to:<br />
                                    <span className="text-primary-400 font-mono mt-1 inline-block">{mfaData.email}</span>
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength="6"
                                    value={mfaData.code}
                                    onChange={handleChange}
                                    placeholder="000000"
                                    className="w-full max-w-[200px] text-center text-3xl tracking-[0.5em] font-black py-4 bg-gray-900 border-2 border-primary-500/30 rounded-2xl text-white focus:border-primary-500 outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || mfaData.code.length !== 6}
                                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        Verify & Login
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMfaData({ ...mfaData, required: false })}
                                className="text-gray-500 hover:text-white text-xs font-bold transition-colors"
                            >
                                Use different credentials
                            </button>
                        </form>
                    )}
                </div>

                {/* Security Footer */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span className="h-[1px] flex-1 bg-gray-800"></span>
                        <span>Encryption: AES-256 Bit</span>
                        <span className="h-[1px] flex-1 bg-gray-800"></span>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 text-center">
                        <p className="text-[10px] text-blue-400/60 leading-relaxed uppercase font-bold tracking-wider">
                            Authorized personnel only. All access is logged and monitored.
                            Unauthorized attempts will be reported to security.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-gray-500 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        &larr; Return to Main Hub
                    </button>
                    <p className="text-gray-600 text-[10px] mt-8 font-mono">
                        &copy; 2026 QR Brand Rice Hub. System Integrity: v2.0.4.SEC
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
