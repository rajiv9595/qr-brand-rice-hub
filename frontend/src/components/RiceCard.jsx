
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Scale, CheckCircle2, XCircle } from 'lucide-react';
import StarRating from './StarRating';
import { useAppStore } from '../context/AppContext';
import { optimizeImage } from '../utils/imageOptimizer';

function RiceCard({ rice }) {
    const { toggleCompare } = useAppStore();
    const compareIds = useAppStore().compareIds || [];

    const isComparing = compareIds.includes(rice.id || rice._id); // Assuming backend uses _id 

    // Normalize data (handling both mock-like and backend data)
    const id = rice.id || rice._id;
    const brandName = rice.brandName;
    const price = rice.price || rice.pricePerBag;
    const variety = rice.riceVariety || rice.variety;
    const millName = rice.millName || "Premium Mill";
    const location = rice.location || "Andhra Pradesh";
    const state = rice.state || "";
    const rawImageUrl = rice.bagImageUrl || rice.imageUrl || "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80";
    const imageUrl = optimizeImage(rawImageUrl, 400); // Optimize for card size
    const stockAvailable = rice.stockAvailable ?? true;
    const averageRating = rice.averageRating || 4.5;

    // Safe Access for complex objects
    let usageTags = rice.usageCategory || rice.tags || [];
    if (!Array.isArray(usageTags)) {
        // If it's a string, potentially split by comma, or just wrap it
        usageTags = typeof usageTags === 'string' ? usageTags.split(',').map(s => s.trim()) : [usageTags];
    }

    // Mock expert review logic if not present in backend data
    const expertReview = rice.expertReview || {
        recommendation: 'Recommended',
        grainQualityGrade: 'A'
    };

    const recColor = expertReview.recommendation === 'Premium'
        ? 'badge-gold'
        : expertReview.recommendation === 'Budget Pick'
            ? 'bg-blue-50 text-blue-600 badge'
            : 'badge-green';

    return (
        <div className="card group h-full flex flex-col">
            <div className="relative overflow-hidden rounded-t-2xl">
                <img
                    src={imageUrl}
                    alt={brandName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {usageTags.slice(0, 2).map((c, i) => (
                        <span key={i} className="badge-green text-[10px] capitalize">{c.replace('_', ' ')}</span>
                    ))}
                </div>
                <div className="absolute top-3 right-3">
                    {stockAvailable
                        ? <span className="badge bg-green-500/90 text-white text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />In Stock</span>
                        : <span className="badge bg-red-500/90 text-white text-[10px]"><XCircle className="w-3 h-3 mr-1" />Out of Stock</span>
                    }
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display font-bold text-field-700 text-lg leading-tight line-clamp-2">{brandName}</h3>
                    <span className="text-xl font-bold text-rice-500 whitespace-nowrap">₹{price}<span className="text-xs font-normal text-gray-400">/kg</span></span>
                </div>

                <p className="text-sm text-gray-500 mb-2 truncate">{variety} · {millName}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-field-400" />
                    {location}{state ? `, ${state}` : ''}
                </div>

                <StarRating rating={averageRating} size={14} />

                <div className="mt-4 flex items-center gap-2 mb-4">
                    <span className={`${recColor} text-[10px]`}>{expertReview.recommendation}</span>
                    <span className="text-[10px] text-gray-400 border px-1.5 rounded">Grade: {expertReview.grainQualityGrade}</span>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-2">
                    <Link to={`/rice/${id}`} className="flex-1 text-center btn-primary text-sm !py-2.5">View Details</Link>
                    <button
                        onClick={() => toggleCompare(id)}
                        className={`p-2.5 rounded-xl border-2 transition-all ${isComparing ? 'border-field-500 bg-field-50 text-field-600' : 'border-gray-200 text-gray-400 hover:border-field-300 hover:text-field-500'}`}
                        title={isComparing ? 'Remove from compare' : 'Add to compare'}
                    >
                        <Scale className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RiceCard;
