import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export interface ConvertToWavRequest {
  includeAlternate?: boolean;
}

export interface ConvertToWavResponse {
  message: string;
  wavTaskId?: string;
  status: string;
}

export interface WavStatusResponse {
  wavConversionStatus: 'not_started' | 'processing' | 'completed' | 'failed';
  wavPath?: string;
  wavUrl?: string;
  alternateWavPath?: string;
  alternateWavUrl?: string;
  error?: string;
}

/**
 * Convert beat audio to WAV format
 */
export async function convertToWav(
  beatId: string,
  data: ConvertToWavRequest = {}
): Promise<ConvertToWavResponse> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(
    `${API_BASE_URL}/api/beats/${beatId}/convert-to-wav`,
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
 * Get WAV conversion status
 */
export async function getWavStatus(beatId: string): Promise<WavStatusResponse> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.get(
    `${API_BASE_URL}/api/beats/${beatId}/wav-status`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
}

/**
 * Download beat files
 */
export async function downloadBeatFiles(
  beatId: string,
  versionNumber?: number
): Promise<{ message: string; files: any }> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.post(
    `${API_BASE_URL}/api/beats/${beatId}/download`,
    versionNumber ? { versionNumber } : {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
