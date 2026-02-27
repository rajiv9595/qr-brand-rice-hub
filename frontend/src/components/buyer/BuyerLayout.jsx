import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingBag, User, Settings,
    LogOut, Menu, X, ShoppingCart, Search
} from 'lucide-react';
import { authService } from '../../services/authService';
import SupportWidget from '../common/SupportWidget';
import Logo from '../common/Logo';

const BuyerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/buyer', icon: LayoutDashboard, label: 'Overview', exact: true },
        { path: '/buyer/orders', icon: ShoppingBag, label: 'My Orders' },
        { path: '/buyer/profile', icon: User, label: 'Profile' },
        { path: '/buyer/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-rice-50 flex">
            {/* Sidebar for Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-4 border-b border-slate-800">
                    <Logo variant="dark" size="sm" />
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                            <span className="text-lg font-bold text-primary-400">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate">{user?.name || 'Buyer'}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Customer</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.exact
                            ? location.pathname === item.path
                            : location.pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Link to="/search" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-primary-400 hover:bg-slate-800 transition-all">
                        <Search className="w-5 h-5" />
                        Browse Market
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-400/10 transition-all w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Overlay */}
            <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 w-full min-h-screen lg:ml-0 transition-all duration-300">
                {/* Mobile Top Bar */}
                <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-gray-900">My Account</span>
                    <button onClick={handleLogout} className="p-2 text-gray-400">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
                <SupportWidget />
            </main>
        </div>
    );
};

export default BuyerLayout;
