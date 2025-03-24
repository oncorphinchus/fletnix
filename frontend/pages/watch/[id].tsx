import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { fetchWithAuth, isAuthenticated } from '../../lib/auth';
import { FaPlay, FaArrowLeft, FaPlus, FaCheck, FaThumbsUp } from 'react-icons/fa';

interface MediaDetails {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  release_date?: string;
  runtime?: number;
  genres?: string[];
  cast?: string[];
  director?: string;
  rating?: number;
  type: string;
}

const WatchPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Only fetch if we have an ID
    if (id) {
      // Check if this is a local media ID
      const isLocalMovie = (id as string).startsWith('movie_');
      const isLocalSeries = (id as string).startsWith('series_');
      
      if (isLocalMovie || isLocalSeries) {
        // For local media, redirect to stream page directly
        console.log(`Redirecting local media ${id} to stream page`);
        setTimeout(() => {
          router.push(`/stream/${id}`);
        }, 100);
        return;
      }
      
      fetchMediaDetails(id as string);
      checkWatchlistStatus(id as string);
    }
  }, [id, router]);
  
  const fetchMediaDetails = async (mediaId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/media/${mediaId}`);
      if (response.ok) {
        const data = await response.json();
        setMediaDetails(data.data);
      } else {
        setError('Failed to load media details. The item may not exist.');
      }
    } catch (err) {
      console.error('Error fetching media details:', err);
      setError('An error occurred while loading media details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkWatchlistStatus = async (mediaId: string) => {
    try {
      const response = await fetchWithAuth(`/api/watchlist/check/${mediaId}`);
      if (response.ok) {
        const data = await response.json();
        setIsInWatchlist(data.data.in_watchlist);
      }
    } catch (err) {
      console.error('Error checking watchlist status:', err);
    }
  };
  
  const toggleWatchlist = async () => {
    if (!mediaDetails) return;
    
    try {
      const endpoint = isInWatchlist 
        ? `/api/watchlist/remove/${mediaDetails.id}`
        : `/api/watchlist/add/${mediaDetails.id}`;
        
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsInWatchlist(!isInWatchlist);
      } else {
        console.error('Error toggling watchlist status');
      }
    } catch (err) {
      console.error('Error toggling watchlist:', err);
    }
  };
  
  const startStream = () => {
    if (!mediaDetails) return;
    
    // Save to history
    saveToHistory();
    
    // Redirect to actual media URL (would link to Jellyfin)
    router.push(`/stream/${mediaDetails.id}`);
  };
  
  const saveToHistory = async () => {
    if (!mediaDetails) return;
    
    try {
      await fetchWithAuth('/api/history/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media_id: mediaDetails.id,
          title: mediaDetails.title,
          poster_path: mediaDetails.poster_path,
          type: mediaDetails.type
        })
      });
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  if (error || !mediaDetails) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
            <p>{error || 'Media not found'}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 flex items-center text-primary hover:underline"
            >
              <FaArrowLeft className="mr-2" /> Go back
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>{mediaDetails.title} - Fletnix</title>
        <meta name="description" content={mediaDetails.overview} />
      </Head>
      
      {/* Hero section with backdrop */}
      <div 
        className="relative h-96 bg-cover bg-center" 
        style={{ backgroundImage: `url(${mediaDetails.backdrop_path || mediaDetails.poster_path})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent"></div>
        
        <div className="container mx-auto px-4 h-full flex items-end pb-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            <div className="w-40 h-60 flex-shrink-0 rounded-lg overflow-hidden shadow-xl hidden md:block">
              <img 
                src={mediaDetails.poster_path} 
                alt={mediaDetails.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{mediaDetails.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                {mediaDetails.release_date && (
                  <span>{new Date(mediaDetails.release_date).getFullYear()}</span>
                )}
                {mediaDetails.runtime && (
                  <span>{Math.floor(mediaDetails.runtime / 60)}h {mediaDetails.runtime % 60}m</span>
                )}
                {mediaDetails.rating && (
                  <span className="flex items-center">
                    <FaThumbsUp className="mr-1" /> {mediaDetails.rating}/10
                  </span>
                )}
                <span className="capitalize px-2 py-1 bg-gray-700 rounded-md">
                  {mediaDetails.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={startStream}
            className="flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-md font-medium transition-colors"
          >
            <FaPlay className="mr-2" /> Play
          </button>
          
          <button
            onClick={toggleWatchlist}
            className="flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
          >
            {isInWatchlist ? <FaCheck className="mr-2" /> : <FaPlus className="mr-2" />}
            {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {mediaDetails.overview}
            </p>
            
            {mediaDetails.director && (
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Director</h2>
                <p className="text-gray-700 dark:text-gray-300">{mediaDetails.director}</p>
              </div>
            )}
            
            {mediaDetails.cast && mediaDetails.cast.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Cast</h2>
                <div className="flex flex-wrap gap-2">
                  {mediaDetails.cast.map((actor, index) => (
                    <span key={index} className="text-gray-700 dark:text-gray-300">
                      {actor}{index < mediaDetails.cast!.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            {mediaDetails.genres && mediaDetails.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {mediaDetails.genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type</span>
                  <span className="text-gray-900 dark:text-white capitalize">{mediaDetails.type}</span>
                </div>
                {mediaDetails.release_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Release Date</span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(mediaDetails.release_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {mediaDetails.runtime && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Runtime</span>
                    <span className="text-gray-900 dark:text-white">
                      {Math.floor(mediaDetails.runtime / 60)}h {mediaDetails.runtime % 60}m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WatchPage; 