import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout';
import MediaGrid from '@/components/MediaGrid';
import { fetchFeaturedMedia, fetchRecentAdditions } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

interface MediaItem {
  id: string;
  title: string;
  thumbnailPath?: string;
  type: 'movie' | 'series';
}

const Home: React.FC = () => {
  const router = useRouter();
  const [featuredMedia, setFeaturedMedia] = useState<MediaItem[]>([]);
  const [recentAdditions, setRecentAdditions] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const authenticated = isAuthenticated();
      console.log('Is authenticated:', authenticated);
      
      if (!authenticated) {
        console.log('Not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching media data...');
        
        // Create placeholder/dummy data in case the API isn't ready
        const placeholderMedia: MediaItem[] = [
          { 
            id: '1', 
            title: 'Placeholder Movie', 
            type: 'movie' 
          },
          { 
            id: '2', 
            title: 'Placeholder Series', 
            type: 'series' 
          },
          { 
            id: '3', 
            title: 'Another Sample', 
            type: 'movie' 
          }
        ];
        
        // Try to fetch real data
        const [featured, recent] = await Promise.all([
          fetchFeaturedMedia().catch(err => {
            console.error('Featured media fetch error:', err);
            return null;
          }),
          fetchRecentAdditions().catch(err => {
            console.error('Recent additions fetch error:', err);
            return null;
          })
        ]);
        
        if (featured && featured.length > 0) {
          setFeaturedMedia(featured);
        } else {
          console.log('Using placeholder data for featured media');
          setFeaturedMedia(placeholderMedia);
        }
        
        if (recent && recent.length > 0) {
          setRecentAdditions(recent);
        } else {
          console.log('Using placeholder data for recent additions');
          setRecentAdditions(placeholderMedia);
        }
        
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to fetch media. Please try again later.');
        // Set placeholder data even on error
        setFeaturedMedia([
          { id: '1', title: 'Placeholder Movie', type: 'movie' },
          { id: '2', title: 'Placeholder Series', type: 'series' }
        ]);
        setRecentAdditions([
          { id: '3', title: 'Another Sample', type: 'movie' },
          { id: '4', title: 'Sample Show', type: 'series' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Layout>
      <Head>
        <title>Fletnix - Home</title>
        <meta
          name="description"
          content="Fletnix - Your personal streaming service"
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <p className="text-sm mt-2">Using placeholder content instead.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Featured
            </h2>
            {featuredMedia.length > 0 ? (
              <MediaGrid items={featuredMedia} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No featured media available at this time.</p>
            )}

            <h2 className="text-2xl font-bold mb-4 mt-12 text-gray-900 dark:text-white">
              Recent Additions
            </h2>
            {recentAdditions.length > 0 ? (
              <MediaGrid items={recentAdditions} />
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No recent additions available at this time.</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home; 