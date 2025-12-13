/**
 * Shopping Cart Types & Interfaces
 */

import { Beat, PricingTier } from './types';

export interface CartItem {
  id: string; // Unique cart item ID (beatId + tierName)
  beat: Beat;
  selectedTier: PricingTier;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartStore extends Cart {
  // Actions
  addItem: (beat: Beat, tier: PricingTier) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  
  // Promo code
  promoCode: string | null;
  discount: number;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
}

export interface CheckoutFormData {
  // Customer Info
  email: string;
  firstName: string;
  lastName: string;
  
  // Optional
  company?: string;
  phone?: string;
  
  // Billing Address
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Terms
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
}

export interface OrderSummary {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customerInfo: CheckoutFormData;
  paymentMethod: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}
