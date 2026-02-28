import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, Users, MessageSquare, Award,
    ChefHat, TrendingUp, Settings, LogOut, Menu, X, ShoppingBag,
    Shield, LifeBuoy, UserCheck
} from 'lucide-react';
import { authService } from '../../services/authService';
import Logo from '../common/Logo';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(() => {
        const saved = localStorage.getItem('adminSidebarPinned');
        return saved !== null ? JSON.parse(saved) : false;
    });
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/analytics', icon: TrendingUp, label: 'Platform Analytics' },
        { path: '/admin/listings', icon: Package, label: 'Listings' },
        { path: '/admin/users', icon: UserCheck, label: 'Users' },
        { path: '/admin/suppliers', icon: Users, label: 'Suppliers' },
        { path: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
        { path: '/admin/support', icon: LifeBuoy, label: 'Support' },
        { path: '/admin/expert-reviews', icon: Award, label: 'Expert Reviews' },
        { path: '/admin/cooking-tips', icon: ChefHat, label: 'Cooking Tips' },
        { path: '/admin/market-updates', icon: TrendingUp, label: 'Market Updates' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const togglePin = () => {
        setIsPinned(!isPinned);
        localStorage.setItem('adminSidebarPinned', JSON.stringify(!isPinned));
    };

    const isExpanded = isPinned || isHovered;

    return (
        <div className="min-h-screen bg-rice-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    fixed lg:sticky top-0 left-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 z-50
                    transform transition-all duration-300 ease-in-out lg:transform-none
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isExpanded ? 'w-64' : 'w-20'}
                `}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Logo */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between h-20 shrink-0">
                        <Link to="/" className="flex items-center gap-3">
                            <Logo variant="dark" size="sm" iconOnly={!isExpanded} />
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-700 shrink-0 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5 text-secondary-500" />
                            </div>
                            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                <p className="font-bold text-white truncate text-sm">{user?.name || 'Admin'}</p>
                                <p className="text-[10px] text-secondary-500 uppercase tracking-wider font-bold italic">Administrator</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    title={!isExpanded ? item.label : ''}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all group
                                        ${active
                                            ? 'bg-secondary-500 text-gray-900 shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                        }
                                    `}
                                >
                                    <div className="min-w-[24px] flex justify-center">
                                        <Icon className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400 group-hover:text-white'}`} />
                                    </div>
                                    <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-gray-700 space-y-1">
                        <button
                            onClick={handleLogout}
                            title={!isExpanded ? 'Logout' : ''}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-all group"
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
                            className="hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-500 hover:bg-gray-700/50 hover:text-white transition-all group"
                            title={isPinned ? 'Collapse Sidebar' : 'Expand Sidebar'}
                        >
                            <div className="min-w-[24px] flex justify-center">
                                <Menu className={`w-5 h-5 transition-transform duration-300 ${isPinned ? 'rotate-90' : ''}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:text-primary-600"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">
                            Admin Control Panel
                        </h1>
                        <Link to="/" className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            Marketplace
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
