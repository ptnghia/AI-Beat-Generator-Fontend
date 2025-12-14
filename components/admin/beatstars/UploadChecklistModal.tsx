'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config';
import type { BeatStarsChecklist } from '@/lib/types';

interface UploadChecklistModalProps {
  beatId: string;
  onClose: () => void;
}

export function UploadChecklistModal({ beatId, onClose }: UploadChecklistModalProps) {
  const { data: checklist, isLoading } = useQuery({
    queryKey: ['beatstars', 'checklist', beatId],
    queryFn: async () => {
      const response = await api.get<BeatStarsChecklist>(
        API_ENDPOINTS.beatstarsChecklist(beatId)
      );
      return response.data;
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>BeatStars Upload Checklist</DialogTitle>
          <DialogDescription>
            {checklist?.beatName || 'Loading...'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : checklist ? (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                {checklist.isReady ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                )}
                <div>
                  <div className="font-semibold">
                    {checklist.isReady ? 'Ready to Upload' : 'Not Ready'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {checklist.items.filter(i => i.completed).length} / {checklist.items.length} items complete
                  </div>
                </div>
              </div>
              <Badge variant={checklist.isReady ? 'default' : 'secondary'}>
                {Math.round(
                  (checklist.items.filter(i => i.completed).length / checklist.items.length) * 100
                )}%
              </Badge>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {checklist.items.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.completed ? 'border-green-200 bg-green-50/50' : 'border-orange-200 bg-orange-50/50'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.item}</span>
                      {item.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {item.details && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {renderDetails(item.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* BeatStars Guidelines */}
            {!checklist.isReady && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">BeatStars Requirements</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Audio files must be MP3 (320kbps) or WAV (44.1kHz, 16-bit)</li>
                  <li>• Title should follow BeatStars naming conventions</li>
                  <li>• Include 10-15 relevant tags for discoverability</li>
                  <li>• Description should be at least 200 characters</li>
                  <li>• Cover art must be 3000x3000px PNG or JPG</li>
                  <li>• Set pricing for all license tiers</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load checklist
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function renderDetails(details: any): string {
  if (typeof details === 'string') {
    return details;
  }
  if (typeof details === 'object' && details !== null) {
    if (Array.isArray(details)) {
      return details.join(', ');
    }
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' • ');
  }
  return JSON.stringify(details);
}
