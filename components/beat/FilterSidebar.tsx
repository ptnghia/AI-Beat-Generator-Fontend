'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export interface FilterValues {
  genre?: string;
  mood?: string;
  bpmMin?: number;
  bpmMax?: number;
  musicalKey?: string;
  sort?: string;
}

interface FilterSidebarProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onClearFilters: () => void;
}

// Filter options
const GENRES = [
  'Trap',
  'Hip-Hop',
  'Drill',
  'R&B',
  'Pop',
  'Afrobeat',
  'Reggaeton',
  'Electronic',
  'Rock',
  'Jazz',
];

const MOODS = [
  'Dark',
  'Aggressive',
  'Chill',
  'Melodic',
  'Happy',
  'Sad',
  'Energetic',
  'Ambient',
  'Romantic',
  'Mysterious',
];

const MUSICAL_KEYS = [
  'C Major',
  'C Minor',
  'D Major',
  'D Minor',
  'E Major',
  'E Minor',
  'F Major',
  'F Minor',
  'G Major',
  'G Minor',
  'A Major',
  'A Minor',
  'B Major',
  'B Minor',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'bpm_asc', label: 'BPM (Low to High)' },
  { value: 'bpm_desc', label: 'BPM (High to Low)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
];

export function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const bpmRange = [filters.bpmMin ?? 60, filters.bpmMax ?? 200];

  const handleBpmChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      bpmMin: value[0],
      bpmMax: value[1],
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ''
  );

  const removeFilter = (key: keyof FilterValues) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.genre && (
            <Badge variant="secondary" className="gap-1">
              Genre: {filters.genre}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('genre')}
              />
            </Badge>
          )}
          {filters.mood && (
            <Badge variant="secondary" className="gap-1">
              Mood: {filters.mood}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('mood')}
              />
            </Badge>
          )}
          {filters.musicalKey && (
            <Badge variant="secondary" className="gap-1">
              Key: {filters.musicalKey}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter('musicalKey')}
              />
            </Badge>
          )}
          {(filters.bpmMin !== 60 || filters.bpmMax !== 200) && (
            <Badge variant="secondary" className="gap-1">
              BPM: {bpmRange[0]}-{bpmRange[1]}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  const newFilters = { ...filters };
                  delete newFilters.bpmMin;
                  delete newFilters.bpmMax;
                  onFilterChange(newFilters);
                }}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sort || 'newest'}
          onValueChange={(value) => onFilterChange({ ...filters, sort: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genre Filter */}
      <div className="space-y-2">
        <Label>Genre</Label>
        <Select
          value={filters.genre || 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filters, genre: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genres</SelectItem>
            {GENRES.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mood Filter */}
      <div className="space-y-2">
        <Label>Mood</Label>
        <Select
          value={filters.mood || 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filters, mood: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All moods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            {MOODS.map((mood) => (
              <SelectItem key={mood} value={mood}>
                {mood}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Musical Key Filter */}
      <div className="space-y-2">
        <Label>Musical Key</Label>
        <Select
          value={filters.musicalKey || 'all'}
          onValueChange={(value) =>
            onFilterChange({ ...filters, musicalKey: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All keys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All keys</SelectItem>
            {MUSICAL_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BPM Range Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>BPM Range</Label>
          <span className="text-sm text-muted-foreground">
            {bpmRange[0]} - {bpmRange[1]}
          </span>
        </div>
        <Slider
          min={60}
          max={200}
          step={5}
          value={bpmRange}
          onValueChange={handleBpmChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>60 BPM</span>
          <span>200 BPM</span>
        </div>
      </div>
    </div>
  );
}
