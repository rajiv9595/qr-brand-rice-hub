# QR Brand Rice Hub - Design System V2

## Overview
This design system establishes a premium, agricultural-tech aesthetic for the QR Brand Rice Hub platform. It prioritizes clarity, trust, and ease of use for both farmers/millers and bulk buyers.

## Color Palette

### Primary (Growth & Trust)
Used for primary actions, branding, and emphasis.
- **Base**: `primary-600` (#2e632b) - Deep agricultural green
- **Hover**: `primary-700` (#264f23)
- **Backgrounds**: `primary-50` (#f2f7f2) - Subtle tint for cards/sections

### Secondary (Harvest & Earth)
Used for accents, premium features, and contrast.
- **Base**: `secondary-500` (#c68d32) - Golden harvest tone
- **Text**: `secondary-700` (#8c5520) - Readable earth tone

### Alerts & Status
- **Success**: Emerald Green (`text-green-600`, `bg-green-50`)
- **Warning**: Amber/Gold (`text-yellow-600`, `bg-yellow-50`)
- **Error**: Rose Red (`text-red-600`, `bg-red-50`)

## Typography

### Headings (Display)
**Font**: `Outfit` (sans-serif)
- Used for page titles, hero sections, and marketing headers.
- Weights: Bold (700), Black (900)

### Body (Readability)
**Font**: `Inter` (sans-serif)
- Used for interface text, forms, and data grids.
- Weights: Regular (400), Medium (500), Bold (700)

## UI Components

### Buttons
- **Primary**: `btn-primary` (Green background, white text, shadow)
- **Secondary**: `btn-secondary` (White background, gray border, gray text)
- **Outline**: `btn-outline` (Transparent, primary border)
- **Ghost**: Minimal padding, text only with hover background

### Cards (`.card`)
- White background
- Rounded corners (`rounded-2xl` or `rounded-xl`)
- Subtle border (`border-gray-100`)
- Soft shadow (`shadow-sm` -> `shadow-md` on hover)
- Padding: `p-6` or `p-8` standard

### Badges (`.badge`)
- Pill-shaped (`rounded-full`)
- Uppercase, tracking-wide
- Font size: `text-xs`
- Heavy font weight: `font-bold`

### Inputs (`.input-field`)
- Large touch targets (`py-3`)
- Light background (`bg-gray-50`)
- Focus ring: Primary color

## Layout Principles
1.  **Spacing**: Use consistent spacing scale (4, 6, 8, 12).
2.  **Container**: `max-w-7xl` centered for main content.
3.  **Grids**: Responsive grids (1col -> 2col -> 3/4col).
4.  **Glassmorphism**: Used sparingly in headers/overlays (`backdrop-blur-md`).

## Animation
- **Transitions**: `duration-200` ease-out for interactive elements.
- **Page Load**: `animate-in fade-in slide-in-from-bottom` for smooth entry.
