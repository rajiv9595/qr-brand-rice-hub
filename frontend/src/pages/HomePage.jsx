
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Wheat, Users, ChefHat, BarChart3, ShieldCheck, Sparkles, MessageSquare, MapPin, ShoppingBag, BookOpen } from 'lucide-react';
import { riceService, marketService } from '../services';
import RiceCard from '../components/RiceCard';
import Logo from '../components/common/Logo';
import { useAppStore } from '../context/AppContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1695150601855-f545034a070a?w=1200&q=80';

const CATEGORY_ICONS = {
    daily: <Wheat className="w-7 h-7" />,
    function: <Users className="w-7 h-7" />,
    guests: <Sparkles className="w-7 h-7" />,
    healthy: <ChefHat className="w-7 h-7" />,
};

const USAGE_LABELS = {
    daily: "Daily Family Use",
    function: "Function / Catering",
    guests: "Guests / Special Meal",
    healthy: "Healthy / Brown Rice"
};

const FEATURES = [
    { icon: <ShieldCheck className="w-8 h-8 text-field-500" />, title: 'Verified Suppliers', desc: 'Every supplier is verified and every listing is admin-approved before publishing.' },
    { icon: <BarChart3 className="w-8 h-8 text-field-500" />, title: 'Expert Reviews', desc: 'QR Brand expert team grades every rice for quality, fairness and suitability.' },
    { icon: <ChefHat className="w-8 h-8 text-field-500" />, title: 'Cooking Guidance', desc: 'Detailed cooking tips for every variety — water ratio, method, best dishes.' },
];

const MOCK_KNOWLEDGE = [
    {
        id: 'k1',
        title: 'How to Identify Quality Rice Before Buying',
        content: 'Learn to check grain length, color uniformity, broken grain percentage, and aroma to identify premium rice...',
        category: 'quality',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
        author: 'QR Brand Research Team',
        publishedAt: '2026-02-15'
    },
    {
        id: 'k2',
        title: 'Rice Market Trends: February 2026 Update',
        content: 'Sona Masoori prices have stabilized at ₹48-55/kg. Basmati shows a slight upward trend due to export demand...',
        category: 'market',
        imageUrl: 'https://images.unsplash.com/photo-1695150601855-f545034a070a?w=600&q=80',
        author: 'QR Brand Market Analysts',
        publishedAt: '2026-02-14'
    },
    {
        id: 'k3',
        title: 'Understanding Rice Varieties in Telugu States',
        content: 'Telugu states produce some of India\'s finest rice varieties: Sona Masoori (most popular), BPT 5204, HMT, Kolam...',
        category: 'education',
        imageUrl: 'https://images.unsplash.com/photo-1627482265910-5c0ff6bee088?w=600&q=80',
        author: 'QR Brand Expert Team',
        publishedAt: '2026-02-12'
    }
];

