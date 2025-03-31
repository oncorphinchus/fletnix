import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import MediaGrid from '@/components/MediaGrid';
import { isAuthenticated } from '@/lib/auth';
import api, { fetchLocalMedia } from '@/lib/api';

interface MediaItem {
  id: string;
  title: string;
  thumbnailPath?: string;
  type: 'movie' | 'series';
  foldername?: string;
  folderpath?: string;
}

const SeriesPage: React.FC = () => {
  const router = useRouter();
  const [series, setSeries] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchSeries();
  }, [router]);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get local media files from the scan endpoint
      const localMedia = await fetchLocalMedia();
      
      if (localMedia && localMedia.series && localMedia.series.length > 0) {
        // Add a timestamp parameter to prevent image caching
        const timestamp = Date.now();
        const processedSeries = localMedia.series.map((series: MediaItem) => ({
          ...series,
          thumbnailPath: series.thumbnailPath?.includes('?') 
            ? `${series.thumbnailPath}&t=${timestamp}` 
            : `${series.thumbnailPath}?t=${timestamp}`
        }));
        
        console.log('Found local series:', processedSeries);
        setSeries(processedSeries);
        return;
      }
      
      // If no local files found, try the API
      try {
        const response = await api.get('/media/series');
        
        if (response.data && response.data.data) {
          setSeries(response.data.data);
          return;
        }
      } catch (apiError) {
        console.error('API error, using placeholder data:', apiError);
      }
      
      // Use placeholder data if API fails
      const placeholderSeries: MediaItem[] = [];
      
      // Create placeholder series
      const seriesTitles = [
        'Drama Series', 'Comedy Show', 'Sci-Fi Series', 
        'Historical Drama', 'Reality TV', 'Crime Series',
        'Fantasy Adventure', 'Animated Series', 'Documentary Series'
      ];
      
      seriesTitles.forEach((title, index) => {
        placeholderSeries.push({
          id: (index + 200).toString(),
          title,
          type: 'series',
          thumbnailPath: '/placeholder.jpg'
        });
      });
      
      setSeries(placeholderSeries);
      
    } catch (err) {
      console.error('Error fetching series:', err);
      setError('Failed to fetch TV series.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>TV Series - Fletnix</title>
        <meta name="description" content="Browse all TV series available on Fletnix" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">TV Series</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : series.length > 0 ? (
          <MediaGrid items={series} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No TV series found in your library.</p>
            <p className="text-gray-500 dark:text-gray-500">
              Add TV series to your media/tv directory to see them here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SeriesPage; 