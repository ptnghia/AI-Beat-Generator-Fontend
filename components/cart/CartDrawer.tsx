'use client';

import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/stores/cart-store';
import { getFullImageUrl } from '@/lib/utils/url';

export function CartDrawer() {
  const { items, subtotal, tax, total, getItemCount, removeItem, updateQuantity } =
    useCartStore();

  const itemCount = getItemCount();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Add some beats to get started
            </p>
            <Link href="/beats">
              <Button>Browse Beats</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Cover Art */}
                  <div className="relative w-20 h-20 shrink-0 rounded overflow-hidden bg-muted">
                    {item.beat.coverArtPath ? (
                      <Image
                        src={getFullImageUrl(item.beat.coverArtPath)}
                        alt={item.beat.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/beats/${item.beat.id}`}
                      className="font-semibold hover:underline line-clamp-1"
                    >
                      {item.beat.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.selectedTier.tier}
                      {item.selectedTier.licenseType && (
                        <span> • {item.selectedTier.licenseType}</span>
                      )}
                    </p>
                    <p className="text-sm font-semibold mt-1">
                      ${item.selectedTier.price}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Link href="/cart" className="block">
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
                <Link href="/checkout" className="block">
                  <Button className="w-full">Checkout</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
