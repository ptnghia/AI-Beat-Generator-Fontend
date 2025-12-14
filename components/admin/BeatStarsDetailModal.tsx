'use client';

import { useState } from 'react';
import { Copy, Check, FileText, Music2, Tag, DollarSign, Download, Sparkles } from 'lucide-react';
import { Beat } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BeatStarsDetailModalProps {
  beat: Beat | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BeatStarsDetailModal({ beat, isOpen, onClose }: BeatStarsDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!beat) return null;

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, label)}
      className="h-8 gap-2"
    >
      {copiedField === label ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-green-600">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy
        </>
      )}
    </Button>
  );

  // BeatStars title formula: [Main vibe] Type Beat – [Mood]
  const beatstarsTitle = beat.beatstarsTitle || beat.name;
  const beatstarsTags = beat.beatstarsTags || beat.tags || [];
  const beatstarsDescription = beat.beatstarsDescription || beat.description || '';

  // File status
  const hasMP3 = !!beat.audioUrl || !!beat.filePath;
  const hasWAV = beat.wavConversionStatus === 'completed';
  const hasCover = !!beat.coverArtPath;
  const hasPreview = !!beat.previewPath;

  // Upload readiness
  const isReadyToUpload = hasMP3 && hasCover && beatstarsTags.length >= 10;

  // Concept data
  const conceptData = typeof beat.conceptData === 'object' ? beat.conceptData : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            BeatStars Upload Details
          </DialogTitle>
          <DialogDescription>
            All information needed to upload this beat to BeatStars
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="beatstars" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beatstars">BeatStars Info</TabsTrigger>
            <TabsTrigger value="files">Files & Status</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="prompt">Generation Prompt</TabsTrigger>
          </TabsList>

          {/* BeatStars Info Tab */}
          <TabsContent value="beatstars" className="space-y-4">
            {/* Upload Readiness Checklist */}
            <div className={`border rounded-lg p-4 ${isReadyToUpload ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Upload Checklist
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  {hasMP3 ? '✅' : '⚠️'} Audio file (MP3/WAV)
                </div>
                <div className="flex items-center gap-2">
                  {beatstarsTitle ? '✅' : '⚠️'} Title (formula-based)
                </div>
                <div className="flex items-center gap-2">
                  {beat.bpm ? '✅' : '⚠️'} BPM / Key accurate
                </div>
                <div className="flex items-center gap-2">
                  {beatstarsTags.length >= 10 ? '✅' : '⚠️'} 10-15 tags ({beatstarsTags.length} tags)
                </div>
                <div className="flex items-center gap-2">
                  {beatstarsDescription.length >= 50 ? '✅' : '⚠️'} Description (min 50 chars)
                </div>
                <div className="flex items-center gap-2">
                  {beat.pricing && beat.pricing.length >= 4 ? '✅' : '⚠️'} License + pricing
                </div>
                <div className="flex items-center gap-2">
                  {hasCover ? '✅' : '⚠️'} Cover art (3000x3000px)
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">BeatStars Title</label>
                <CopyButton text={beatstarsTitle} label="title" />
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                {beatstarsTitle}
              </div>
              <p className="text-xs text-muted-foreground">
                Formula: [Main vibe] Type Beat – [Mood]
              </p>
            </div>

            {/* Genre & Subgenre */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <div className="p-3 bg-muted rounded-lg">
                  <Badge>{beat.genre}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Style (Subgenre)</label>
                <div className="p-3 bg-muted rounded-lg">
                  <Badge variant="outline">{beat.style}</Badge>
                </div>
              </div>
            </div>

            {/* BPM & Key */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">BPM</label>
                <div className="p-3 bg-muted rounded-lg font-mono">
                  {beat.bpm || 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Musical Key</label>
                <div className="p-3 bg-muted rounded-lg font-mono">
                  {beat.musicalKey || 'N/A'}
                </div>
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Mood</label>
              <div className="p-3 bg-muted rounded-lg">
                <Badge variant="secondary">{beat.mood}</Badge>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tags ({beatstarsTags.length})</label>
                <CopyButton text={beatstarsTags.join(', ')} label="tags" />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex flex-wrap gap-1">
                  {beatstarsTags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {beatstarsTags.length < 10 && (
                <p className="text-xs text-yellow-600">
                  ⚠️ BeatStars recommends 10-15 tags for better discoverability
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Description ({beatstarsDescription.length} chars)
                </label>
                <CopyButton text={beatstarsDescription} label="description" />
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                {beatstarsDescription}
              </div>
            </div>
          </TabsContent>

          {/* Files & Status Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="space-y-3">
              {/* MP3 Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${hasMP3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">MP3 Audio</p>
                    <p className="text-xs text-muted-foreground">
                      {hasMP3 ? 'Available from Suno CDN' : 'Not available'}
                    </p>
                  </div>
                </div>
                {hasMP3 && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Ready
                  </Badge>
                )}
              </div>

              {/* WAV Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    hasWAV ? 'bg-green-500' : 
                    beat.wavConversionStatus === 'processing' ? 'bg-yellow-500' : 
                    'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium">WAV Audio (44.1kHz 16-bit)</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {beat.wavConversionStatus || 'not_started'}
                    </p>
                  </div>
                </div>
                {hasWAV ? (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Converted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-50">
                    Convert needed
                  </Badge>
                )}
              </div>

              {/* Cover Art Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${hasCover ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">Cover Art (3000x3000px)</p>
                    <p className="text-xs text-muted-foreground">
                      {hasCover ? 'PNG format available' : 'Not generated'}
                    </p>
                  </div>
                </div>
                {hasCover && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Ready
                  </Badge>
                )}
              </div>

              {/* Preview Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${hasPreview ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">Preview (30s MP3 128kbps)</p>
                    <p className="text-xs text-muted-foreground">
                      {hasPreview ? 'Available' : 'Not generated'}
                    </p>
                  </div>
                </div>
                {hasPreview && (
                  <Badge variant="outline" className="bg-green-50">
                    ✓ Ready
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* File Paths */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">File Paths</h3>
              <div className="space-y-1 text-xs font-mono bg-muted p-3 rounded-lg">
                {beat.audioUrl && <div>MP3: {beat.audioUrl}</div>}
                {beat.wavUrl && <div>WAV: {beat.wavUrl}</div>}
                {beat.coverArtPath && <div>Cover: {beat.coverArtPath}</div>}
                {beat.previewPath && <div>Preview: {beat.previewPath}</div>}
              </div>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            {beat.pricing && beat.pricing.length > 0 ? (
              <div className="space-y-3">
                {beat.pricing.map((tier, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold">{tier.tier}</h3>
                      </div>
                      <span className="text-2xl font-bold">${tier.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tier.description}
                    </p>
                    {tier.features && tier.features.length > 0 && (
                      <ul className="text-xs space-y-1">
                        {tier.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No pricing tiers configured</p>
              </div>
            )}

            <Separator />

            {/* Recommended BeatStars Pricing */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-blue-900">
                BeatStars Recommended Pricing
              </h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>MP3 Lease</span>
                  <span className="font-mono">$25 (100k streams, 1 video)</span>
                </div>
                <div className="flex justify-between">
                  <span>WAV Lease</span>
                  <span className="font-mono">$49 (500k streams, 2 videos)</span>
                </div>
                <div className="flex justify-between">
                  <span>Trackout</span>
                  <span className="font-mono">$99 (Unlimited, 3 videos)</span>
                </div>
                <div className="flex justify-between">
                  <span>Exclusive</span>
                  <span className="font-mono">$499 (Full rights)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Generation Prompt Tab */}
          <TabsContent value="prompt" className="space-y-4">
            {/* Concept Data */}
            {conceptData && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Concept & Analysis
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(conceptData as any).concept && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Concept</label>
                      <div className="p-2 bg-muted rounded text-sm mt-1">
                        {(conceptData as any).concept}
                      </div>
                    </div>
                  )}
                  {(conceptData as any).trendAnalysis && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Trend Analysis</label>
                      <div className="p-2 bg-muted rounded text-sm mt-1">
                        {(conceptData as any).trendAnalysis}
                      </div>
                    </div>
                  )}
                  {(conceptData as any).suggestedMood && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Suggested Mood</label>
                      <div className="p-2 bg-muted rounded text-sm mt-1">
                        <Badge variant="secondary">{(conceptData as any).suggestedMood}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Base Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Base Prompt</label>
                <CopyButton text={beat.basePrompt || ''} label="basePrompt" />
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                {beat.basePrompt || 'No base prompt available'}
              </div>
            </div>

            {/* Normalized Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Normalized Prompt (Suno API)</label>
                <CopyButton text={beat.normalizedPrompt || ''} label="normalizedPrompt" />
              </div>
              <div className="p-3 bg-muted rounded-lg font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                {beat.normalizedPrompt || 'No normalized prompt available'}
              </div>
            </div>

            {/* Generation Metadata */}
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-medium text-muted-foreground">Model</label>
                <div className="mt-1 p-2 bg-muted rounded">
                  {beat.modelName || 'N/A'}
                </div>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">Duration</label>
                <div className="mt-1 p-2 bg-muted rounded">
                  {beat.duration ? `${beat.duration.toFixed(1)}s` : 'N/A'}
                </div>
              </div>
              {beat.sunoTaskId && (
                <div className="col-span-2">
                  <label className="font-medium text-muted-foreground">Suno Task ID</label>
                  <div className="mt-1 p-2 bg-muted rounded font-mono">
                    {beat.sunoTaskId}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              const allText = `
BeatStars Upload Info
=====================

Title: ${beatstarsTitle}
Genre: ${beat.genre}
Style: ${beat.style}
Mood: ${beat.mood}
BPM: ${beat.bpm || 'N/A'}
Key: ${beat.musicalKey || 'N/A'}

Tags: ${beatstarsTags.join(', ')}

Description:
${beatstarsDescription}

Files Ready:
- MP3: ${hasMP3 ? 'Yes' : 'No'}
- WAV: ${hasWAV ? 'Yes' : 'No'}
- Cover: ${hasCover ? 'Yes' : 'No'}
              `.trim();
              copyToClipboard(allText, 'all');
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Copy All Info
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
