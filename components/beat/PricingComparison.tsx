'use client';

import { useState } from 'react';
import { Check, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingTier } from '@/lib/types';

interface PricingComparisonProps {
  pricing: PricingTier[];
  onAddToCart?: (tier: PricingTier) => void;
}

export function PricingComparison({ pricing, onAddToCart }: PricingComparisonProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Sort pricing by price
  const sortedPricing = [...pricing].sort((a, b) => a.price - b.price);

  // Define popular tier (usually WAV or Premium)
  const popularTier = sortedPricing[1]?.tier || sortedPricing[0]?.tier;

  const handleAddToCart = (tier: PricingTier) => {
    setSelectedTier(tier.tier);
    if (onAddToCart) {
      onAddToCart(tier);
    }
    // Reset after animation
    setTimeout(() => setSelectedTier(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your License</h2>
        <p className="text-muted-foreground">
          Select the license that fits your needs. All licenses include instant download.
        </p>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedPricing.map((tier) => (
          <PricingCard
            key={tier.tier}
            tier={tier}
            isPopular={tier.tier === popularTier}
            isSelected={selectedTier === tier.tier}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-4">
        {sortedPricing.map((tier) => (
          <PricingCardMobile
            key={tier.tier}
            tier={tier}
            isPopular={tier.tier === popularTier}
            isSelected={selectedTier === tier.tier}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Feature</th>
                {sortedPricing.map((tier) => (
                  <th key={tier.tier} className="text-center py-3 px-4 font-semibold">
                    {tier.tier}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getComparisonFeatures(sortedPricing).map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4 text-sm">{feature.name}</td>
                  {feature.values.map((value, tierIndex) => (
                    <td key={tierIndex} className="text-center py-3 px-4">
                      {value === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : value === false ? (
                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  isPopular,
  isSelected,
  onAddToCart,
}: {
  tier: PricingTier;
  isPopular: boolean;
  isSelected: boolean;
  onAddToCart: (tier: PricingTier) => void;
}) {
  return (
    <div
      className={`relative border rounded-lg p-6 flex flex-col ${
        isPopular ? 'border-primary shadow-lg scale-105' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-1">{tier.tier}</h3>
        {tier.licenseType && (
          <p className="text-sm text-muted-foreground">{tier.licenseType}</p>
        )}
      </div>

      <div className="text-center mb-6">
        <p className="text-4xl font-bold">${tier.price}</p>
        <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
      </div>

      {tier.description && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          {tier.description}
        </p>
      )}

      <Button
        className="w-full mb-4"
        variant={isPopular ? 'default' : 'outline'}
        onClick={() => onAddToCart(tier)}
        disabled={isSelected}
      >
        {isSelected ? (
          'Added!'
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>

      {tier.features && tier.features.length > 0 && (
        <div className="space-y-2 flex-1">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PricingCardMobile({
  tier,
  isPopular,
  isSelected,
  onAddToCart,
}: {
  tier: PricingTier;
  isPopular: boolean;
  isSelected: boolean;
  onAddToCart: (tier: PricingTier) => void;
}) {
  return (
    <div
      className={`relative border rounded-lg p-4 ${
        isPopular ? 'border-primary shadow-md' : ''
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{tier.tier}</h3>
            {isPopular && (
              <Badge variant="secondary" className="text-xs">
                Popular
              </Badge>
            )}
          </div>
          {tier.licenseType && (
            <p className="text-sm text-muted-foreground">{tier.licenseType}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">${tier.price}</p>
        </div>
      </div>

      {tier.description && (
        <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
      )}

      {tier.features && tier.features.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {tier.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
          {tier.features.length > 3 && (
            <p className="text-xs text-muted-foreground pl-6">
              +{tier.features.length - 3} more features
            </p>
          )}
        </div>
      )}

      <Button
        className="w-full"
        variant={isPopular ? 'default' : 'outline'}
        onClick={() => onAddToCart(tier)}
        disabled={isSelected}
      >
        {isSelected ? (
          'Added!'
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}

// Helper function to extract comparison features
function getComparisonFeatures(pricing: PricingTier[]): {
  name: string;
  values: (string | boolean)[];
}[] {
  // Common features to compare
  const commonFeatures = [
    'Audio Quality',
    'Commercial Use',
    'Distribution Copies',
    'Streaming',
    'Music Videos',
    'Radio Plays',
    'Live Performances',
    'Trackout Stems',
  ];

  return commonFeatures.map((featureName) => {
    const values = pricing.map((tier) => {
      // Check if feature exists in tier features
      const hasFeature = tier.features?.some((f) =>
        f.toLowerCase().includes(featureName.toLowerCase())
      );

      if (hasFeature) {
        // Try to extract specific value from feature text
        const feature = tier.features?.find((f) =>
          f.toLowerCase().includes(featureName.toLowerCase())
        );
        if (feature) {
          // Extract numbers or specific values
          const match = feature.match(/(\d+[,\d]*|\bunlimited\b)/i);
          return match ? match[0] : true;
        }
        return true;
      }

      // Default values based on tier
      if (tier.tier === 'MP3 Lease') {
        if (featureName === 'Audio Quality') return 'MP3 320kbps';
        if (featureName === 'Distribution Copies') return '2,000';
        if (featureName === 'Streaming') return '500,000';
        if (featureName === 'Trackout Stems') return false;
        return true;
      } else if (tier.tier === 'WAV Lease') {
        if (featureName === 'Audio Quality') return 'WAV Untagged';
        if (featureName === 'Distribution Copies') return '5,000';
        if (featureName === 'Streaming') return '1,000,000';
        if (featureName === 'Trackout Stems') return false;
        return true;
      } else if (tier.tier === 'Premium Lease') {
        if (featureName === 'Audio Quality') return 'WAV + Stems';
        if (featureName === 'Distribution Copies') return 'Unlimited';
        if (featureName === 'Streaming') return 'Unlimited';
        if (featureName === 'Trackout Stems') return true;
        return true;
      } else if (tier.tier === 'Exclusive Rights') {
        if (featureName === 'Audio Quality') return 'WAV + Stems';
        if (featureName === 'Distribution Copies') return 'Unlimited';
        if (featureName === 'Streaming') return 'Unlimited';
        if (featureName === 'Trackout Stems') return true;
        return true;
      }

      return false;
    });

    return { name: featureName, values };
  });
}
