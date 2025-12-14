'use client';

import { BeatVersion } from '@/lib/api/versions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Download, Play, Pause, Trash2, Music } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getFullAudioUrl } from '@/lib/utils/url';

interface VersionCardProps {
  version: BeatVersion;
  onSetPrimary?: (versionId: string) => void;
  onDelete?: (versionId: string) => void;
  onDownload?: (versionNumber: number) => void;
  isAdmin?: boolean;
}

export function VersionCard({
  version,
  onSetPrimary,
  onDelete,
  onDownload,
  isAdmin = false,
}: VersionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => {
    if (typeof window !== 'undefined') {
      const audioElement = new Audio();
      audioElement.addEventListener('ended', () => setIsPlaying(false));
      return audioElement;
    }
    return null;
  });

  const audioUrl = version.audioUrl || (version.audioPath ? getFullAudioUrl(version.audioPath) : null);

  const togglePlay = () => {
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = audioUrl;
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(version.versionNumber);
    }
  };

  const getSourceBadgeColor = (source?: string) => {
    switch (source) {
      case 'suno':
        return 'bg-blue-500';
      case 'suno_retry':
        return 'bg-yellow-500';
      case 'upload':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={version.isPrimary ? 'border-2 border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            <CardTitle className="text-lg">
              Version {version.versionNumber}
            </CardTitle>
            {version.isPrimary && (
              <Badge variant="default" className="gap-1">
                <Crown className="h-3 w-3" />
                Primary
              </Badge>
            )}
          </div>
          {version.source && (
            <Badge variant="outline" className={getSourceBadgeColor(version.source)}>
              {version.source}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Player */}
        {audioUrl && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Button
              size="sm"
              variant="outline"
              onClick={togglePlay}
              className="h-10 w-10 rounded-full p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>
            <div className="flex-1">
              <p className="text-sm font-medium">Audio Preview</p>
              {version.duration && (
                <p className="text-xs text-muted-foreground">
                  {Math.floor(version.duration / 60)}:
                  {String(Math.floor(version.duration % 60)).padStart(2, '0')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {version.modelName && (
            <div>
              <span className="text-muted-foreground">Model:</span>
              <p className="font-medium">{version.modelName}</p>
            </div>
          )}
          {version.createdAt && (
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">
                {formatDistanceToNow(new Date(version.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t">
            {!version.isPrimary && onSetPrimary && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSetPrimary(version.id)}
                className="flex-1"
              >
                <Crown className="h-4 w-4 mr-2" />
                Set as Primary
              </Button>
            )}
            {onDownload && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {!version.isPrimary && onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(version.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
