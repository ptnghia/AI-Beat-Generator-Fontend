'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2, Music, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Beat } from '@/lib/types';

interface GenerationQueueTableProps {
  beats: Beat[];
}

export function GenerationQueueTable({ beats }: GenerationQueueTableProps) {
  const router = useRouter();

  if (beats.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No beats generated yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first beat to see it here
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
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Genre</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Mood</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {beats.map((beat) => (
              <tr key={beat.id} className="hover:bg-muted/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{beat.name}</div>
                  {beat.filePath && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Has audio files
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{beat.genre}</td>
                <td className="px-4 py-3 text-sm">{beat.mood || '-'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={getStatus(beat)} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(beat.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admin/beats?id=${beat.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatus(beat: Beat): 'pending' | 'processing' | 'completed' | 'failed' {
  // Check if beat has audio files
  if (beat.filePath) {
    return 'completed';
  }
  
  // Check duration - if has metadata but no file yet
  if (beat.duration && !beat.filePath) {
    return 'processing';
  }
  
  // Otherwise pending
  return 'pending';
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; icon: any; label: string }> = {
    pending: {
      variant: 'secondary',
      icon: Music,
      label: 'Metadata Only',
    },
    processing: {
      variant: 'default',
      icon: Loader2,
      label: 'Processing',
    },
    completed: {
      variant: 'default',
      icon: null,
      label: 'Completed',
    },
    failed: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'Failed',
    },
  };

  const config = variants[status] || variants.pending;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      {Icon && <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />}
      {config.label}
    </Badge>
  );
}
