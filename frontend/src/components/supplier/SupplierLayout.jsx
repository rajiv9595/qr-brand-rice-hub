import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, PlusCircle, LogOut,
    Menu, X, ShoppingBag, User, MessageSquare
} from 'lucide-react';
import { authService } from '../../services/authService';
import { supplierService } from '../../services/supplierService';
import SupportWidget from '../common/SupportWidget';
import Logo from '../common/Logo';

const SupplierLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isPinned, setIsPinned] = useState(() => {
        const saved = localStorage.getItem('supplierSidebarPinned');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    // Shared Stats State
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchStats = async () => {
        try {
            const data = await supplierService.getDashboardStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch supplier stats', err);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const refreshStats = () => {
        fetchStats();
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/supplier', icon: LayoutDashboard, label: 'Overview', exact: true },
        { path: '/supplier/listings', icon: Package, label: 'My Listings' },
        { path: '/supplier/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/supplier/reviews', icon: MessageSquare, label: 'Reviews' },
        { path: '/supplier/create', icon: PlusCircle, label: 'Create Listing' },
        { path: '/supplier/profile', icon: User, label: 'Profile' },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const togglePin = () => {
        setIsPinned(!isPinned);
        localStorage.setItem('supplierSidebarPinned', JSON.stringify(!isPinned));
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
                    fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-100 z-50
                    transform transition-all duration-300 ease-in-out lg:transform-none
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${isExpanded ? 'w-64' : 'w-20'}
                `}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    {/* Logo */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between h-20 shrink-0">
                        <Link to="/supplier" className="flex items-center gap-3 overflow-hidden">
                            <div className="min-w-[40px] flex justify-center">
                                <Logo variant="light" size="sm" />
                            </div>
                            <span className={`font-black text-xl text-primary-900 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                QR HUB
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-100 shrink-0 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                                <p className="font-black text-primary-900 truncate text-sm leading-none">{user?.name || 'Supplier'}</p>
                                <p className="text-[10px] text-primary-500/70 font-bold uppercase tracking-widest mt-1">Supplier</p>
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
                                            ? 'bg-primary-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                                        }
                                    `}
                                >
                                    <div className="min-w-[24px] flex justify-center">
                                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
                                    </div>
                                    <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-3 border-t border-gray-100 space-y-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all group"
                        >
                            <div className="min-w-[24px] flex justify-center text-red-400 group-hover:text-red-600">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                                Logout
                            </span>
                        </button>

                        {/* Collapsible Toggle */}
                        <button
                            onClick={togglePin}
                            className="hidden lg:flex w-full items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-400 hover:bg-gray-50 hover:text-primary-600 transition-all group"
                        >
                            <div className="min-w-[24px] flex justify-center">
                                {isPinned ? (
                                    <Menu className="w-5 h-5 rotate-90" /> // Using Menu as a placeholder for toggle icon
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </div>
                            <span className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
                                {isPinned ? 'Collapse Sidebar' : 'Expand Sidebar'}
                            </span>
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
                            Supplier Dashboard
                        </h1>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {/* Provide Shared Context */}
                    <Outlet context={{ stats, refreshStats, loadingStats }} />
                </main>
                <SupportWidget />
            </div>
        </div>
    );
};

export default SupplierLayout;
