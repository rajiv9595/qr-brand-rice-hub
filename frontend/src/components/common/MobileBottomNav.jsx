import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { authService } from '../../services/authService';

const MobileBottomNav = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();

    // Determine the dashboard/account link based on role
    let accountLink = '/login';
    if (user) {
        if (user.role === 'customer') accountLink = '/buyer';
        else if (user.role === 'supplier') accountLink = '/supplier';
        else if (user.role === 'admin') accountLink = '/admin';
    }

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Market' },
        { path: '/buyer/orders', icon: ShoppingBag, label: 'Orders', hideForRoles: ['admin', 'supplier'], requiresAuth: true },
        { path: accountLink, icon: User, label: user ? 'Account' : 'Login' },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const requiresAuth = item.requiresAuth || false;
                    const hideForRoles = item.hideForRoles || [];

                    if (requiresAuth && !user) return null;
                    if (hideForRoles.length > 0 && user && hideForRoles.includes(user.role)) return null;

                    let active = false;
                    if (item.path === '/') {
                        active = location.pathname === '/';
                    } else if (item.path === '/login') {
                        active = location.pathname === '/login';
                    } else {
                        active = location.pathname.startsWith(item.path);
                    }

                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-6 h-6 stroke-2 ${active ? 'fill-primary-50 text-primary-600' : ''}`} />
                            <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
