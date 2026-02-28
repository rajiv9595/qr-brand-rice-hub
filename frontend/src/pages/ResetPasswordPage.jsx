import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import Logo from '../components/common/Logo';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.resetPassword(token, password);
            setMessage('Password reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-rice-50 flex flex-col items-center pt-8 sm:pt-12 px-4 font-body">
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link to="/" className="inline-block transform hover:scale-105 transition-transform">
                    <Logo size="lg" className="transition-transform" />
                </Link>
            </div>

            <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl shadow-rice-200/50 p-6 sm:p-8 border border-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                <div className="mb-6">
                    <h2 className="font-display font-bold text-xl text-field-900 mb-2">
                        Create New Password
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Please enter your new password below.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-start gap-2">
                        <div className="mt-0.5 min-w-[16px]">⚠️</div>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-start gap-2">
                        <div className="mt-0.5 min-w-[16px]">✅</div>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                placeholder="Enter strong password"
                                required
                                minLength="6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3 text-gray-400 hover:text-field-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                placeholder="Confirm new password"
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-field-700 hover:bg-field-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-field-700/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={loading || !password || !confirmPassword}
                    >
                        {loading ? 'Reseting...' : <>Reset Password <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-bold text-field-600 hover:text-field-700 transition-colors">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
