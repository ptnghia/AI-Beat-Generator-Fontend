'use client';

import { CloudDownload, HardDrive, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type FileStatus = 'cdn' | 'downloaded' | 'converting' | 'not_available';

interface FileStatusIndicatorProps {
  status: FileStatus;
  label: string;
}

export function FileStatusIndicator({ status, label }: FileStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'cdn':
        return {
          icon: CloudDownload,
          text: 'CDN',
          variant: 'secondary' as const,
          color: 'text-blue-500',
        };
      case 'downloaded':
        return {
          icon: HardDrive,
          text: 'Downloaded',
          variant: 'default' as const,
          color: 'text-green-500',
        };
      case 'converting':
        return {
          icon: Clock,
          text: 'Converting',
          variant: 'secondary' as const,
          color: 'text-yellow-500 animate-pulse',
        };
      default:
        return {
          icon: CloudDownload,
          text: 'Not Available',
          variant: 'outline' as const,
          color: 'text-gray-500',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${config.color}`} />
      <span className="text-sm">{label}</span>
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    </div>
  );
}
