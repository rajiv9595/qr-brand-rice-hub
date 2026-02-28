import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import Logo from '../components/common/Logo';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        role: 'customer'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await authService.login(formData.email, formData.password);
            } else {
                await authService.register(formData);
            }

            const user = authService.getCurrentUser();
            if (user) {
                if (user.role === 'supplier') {
                    navigate('/supplier');
                } else if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/search');
                }
            } else {
                setError('Login succeeded but user data is missing');
            }
        } catch (err) {
            console.error('Authentication error:', err);
            if (!err.response) {
                setError('Cannot connect to server. Please check if the backend is running.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError(`Authentication failed: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-rice-50 flex flex-col items-center pt-8 sm:pt-12 px-4 font-body">

            {/* Logo Header */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link to="/" className="inline-block transform hover:scale-105 transition-transform">
                    <Logo size="lg" className="transition-transform" />
                </Link>
            </div>

            {/* Auth Container */}
            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">

                {/* Toggle Tabs */}
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-rice-200 flex mb-6">
                    <button
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isLogin
                            ? 'bg-rice-50 text-field-800 shadow-sm'
                            : 'text-gray-400 hover:text-field-600'
                            }`}
                    >
                        <LogIn className="w-4 h-4" /> Login
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin
                            ? 'bg-rice-50 text-field-800 shadow-sm'
                            : 'text-gray-400 hover:text-field-600'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" /> Register
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-rice-200/50 p-6 sm:p-8 border border-white">
                    <div className="mb-5">
                        <h2 className="font-display font-bold text-xl text-field-900 mb-1">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-start gap-2">
                                <div className="mt-0.5 min-w-[16px]">⚠️</div>
                                {error}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['customer', 'supplier', 'expert'].map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, role })}
                                                className={`py-2 px-1 rounded-lg text-xs font-bold capitalize transition-all border ${formData.role === role
                                                    ? 'bg-field-600 text-white border-field-600 shadow-lg shadow-field-600/20'
                                                    : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white hover:border-gray-300'
                                                    }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                                    required
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

                        {isLogin && (
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900">
                                    <input type="checkbox" className="rounded border-gray-300 text-field-600 focus:ring-field-500" />
                                    Remember me
                                </label>
                                <Link to="/forgotpassword" className="font-bold text-field-600 hover:text-field-700">Forgot password?</Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-field-700 hover:bg-field-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-field-700/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            By continuing, you agree to our <a href="#" className="underline hover:text-field-600">Terms of Service</a> and <a href="#" className="underline hover:text-field-600">Privacy Policy</a>.
                        </p>
                    </form>
                </div>
            </div>

            <div className="mt-6 mb-4">
                <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-field-600 transition-colors flex items-center gap-2">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
