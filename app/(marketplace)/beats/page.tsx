'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Grid, List, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useBeats } from '@/lib/hooks/useBeats';
import { BeatCard } from '@/components/beat/BeatCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { FilterSidebar, type FilterValues } from '@/components/beat/FilterSidebar';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { Beat } from '@/lib/types';

function BeatsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterValues>({
    genre: searchParams.get('genre') || undefined,
    mood: searchParams.get('mood') || undefined,
    musicalKey: searchParams.get('key') || undefined,
    bpmMin: searchParams.get('bpmMin') ? parseInt(searchParams.get('bpmMin')!) : undefined,
    bpmMax: searchParams.get('bpmMax') ? parseInt(searchParams.get('bpmMax')!) : undefined,
    sort: searchParams.get('sort') || 'newest',
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.mood) params.set('mood', filters.mood);
    if (filters.musicalKey) params.set('key', filters.musicalKey);
    if (filters.bpmMin) params.set('bpmMin', filters.bpmMin.toString());
    if (filters.bpmMax) params.set('bpmMax', filters.bpmMax.toString());
    if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [filters, searchQuery, currentPage, pathname, router]);

  const { data, isLoading, isError, error } = useBeats({
    page: currentPage,
    limit: 20,
    genre: filters.genre,
    mood: filters.mood,
    musicalKey: filters.musicalKey,
    bpmMin: filters.bpmMin,
    bpmMax: filters.bpmMax,
    sort: (filters.sort || 'newest') as 'newest' | 'oldest' | 'bpm_asc' | 'bpm_desc' | 'price_asc' | 'price_desc',
    search: searchQuery,
  });

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ sort: 'newest' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePlayBeat = (beat: Beat) => {
    setCurrentBeat(beat);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">AI Beat Generator</h1>
          <p className="text-muted-foreground mt-2">
            Premium AI-generated beats for your next project
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    <>Showing {data?.beats.length || 0} of {data?.pagination.total || 0} beats</>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isError ? (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Beats</h2>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : 'Failed to load beats'}
                </p>
                <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : data?.beats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No beats found</p>
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {data?.beats.map((beat) => (
                  <BeatCard key={beat.id} beat={beat} onPlay={handlePlayBeat} />
                ))}
              </div>
            )}

            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={currentPage === data.pagination.totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AudioPlayer beat={currentBeat} onClose={() => setCurrentBeat(null)} />
    </div>
  );
}

export default function BeatsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <BeatsPageContent />
    </Suspense>
  );
}
