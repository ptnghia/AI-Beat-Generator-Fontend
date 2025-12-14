'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Clock, Zap, Loader2, Music, AlertCircle, Trash2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';
import type { Beat } from '@/lib/types';

export default function PendingBeatsPage() {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedBeats, setSelectedBeats] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Query pending beats
  const { data: pendingBeats = [], isLoading } = useQuery({
    queryKey: ['beats', 'pending'],
    queryFn: async () => {
      const response = await api.get<{ data: Beat[]; pagination: any }>(
        API_ENDPOINTS.pendingBeats
      );
      return response.data.data || [];
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Generate audio mutation
  const generateAudioMutation = useMutation({
    mutationFn: async (beatId: string) => {
      const response = await api.post(API_ENDPOINTS.generateAudio(beatId));
      return response.data;
    },
    onSuccess: (data, beatId) => {
      toast.success('Audio generation started successfully');
      setIsGenerateDialogOpen(false);
      setSelectedBeat(null);
      queryClient.invalidateQueries({ queryKey: ['beats', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['beats', 'recent-generations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate audio');
    },
  });

  // Delete beat mutation
  const deleteBeatMutation = useMutation({
    mutationFn: async (beatId: string) => {
      await api.delete(API_ENDPOINTS.deleteBeat(beatId));
    },
    onSuccess: () => {
      toast.success('Beat deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['beats', 'pending'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete beat');
    },
  });

  const handleGenerateAudio = (beat: Beat) => {
    setSelectedBeat(beat);
    setIsGenerateDialogOpen(true);
  };

  const confirmGenerateAudio = () => {
    if (selectedBeat) {
      generateAudioMutation.mutate(selectedBeat.id);
    }
  };

  const handleBulkGenerate = async () => {
    if (selectedBeats.size === 0) {
      toast.error('Please select at least one beat');
      return;
    }

    for (const beatId of Array.from(selectedBeats)) {
      try {
        await generateAudioMutation.mutateAsync(beatId);
      } catch (error) {
        // Error already handled by mutation
      }
    }

    setSelectedBeats(new Set());
  };

  const toggleBeatSelection = (beatId: string) => {
    const newSelection = new Set(selectedBeats);
    if (newSelection.has(beatId)) {
      newSelection.delete(beatId);
    } else {
      newSelection.add(beatId);
    }
    setSelectedBeats(newSelection);
  };

  const toggleSelectAll = () => {
    if (!pendingBeats || pendingBeats.length === 0) return;
    
    if (selectedBeats.size === pendingBeats.length) {
      setSelectedBeats(new Set());
    } else {
      setSelectedBeats(new Set(pendingBeats.map((b) => b.id)));
    }
  };

  // Calculate stats safely
  const stats = {
    pendingCount: pendingBeats?.length || 0,
    selectedCount: selectedBeats.size,
    quotaNeeded: selectedBeats.size
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Beats</h1>
          <p className="text-muted-foreground mt-2">
            Beats with metadata only, waiting for audio generation
          </p>
        </div>

        {selectedBeats.size > 0 && (
          <Button onClick={handleBulkGenerate} size="lg">
            <Zap className="mr-2 h-5 w-5" />
            Generate Audio ({selectedBeats.size})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Beats</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Waiting for audio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.selectedCount}</div>
            <p className="text-xs text-muted-foreground">Ready to generate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quotaNeeded}</div>
            <p className="text-xs text-muted-foreground">Will be used</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Beats Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Beats List</CardTitle>
              <CardDescription>Metadata-only beats ready for audio generation</CardDescription>
            </div>
            {pendingBeats && pendingBeats.length > 0 && (
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedBeats.size === pendingBeats.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !pendingBeats || pendingBeats.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending beats</p>
              <p className="text-sm text-muted-foreground mt-1">
                All beats have audio files or create new beats in metadata-only mode
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={selectedBeats.size === (pendingBeats?.length || 0)}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Genre</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Mood</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Tags</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingBeats.map((beat) => (
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
                          <div className="font-medium">{beat.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {beat.bpm ? `${beat.bpm} BPM` : 'No BPM'} • {beat.musicalKey || 'No Key'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{beat.genre}</td>
                        <td className="px-4 py-3 text-sm">{beat.mood || '-'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{Array.isArray(beat.tags) ? beat.tags.length : 0} tags</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(beat.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleGenerateAudio(beat)}
                              disabled={generateAudioMutation.isPending}
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              Generate
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Delete this beat?')) {
                                  deleteBeatMutation.mutate(beat.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Audio Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Audio</DialogTitle>
            <DialogDescription>
              Confirm audio generation for this beat
            </DialogDescription>
          </DialogHeader>

          {selectedBeat && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">{selectedBeat.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Genre:</span>{' '}
                    {selectedBeat.genre}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mood:</span>{' '}
                    {selectedBeat.mood || 'N/A'}
                  </div>
                  {selectedBeat.bpm && (
                    <div>
                      <span className="text-muted-foreground">BPM:</span>{' '}
                      {selectedBeat.bpm}
                    </div>
                  )}
                  {selectedBeat.musicalKey && (
                    <div>
                      <span className="text-muted-foreground">Key:</span>{' '}
                      {selectedBeat.musicalKey}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Confirm audio generation?</p>
                <p className="text-xs text-muted-foreground">
                  This will use 1 API credit. Processing time: ~2-5 minutes.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmGenerateAudio}
              disabled={generateAudioMutation.isPending}
            >
              {generateAudioMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Audio
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
