'use client';

import { BeatVersion } from '@/lib/api/versions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Crown } from 'lucide-react';

interface VersionSwitcherProps {
  versions: BeatVersion[];
  currentVersionId: string;
  onVersionChange: (versionId: string) => void;
}

export function VersionSwitcher({
  versions,
  currentVersionId,
  onVersionChange,
}: VersionSwitcherProps) {
  if (versions.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Version:</span>
      <Select value={currentVersionId} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {versions
            .sort((a, b) => {
              if (a.isPrimary) return -1;
              if (b.isPrimary) return 1;
              return b.versionNumber - a.versionNumber;
            })
            .map((version) => (
              <SelectItem key={version.id} value={version.id}>
                <div className="flex items-center gap-2">
                  <span>Version {version.versionNumber}</span>
                  {version.isPrimary && (
                    <Crown className="h-3 w-3 text-primary" />
                  )}
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
