'use client';

import { useState } from 'react';
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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (setPrimary: boolean) => void;
  beatName: string;
  isLoading?: boolean;
}

export function CreateVersionModal({
  isOpen,
  onClose,
  onConfirm,
  beatName,
  isLoading = false,
}: CreateVersionModalProps) {
  const [setPrimary, setSetPrimary] = useState(false);

  const handleConfirm = () => {
    onConfirm(setPrimary);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New Version</DialogTitle>
          <DialogDescription>
            Create a new version for <strong>{beatName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will generate a new audio version using Suno AI. The process may take 2-5 minutes.
              This will use 1 API credit.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="setPrimary"
              checked={setPrimary}
              onCheckedChange={(checked) => setSetPrimary(checked as boolean)}
            />
            <Label htmlFor="setPrimary" className="text-sm cursor-pointer">
              Set as primary version after generation
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
