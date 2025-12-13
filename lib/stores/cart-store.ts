/**
 * Zustand Cart Store with localStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import type { Beat, PricingTier } from '../types';
import type { CartStore, CartItem } from '../cart-types';

const TAX_RATE = 0.1; // 10% tax

// Helper to calculate cart totals
const calculateTotals = (
  items: CartItem[],
  discount: number = 0
): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.selectedTier.price * item.quantity,
    0
  );
  
  const discountAmount = subtotal * (discount / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * TAX_RATE;
  const total = subtotalAfterDiscount + tax;

  return {
    subtotal,
    tax,
    total,
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      promoCode: null,
      discount: 0,

      // Add item to cart
      addItem: (beat: Beat, tier: PricingTier) => {
        const itemId = `${beat.id}-${tier.tier}`;
        const existingItem = get().items.find((item) => item.id === itemId);

        if (existingItem) {
          // Increase quantity if item already exists
          get().updateQuantity(itemId, existingItem.quantity + 1);
          toast.success('Cart Updated', {
            description: `Quantity increased for ${beat.name}`,
          });
        } else {
          // Add new item
          const newItem: CartItem = {
            id: itemId,
            beat,
            selectedTier: tier,
            quantity: 1,
            addedAt: new Date(),
          };

          set((state) => {
            const items = [...state.items, newItem];
            const totals = calculateTotals(items, state.discount);
            return { items, ...totals };
          });
          
          toast.success('Added to Cart', {
            description: `${beat.name} - ${tier.licenseType || tier.tier}`,
          });
        }
      },

      // Remove item from cart
      removeItem: (itemId: string) => {
        const item = get().items.find((i) => i.id === itemId);
        
        set((state) => {
          const items = state.items.filter((item) => item.id !== itemId);
          const totals = calculateTotals(items, state.discount);
          return { items, ...totals };
        });
        
        if (item) {
          toast.success('Removed from Cart', {
            description: item.beat.name,
          });
        }
      },

      // Update item quantity
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }

        set((state) => {
          const items = state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const totals = calculateTotals(items, state.discount);
          return { items, ...totals };
        });
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          promoCode: null,
          discount: 0,
        });
      },

      // Get total item count
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Apply promo code
      applyPromoCode: async (code: string) => {
        // TODO: In production, validate with backend API
        // For now, mock validation
        const validCodes: Record<string, number> = {
          SAVE10: 10,
          SAVE20: 20,
          WELCOME15: 15,
          CYBER30: 30,
        };

        const discount = validCodes[code.toUpperCase()];

        if (discount) {
          set((state) => {
            const totals = calculateTotals(state.items, discount);
            return {
              promoCode: code.toUpperCase(),
              discount,
              ...totals,
            };
          });
          
          toast.success('Promo Code Applied', {
            description: `${discount}% discount applied`,
          });
          
          return true;
        }

        toast.error('Invalid Promo Code', {
          description: 'The code you entered is not valid',
        });
        
        return false;
      },

      // Remove promo code
      removePromoCode: () => {
        set((state) => {
          const totals = calculateTotals(state.items, 0);
          return {
            promoCode: null,
            discount: 0,
            ...totals,
          };
        });
      },
    }),
    {
      name: 'ai-beat-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
        discount: state.discount,
      }),
    }
  )
);
