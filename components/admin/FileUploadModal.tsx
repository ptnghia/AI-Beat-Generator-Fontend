'use client';

import { useState } from 'react';
import { X, Upload, File, Music, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { API_CONFIG } from '@/lib/config';

interface FileUploadModalProps {
  beat: {
    id: string;
    name: string;
    genre?: string;
    mood?: string;
    generationStatus?: string;
    fileUrl?: string;
    coverArtPath?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function FileUploadModal({ beat, isOpen, onClose, onSuccess }: FileUploadModalProps) {
  const [mp3File, setMp3File] = useState<UploadedFile | null>(null);
  const [wavFile, setWavFile] = useState<UploadedFile | null>(null);
  const [coverFile, setCoverFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (type: 'mp3' | 'wav' | 'cover', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes: Record<string, string[]> = {
      mp3: ['audio/mpeg', 'audio/mp3'],
      wav: ['audio/wav', 'audio/wave', 'audio/x-wav'],
      cover: ['image/png', 'image/jpeg', 'image/jpg']
    };

    if (!validTypes[type].includes(file.type)) {
      toast.error(`Invalid file type for ${type.toUpperCase()}. Please select a valid ${type} file.`);
      return;
    }

    // Validate file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error(`File size exceeds 100MB limit. Please select a smaller file.`);
      return;
    }

    const uploadedFile: UploadedFile = {
      file,
      status: 'pending'
    };

    // Create preview for images
    if (type === 'cover') {
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadedFile.preview = reader.result as string;
        setCoverFile({ ...uploadedFile });
      };
      reader.readAsDataURL(file);
    }

    // Set file based on type
    if (type === 'mp3') setMp3File(uploadedFile);
    if (type === 'wav') setWavFile(uploadedFile);
    if (type === 'cover' && !uploadedFile.preview) setCoverFile(uploadedFile);
  };

  const removeFile = (type: 'mp3' | 'wav' | 'cover') => {
    if (type === 'mp3') setMp3File(null);
    if (type === 'wav') setWavFile(null);
    if (type === 'cover') setCoverFile(null);
  };

  const handleUpload = async () => {
    if (!mp3File && !wavFile && !coverFile) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      if (mp3File) {
        formData.append('mp3', mp3File.file);
        setMp3File({ ...mp3File, status: 'uploading' });
      }
      if (wavFile) {
        formData.append('wav', wavFile.file);
        setWavFile({ ...wavFile, status: 'uploading' });
      }
      if (coverFile) {
        formData.append('cover', coverFile.file);
        setCoverFile({ ...coverFile, status: 'uploading' });
      }

      // Always set as primary for manual uploads
      formData.append('setPrimary', 'true');

      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/beats/${beat.id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.status === 'success') {
        // Mark all as success
        if (mp3File) setMp3File({ ...mp3File, status: 'success' });
        if (wavFile) setWavFile({ ...wavFile, status: 'success' });
        if (coverFile) setCoverFile({ ...coverFile, status: 'success' });

        toast.success('Files uploaded successfully!', {
          description: `${response.data.uploadedFiles ? Object.keys(response.data.uploadedFiles).length : 0} file(s) uploaded`
        });

        // Wait a bit to show success state
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Upload error:', error);

      // Mark all as error
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      if (mp3File) setMp3File({ ...mp3File, status: 'error', error: errorMessage });
      if (wavFile) setWavFile({ ...wavFile, status: 'error', error: errorMessage });
      if (coverFile) setCoverFile({ ...coverFile, status: 'error', error: errorMessage });

      toast.error('Upload failed', {
        description: errorMessage
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (isUploading) {
      toast.warning('Upload in progress, please wait...');
      return;
    }
    setMp3File(null);
    setWavFile(null);
    setCoverFile(null);
    setUploadProgress(0);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const hasFiles = mp3File || wavFile || coverFile;
  const canUpload = hasFiles && !isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Files for Beat
          </DialogTitle>
          <DialogDescription>
            <div className="mt-2 space-y-1">
              <div className="font-medium text-foreground">{beat.name}</div>
              <div className="flex gap-2 text-xs">
                {beat.genre && <Badge variant="secondary">{beat.genre}</Badge>}
                {beat.mood && <Badge variant="secondary">{beat.mood}</Badge>}
                <Badge variant={beat.generationStatus === 'pending' ? 'default' : 'outline'}>
                  {beat.generationStatus || 'Metadata Only'}
                </Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Upload Manual Files</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Upload MP3, WAV, and/or cover image for this Metadata Only beat. 
                  Files will be stored and the beat will be marked as ready.
                </p>
              </div>
            </div>
          </div>

          {/* MP3 Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Music className="h-4 w-4" />
              MP3 Audio File
            </label>
            
            {!mp3File ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={(e) => handleFileSelect('mp3', e)}
                  className="hidden"
                  id="mp3-upload"
                  disabled={isUploading}
                />
                <label htmlFor="mp3-upload" className="cursor-pointer">
                  <File className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to select MP3 file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max 100MB</p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Music className="h-8 w-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mp3File.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(mp3File.file.size)}</p>
                  </div>
                  {getStatusIcon(mp3File.status)}
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile('mp3')}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* WAV Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Music className="h-4 w-4" />
              WAV Audio File (Optional)
            </label>
            
            {!wavFile ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".wav,audio/wav"
                  onChange={(e) => handleFileSelect('wav', e)}
                  className="hidden"
                  id="wav-upload"
                  disabled={isUploading}
                />
                <label htmlFor="wav-upload" className="cursor-pointer">
                  <File className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to select WAV file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">44.1kHz 16-bit recommended</p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Music className="h-8 w-8 text-purple-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{wavFile.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(wavFile.file.size)}</p>
                  </div>
                  {getStatusIcon(wavFile.status)}
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile('wav')}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Cover Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Cover Image (Optional)
            </label>
            
            {!coverFile ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  onChange={(e) => handleFileSelect('cover', e)}
                  className="hidden"
                  id="cover-upload"
                  disabled={isUploading}
                />
                <label htmlFor="cover-upload" className="cursor-pointer">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to select cover image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3000x3000px PNG recommended</p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{coverFile.file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(coverFile.file.size)}</p>
                    </div>
                    {getStatusIcon(coverFile.status)}
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile('cover')}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {coverFile.preview && (
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={coverFile.preview}
                      alt="Cover preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!canUpload}
            className="min-w-24"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
