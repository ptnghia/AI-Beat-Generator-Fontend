'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Music, FileAudio, Image as ImageIcon, Package } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { downloadBeatFiles } from '@/lib/api/files';
import { useToast } from '@/hooks/use-toast';

interface FileDownloadMenuProps {
  beatId: string;
  beatName: string;
  hasAudio?: boolean;
  hasWav?: boolean;
  hasCover?: boolean;
  versionNumber?: number;
}

export function FileDownloadMenu({
  beatId,
  beatName,
  hasAudio = false,
  hasWav = false,
  hasCover = false,
  versionNumber,
}: FileDownloadMenuProps) {
  const { toast } = useToast();

  const downloadMutation = useMutation({
    mutationFn: () => downloadBeatFiles(beatId, versionNumber),
    onSuccess: (data) => {
      toast({
        title: 'Download started',
        description: data.message || 'Files are being downloaded.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDownloadAll = () => {
    downloadMutation.mutate();
  };

  // Individual file downloads would need direct URLs
  const handleDownloadFile = (fileType: string) => {
    toast({
      title: 'Download initiated',
      description: `Downloading ${fileType} file for ${beatName}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Files
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Download Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {hasAudio && (
          <DropdownMenuItem onClick={() => handleDownloadFile('MP3')}>
            <Music className="h-4 w-4 mr-2" />
            Download MP3
          </DropdownMenuItem>
        )}
        
        {hasWav && (
          <DropdownMenuItem onClick={() => handleDownloadFile('WAV')}>
            <FileAudio className="h-4 w-4 mr-2" />
            Download WAV
          </DropdownMenuItem>
        )}
        
        {hasCover && (
          <DropdownMenuItem onClick={() => handleDownloadFile('Cover')}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Download Cover Art
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDownloadAll}
          disabled={downloadMutation.isPending}
        >
          <Package className="h-4 w-4 mr-2" />
          {downloadMutation.isPending ? 'Downloading...' : 'Download All Files'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
