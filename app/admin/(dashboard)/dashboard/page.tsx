'use client';

import { useEffect, useState } from 'react';
import { Music, Key, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '@/lib/config';
import { StatsResponse } from '@/lib/types';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<StatsResponse>(
          `${API_CONFIG.BASE_URL}/api/stats`
        );
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 animate-pulse">
              <div className="h-12 bg-muted rounded mb-4" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="border rounded-lg p-6 text-center text-destructive">
          {error}
        </div>
      </div>
    );
  }

  const statCards: StatCard[] = stats
    ? [
        {
          title: 'Total Beats',
          value: stats.beats.total,
          icon: Music,
          description: `${stats.beats.recentCount} generated recently`,
          trend: '+12%',
        },
        {
          title: 'API Keys',
          value: stats.apiKeys.active,
          icon: Key,
          description: `${stats.apiKeys.total} total keys`,
          trend: `${stats.apiKeys.exhausted} exhausted`,
        },
        {
          title: 'Beats Today',
          value: stats.system.totalBeatsToday,
          icon: TrendingUp,
          description: 'Generated in last 24h',
          trend: '+5',
        },
        {
          title: 'System Uptime',
          value: stats.system.uptime,
          icon: Activity,
          description: 'All systems operational',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {stat.trend && (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {stat.trend}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Genre Distribution */}
      {stats && Object.keys(stats.beats.byGenre).length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Beats by Genre</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.beats.byGenre).map(([genre, count]) => (
              <div
                key={genre}
                className="bg-muted rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      {stats && Object.keys(stats.beats.byMood).length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Beats by Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.beats.byMood).map(([mood, count]) => (
              <div
                key={mood}
                className="bg-muted rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground">{mood}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Info */}
      {stats && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Last Beat Generated</span>
              <span className="font-medium">
                {stats.system.lastBeatGenerated
                  ? new Date(stats.system.lastBeatGenerated).toLocaleString()
                  : 'Never'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">System Uptime</span>
              <span className="font-medium">{stats.system.uptime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Beats Today</span>
              <span className="font-medium">{stats.system.totalBeatsToday}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
