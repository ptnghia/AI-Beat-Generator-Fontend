# AI Beat Generator - Frontend

Modern, responsive e-commerce marketplace for AI-generated beats built with Next.js 16 and React 19.

## Features

- 🎵 **Beat Marketplace**: Browse, filter, and preview AI-generated beats
- 🛒 **Shopping Cart**: Full cart management with localStorage persistence
- 💳 **Checkout Flow**: Stripe-ready checkout with promo codes
- 🎨 **Audio Player**: Custom audio player with waveform visualization
- 🔐 **Admin Dashboard**: Complete admin panel with JWT authentication
- 📊 **Analytics Dashboard**: Real-time stats, API key management, system logs
- 🎯 **Advanced Filters**: Genre, mood, style, use case filtering
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **Optimized Performance**: Next.js 16 with Turbopack, image optimization
- 🎭 **Toast Notifications**: User feedback with Sonner
- 🚨 **Error Handling**: Custom error pages and boundaries
- ♿ **Accessibility**: ARIA labels, keyboard navigation
- 🔍 **SEO Optimized**: Sitemap, robots.txt, Open Graph tags

## Tech Stack

- **Next.js 16** - React framework with App Router & Turbopack
- **React 19** - Latest React with Server Components
- **TypeScript 5+** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Zustand 5** - State management with persist
- **React Query** - Server state management
- **Axios** - HTTP client with interceptors
- **Sonner** - Toast notifications
- **WaveSurfer.js** - Audio waveform visualization

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3001
```

## Project Structure

```
app/
├── (marketplace)/      # Public routes
│   ├── beats/         # Browse beats
│   ├── cart/          # Shopping cart
│   └── checkout/      # Checkout flow
├── admin/             # Admin dashboard (protected)
│   ├── dashboard/     
│   ├── beats/         # Beat management
│   ├── api-keys/      # API key management
│   └── logs/          # System logs
components/
├── ui/                # shadcn/ui components
├── beat/              # Beat components
├── cart/              # Cart components
└── AudioPlayer.tsx    # Audio player
lib/
├── api.ts             # Axios instance
├── hooks/             # React Query hooks
└── stores/            # Zustand stores
```

## Key Features

### Beat Marketplace
- Advanced filtering (genre, mood, style)
- Real-time audio preview
- Tag-based search
- Responsive grid layout

### Admin Dashboard
- JWT authentication
- Real-time statistics
- Beat CRUD operations
- API key monitoring
- System logs viewer

### Shopping Cart
- Persistent cart (localStorage)
- Multiple license types
- Promo code support
- Toast notifications

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Deployment

### Vercel
```bash
vercel
```

### PM2
```bash
npm run build
pm2 start ecosystem.config.js
```

## Backend Repository

Backend API: https://github.com/ptnghia/AI-Beat-Generator-backend

## Author

Phan Thanh Nghia
