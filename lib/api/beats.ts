import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export interface UpdateBeatRequest {
  name?: string;
  genre?: string;
  style?: string;
  mood?: string;
  useCase?: string;
  tags?: string[];
  bpm?: number;
  musicalKey?: string;
  description?: string;
  beatstarsDescription?: string;
  pricing?: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
}

/**
 * Update beat metadata
 */
export async function updateBeat(
  beatId: string,
  data: UpdateBeatRequest
): Promise<any> {
  const token = localStorage.getItem('adminToken');
  const response = await axios.patch(
    `${API_BASE_URL}/api/beats/${beatId}`,
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
 * Delete a beat
 */
export async function deleteBeat(beatId: string): Promise<void> {
  const token = localStorage.getItem('adminToken');
  await axios.delete(`${API_BASE_URL}/api/admin/beats/${beatId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
