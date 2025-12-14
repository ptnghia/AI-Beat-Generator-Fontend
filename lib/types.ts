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
  fileUrl?: string; // Suno CDN URL or uploaded file path
  audioPath?: string;
  audioUrl?: string;
  coverArtPath?: string;
  previewPath?: string;
  wavPath?: string;
  wavUrl?: string;
  beatstarsTitle?: string;
  beatstarsTags?: string[];
  beatstarsDescription?: string;
  pricing?: PricingTier[];
  basePrompt?: string;
  normalizedPrompt?: string;
  conceptData?: ConceptData;
  modelName?: string;
  sunoTaskId?: string;
  sunoAudioId?: string;
  generationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  wavConversionStatus?: 'not_started' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface PricingTier {
  tier: string;
  name?: string;
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

// Beat Generation Types
export interface BeatTemplate {
  id: string;
  categoryName: string;
  genre: string;
  style: string;
  mood: string;
  useCase: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface GenerationRequest {
  templateId?: string;
  categoryName?: string;
  mode: 'full' | 'metadata_only';
  count?: number;
}

export interface GenerationQueueItem {
  beatId: string;
  name: string;
  genre: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mode: 'full' | 'metadata_only';
  createdAt: string;
  error?: string;
}

export interface GenerationResponse {
  success: boolean;
  beat?: Beat;
  beats?: Beat[];
  message: string;
}

// Beat Versions
export interface BeatVersion {
  id: string;
  beatId: string;
  versionNumber: number;
  isPrimary: boolean;
  audioUrl?: string;
  audioPathLocal?: string;
  duration?: number;
  modelName?: string;
  source: 'suno' | 'suno_retry' | 'upload';
  sunoTaskId?: string;
  createdAt: string;
}

export interface BeatVersionsResponse {
  beatId: string;
  totalVersions: number;
  versions: BeatVersion[];
}

// BeatStars Integration
export interface BeatStarsReadiness {
  id: string;
  name: string;
  genre: string;
  beatstarsTitle: string;
  hasWav: boolean;
  hasCover: boolean;
  hasMp3: boolean;
  tagCount: number;
  descriptionLength: number;
  isReady: boolean;
  missingItems: string[];
  metadata: {
    bpm?: number;
    musicalKey?: string;
    tags: string[];
    pricing: PricingTier[];
  };
}

export interface BeatStarsChecklist {
  beatId: string;
  beatName: string;
  isReady: boolean;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  item: string;
  required: boolean;
  completed: boolean;
  details: any;
}

// Pending Beats
export interface PendingBeat {
  id: string;
  name: string;
  genre: string;
  mood: string;
  templateId?: string;
  generationStatus: 'pending';
  createdAt: string;
}
