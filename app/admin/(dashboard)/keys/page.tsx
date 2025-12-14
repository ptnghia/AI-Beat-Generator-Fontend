'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '@/lib/config';
import { Button } from '@/components/ui/button';

interface ApiKey {
  id: string;
  service: string;
  key: string;
  quota: number;
  used: number;
  isExhausted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await axios.get<{success: boolean; data: ApiKey[]}>(
          `${API_CONFIG.BASE_URL}/api/admin/keys`
        );
        setKeys(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch API keys:', err);
        setError('Failed to load API keys');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeys();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      await axios.delete(`${API_CONFIG.BASE_URL}/api/admin/keys/${id}`);
      setKeys((prev) => prev.filter((key) => key.id !== id));
    } catch (err) {
      console.error('Failed to delete API key:', err);
      alert('Failed to delete API key');
    }
  };

  const handleUpdateQuota = async (id: string, newQuota: number) => {
    try {
      await axios.patch(`${API_CONFIG.BASE_URL}/api/admin/keys/${id}`, {
        quota: newQuota,
      });
      setKeys((prev) =>
        prev.map((key) => (key.id === id ? { ...key, quota: newQuota } : key))
      );
    } catch (err) {
      console.error('Failed to update quota:', err);
      alert('Failed to update quota');
    }
  };

  const handleMarkExhausted = async (id: string) => {
    try {
      await axios.patch(`${API_CONFIG.BASE_URL}/api/admin/keys/${id}`, {
        isExhausted: true,
      });
      setKeys((prev) =>
        prev.map((key) =>
          key.id === id ? { ...key, isExhausted: true } : key
        )
      );
    } catch (err) {
      console.error('Failed to mark as exhausted:', err);
      alert('Failed to mark as exhausted');
    }
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '****';
    return `${key.slice(0, 4)}${'*'.repeat(key.length - 8)}${key.slice(-4)}`;
  };

  const getUsagePercentage = (used: number, quota: number): number => {
    return Math.min((used / quota) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">API Key Management</h1>
        <div className="border rounded-lg p-6 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">API Key Management</h1>
        <div className="border border-destructive rounded-lg p-6">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-semibold">Backend API Unavailable</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            The backend endpoint <code className="bg-muted px-1 py-0.5 rounded">/api/admin/keys</code> is not implemented yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Backend team needs to implement:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
            <li><code className="bg-muted px-1 py-0.5 rounded">GET /api/admin/keys</code> - List API keys</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">POST /api/admin/keys</code> - Add new key</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">PATCH /api/admin/keys/:id</code> - Update key</li>
            <li><code className="bg-muted px-1 py-0.5 rounded">DELETE /api/admin/keys/:id</code> - Delete key</li>
          </ul>
        </div>
      </div>
    );
  }

  const activeKeys = keys.filter((k) => !k.isExhausted).length;
  const exhaustedKeys = keys.filter((k) => k.isExhausted).length;
  const totalUsage = keys.reduce((sum, k) => sum + k.used, 0);
  const totalQuota = keys.reduce((sum, k) => sum + k.quota, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Key Management</h1>
          <p className="text-muted-foreground">
            Manage API keys for external services
          </p>
        </div>
        <Button onClick={() => alert('Add key functionality coming soon')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Key
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Keys</p>
          </div>
          <p className="text-2xl font-bold">{keys.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-green-600" />
            <p className="text-sm text-muted-foreground">Active Keys</p>
          </div>
          <p className="text-2xl font-bold">{activeKeys}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-destructive" />
            <p className="text-sm text-muted-foreground">Exhausted</p>
          </div>
          <p className="text-2xl font-bold">{exhaustedKeys}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Total Usage</p>
          </div>
          <p className="text-2xl font-bold">
            {totalUsage}/{totalQuota}
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="border border-destructive rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Keys Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium">Key</th>
                <th className="text-left p-4 font-medium">Usage</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Created</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    No API keys configured. Add a key to get started.
                  </td>
                </tr>
              ) : (
                keys.map((key) => {
                  const usagePercentage = getUsagePercentage(
                    key.used,
                    key.quota
                  );
                  const usageColor = getUsageColor(usagePercentage);

                  return (
                    <tr key={key.id} className="border-t hover:bg-muted/50">
                      <td className="p-4">
                        <span className="font-medium">{key.service}</span>
                      </td>
                      <td className="p-4">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {maskKey(key.key)}
                        </code>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={usageColor}>
                              {key.used}/{key.quota}
                            </span>
                            <span className={usageColor}>
                              {usagePercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                usagePercentage >= 90
                                  ? 'bg-destructive'
                                  : usagePercentage >= 70
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {key.isExhausted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                            Exhausted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600/10 text-green-600">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newQuota = prompt(
                                'Enter new quota:',
                                key.quota.toString()
                              );
                              if (newQuota) {
                                handleUpdateQuota(key.id, parseInt(newQuota));
                              }
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!key.isExhausted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkExhausted(key.id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(key.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
