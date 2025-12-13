'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Music, Clock, TrendingUp, Tag, ArrowLeft, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBeat } from '@/lib/hooks/useBeat';
import { API_CONFIG } from '@/lib/config';
import { useState } from 'react';
import { EnhancedAudioPlayer } from '@/components/EnhancedAudioPlayer';
import { PricingComparison } from '@/components/beat/PricingComparison';
import { RelatedBeatsCarousel } from '@/components/beat/RelatedBeatsCarousel';
import { SocialShareButtons } from '@/components/beat/SocialShareButtons';
import { useBeats } from '@/lib/hooks/useBeats';
import { useCartStore } from '@/lib/stores/cart-store';
import { PricingTier } from '@/lib/types';

export default function BeatDetailPage() {
  const params = useParams();
  const beatId = params.id as string;
  const { data: beat, isLoading, error } = useBeat(beatId);
  const [showPlayer, setShowPlayer] = useState(false);
  const { addItem } = useCartStore();

  // Fetch related beats (same genre, limit 6)
  const { data: relatedBeatsData } = useBeats({
    genre: beat?.genre,
    limit: 6,
  }, {
    enabled: !!beat?.genre, // Only fetch when beat is loaded
  });

  const handleAddToCart = (tier: PricingTier) => {
    if (beat) {
      addItem(beat, tier);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !beat) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Beat không tìm thấy</h1>
          <p className="text-muted-foreground mb-6">
            Không thể tải thông tin beat này. Vui lòng thử lại sau.
          </p>
          <Link href="/beats">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const coverUrl = beat.coverArtPath
    ? `${API_CONFIG.BASE_URL}/${beat.coverArtPath}`
    : '/placeholder-cover.jpg';

  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/beats">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <SocialShareButtons
              beatName={beat.name}
              beatId={beatId}
              description={beat.description}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Cover Art & Player */}
          <div className="space-y-6">
            {/* Cover Art */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
              <Image
                src={coverUrl}
                alt={beat.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 600px"
              />
              
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full w-20 h-20"
                  onClick={handlePlayClick}
                >
                  {showPlayer ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Beat Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <Music className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{beat.bpm}</p>
                <p className="text-xs text-muted-foreground">BPM</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{beat.musicalKey || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Key</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {beat.duration ? `${Math.floor(beat.duration / 60)}:${String(beat.duration % 60).padStart(2, '0')}` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title & Metadata */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{beat.name}</h1>
              
              {/* Genre & Mood Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {beat.genre && (
                  <Badge variant="secondary" className="text-sm">
                    {beat.genre}
                  </Badge>
                )}
                {beat.mood && (
                  <Badge variant="outline" className="text-sm">
                    {beat.mood}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {beat.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {beat.description}
                </p>
              )}
            </div>

            {/* Tags */}
            {beat.tags && beat.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {beat.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Concept Data */}
            {beat.conceptData && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-semibold mb-3">Beat Information</h3>
                {beat.conceptData.genre && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Genre: </span>
                    <span className="font-medium">{beat.conceptData.genre}</span>
                  </div>
                )}
                {beat.conceptData.style && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Style: </span>
                    <span className="font-medium">{beat.conceptData.style}</span>
                  </div>
                )}
                {beat.conceptData.mood && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Mood: </span>
                    <span className="font-medium">{beat.conceptData.mood}</span>
                  </div>
                )}
                {beat.conceptData.useCase && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Use Case: </span>
                    <span className="font-medium">{beat.conceptData.useCase}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Pricing Section - Full Width */}
        {beat.pricing && beat.pricing.length > 0 && (
          <div className="mt-12 max-w-7xl mx-auto">
            <PricingComparison
              pricing={beat.pricing}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}

        {/* Related Beats */}
        {relatedBeatsData && relatedBeatsData.beats.length > 0 && (
          <div className="mt-16 max-w-7xl mx-auto">
            <RelatedBeatsCarousel
              beats={relatedBeatsData.beats}
              currentBeatId={beatId}
            />
          </div>
        )}
      </div>

      {/* Audio Player */}
      {showPlayer && beat && (
        <EnhancedAudioPlayer beat={beat} onClose={() => setShowPlayer(false)} />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="space-y-6">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
