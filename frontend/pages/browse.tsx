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
  filename?: string;
  filepath?: string;
  foldername?: string;
  folderpath?: string;
}

const BrowsePage: React.FC = () => {
  const router = useRouter();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'movies' | 'series'>('all');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchAllMedia();
  }, [router]);

  const fetchAllMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get local media files from the scan endpoint
      const localMedia = await fetchLocalMedia();
      
      if (localMedia) {
        // Add a timestamp parameter to prevent image caching
        const timestamp = Date.now();
        const processedMedia = [...(localMedia.movies || []), ...(localMedia.series || [])].map(item => ({
          ...item,
          thumbnailPath: item.thumbnailPath?.includes('?') 
            ? `${item.thumbnailPath}&t=${timestamp}` 
            : `${item.thumbnailPath}?t=${timestamp}`
        }));
        
        if (processedMedia.length > 0) {
          console.log('Found local media files:', processedMedia);
          setMedia(processedMedia);
          return;
        }
      }
      
      // If no local files found, try the API
      try {
        const response = await api.get('/media/all');
        
        if (response.data && response.data.data) {
          setMedia(response.data.data);
          return;
        }
      } catch (apiError) {
        console.error('API error, using placeholder data:', apiError);
      }
      
      // Use placeholder data if API fails
      const placeholderMedia: MediaItem[] = [];
      
      // Check for local files in the media directory
      const localFileNames = [
        'Sample Movie 1', 'The Documentary', 'Action Movie', 
        'Drama Series', 'Comedy Show', 'Sci-Fi Adventure', 
        'Historical Drama', 'Animated Feature', 'Nature Documentary'
      ];
      
      // Create placeholder items
      localFileNames.forEach((title, index) => {
        placeholderMedia.push({
          id: (index + 1).toString(),
          title,
          type: index % 3 === 0 ? 'series' : 'movie',
          thumbnailPath: '/placeholder.jpg'
        });
      });
      
      setMedia(placeholderMedia);
      
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to fetch media.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <Layout>
      <Head>
        <title>Browse - Fletnix</title>
        <meta name="description" content="Browse all media available on Fletnix" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Library</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('movies')}
              className={`px-4 py-2 rounded ${
                filter === 'movies' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Movies
            </button>
            <button 
              onClick={() => setFilter('series')}
              className={`px-4 py-2 rounded ${
                filter === 'series' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Series
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : filteredMedia.length > 0 ? (
          <MediaGrid items={filteredMedia} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No media found in this category.</p>
            <p className="text-gray-500 dark:text-gray-500">
              Add media files to your media/movies and media/tv directories.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowsePage; 