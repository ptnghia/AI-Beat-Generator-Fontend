'use client';

import { Card } from '@/components/ui/card';
import { Music, Zap } from 'lucide-react';

interface GenerationModeToggleProps {
  value: 'full' | 'metadata_only';
  onChange: (value: 'full' | 'metadata_only') => void;
}

export function GenerationModeToggle({ value, onChange }: GenerationModeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          value === 'metadata_only'
            ? 'border-primary bg-primary/5 ring-2 ring-primary'
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => onChange('metadata_only')}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Metadata Only</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Create beat metadata instantly without audio. Generate audio later for selected beats.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <span>⚡ Instant</span>
            <span>💰 Free (No quota)</span>
          </div>
        </div>
      </Card>

      <Card
        className={`cursor-pointer transition-all hover:shadow-md ${
          value === 'full'
            ? 'border-primary bg-primary/5 ring-2 ring-primary'
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => onChange('full')}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Full Mode</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate complete beat with audio files, cover art, and metadata immediately.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
            <span>⏱️ ~3 min/beat</span>
            <span>💳 1 credit/beat</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
