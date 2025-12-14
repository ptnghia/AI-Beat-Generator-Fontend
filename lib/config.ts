/**
 * API Configuration
 * Project ID 40: Port Range 4000-4099
 * Backend API: 4000
 * Frontend Dev: 4001
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
};

export const API_ENDPOINTS = {
  // Public endpoints
  beats: '/api/beats',
  beatDetail: (id: string) => `/api/beats/${id}`,
  stats: '/api/stats',
  
  // Admin endpoints
  adminLogin: '/api/admin/login',
  adminMe: '/api/admin/me',
  adminChangePassword: '/api/admin/change-password',
  adminUsers: '/api/admin/users',
  
  // Beat Generation
  generateBeat: '/api/generate/beat',
  generateBeats: '/api/generate/beats',
  generateAudio: (id: string) => `/api/beats/${id}/generate-audio`,
  
  // Beat Versions
  beatVersions: (id: string) => `/api/beats/${id}/versions`,
  createVersion: (id: string) => `/api/beats/${id}/versions`,
  
  // Beat Management
  pendingBeats: '/api/beats/pending/list',
  updateBeat: (id: string) => `/api/admin/beats/${id}`,
  deleteBeat: (id: string) => `/api/admin/beats/${id}`,
  
  // File Operations
  convertWav: (id: string) => `/api/beats/${id}/convert-to-wav`,
  downloadFiles: (id: string) => `/api/beats/${id}/download`,
  wavStatus: (id: string) => `/api/beats/${id}/wav-status`,
  
  // BeatStars Integration
  beatstarsExport: '/api/beatstars/export',
  beatstarsReadyCheck: '/api/beatstars/ready-check',
  beatstarsChecklist: (id: string) => `/api/beatstars/checklist/${id}`,
  
  // Admin API Keys
  adminKeys: '/api/admin/keys',
  adminKeyDetail: (id: string) => `/api/admin/keys/${id}`,
  
  // Admin Logs
  adminLogs: '/api/admin/logs',
  adminStats: '/api/admin/stats/overview',
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

export const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};
