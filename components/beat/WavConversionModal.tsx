'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Music } from 'lucide-react';
import { convertToWav } from '@/lib/api/files';
import { useToast } from '@/hooks/use-toast';

interface WavConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  beatId: string;
  beatName: string;
}

export function WavConversionModal({
  isOpen,
  onClose,
  beatId,
  beatName,
}: WavConversionModalProps) {
  const [includeAlternate, setIncludeAlternate] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const convertMutation = useMutation({
    mutationFn: () => convertToWav(beatId, { includeAlternate }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beat', beatId] });
      toast({
        title: 'Conversion started',
        description: data.message || 'WAV conversion is in progress. This may take 2-5 minutes.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Conversion failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to WAV</DialogTitle>
          <DialogDescription>
            Convert <strong>{beatName}</strong> to high-quality WAV format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">WAV Format Specifications:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Sample Rate: 44.1kHz</li>
                  <li>Bit Depth: 16-bit</li>
                  <li>Channels: Stereo</li>
                  <li>Processing Time: 2-5 minutes</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeAlternate"
              checked={includeAlternate}
              onCheckedChange={(checked) => setIncludeAlternate(checked as boolean)}
            />
            <Label htmlFor="includeAlternate" className="text-sm cursor-pointer">
              Include alternate version (if available)
            </Label>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Music className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Why convert to WAV?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  WAV files are required for professional distribution on platforms like
                  BeatStars. They provide lossless audio quality and are preferred for
                  studio use.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={convertMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={() => convertMutation.mutate()} disabled={convertMutation.isPending}>
            {convertMutation.isPending ? 'Converting...' : 'Convert to WAV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
