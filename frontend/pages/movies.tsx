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
}

const MoviesPage: React.FC = () => {
  const router = useRouter();
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchMovies();
  }, [router]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get local media files from the scan endpoint
      const localMedia = await fetchLocalMedia();
      
      if (localMedia && localMedia.movies && localMedia.movies.length > 0) {
        // Add a timestamp parameter to prevent image caching
        const timestamp = Date.now();
        const processedMovies = localMedia.movies.map((movie: MediaItem) => ({
          ...movie,
          thumbnailPath: movie.thumbnailPath?.includes('?') 
            ? `${movie.thumbnailPath}&t=${timestamp}` 
            : `${movie.thumbnailPath}?t=${timestamp}`
        }));
        
        console.log('Found local movies:', processedMovies);
        setMovies(processedMovies);
        return;
      }
      
      // If no local files found, try the API
      try {
        const response = await api.get('/media/movies');
        
        if (response.data && response.data.data) {
          setMovies(response.data.data);
          return;
        }
      } catch (apiError) {
        console.error('API error, using placeholder data:', apiError);
      }
      
      // Use placeholder data if API fails
      const placeholderMovies: MediaItem[] = [];
      
      // Create placeholder movies
      const movieTitles = [
        'Action Movie', 'Adventure Film', 'Comedy Classic', 
        'Drama', 'Sci-Fi Thriller', 'Mystery Movie',
        'Romantic Comedy', 'Horror Film', 'Documentary'
      ];
      
      movieTitles.forEach((title, index) => {
        placeholderMovies.push({
          id: (index + 100).toString(),
          title,
          type: 'movie',
          thumbnailPath: '/placeholder.jpg'
        });
      });
      
      setMovies(placeholderMovies);
      
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Failed to fetch movies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Movies - Fletnix</title>
        <meta name="description" content="Browse all movies available on Fletnix" />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Movies</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : movies.length > 0 ? (
          <MediaGrid items={movies} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No movies found in your library.</p>
            <p className="text-gray-500 dark:text-gray-500">
              Add movie files to your media/movies directory to see them here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MoviesPage; 