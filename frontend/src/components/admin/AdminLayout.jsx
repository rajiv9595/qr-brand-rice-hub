import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, Users, MessageSquare, Award,
    ChefHat, TrendingUp, Settings, LogOut, Menu, X, ShoppingBag,
    Shield, LifeBuoy, UserCheck
} from 'lucide-react';
import { authService } from '../../services/authService';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
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
            <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 z-50
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center">
                                <Shield className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <span className="font-bold text-lg tracking-tight text-white block">QR BRAND</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Admin Panel</span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary-500/20 rounded-full flex items-center justify-center">
                                <Shield className="w-5 h-5 text-secondary-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-secondary-500 uppercase tracking-wider font-bold">Administrator</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path, item.exact);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${active
                                            ? 'bg-secondary-500 text-gray-900 shadow-lg'
                                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
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
