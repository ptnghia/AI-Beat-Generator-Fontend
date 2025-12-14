'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BeatStarsTable } from '@/components/admin/beatstars/BeatStarsTable';
import { BeatStarsFilters } from '@/components/admin/beatstars/BeatStarsFilters';
import { UploadChecklistModal } from '@/components/admin/beatstars/UploadChecklistModal';
import { BulkActionToolbar } from '@/components/admin/beatstars/BulkActionToolbar';
import { Upload, FileDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';
import type { BeatStarsReadiness } from '@/lib/types';

export default function BeatStarsExportPage() {
  const [selectedBeats, setSelectedBeats] = useState<Set<string>>(new Set());
  const [checklistBeatId, setChecklistBeatId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    readyOnly: false,
    missingWav: false,
    missingCover: false,
    genre: '',
    startDate: '',
    endDate: '',
  });
  const queryClient = useQueryClient();

  // Query BeatStars ready beats
  const { data: beatsData, isLoading } = useQuery({
    queryKey: ['beatstars', 'ready-check', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.readyOnly) params.set('readyOnly', 'true');
      if (filters.genre) params.set('genre', filters.genre);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await api.get<{ 
        data: BeatStarsReadiness[];
        stats: {
          total: number;
          ready: number;
          missingWav: number;
          missingCover: number;
        }
      }>(
        `${API_ENDPOINTS.beatstarsReadyCheck}?${params.toString()}`
      );
      return response.data;
    },
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Export to CSV mutation
  const exportCsvMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      if (filters.readyOnly) params.set('readyOnly', 'true');
      if (filters.genre) params.set('genre', filters.genre);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await api.get(
        `${API_ENDPOINTS.beatstarsExport}?${params.toString()}`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `beatstars_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    },
    onSuccess: () => {
      toast.success('CSV exported successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to export CSV');
    },
  });

  // Bulk convert to WAV mutation
  const bulkConvertMutation = useMutation({
    mutationFn: async (beatIds: string[]) => {
      const results = await Promise.allSettled(
        beatIds.map(id => api.post(API_ENDPOINTS.convertWav(id)))
      );
      return results;
    },
    onSuccess: (results) => {
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (succeeded > 0) {
        toast.success(`${succeeded} beat(s) conversion started`);
      }
      if (failed > 0) {
        toast.error(`${failed} beat(s) failed to convert`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['beatstars', 'ready-check'] });
      setSelectedBeats(new Set());
    },
  });

  // Bulk download mutation
  const bulkDownloadMutation = useMutation({
    mutationFn: async (beatIds: string[]) => {
      const results = await Promise.allSettled(
        beatIds.map(id => api.post(API_ENDPOINTS.downloadFiles(id)))
      );
      return results;
    },
    onSuccess: (results) => {
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (succeeded > 0) {
        toast.success(`${succeeded} beat(s) files downloaded`);
      }
      if (failed > 0) {
        toast.error(`${failed} beat(s) failed to download`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['beatstars', 'ready-check'] });
      setSelectedBeats(new Set());
    },
  });

  const handleExportCsv = () => {
    if (selectedBeats.size > 0) {
      // Export only selected beats (would need backend support)
      toast.info('Exporting all filtered beats. Selected beats filter coming soon.');
    }
    exportCsvMutation.mutate();
  };

  const handleBulkConvert = () => {
    if (selectedBeats.size === 0) {
      toast.error('Please select beats to convert');
      return;
    }
    bulkConvertMutation.mutate(Array.from(selectedBeats));
  };

  const handleBulkDownload = () => {
    if (selectedBeats.size === 0) {
      toast.error('Please select beats to download');
      return;
    }
    bulkDownloadMutation.mutate(Array.from(selectedBeats));
  };

  const beats = beatsData?.data || [];
  const stats = beatsData?.stats || { total: 0, ready: 0, missingWav: 0, missingCover: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BeatStars Export</h1>
          <p className="text-muted-foreground mt-2">
            Prepare and export beats for BeatStars upload
          </p>
        </div>

        <Button
          size="lg"
          onClick={handleExportCsv}
          disabled={exportCsvMutation.isPending}
        >
          {exportCsvMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-5 w-5" />
              Export to CSV
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beats</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Upload</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.ready}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.ready / stats.total) * 100)}%` : '0%'} complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing WAV</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.missingWav}</div>
            <p className="text-xs text-muted-foreground">Need conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Cover</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.missingCover}</div>
            <p className="text-xs text-muted-foreground">Need artwork</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <BeatStarsFilters
        filters={filters}
        onFiltersChange={setFilters}
        stats={stats}
      />

      {/* Bulk Actions Toolbar */}
      {selectedBeats.size > 0 && (
        <BulkActionToolbar
          selectedCount={selectedBeats.size}
          onConvertWav={handleBulkConvert}
          onDownload={handleBulkDownload}
          onExportCsv={handleExportCsv}
          onClearSelection={() => setSelectedBeats(new Set())}
          isConverting={bulkConvertMutation.isPending}
          isDownloading={bulkDownloadMutation.isPending}
        />
      )}

      {/* Beats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Beats Ready for BeatStars</CardTitle>
          <CardDescription>
            Review and prepare your beats for upload to BeatStars
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BeatStarsTable
              beats={beats}
              selectedBeats={selectedBeats}
              onSelectionChange={setSelectedBeats}
              onViewChecklist={(beatId) => setChecklistBeatId(beatId)}
            />
          )}
        </CardContent>
      </Card>

      {/* Upload Checklist Modal */}
      {checklistBeatId && (
        <UploadChecklistModal
          beatId={checklistBeatId}
          onClose={() => setChecklistBeatId(null)}
        />
      )}
    </div>
  );
}
