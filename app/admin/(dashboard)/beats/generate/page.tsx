'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { GenerationModeToggle } from '@/components/admin/generation/GenerationModeToggle';
import { BatchCountSlider } from '@/components/admin/generation/BatchCountSlider';
import { GenerationQueueTable } from '@/components/admin/generation/GenerationQueueTable';
import { Loader2, Music, Zap } from 'lucide-react';
import type { GenerationRequest, GenerationResponse, Beat } from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/config';

export default function BeatGenerationPage() {
  const [mode, setMode] = useState<'full' | 'metadata_only'>('metadata_only');
  const [batchCount, setBatchCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Query recent generations (pending + processing + recent completed)
  const { data: recentBeats, isLoading } = useQuery({
    queryKey: ['beats', 'recent-generations'],
    queryFn: async () => {
      const response = await api.get<{ data: Beat[] }>(API_ENDPOINTS.beats, {
        params: {
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      });
      return response.data.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Single beat generation mutation
  const generateSingleMutation = useMutation({
    mutationFn: async (request: GenerationRequest) => {
      const response = await api.post<GenerationResponse>(
        API_ENDPOINTS.generateBeat,
        request
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Beat generation started successfully');
      queryClient.invalidateQueries({ queryKey: ['beats', 'recent-generations'] });
      queryClient.invalidateQueries({ queryKey: ['beats', 'pending'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate beat');
    },
  });

  // Batch generation mutation
  const generateBatchMutation = useMutation({
    mutationFn: async (request: GenerationRequest) => {
      const response = await api.post<GenerationResponse>(
        API_ENDPOINTS.generateBeats,
        request
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || `${batchCount} beats created successfully`);
      queryClient.invalidateQueries({ queryKey: ['beats', 'recent-generations'] });
      queryClient.invalidateQueries({ queryKey: ['beats', 'pending'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate beats');
    },
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const request: GenerationRequest = {
        mode,
        count: batchCount > 1 ? batchCount : undefined,
      };

      if (batchCount > 1) {
        await generateBatchMutation.mutateAsync(request);
      } else {
        await generateSingleMutation.mutateAsync(request);
      }
    } catch (error: any) {
      // Check if it's a 404 (endpoint not found)
      if (error.response?.status === 404) {
        toast.error('Backend endpoint not implemented', {
          description: 'Backend team needs to implement /api/generate/beat and /api/generate/beats endpoints',
          duration: 5000,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const estimatedTime = mode === 'full' ? batchCount * 3 : batchCount * 0.5; // minutes
  const quotaUsage = mode === 'full' ? batchCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Generate Beats</h1>
        <p className="text-muted-foreground mt-2">
          Create new beats using AI-powered generation
        </p>
      </div>

      {/* Generation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Settings</CardTitle>
          <CardDescription>
            Configure your beat generation parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div>
            <label className="text-sm font-medium mb-3 block">Generation Mode</label>
            <GenerationModeToggle value={mode} onChange={setMode} />
          </div>

          {/* Batch Count */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Number of Beats {batchCount > 1 ? `(${batchCount})` : ''}
            </label>
            <BatchCountSlider value={batchCount} onChange={setBatchCount} />
          </div>

          {/* Estimate Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Time:</span>
              <span className="font-medium">
                ~{estimatedTime.toFixed(1)} minutes
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Quota Usage:</span>
              <span className="font-medium">{quotaUsage} credits</span>
            </div>
            {mode === 'metadata_only' && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Metadata only mode creates beats instantly without using API quota.
                Generate audio later for selected beats.
              </p>
            )}
          </div>

          {/* Generate Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || generateSingleMutation.isPending || generateBatchMutation.isPending}
          >
            {isGenerating || generateSingleMutation.isPending || generateBatchMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : mode === 'full' ? (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Generate {batchCount > 1 ? `${batchCount} Beats` : 'Beat'} with Audio
              </>
            ) : (
              <>
                <Music className="mr-2 h-5 w-5" />
                Create {batchCount > 1 ? `${batchCount} Beats` : 'Beat'} (Metadata Only)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
          <CardDescription>
            Track the status of your beat generations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <GenerationQueueTable beats={recentBeats || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
