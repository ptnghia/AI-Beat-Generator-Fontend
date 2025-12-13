/**
 * API Configuration
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

export const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};
