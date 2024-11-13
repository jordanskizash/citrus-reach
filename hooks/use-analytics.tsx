import { useState, useEffect } from 'react';

interface ViewData {
  date: string;
  pagePath: string;
  views: number;
  users: number;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  viewsOverTime: ViewData[];
  error?: string;
}

interface AnalyticsHookReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}

interface AnalyticsOptions {
  pageId?: string;
  startDate?: string;
  endDate?: string;
}

export function useAnalytics({ 
  pageId, 
  startDate = '30daysAgo', 
  endDate = 'today' 
}: AnalyticsOptions = {}): AnalyticsHookReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            pageId: pageId ? `/blog/${pageId}` : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const analyticsData: AnalyticsData = await response.json();
        
        if ('error' in analyticsData) {
          throw new Error(analyticsData.error);
        }

        setData(analyticsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [pageId, startDate, endDate]);

  return { data, loading, error };
}