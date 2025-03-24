import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import MediaGrid from '@/components/MediaGrid';
import { fetchWithAuth, isAuthenticated } from '@/lib/auth';

// Define API Media item interface
interface ApiMediaItem {
  id: number;
  title: string;
  poster_path: string;
  type: string;
  release_date?: string;
  rating?: number;
}

// Adapter function to convert API media items to component format
function adaptMediaItems(apiItems: ApiMediaItem[]): Array<{
  id: string;
  title: string;
  thumbnailPath: string;
  type: string;
}> {
  return apiItems.map(item => ({
    id: String(item.id),
    title: item.title,
    thumbnailPath: item.poster_path || '/placeholder.jpg', // Provide a default placeholder
    type: item.type
  }));
}

const Home: React.FC = () => {
  const router = useRouter();
  const [featuredMedia, setFeaturedMedia] = useState<ApiMediaItem[]>([]);
  const [recentAdditions, setRecentAdditions] = useState<ApiMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    // Don't do anything if router isn't ready yet
    if (!router || !router.isReady) return;
    
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
        
        if (!featuredResponse) {
          throw new Error('Failed to fetch featured media');
        }
        
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          setFeaturedMedia(featuredData.data || []);
        } else {
          console.error('Featured media response not OK:', featuredResponse.status);
          throw new Error(`Failed to load featured media: ${featuredResponse.statusText}`);
        }
        
        // Fetch recent additions
        const recentResponse = await fetchWithAuth('/api/media/recent');
        
        if (!recentResponse) {
          throw new Error('Failed to fetch recent additions');
        }
        
        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          setRecentAdditions(recentData.data || []);
        } else {
          console.error('Recent additions response not OK:', recentResponse.status);
          throw new Error(`Failed to load recent additions: ${recentResponse.statusText}`);
        }
      } catch (err) {
        console.error('Error fetching media:', err);
        setError(err instanceof Error ? err.message : 'Failed to load media content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedia();
  }, [router]);
  
  // If router is not ready yet, show a loading indicator
  if (!router || !router.isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
                <MediaGrid items={adaptMediaItems(featuredMedia)} />
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No featured content available.</p>
              )}
            </section>
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Recently Added</h2>
              {recentAdditions.length > 0 ? (
                <MediaGrid items={adaptMediaItems(recentAdditions)} />
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