'use client';

import { useEffect, useState } from 'react';
import { Search, Music, Edit, Trash2, ExternalLink, Info, Upload } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '@/lib/config';
import { Beat } from '@/lib/types';
import { getFullImageUrl } from '@/lib/utils/url';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BeatStarsDetailModal } from '@/components/admin/BeatStarsDetailModal';
import FileUploadModal from '@/components/admin/FileUploadModal';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [uploadBeat, setUploadBeat] = useState<Beat | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = await axios.get<{ data: Beat[] }>(
          `${API_CONFIG.BASE_URL}/api/beats`
        );
        setBeats(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch beats:', err);
        setError('Failed to load beats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBeats();
  }, []);

  const filteredBeats = beats.filter((beat) => {
    const query = searchQuery.toLowerCase();
    return (
      beat.name.toLowerCase().includes(query) ||
      beat.genre.toLowerCase().includes(query) ||
      beat.mood?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this beat?')) {
      return;
    }

    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/api/admin/beats/${id}`);
      setBeats((prev) => prev.filter((beat) => beat.id !== id));
    } catch (err) {
      console.error('Failed to delete beat:', err);
      alert('Failed to delete beat');
    }
  };

  const handleViewDetails = (beat: Beat) => {
    setSelectedBeat(beat);
    setIsDetailModalOpen(true);
  };

  const handleUploadFiles = (beat: Beat) => {
    setUploadBeat(beat);
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = async () => {
    // Refresh beats list after upload
    try {
      const response = await axios.get<{ data: Beat[] }>(
        `${API_CONFIG.BASE_URL}/api/beats`
      );
      setBeats(response.data.data || []);
    } catch (err) {
      console.error('Failed to refresh beats:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Beat Management</h1>
        <div className="border rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-muted rounded mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Beat Management</h1>
          <p className="text-muted-foreground">
            Manage all generated beats ({beats.length} total)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          placeholder="Search by name, genre, or mood..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label="Search beats"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="border border-destructive rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Beats Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Cover</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Genre</th>
                <th className="text-left p-4 font-medium">Mood</th>
                <th className="text-left p-4 font-medium">BPM</th>
                <th className="text-left p-4 font-medium">Key</th>
                <th className="text-left p-4 font-medium">Created</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-muted-foreground">
                    {searchQuery ? 'No beats found matching your search' : 'No beats available'}
                  </td>
                </tr>
              ) : (
                filteredBeats.map((beat) => (
                  <tr key={beat.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                        {beat.coverArtPath ? (
                          <Image
                              src={getFullImageUrl(beat.coverArtPath)}
                            alt={beat.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{beat.name}</p>
                          {beat.style && (
                            <p className="text-sm text-muted-foreground">{beat.style}</p>
                          )}
                        </div>
                        {beat.generationStatus === 'pending' && !beat.fileUrl && (
                          <Badge variant="outline" className="text-xs">
                            Metadata Only
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {beat.genre}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{beat.mood}</td>
                    <td className="p-4 text-sm">{beat.bpm}</td>
                    <td className="p-4 text-sm">{beat.musicalKey || 'N/A'}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(beat.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Upload button for Metadata Only beats */}
                        {beat.generationStatus === 'pending' && !beat.fileUrl && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUploadFiles(beat)}
                            aria-label={`Upload files for ${beat.name}`}
                            title="Upload MP3/WAV/Cover"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(beat)}
                          aria-label={`View BeatStars details for ${beat.name}`}
                          title="BeatStars Upload Info"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Link href={`/beats/${beat.id}`} target="_blank">
                          <Button variant="ghost" size="sm" aria-label={`View ${beat.name}`}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alert('Edit functionality coming soon')}
                          aria-label={`Edit ${beat.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(beat.id)}
                          aria-label={`Delete ${beat.name}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBeats.length} of {beats.length} beats
      </div>

      {/* BeatStars Detail Modal */}
      <BeatStarsDetailModal
        beat={selectedBeat}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBeat(null);
        }}
      />

      {/* File Upload Modal */}
      {uploadBeat && (
        <FileUploadModal
          beat={uploadBeat}
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setUploadBeat(null);
          }}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
