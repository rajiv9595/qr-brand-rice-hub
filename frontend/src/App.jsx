
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Home, TrendingUp, BarChart2, ShoppingBag, LogOut, User, Wheat, Scale, BookOpen, Shield, Menu, X, LogIn, LayoutDashboard, Box, ArrowRight } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';
import SupplierLayout from './components/supplier/SupplierLayout';
import AdminLayout from './components/admin/AdminLayout';
import { authService } from './services/authService';
import { useAppStore, AppProvider } from './context/AppContext';
import SupportWidget from './components/common/SupportWidget';
import Logo from './components/common/Logo';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const RiceDetailPage = React.lazy(() => import('./pages/RiceDetailPage'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
const MarketPage = React.lazy(() => import('./pages/MarketPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));

// Supplier pages
const SupplierOverview = React.lazy(() => import('./pages/supplier/SupplierOverview'));
const CreateListing = React.lazy(() => import('./pages/supplier/CreateListing'));
const MyListings = React.lazy(() => import('./pages/supplier/MyListings'));
const EditListing = React.lazy(() => import('./pages/supplier/EditListing'));
const SupplierProfile = React.lazy(() => import('./pages/supplier/SupplierProfile'));
const SupplierOrders = React.lazy(() => import('./pages/supplier/SupplierOrders'));
const SupplierReviews = React.lazy(() => import('./pages/supplier/SupplierReviews'));

// Buyer pages
const BuyerLayout = React.lazy(() => import('./components/buyer/BuyerLayout'));
const BuyerOverview = React.lazy(() => import('./pages/buyer/BuyerOverview'));
const MyOrders = React.lazy(() => import('./pages/buyer/MyOrders'));
const BuyerProfile = React.lazy(() => import('./pages/buyer/BuyerProfile'));
const BuyerSettings = React.lazy(() => import('./pages/buyer/BuyerSettings'));

// Admin pages
const AdminLogin = React.lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const ListingManagement = React.lazy(() => import('./pages/admin/ListingManagement'));
const SupplierManagement = React.lazy(() => import('./pages/admin/SupplierManagement'));
const ReviewModeration = React.lazy(() => import('./pages/admin/ReviewModeration'));
const ExpertReviewManagement = React.lazy(() => import('./pages/admin/ExpertReviewManagement'));
const MarketUpdateManagement = React.lazy(() => import('./pages/admin/MarketUpdateManagement'));
const CookingTipsManagement = React.lazy(() => import('./pages/admin/CookingTipsManagement'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const SupportManagement = React.lazy(() => import('./pages/admin/SupportManagement'));

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Wheat },
  { to: '/search', label: 'Rice Listings', icon: Search },
  { to: '/compare', label: 'Compare', icon: Scale },
  { to: '/market', label: 'Knowledge Hub', icon: BookOpen },
  { to: '/supplier', label: 'Supplier Panel', icon: User },
  { to: '/admin', label: 'Admin', icon: Shield },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const { compareIds, clearCompare } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    const isAdmin = authService.getCurrentUser()?.role === 'admin';
    authService.logout();
    navigate(isAdmin ? '/admin/login' : '/login');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-rice-50 font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rice-200 shadow-sm">
        <div className="w-full max-w-[90rem] ml-0 px-4 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="shrink-0">
              <Logo size="md" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

                // Hide protected routes if not logged in or wrong role, etc. allow visible for now
                if ((label === 'Supplier Panel' && user?.role === 'customer')) return null;
                if ((label === 'Admin' && user?.role !== 'admin')) return null;

                return (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${active ? 'bg-field-500 text-white shadow-md' : 'text-gray-600 hover:bg-field-50 hover:text-field-600'}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {to === '/compare' && compareIds.length > 0 && (
                      <span className="ml-1 bg-rice-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{compareIds.length}</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 text-sm font-medium">
                  {user.role === 'customer' && (
                    <Link to="/buyer" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-field-100 text-field-700 rounded-xl hover:bg-field-200 transition-all border border-field-200/50 shadow-sm font-bold">
                      <LayoutDashboard className="w-4 h-4" />
                      My Dashboard
                    </Link>
                  )}
                  {user.role === 'supplier' && (
                    <Link to="/supplier" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all border border-orange-200/50 shadow-sm font-bold">
                      <BarChart2 className="w-4 h-4" />
                      Supplier Panel
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-all border border-indigo-200/50 shadow-sm font-bold">
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="flex items-center gap-2 bg-field-50 pl-3 pr-1 py-1 rounded-full border border-field-100">
                    <span className="text-field-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <button onClick={handleLogout} className="p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm transition-colors" title="Logout">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1.5 btn-primary text-sm !px-4 !py-2">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg hover:bg-rice-100 transition-colors text-field-700">
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-rice-100 bg-white pb-4 px-4 shadow-xl">
            <nav className="flex flex-col gap-1 pt-2">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;
                if ((label === 'Supplier Panel' && user?.role === 'customer')) return null;
                if ((label === 'Admin' && user?.role !== 'admin')) return null;

                return (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${active ? 'bg-field-500 text-white' : 'text-gray-600 hover:bg-field-50'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                    {to === '/compare' && compareIds.length > 0 && (
                      <span className="ml-auto bg-rice-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{compareIds.length}</span>
                    )}
                  </Link>
                );
              })}
              {!user && (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-field-600 bg-field-50 mt-1">
                  <LogIn className="w-5 h-5" /> Login / Register
                </Link>
              )}
              {user && (
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        <React.Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-[50vh] text-gray-400">Loading...</div>}>
          {children}
        </React.Suspense>
      </main>

      {/* Support Widget - Show for logged in users who are not admins */}
      {user && user.role !== 'admin' && <SupportWidget />}

      {/* Compare Float Bar */}
      {compareIds.length > 0 && location.pathname !== '/compare' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-white border border-primary-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 pr-4 rounded-full flex items-center gap-4 animate-in slide-in-from-bottom-12 duration-700">
          <div className="flex -space-x-2 ml-2">
            {[...Array(compareIds.length)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-1 ring-primary-100">
                <Box className="w-3.5 h-3.5" />
              </div>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-100" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-900 whitespace-nowrap">
            {compareIds.length} <span className="text-primary-600">Selected</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 px-2 transition-colors"
            >
              Clear
            </button>
            <Link
              to={`/compare?ids=${compareIds.join(',')}`}
              className="bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black uppercase tracking-[0.15em] px-6 py-2.5 rounded-full transition-all shadow-lg shadow-primary-200 flex items-center gap-2 group"
            >
              Analysis <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-field-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-6">
                <Logo variant="dark" size="md" />
              </div>
              <p className="text-field-200 text-sm font-body italic leading-relaxed opacity-80">
                "సరియైన బియ్యం.. సరైన ధర... సరైన ఎంపిక...<br />
                బియ్యం మార్కెట్ నిజమైన సమాచారం ఒకే చోట."
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4 text-rice-300">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {NAV_ITEMS.map(({ to, label }) => (
                  <Link key={to} to={to} className="text-field-200 hover:text-white text-sm transition-colors font-body hover:translate-x-1 transform duration-200 w-fit">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-4 text-rice-300">Contact</h4>
              <div className="text-field-200 text-sm space-y-3 font-body">
                <p className="flex items-center gap-2"><span className="text-xl">📧</span> ricehubinfo@gmail.com</p>
                <p className="flex items-center gap-2"><span className="text-xl">📞</span> +91 9614346666</p>
                <p className="flex items-center gap-2"><span className="text-xl">📍</span> Rajamahendravaram, Andhra Pradesh, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-field-700 mt-10 pt-6 text-center text-field-400 text-xs font-body tracking-wide">
            © 2026 QR Brand Rice Hub. All rights reserved. A trusted rice intelligence platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/search" element={<Layout><SearchPage /></Layout>} />
          <Route path="/rice/:id" element={<Layout><RiceDetailPage /></Layout>} />
          <Route path="/compare" element={<Layout><ComparePage /></Layout>} />
          <Route path="/market" element={<Layout><MarketPage /></Layout>} />
          <Route path="/login" element={<React.Suspense fallback={<div>Loading...</div>}><LoginPage /></React.Suspense>} />
          <Route path="/admin/login" element={<React.Suspense fallback={<div>Loading...</div>}><AdminLogin /></React.Suspense>} />

          {/* Supplier Protected Routes */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute requiredRole="supplier">
                <React.Suspense fallback={<div>Loading...</div>}>
                  <SupplierLayout />
                </React.Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<SupplierOverview />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="orders" element={<SupplierOrders />} />
            <Route path="reviews" element={<SupplierReviews />} />
            <Route path="create" element={<CreateListing />} />
            <Route path="edit/:id" element={<EditListing />} />
            <Route path="profile" element={<SupplierProfile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <React.Suspense fallback={<div>Loading...</div>}>
                  <AdminLayout />
                </React.Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="listings" element={<ListingManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="reviews" element={<ReviewModeration />} />
            <Route path="support" element={<SupportManagement />} />
            <Route path="expert-reviews" element={<ExpertReviewManagement />} />
            <Route path="market-updates" element={<MarketUpdateManagement />} />
            <Route path="cooking-tips" element={<CookingTipsManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Buyer Protected Routes */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute requiredRole="customer">
                <React.Suspense fallback={<div>Loading...</div>}>
                  <BuyerLayout />
                </React.Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<BuyerOverview />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="profile" element={<BuyerProfile />} />
            <Route path="settings" element={<BuyerSettings />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
