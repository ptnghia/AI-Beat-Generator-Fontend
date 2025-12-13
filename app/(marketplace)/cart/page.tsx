'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cart-store';
import { API_CONFIG } from '@/lib/config';

export default function CartPage() {
  const {
    items,
    subtotal,
    tax,
    total,
    discount,
    promoCode,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromoCode,
    removePromoCode,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsApplying(true);
    setPromoError('');

    const success = await applyPromoCode(promoInput);

    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code');
    }

    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t added any beats yet. Browse our collection to get started!
            </p>
            <Link href="/beats">
              <Button size="lg">
                Browse Beats
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Cover Art */}
                <Link
                  href={`/beats/${item.beat.id}`}
                  className="relative w-24 h-24 shrink-0 rounded overflow-hidden bg-muted"
                >
                  {item.beat.coverArtPath ? (
                    <Image
                      src={`${API_CONFIG.BASE_URL}/${item.beat.coverArtPath}`}
                      alt={item.beat.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </Link>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/beats/${item.beat.id}`}
                    className="font-semibold text-lg hover:underline line-clamp-1"
                  >
                    {item.beat.name}
                  </Link>
                  
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {item.beat.genre && <span>{item.beat.genre}</span>}
                    {item.beat.bpm && (
                      <>
                        <span>•</span>
                        <span>{item.beat.bpm} BPM</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2">
                    <p className="text-sm font-semibold text-primary">
                      {item.selectedTier.tier}
                    </p>
                    {item.selectedTier.licenseType && (
                      <p className="text-xs text-muted-foreground">
                        {item.selectedTier.licenseType}
                      </p>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${(item.selectedTier.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          ${item.selectedTier.price} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 sticky top-20 space-y-4">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Promo Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Promo Code
                </label>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {promoCode} applied
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removePromoCode}
                      className="h-auto p-1 text-green-700 dark:text-green-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          setPromoError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={isApplying}
                      >
                        Apply
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-xs text-destructive">{promoError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount ({discount}%)</span>
                    <span className="font-medium">
                      -${(subtotal * (discount / 100)).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              {/* Continue Shopping */}
              <Link href="/beats" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
