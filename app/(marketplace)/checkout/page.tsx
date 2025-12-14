'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/lib/stores/cart-store';
import { checkoutSchema, type CheckoutFormData } from '@/lib/schemas/checkout-schema';
import { toast } from 'sonner';
import axios from 'axios';
import { API_CONFIG } from '@/lib/config';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      agreeToTerms: false,
      subscribeNewsletter: false,
    },
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const onSubmit = async (data: CheckoutFormData) => {
    if (currentStep === 1) {
      // Move to payment step
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      // Move to review step
      setCurrentStep(3);
      return;
    }

    // Process payment with Stripe
    setIsProcessing(true);

    try {
      // Prepare items for Stripe checkout
      const checkoutItems = items.map(item => ({
        beatId: item.beat.id,
        tier: item.selectedTier.tier.toLowerCase().replace(/\s+/g, '_'),
        price: item.selectedTier.price * item.quantity
      }));

      // Create Stripe checkout session
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/payments/create-checkout-session`, {
        items: checkoutItems,
        email: data.email,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout`
      });

      const { url } = response.data;

      if (!url) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = url;

    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/cart">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: 'Information' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Review' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step.num
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className="text-sm mt-2 font-medium">{step.label}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.num ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="border rounded-lg p-6">
                  {/* Step 1: Customer Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-4">Customer Information</h2>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input id="firstName" {...register('firstName')} />
                          {errors.firstName && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input id="lastName" {...register('lastName')} />
                          {errors.lastName && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            {...register('phone')}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <Input id="company" {...register('company')} />
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold mt-6 mb-3">
                        Billing Address
                      </h3>

                      <div>
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          {...register('address')}
                          placeholder="123 Main St"
                        />
                        {errors.address && (
                          <p className="text-xs text-destructive mt-1">
                            {errors.address.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input id="city" {...register('city')} />
                          {errors.city && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.city.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province *</Label>
                          <Input id="state" {...register('state')} />
                          {errors.state && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.state.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                          <Input id="zipCode" {...register('zipCode')} />
                          {errors.zipCode && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.zipCode.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            {...register('country')}
                            placeholder="United States"
                          />
                          {errors.country && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.country.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Payment Information
                      </h2>

                      <div className="bg-muted p-6 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          Stripe payment integration will be implemented here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          For now, click Continue to proceed to review
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold mb-4">Review Order</h2>

                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between p-4 bg-muted rounded-lg"
                          >
                            <div>
                              <p className="font-semibold">{item.beat.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.selectedTier.tier} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold">
                              ${(item.selectedTier.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-2 mt-6">
                        <Checkbox
                          id="agreeToTerms"
                          checked={getValues('agreeToTerms')}
                          onCheckedChange={(checked: boolean) => {
                            const event = {
                              target: { name: 'agreeToTerms', value: checked },
                            };
                            register('agreeToTerms').onChange(event);
                          }}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms and Conditions
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                          *
                        </Label>
                      </div>
                      {errors.agreeToTerms && (
                        <p className="text-xs text-destructive">
                          {errors.agreeToTerms.message}
                        </p>
                      )}

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="subscribeNewsletter"
                          {...register('subscribeNewsletter')}
                        />
                        <Label htmlFor="subscribeNewsletter" className="text-sm">
                          Subscribe to newsletter for updates and exclusive offers
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? (
                        'Processing...'
                      ) : currentStep === 3 ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Place Order
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="border rounded-lg p-6 sticky top-20">
                  <h3 className="font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items ({items.length})</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
