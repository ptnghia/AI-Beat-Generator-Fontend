/**
 * TypeScript Interfaces for API responses
 */

export interface Beat {
  id: string;
  name: string;
  genre: string;
  style?: string;
  mood?: string;
  useCase?: string;
  tags: string[];
  description?: string;
  bpm?: number;
  musicalKey?: string;
  duration?: number;
  filePath: string;
  coverArtPath?: string;
  previewPath?: string;
  beatstarsTitle?: string;
  beatstarsTags?: string[];
  beatstarsDescription?: string;
  pricing?: PricingTier[];
  basePrompt?: string;
  normalizedPrompt?: string;
  conceptData?: ConceptData;
  createdAt: string;
  updatedAt: string;
}

export interface PricingTier {
  tier: string;
  licenseType?: string;
  price: number;
  description: string;
  features?: string[];
}

export interface ConceptData {
  concept: string;
  genre?: string;
  style?: string;
  mood?: string;
  useCase?: string;
  trendAnalysis?: string;
  suggestedMood?: string;
}

export interface BeatQueryParams {
  genre?: string;
  style?: string;
  mood?: string;
  useCase?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface BeatListResponse {
  data: Beat[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface StatsResponse {
  beats: {
    total: number;
    byGenre: Record<string, number>;
    byMood: Record<string, number>;
    recentCount: number;
  };
  apiKeys: {
    total: number;
    active: number;
    exhausted: number;
  };
  system: {
    uptime: string;
    lastBeatGenerated: string | null;
    totalBeatsToday: number;
  };
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'super_admin';
    createdAt: string;
  };
  expiresIn: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}
