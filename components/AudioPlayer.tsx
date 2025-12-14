'use client';

import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Beat } from '@/lib/types';
import Image from 'next/image';
import { getFullImageUrl, getFullAudioUrl } from '@/lib/utils/url';

interface AudioPlayerProps {
  beat: Beat | null;
  onClose: () => void;
}

export function AudioPlayer({ beat, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const howlRef = useRef<Howl | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount or beat change
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [beat]);

  // Load new beat audio
  useEffect(() => {
    if (!beat) return;

    // Stop and unload previous audio
    if (howlRef.current) {
      howlRef.current.unload();
    }

    const audioUrl = getFullAudioUrl(beat.previewPath || beat.filePath) || '';

    howlRef.current = new Howl({
      src: [audioUrl],
      html5: true,
      volume: isMuted ? 0 : volume,
      onload: () => {
        setDuration(howlRef.current?.duration() || 0);
      },
      onplay: () => {
        setIsPlaying(true);
        // Update progress every 100ms
        progressIntervalRef.current = setInterval(() => {
          if (howlRef.current) {
            const seek = howlRef.current.seek() as number;
            setProgress(seek);
          }
        }, 100);
      },
      onpause: () => {
        setIsPlaying(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      },
      onstop: () => {
        setIsPlaying(false);
        setProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      },
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      },
    });

    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
    };
  }, [beat, volume, isMuted]);

  const togglePlay = () => {
    if (!howlRef.current) return;

    if (isPlaying) {
      howlRef.current.pause();
    } else {
      howlRef.current.play();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!howlRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;

    howlRef.current.seek(seekTime);
    setProgress(seekTime);
  };

  const toggleMute = () => {
    if (!howlRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    howlRef.current.volume(newMuted ? 0 : volume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (howlRef.current && !isMuted) {
      howlRef.current.volume(newVolume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!beat) return null;

const coverUrl = getFullImageUrl(beat.coverArtPath);

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg border-t shadow-lg">
      <div className="flex items-center gap-4 p-4">
        {/* Beat Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Image
            src={coverUrl}
            alt={beat.name}
            width={48}
            height={48}
            className="rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm truncate">{beat.name}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {beat.genre} • {beat.bpm} BPM
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={togglePlay}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="hidden sm:flex items-center gap-2 w-64">
            <span className="text-xs text-muted-foreground">
              {formatTime(progress)}
            </span>
            <div
              className="flex-1 h-2 bg-muted rounded-full cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(progress / duration) * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 accent-primary"
              aria-label="Volume control"
            />
          </div>

          {/* Close */}
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
