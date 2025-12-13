'use client';

import Link from 'next/link';
import { Music } from 'lucide-react';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Music className="w-6 h-6" />
          <span>AI Beat Generator</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/beats"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Browse Beats
          </Link>
          <Link
            href="/cart"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Cart
          </Link>
        </nav>

        {/* Cart Drawer */}
        <CartDrawer />
      </div>
    </header>
  );
}
