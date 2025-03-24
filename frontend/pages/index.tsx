import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import MediaGrid from '../components/MediaGrid';
import { fetchWithAuth, isAuthenticated } from '../lib/auth';

// Define Media item interface
interface MediaItem {
  id: number;
  title: string;
  poster_path: string;
  type: string;
  release_date?: string;
  rating?: number;
}

const Home: React.FC = () => {
  const router = useRouter();
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([]);
  const [recentAdditions, setRecentAdditions] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const fetchMedia = async () => {
      setIsLoading(true);
      try {
        // Fetch featured media
        const featuredResponse = await fetchWithAuth('/api/media/featured');
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedMedia(featuredData.data || []);
        }
        
        // Fetch recent additions
        const recentResponse = await fetchWithAuth('/api/media/recent');
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          setRecentAdditions(recentData.data || []);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedia();
  }, [router]);
  
  return (
    <Layout>
      <Head>
        <title>Fletnix - Home</title>
        <meta name="description" content="Your personal media streaming service" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Featured Content</h2>
              {featuredMedia.length > 0 ? (
                <MediaGrid items={featuredMedia} />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No featured content available.</p>
              )}
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recently Added</h2>
              {recentAdditions.length > 0 ? (
                <MediaGrid items={recentAdditions} />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No recent additions available.</p>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home; 