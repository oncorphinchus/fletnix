import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const NotFoundPage: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Automatically redirect back to home page after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Head>
        <title>Page Not Found - Fletnix</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Head>
      
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
          <br />
          You'll be redirected to the home page in 5 seconds.
        </p>
        
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-md font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 