'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Music } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Beat, PricingTier } from '@/lib/types';
import { API_CONFIG } from '@/lib/config';

interface BeatCardProps {
  beat: Beat;
  onPlay?: (beat: Beat) => void;
}

export function BeatCard({ beat, onPlay }: BeatCardProps) {
  const coverUrl = beat.coverArtPath 
    ? `${API_CONFIG.BASE_URL}/${beat.coverArtPath}`
    : '/placeholder-cover.png';

  const mp3PriceTag = beat.pricing?.find((p: PricingTier) => p.licenseType === 'MP3 Lease');
  const wavPriceTag = beat.pricing?.find((p: PricingTier) => p.licenseType === 'WAV Lease');

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/beats/${beat.id}`} className="block">
        {/* Cover Art */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={coverUrl}
            alt={beat.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
            <Button
              size="lg"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                onPlay?.(beat);
              }}
            >
              <Play className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/beats/${beat.id}`}>
          <h3 className="font-semibold text-lg truncate hover:text-primary transition-colors">
            {beat.name}
          </h3>
        </Link>

        {/* Genre & Mood Tags */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {beat.genre}
          </Badge>
          {beat.mood && (
            <Badge variant="outline" className="text-xs">
              {beat.mood}
            </Badge>
          )}
        </div>

        {/* BPM & Key */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {beat.bpm && (
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>{beat.bpm} BPM</span>
            </div>
          )}
          {beat.musicalKey && (
            <div className="font-medium">
              {beat.musicalKey}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {/* Pricing */}
        <div className="flex gap-2">
          {mp3PriceTag && (
            <span className="text-sm font-semibold">
              ${mp3PriceTag.price}
            </span>
          )}
          {wavPriceTag && (
            <span className="text-sm text-muted-foreground">
              WAV: ${wavPriceTag.price}
            </span>
          )}
        </div>

        {/* View Details Link */}
        <Link href={`/beats/${beat.id}`}>
          <Button variant="ghost" size="sm">
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
