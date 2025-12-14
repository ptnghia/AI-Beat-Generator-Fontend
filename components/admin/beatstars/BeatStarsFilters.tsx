'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Filter, X } from 'lucide-react';

interface BeatStarsFiltersProps {
  filters: {
    readyOnly: boolean;
    missingWav: boolean;
    missingCover: boolean;
    genre: string;
    startDate: string;
    endDate: string;
  };
  onFiltersChange: (filters: any) => void;
  stats: {
    ready: number;
    missingWav: number;
    missingCover: number;
  };
}

export function BeatStarsFilters({ filters, onFiltersChange, stats }: BeatStarsFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      readyOnly: false,
      missingWav: false,
      missingCover: false,
      genre: '',
      startDate: '',
      endDate: '',
    });
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    typeof v === 'boolean' ? v : v !== ''
  ).length;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick Filters */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.readyOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('readyOnly', !filters.readyOnly)}
                className="gap-2"
              >
                <CheckCircle className="h-3 w-3" />
                Ready ({stats.ready})
              </Button>
              <Button
                variant={filters.missingWav ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('missingWav', !filters.missingWav)}
                className="gap-2"
              >
                <AlertCircle className="h-3 w-3" />
                Missing WAV ({stats.missingWav})
              </Button>
              <Button
                variant={filters.missingCover ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('missingCover', !filters.missingCover)}
                className="gap-2"
              >
                <AlertCircle className="h-3 w-3" />
                Missing Cover ({stats.missingCover})
              </Button>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              placeholder="Filter by genre..."
              value={filters.genre}
              onChange={(e) => updateFilter('genre', e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter('startDate', e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter('endDate', e.target.value)}
                placeholder="End date"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
