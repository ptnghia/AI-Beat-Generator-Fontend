'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Music, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useBeat } from '@/lib/hooks/useBeat';
import { getFullImageUrl } from '@/lib/utils/url';
import { VersionsTab } from '@/components/beat/VersionsTab';
import { BeatEditModal } from '@/components/admin/BeatEditModal';
import { WavStatusBadge } from '@/components/beat/WavStatusBadge';
import { WavConversionModal } from '@/components/beat/WavConversionModal';
import { FileDownloadMenu } from '@/components/beat/FileDownloadMenu';
import { FileStatusIndicator } from '@/components/beat/FileStatusIndicator';
import { useState } from 'react';

export default function AdminBeatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const beatId = params.id as string;
  const { data: beat, isLoading, error } = useBeat(beatId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showWavConversionModal, setShowWavConversionModal] = useState(false);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !beat) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Beat không tìm thấy</h1>
          <p className="text-muted-foreground mb-6">
            {error?.message || 'Beat ID không tồn tại'}
          </p>
          <Button asChild>
            <Link href="/admin/beats">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const coverUrl = beat.coverArtPath ? getFullImageUrl(beat.coverArtPath) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/beats">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Beats
          </Link>
        </Button>

        <div className="flex items-start gap-6">
          {/* Cover Art */}
          {coverUrl && (
            <div className="relative w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              <Image
                src={coverUrl}
                alt={beat.name}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          )}

          {/* Beat Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{beat.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">{beat.genre}</Badge>
                  {beat.style && <Badge variant="outline">{beat.style}</Badge>}
                  {beat.mood && <Badge variant="outline">{beat.mood}</Badge>}
                </div>
              </div>
              <Button onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Beat
              </Button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {beat.bpm && (
                <div>
                  <p className="text-sm text-muted-foreground">BPM</p>
                  <p className="font-semibold">{beat.bpm}</p>
                </div>
              )}
              {beat.musicalKey && (
                <div>
                  <p className="text-sm text-muted-foreground">Key</p>
                  <p className="font-semibold">{beat.musicalKey}</p>
                </div>
              )}
              {beat.generationStatus && (
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      beat.generationStatus === 'completed'
                        ? 'default'
                        : beat.generationStatus === 'processing'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {beat.generationStatus}
                  </Badge>
                </div>
              )}
              {beat.wavConversionStatus && (
                <div>
                  <p className="text-sm text-muted-foreground">WAV Status</p>
                  <Badge
                    variant={
                      beat.wavConversionStatus === 'completed'
                        ? 'default'
                        : beat.wavConversionStatus === 'processing'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {beat.wavConversionStatus}
                  </Badge>
                </div>
              )}
            </div>

            {/* Tags */}
            {beat.tags && beat.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {beat.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="versions" className="mt-8">
        <TabsList>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="beatstars">BeatStars</TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="mt-6">
          <VersionsTab beatId={beatId} beatName={beat.name} isAdmin={true} />
        </TabsContent>

        <TabsContent value="metadata" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-medium">{beat.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Genre</label>
                  <p className="font-medium">{beat.genre}</p>
                </div>
                {beat.style && (
                  <div>
                    <label className="text-sm text-muted-foreground">Style</label>
                    <p className="font-medium">{beat.style}</p>
                  </div>
                )}
                {beat.mood && (
                  <div>
                    <label className="text-sm text-muted-foreground">Mood</label>
                    <p className="font-medium">{beat.mood}</p>
                  </div>
                )}
                {beat.useCase && (
                  <div>
                    <label className="text-sm text-muted-foreground">Use Case</label>
                    <p className="font-medium">{beat.useCase}</p>
                  </div>
                )}
              </div>
            </div>

            {beat.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {beat.description}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">File Management</h3>
              <div className="flex gap-2">
                {beat.wavConversionStatus !== 'completed' && (
                  <Button onClick={() => setShowWavConversionModal(true)}>
                    Convert to WAV
                  </Button>
                )}
                <FileDownloadMenu
                  beatId={beat.id}
                  beatName={beat.name}
                  hasAudio={!!beat.audioPath}
                  hasWav={beat.wavConversionStatus === 'completed'}
                  hasCover={!!beat.coverArtPath}
                />
              </div>
            </div>

            <div className="grid gap-4">
              {/* MP3 Audio */}
              {beat.audioPath && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">Audio (MP3)</p>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{beat.audioPath}</p>
                      <FileStatusIndicator 
                        status="cdn" 
                        label="Hosted on CDN"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* WAV Audio */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">Audio (WAV)</p>
                      <WavStatusBadge status={beat.wavConversionStatus} />
                    </div>
                    {beat.wavPath ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">{beat.wavPath}</p>
                        <FileStatusIndicator 
                          status="downloaded" 
                          label="44.1kHz 16-bit Stereo"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {beat.wavConversionStatus === 'processing' 
                          ? 'Conversion in progress...' 
                          : 'Not converted yet'}
                      </p>
                    )}
                  </div>
                  {beat.wavConversionStatus !== 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowWavConversionModal(true)}
                    >
                      Convert
                    </Button>
                  )}
                </div>
              </div>

              {/* Cover Art */}
              {beat.coverArtPath && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">Cover Art</p>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{beat.coverArtPath}</p>
                      <FileStatusIndicator 
                        status="cdn" 
                        label="3000x3000px PNG"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {beat.previewPath && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">Preview (30s)</p>
                        <Badge variant="default">Available</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{beat.previewPath}</p>
                      <FileStatusIndicator 
                        status="cdn" 
                        label="MP3 128kbps"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="beatstars" className="mt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">BeatStars Metadata</h3>
              <div className="grid gap-4">
                {beat.beatstarsTitle && (
                  <div>
                    <label className="text-sm text-muted-foreground">BeatStars Title</label>
                    <p className="font-medium">{beat.beatstarsTitle}</p>
                  </div>
                )}
                {beat.beatstarsTags && beat.beatstarsTags.length > 0 && (
                  <div>
                    <label className="text-sm text-muted-foreground">BeatStars Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {beat.beatstarsTags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {beat.beatstarsDescription && (
                  <div>
                    <label className="text-sm text-muted-foreground">
                      BeatStars Description
                    </label>
                    <p className="text-sm mt-2 whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {beat.beatstarsDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {beat.pricing && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {beat.pricing.map((tier, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <p className="font-semibold text-lg">${tier.price}</p>
                      <p className="text-sm text-muted-foreground">{tier.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      {beat && (
        <>
          <BeatEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            beat={beat}
          />
          <WavConversionModal
            isOpen={showWavConversionModal}
            onClose={() => setShowWavConversionModal(false)}
            beatId={beat.id}
            beatName={beat.name}
          />
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="flex gap-6">
        <Skeleton className="w-48 h-48 rounded-lg" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
