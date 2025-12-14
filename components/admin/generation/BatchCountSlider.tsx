'use client';

import { Slider } from '@/components/ui/slider';

interface BatchCountSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function BatchCountSlider({ value, onChange }: BatchCountSliderProps) {
  return (
    <div className="space-y-4">
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 beat</span>
        <span>5 beats</span>
        <span>10 beats (max)</span>
      </div>
    </div>
  );
}
