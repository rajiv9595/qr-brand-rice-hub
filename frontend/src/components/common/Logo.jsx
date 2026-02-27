import React from 'react';

const Logo = ({
    className = "",
    iconOnly = false,
    variant = 'light', // 'light' for dark text (light bg), 'dark' for light text (dark bg)
    size = 'md' // 'sm', 'md', 'lg'
}) => {
    const isDarkBg = variant === 'dark';

    const sizes = {
        sm: { container: 'w-10 h-10', text: 'text-base', subtext: 'text-[7px]', gap: 'gap-1.5' },
        md: { container: 'w-12 h-12', text: 'text-xl', subtext: 'text-[9px]', gap: 'gap-2' },
        lg: { container: 'w-16 h-16', text: 'text-2xl', subtext: 'text-[11px]', gap: 'gap-3' }
    };

    const currentSize = sizes[size] || sizes.md;

    return (
        <div className={`flex items-center ${currentSize.gap} shrink-0`}>
            {/* Professional Brand Icon */}
            <div className={`${className} relative flex items-center justify-center shrink-0 ${currentSize.container}`}>
                <img
                    src="/logo.png"
                    alt="Quality Rice"
                    className="w-full h-full object-contain drop-shadow-sm"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentNode.innerHTML = `<div class="w-full h-full bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold ${size === 'sm' ? 'text-[8px]' : 'text-xs'}">QR</div>`;
                    }}
                />
            </div>

            {!iconOnly && (
                <div className="flex flex-col gap-0.5 ml-1 overflow-hidden">
                    <h1 className={`${currentSize.text} font-black ${isDarkBg ? 'text-white' : 'text-emerald-950'} leading-none tracking-tight uppercase font-display whitespace-nowrap`}>
                        QR <span className="text-emerald-500">BRAND</span>
                    </h1>
                    <p className={`${currentSize.subtext} font-black ${isDarkBg ? 'text-amber-400' : 'text-amber-600'} tracking-[0.05em] uppercase opacity-90 truncate`}>
                        Quality Rice Intelligence
                    </p>
                </div>
            )}
        </div>
    );
};

export default Logo;
