import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export interface BeatVersion {
  id: string;
  beatId: string;
  versionNumber: number;
  isPrimary: boolean;
  audioPath?: string;
  audioUrl?: string;
  alternateAudioPath?: string;
  alternateAudioUrl?: string;
  duration?: number;
  modelName?: string;
  videoUrl?: string;
  imageUrl?: string;
  imageLargeUrl?: string;
  lyric?: string;
  prompt?: string;
  type?: string;
  tags?: string;
  source?: 'suno' | 'suno_retry' | 'upload';
  sunoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVersionRequest {
  setPrimary?: boolean;
}

export interface UpdateVersionRequest {
  isPrimary?: boolean;
}

/**
 * Get all versions for a beat
 */
export async function getBeatVersions(beatId: string): Promise<BeatVersion[]> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(`${API_BASE_URL}/api/beats/${beatId}/versions`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
}

/**
 * Create a new version for a beat
 */
export async function createBeatVersion(
  beatId: string,
  data: CreateVersionRequest
): Promise<{ version: BeatVersion; sunoTaskId?: string }> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(
    `${API_BASE_URL}/api/beats/${beatId}/versions`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

/**
 * Update a version (e.g., set as primary)
 */
export async function updateBeatVersion(
  beatId: string,
  versionId: string,
  data: UpdateVersionRequest
): Promise<BeatVersion> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(
    `${API_BASE_URL}/api/beats/${beatId}/versions/${versionId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

/**
 * Delete a version
 */
export async function deleteBeatVersion(
  beatId: string,
  versionId: string
): Promise<void> {
  const token = localStorage.getItem('adminToken');
  await axios.delete(`${API_BASE_URL}/api/beats/${beatId}/versions/${versionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Download files for a specific version
 */
export async function downloadVersionFiles(
  beatId: string,
  versionNumber: number
): Promise<{ message: string; files: any }> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(
    `${API_BASE_URL}/api/beats/${beatId}/download`,
    { versionNumber },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
