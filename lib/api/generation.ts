// API endpoints for beat generation and catalog
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export interface BeatCategory {
  categoryName: string;
  genre: string;
  style: string;
  mood: string;
  useCase: string;
  tags: string;
  prompt: string;
}

export interface GenerateBeatRequest {
  categoryName: string;
  mode: 'full' | 'metadata_only';
}

export interface BatchGenerateRequest {
  count: number;
  mode: 'full' | 'metadata_only';
  category?: string;
}

export interface GenerationTask {
  id: string;
  beatId?: string;
  categoryName: string;
  mode: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// Get beat catalog templates
export async function getBeatCatalog(): Promise<BeatCategory[]> {
  const response = await axios.get(`${API_BASE_URL}/api/catalog`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
    },
  });
  return response.data;
}

// Generate single beat
export async function generateBeat(data: GenerateBeatRequest) {
  const response = await axios.post(
    `${API_BASE_URL}/api/generate/beat`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

// Generate multiple beats
export async function generateBeats(data: BatchGenerateRequest) {
  const response = await axios.post(
    `${API_BASE_URL}/api/generate/beats`,
    data,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

// Get generation queue status
export async function getGenerationQueue(): Promise<GenerationTask[]> {
  const response = await axios.get(`${API_BASE_URL}/api/generate/queue`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
    },
  });
  return response.data;
}

// Get specific beat by ID (for polling status)
export async function getBeatById(id: string) {
  const response = await axios.get(`${API_BASE_URL}/api/beats/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
    },
  });
  return response.data;
}
