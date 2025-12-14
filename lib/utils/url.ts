/**
 * Utility functions for handling API URLs and file paths
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Convert relative file paths to absolute URLs
 * Handles paths like: "output/beats/..." or "/output/beats/..."
 */
export function getFullImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-cover.png';
  
  // Already absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct full URL
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Convert relative audio paths to absolute URLs
 */
export function getFullAudioUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // Already absolute URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct full URL
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Get API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}
