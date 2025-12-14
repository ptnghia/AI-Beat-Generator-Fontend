'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { API_CONFIG } from '@/lib/config';
import { useCartStore } from '@/lib/stores/cart-store';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCartStore();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/api/payments/verify-session?session_id=${sessionId}`
        );

        setOrder(response.data.order);
        
        // Clear cart after successful payment
        clearCart();
        
      } catch (err: any) {
        console.error('Payment verification failed:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, clearCart]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Verifying your payment...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Verification Failed</h1>
            <p className="text-lg text-muted-foreground mb-8">{error}</p>
            <Link href="/cart">
              <Button size="lg">Return to Cart</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for your purchase
          </p>
          <p className="text-muted-foreground mb-8">
            Your order has been processed successfully. You will receive an email confirmation shortly with download links for your beats.
          </p>

          {/* Order Details */}
          <div className="bg-muted rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold mb-4">Order Details</h2>
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="text-muted-foreground">Order ID:</span>{' '}
                <span className="font-mono">{order?.id?.slice(0, 8)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Total:</span>{' '}
                <span className="font-bold">${order?.total?.toFixed(2)}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Items:</span>{' '}
                <span>{order?.items?.length || 0} beat(s)</span>
              </p>
            </div>
            
            <h3 className="font-medium mb-3">What&apos;s next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Email confirmation sent</p>
                  <p className="text-sm text-muted-foreground">
                    Check {order?.email} for order details and download links
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Download className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Download your beats</p>
                  <p className="text-sm text-muted-foreground">
                    Access your purchased beats immediately from the email
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">License included</p>
                  <p className="text-sm text-muted-foreground">
                    Your license agreement is attached to the confirmation email
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/beats">
              <Button size="lg">
                Browse More Beats
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@aibeatgenerator.com"
                className="text-primary hover:underline"
              >
                support@aibeatgenerator.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
