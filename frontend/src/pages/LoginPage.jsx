import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { authService } from '../services/authService';
import Logo from '../components/common/Logo';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
    const { t, i18n } = useTranslation();
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

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            await authService.googleAuth(credentialResponse.credential, formData.role);
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
            console.error('Google Auth Error:', err);
            setError(err.response?.data?.message || 'Google Auth failed. Is the API correctly configured?');
        } finally {
            setLoading(false);
        }
    };

    const handleNativeGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const user = await GoogleAuth.signIn();
            if (user && user.authentication && user.authentication.idToken) {
                await authService.googleAuth(user.authentication.idToken, formData.role);
                const currentUser = authService.getCurrentUser();
                if (currentUser) {
                    if (currentUser.role === 'supplier') {
                        navigate('/supplier');
                    } else if (currentUser.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/search');
                    }
                } else {
                    setError('Login succeeded but user data is missing');
                }
            } else {
                setError('Google Auth failed. Missing token.');
            }
        } catch (err) {
            console.error('Native Google Auth Error:', err);
            setError(err.message || 'Google Auth failed.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="relative min-h-screen bg-rice-50 flex flex-col items-center pt-16 sm:pt-12 px-4 font-body">

            {/* Language Selector - Top Right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 animate-in fade-in duration-700 z-10">
                <select
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    value={i18n.language}
                    className="text-xs bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 font-bold shadow-sm transition-all"
                >
                    <option value="en">English</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                </select>
            </div>

            {/* Logo Header */}
            <div className="text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative w-full max-w-[480px]">
                <div className="flex justify-center items-center w-full">
                    <Link to="/" className="inline-block transform hover:scale-105 transition-transform">
                        <Logo size="lg" className="transition-transform" />
                    </Link>
                </div>
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
                        <LogIn className="w-4 h-4" /> {t('Login')}
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin
                            ? 'bg-rice-50 text-field-800 shadow-sm'
                            : 'text-gray-400 hover:text-field-600'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" /> {t('Register')}
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-rice-200/50 p-6 sm:p-8 border border-white">
                    <div className="mb-5">
                        <h2 className="font-display font-bold text-xl text-field-900 mb-1">
                            {isLogin ? t('Welcome Back') : t('Create Account')}
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('I am a')}</label>
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
                                                {t(role)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('Full Name')}</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                            placeholder={t('Your full name')}
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('Email')}</label>
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
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('Phone')}</label>
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
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{t('Password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-field-500/20 focus:border-field-500 transition-all outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                    placeholder={isLogin ? t('Enter your password') : t('Create a password')}
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
                                    {t('Remember me')}
                                </label>
                                <Link to="/forgotpassword" className="font-bold text-field-600 hover:text-field-700">{t('Forgot password?')}</Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-field-700 hover:bg-field-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-field-700/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                t('Processing...')
                            ) : (
                                <>
                                    {isLogin ? t('Sign In') : t('Create Account')} <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 pb-1">
                            <span className="w-[30%] border-b border-gray-200"></span>
                            <span className="flex-1 text-center font-bold tracking-widest uppercase">{t('Or Continue With')}</span>
                            <span className="w-[30%] border-b border-gray-200"></span>
                        </div>

                        {/* Google Auth Button Wrapper */}
                        <div className="flex justify-center w-full">
                            <div className="w-full [&>div]:w-full transition-transform hover:scale-[1.02]">
                                {Capacitor.isNativePlatform() ? (
                                    <button
                                        type="button"
                                        onClick={handleNativeGoogleLogin}
                                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                            <path fill="none" d="M0 0h48v48H0z" />
                                        </svg>
                                        <span className="text-gray-700 font-medium font-body text-[14px]">
                                            {isLogin ? t('Sign in with Google') : t('Sign up with Google')}
                                        </span>
                                    </button>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError('Google Authentication Failed')}
                                        type="standard"
                                        theme="outline"
                                        size="large"
                                        text={isLogin ? "signin_with" : "signup_with"}
                                        shape="rectangular"
                                    />
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-6">
                            {t('By continuing, you agree to our')} <a href="#" className="underline hover:text-field-600">{t('Terms of Service')}</a> and <a href="#" className="underline hover:text-field-600">{t('Privacy Policy')}</a>.
                        </p>
                    </form>
                </div>
            </div>

            <div className="mt-6 mb-4">
                <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-field-600 transition-colors flex items-center gap-2">
                    ← {t('Back to Home')}
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
