'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileAudio, Download, FileDown, X, Loader2 } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  onConvertWav: () => void;
  onDownload: () => void;
  onExportCsv: () => void;
  onClearSelection: () => void;
  isConverting: boolean;
  isDownloading: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  onConvertWav,
  onDownload,
  onExportCsv,
  onClearSelection,
  isConverting,
  isDownloading,
}: BulkActionToolbarProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selectedCount} beat{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onConvertWav}
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileAudio className="mr-2 h-4 w-4" />
                  Convert to WAV
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Files
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Selected
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="mr-2 h-4 w-4" />
          Clear Selection
        </Button>
      </div>
    </Card>
  );
}
