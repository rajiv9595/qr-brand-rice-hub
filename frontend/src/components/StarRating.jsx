
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export default function StarRating({ rating = 0, size = 16 }) {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: full }).map((_, i) => (
                <Star key={`f${i}`} size={size} className="fill-warning-400 text-warning-400" />
            ))}
            {hasHalf && <StarHalf size={size} className="fill-warning-400 text-warning-400" />}
            {Array.from({ length: empty }).map((_, i) => (
                <Star key={`e${i}`} size={size} className="text-gray-300" />
            ))}
            <span className="ml-1.5 text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
        </div>
    );
}