export default function HomePage() {
    const { setSelectedCategory } = useAppStore();
    const [featured, setFeatured] = useState([]);
    const [marketUpdates, setMarketUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUpdates, setLoadingUpdates] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHomeData = async () => {
            setLoading(true);
            try {
                const [riceRes, marketRes] = await Promise.allSettled([
                    riceService.getPublicListings({ limit: 3 }),
                    marketService.getMarketUpdates({ limit: 3 })
                ]);

                if (riceRes.status === 'fulfilled') {
                    setFeatured(riceRes.value.data.data?.slice(0, 3) || []);
                }
                if (marketRes.status === 'fulfilled') {
                    setMarketUpdates(marketRes.value.data.updates || []);
                }
            } catch (err) {
                console.error('Failed to load home data', err);
            } finally {
                setLoading(false);
                setLoadingUpdates(false);
            }
        };
        fetchHomeData();
    }, []);

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        navigate('/rice'); // Assuming /rice is the listings page; App.jsx says /search -> SearchPage
    };

    // Check routes in App.jsx: /search -> SearchPage. Reference uses /rice.
    // I'll stick to Reference UI links (/rice) but map them to /search if needed, 
    // or better, I should probably update App.jsx routes to match Reference (/rice) for consistency?
    // User said "change my ui... without disturbing my backend".
    // Routes are frontend. I will use /search as per existing App.jsx or update App.jsx to /rice?
    // Existing App.jsx uses `/rice/:id` for details but `/search` for listing. 
    // Reference used `/rice` for listing. 
    // I will use `/search` for listing in this HomePage to capture existing route logic.

    return (
        <div>
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center overflow-hidden">
                <div className="absolute inset-0">
                    <img src={HERO_IMG} alt="Rice fields" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-field-900/90 via-field-800/70 to-transparent" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full text-center sm:text-left">
                    <div className="max-w-xl mx-auto sm:mx-0">
                        <span className="badge-gold mb-6 inline-block uppercase tracking-widest text-[10px]">🌾 Trusted Rice Intelligence Platform</span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4 flex flex-col gap-1 tracking-tight">
                            <span>సరియైన బియ్యం</span>
                            <span className="text-rice-300">సరైన ధర</span>
                        </h1>
                        <p className="text-field-100 text-lg sm:text-xl font-body mb-8 leading-relaxed max-w-lg">
                            Compare rice brands, read expert reviews, get cooking tips — all verified and transparent. Your trusted guide for rice selection.
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                            <Link to="/search" className="btn-primary flex items-center gap-2 px-8">
                                Start Searching <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white font-bold group">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm">Help on WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Usage Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {Object.keys(USAGE_LABELS).map(cat => (
                        <div key={cat} onClick={() => handleCategoryClick(cat)}
                            className="card p-5 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-field-50 text-field-500 flex items-center justify-center group-hover:bg-field-500 group-hover:text-white transition-all duration-300">
                                {CATEGORY_ICONS[cat]}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-field-600 transition-colors">{USAGE_LABELS[cat]}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Rural Friendly - Simple Steps Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">How to use QR Brand?</h2>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Simple 3-Step Process for Everyone</p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden sm:block absolute top-1/4 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-gray-100 -z-10" />

                        {[
                            { step: '1', title: 'Find Your Village', desc: 'Type your village name or Pincode to see what rice is available near you.', icon: <MapPin className="w-8 h-8" />, color: 'bg-blue-500' },
                            { step: '2', title: 'Compare & Select', desc: 'Check prices and expert reviews to pick the best rice for your family.', icon: <BarChart3 className="w-8 h-8" />, color: 'bg-orange-500' },
                            { step: '3', title: 'Order for Home', desc: 'Place your order in 30 seconds. We deliver directly to your village address.', icon: <ShoppingBag className="w-8 h-8" />, color: 'bg-primary-600' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className={`w-20 h-20 rounded-full ${item.color} text-white flex items-center justify-center mb-6 shadow-2xl shadow-gray-200 group-hover:scale-110 transition-transform relative`}>
                                    {item.icon}
                                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-900 rounded-full flex items-center justify-center font-black text-sm border-4 border-gray-50">{item.step}</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed font-medium px-4">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <div className="inline-flex flex-col gap-4">
                            <Link to="/search" className="btn-primary px-10 py-5 rounded-2xl text-lg shadow-2xl shadow-primary-500/30">
                                Start Searching Now
                            </Link>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No English knowledge needed — Just type your village name</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Rice */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="section-title">Featured Rice</h2>
                    <Link to="/search" className="text-field-500 hover:text-field-600 font-semibold text-sm flex items-center gap-1">
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? [1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />)
                        : featured.map(r => <RiceCard key={r._id || r.id} rice={r} />)
                    }
                </div>
            </section>

            {/* Knowledge Preview */}
            <section className="bg-field-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="section-title !text-white">Market Intelligence</h2>
                            <p className="text-field-200 mt-1 text-sm">Latest rice market updates and knowledge</p>
                        </div>
                        <Link to="/market" className="text-rice-300 hover:text-rice-200 font-semibold text-sm flex items-center gap-1">
                            All Updates <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {loadingUpdates
                            ? [1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)
                            : marketUpdates.length > 0 ? marketUpdates.map(post => (
                                <div key={post._id} className="card group hover:scale-[1.02] transition-transform duration-300">
                                    {post.imageUrl && (
                                        <div className="h-40 overflow-hidden">
                                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <span className="badge text-[10px] mb-3 bg-field-50 text-field-600 border border-field-100 uppercase tracking-widest font-black">
                                            {post.category || 'MARKET'}
                                        </span>
                                        <h3 className="font-display font-bold text-field-700 mb-2 leading-tight line-clamp-2">{post.title}</h3>
                                        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{post.description}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-field-500" />
                                            {post.createdBy?.name || 'Expert Team'}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                                    <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.2em]">New updates are on the way</p>
                                </div>
                            )
                        }
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
                <div className="card p-8 sm:p-12 text-center bg-gradient-to-br from-field-50 to-rice-50">
                    <div className="flex justify-center mb-6">
                        <Logo iconOnly size="lg" />
                    </div>
                    <h2 className="section-title mb-4">Are You a Rice Supplier?</h2>
                    <p className="text-gray-600 max-w-xl mx-auto mb-6">
                        List your rice brands on QR Brand Rice Hub. Reach customers across Telugu states with verified, trusted listings.
                    </p>
                    <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                        Register as Supplier <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
