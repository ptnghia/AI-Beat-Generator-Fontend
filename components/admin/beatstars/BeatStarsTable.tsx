'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Music, 
  Copy, 
  FileAudio,
  Download,
  ClipboardCheck,
  Cloud,
  HardDrive
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';
import type { BeatStarsReadiness } from '@/lib/types';
import Image from 'next/image';

interface BeatStarsTableProps {
  beats: BeatStarsReadiness[];
  selectedBeats: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onViewChecklist: (beatId: string) => void;
}

export function BeatStarsTable({ 
  beats, 
  selectedBeats, 
  onSelectionChange,
  onViewChecklist 
}: BeatStarsTableProps) {
  const queryClient = useQueryClient();

  // Convert to WAV mutation
  const convertWavMutation = useMutation({
    mutationFn: async (beatId: string) => {
      const response = await api.post(API_ENDPOINTS.convertWav(beatId));
      return response.data;
    },
    onSuccess: () => {
      toast.success('WAV conversion started');
      queryClient.invalidateQueries({ queryKey: ['beatstars', 'ready-check'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to convert to WAV');
    },
  });

  // Download files mutation
  const downloadMutation = useMutation({
    mutationFn: async (beatId: string) => {
      const response = await api.post(API_ENDPOINTS.downloadFiles(beatId));
      return response.data;
    },
    onSuccess: () => {
      toast.success('Files download started');
      queryClient.invalidateQueries({ queryKey: ['beatstars', 'ready-check'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to download files');
    },
  });

  const toggleBeatSelection = (beatId: string) => {
    const newSelection = new Set(selectedBeats);
    if (newSelection.has(beatId)) {
      newSelection.delete(beatId);
    } else {
      newSelection.add(beatId);
    }
    onSelectionChange(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedBeats.size === beats.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(beats.map(b => b.id)));
    }
  };

  const copyMetadata = (beat: BeatStarsReadiness) => {
    const metadata = `Title: ${beat.beatstarsTitle}
Genre: ${beat.genre}
BPM: ${beat.metadata.bpm || 'N/A'}
Key: ${beat.metadata.musicalKey || 'N/A'}
Tags: ${beat.metadata.tags.join(', ')}

Pricing:
${beat.metadata.pricing.map(p => `${p.tier}: $${p.price}`).join('\n')}`;

    navigator.clipboard.writeText(metadata);
    toast.success('Metadata copied to clipboard');
  };

  if (beats.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No beats match the current filters</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create new beats
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedBeats.size === beats.length && beats.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium w-16">Cover</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Genre</th>
              <th className="px-4 py-3 text-left text-sm font-medium">BPM/Key</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tags</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Files</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {beats.map((beat) => (
              <tr key={beat.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedBeats.has(beat.id)}
                    onChange={() => toggleBeatSelection(beat.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  {beat.hasCover ? (
                    <div className="w-12 h-12 rounded overflow-hidden border">
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <div className="font-medium truncate">{beat.beatstarsTitle}</div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {beat.name}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">{beat.genre}</td>
                <td className="px-4 py-3 text-sm">
                  {beat.metadata.bpm ? (
                    <div>
                      <div>{beat.metadata.bpm} BPM</div>
                      <div className="text-xs text-muted-foreground">
                        {beat.metadata.musicalKey || 'No key'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge 
                    variant={beat.tagCount >= 10 && beat.tagCount <= 15 ? 'default' : 'destructive'}
                  >
                    {beat.tagCount} tags
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1">
                      {beat.hasMp3 ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>MP3</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {beat.hasWav ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>WAV</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {beat.hasCover ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>Cover</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {beat.isReady ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Ready
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <Badge variant="secondary">Not Ready</Badge>
                      <div className="text-xs text-muted-foreground">
                        {beat.missingItems.slice(0, 2).join(', ')}
                        {beat.missingItems.length > 2 && ` +${beat.missingItems.length - 2}`}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMetadata(beat)}
                      title="Copy metadata"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {!beat.hasWav && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => convertWavMutation.mutate(beat.id)}
                        disabled={convertWavMutation.isPending}
                        title="Convert to WAV"
                      >
                        {convertWavMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileAudio className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadMutation.mutate(beat.id)}
                      disabled={downloadMutation.isPending}
                      title="Download files"
                    >
                      {downloadMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewChecklist(beat.id)}
                      title="View checklist"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
