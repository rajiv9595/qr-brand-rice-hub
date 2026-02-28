import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingBag, User, Settings,
    LogOut, Menu, X, ShoppingCart, Search, MessageSquare
} from 'lucide-react';
import { authService } from '../../services/authService';
import SupportWidget from '../common/SupportWidget';
import Logo from '../common/Logo';

const BuyerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(() => {
        const saved = localStorage.getItem('buyerSidebarPinned');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [isHovered, setIsHovered] = useState(false);
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
        { path: '/buyer/negotiations', icon: MessageSquare, label: 'Negotiations' },
        { path: '/buyer/profile', icon: User, label: 'Profile' },
        { path: '/buyer/settings', icon: Settings, label: 'Settings' },
    ];

    const togglePin = () => {
        setIsPinned(!isPinned);
        localStorage.setItem('buyerSidebarPinned', JSON.stringify(!isPinned));
    };

    const isExpanded = isPinned || isHovered;

    return (
        <div className="min-h-screen bg-rice-50 flex">
            {/* Sidebar for Desktop */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    fixed inset-y-0 left-0 z-50 bg-slate-900 text-white 
                    transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky flex flex-col
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isExpanded ? 'w-64' : 'w-20'}
                `}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-4 border-b border-slate-800 shrink-0 overflow-hidden">
                    <Link to="/buyer" className="flex items-center gap-3">
                        <Logo variant="dark" size="sm" iconOnly={!isExpanded} />
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-slate-800 shrink-0 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border-2 border-slate-700 shrink-0">
                            <span className="text-lg font-bold text-primary-400">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="font-bold text-sm truncate">{user?.name || 'Buyer'}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Customer</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
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
                                title={!isExpanded ? item.label : ''}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group ${active
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <div className="min-w-[24px] flex justify-center">
                                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                </div>
                                <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-3 border-t border-slate-800 space-y-1">
                    <Link
                        to="/search"
                        title={!isExpanded ? 'Browse Market' : ''}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-primary-400 hover:bg-slate-800 transition-all group"
                    >
                        <div className="min-w-[24px] flex justify-center">
                            <Search className="w-5 h-5" />
                        </div>
                        <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                            Browse Market
                        </span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        title={!isExpanded ? 'Logout' : ''}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-red-400 hover:bg-red-400/10 transition-all w-full group"
                    >
                        <div className="min-w-[24px] flex justify-center">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                            Logout
                        </span>
                    </button>

                    {/* Collapsible Toggle */}
                    <button
                        onClick={togglePin}
                        className="hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-800 hover:text-white transition-all group"
                        title={isPinned ? 'Collapse Sidebar' : 'Expand Sidebar'}
                    >
                        <div className="min-w-[24px] flex justify-center">
                            <Menu className={`w-5 h-5 transition-transform duration-300 ${isPinned ? 'rotate-90' : ''}`} />
                        </div>
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
