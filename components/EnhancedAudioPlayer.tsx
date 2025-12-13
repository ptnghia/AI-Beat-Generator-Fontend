'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Repeat, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Beat } from '@/lib/types';
import { API_CONFIG } from '@/lib/config';
import type WaveSurfer from 'wavesurfer.js';

interface EnhancedAudioPlayerProps {
  beat: Beat;
  onClose: () => void;
}

export function EnhancedAudioPlayer({ beat, onClose }: EnhancedAudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    const initWaveSurfer = async () => {
      try {
        // Dynamically import WaveSurfer
        const WaveSurfer = (await import('wavesurfer.js')).default;

        // Get audio URL
        const audioPath = beat.previewPath || beat.filePath;
        if (!audioPath) {
          setError('No audio file available');
          setIsLoading(false);
          return;
        }

        const audioUrl = `${API_CONFIG.BASE_URL}${audioPath}`;

        // Create WaveSurfer instance
        const wavesurfer = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: '#94a3b8',
          progressColor: '#3b82f6',
          cursorColor: '#3b82f6',
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 80,
          normalize: true,
          backend: 'WebAudio',
          hideScrollbar: true,
        });

        // Load audio
        wavesurfer.load(audioUrl);

        // Event listeners
        wavesurfer.on('ready', () => {
          setDuration(wavesurfer.getDuration());
          setIsLoading(false);
          wavesurfer.setVolume(volume / 100);
        });

        wavesurfer.on('audioprocess', () => {
          setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on('finish', () => {
          if (isLoop) {
            wavesurfer.play();
          } else {
            setIsPlaying(false);
          }
        });

        wavesurfer.on('error', (err) => {
          console.error('WaveSurfer error:', err);
          setError('Failed to load audio');
          setIsLoading(false);
        });

        wavesurferRef.current = wavesurfer;
      } catch (err) {
        console.error('Failed to initialize WaveSurfer:', err);
        setError('Failed to initialize audio player');
        setIsLoading(false);
      }
    };

    initWaveSurfer();

    // Cleanup
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat.filePath, beat.previewPath]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
  };

  const handleDownload = () => {
    const audioPath = beat.previewPath || beat.filePath;
    if (!audioPath) return;

    const audioUrl = `${API_CONFIG.BASE_URL}${audioPath}`;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${beat.name}-preview.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <p className="text-destructive">{error}</p>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Beat Info & Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            {/* Beat Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{beat.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {beat.genre} • {beat.bpm} BPM
              </p>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Loop */}
              <Button
                variant={isLoop ? 'secondary' : 'ghost'}
                size="icon"
                onClick={toggleLoop}
                title="Loop"
                className="hidden sm:flex"
              >
                <Repeat className="w-4 h-4" />
              </Button>

              {/* Download */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download Preview"
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4" />
              </Button>

              {/* Volume */}
              <div className="hidden md:flex items-center gap-2 w-32">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                  aria-label="Volume"
                />
              </div>

              {/* Time */}
              <div className="hidden lg:block text-sm text-muted-foreground min-w-20 text-right">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Close */}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Waveform */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
                <p className="text-sm text-muted-foreground">Loading audio...</p>
              </div>
            )}
            <div ref={waveformRef} className="w-full" />
          </div>

          {/* Mobile Time Display */}
          <div className="flex justify-between text-sm text-muted-foreground lg:hidden">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
