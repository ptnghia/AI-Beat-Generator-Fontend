'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, XCircle, Circle } from 'lucide-react';

interface WavStatusBadgeProps {
  status?: 'not_started' | 'processing' | 'completed' | 'failed';
}

export function WavStatusBadge({ status = 'not_started' }: WavStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          label: 'WAV Available',
          variant: 'default' as const,
          icon: CheckCircle2,
          className: 'bg-green-500',
        };
      case 'processing':
        return {
          label: 'Converting...',
          variant: 'secondary' as const,
          icon: Loader2,
          className: 'bg-yellow-500',
        };
      case 'failed':
        return {
          label: 'Conversion Failed',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-500',
        };
      default:
        return {
          label: 'Not Converted',
          variant: 'outline' as const,
          icon: Circle,
          className: 'bg-gray-500',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}
