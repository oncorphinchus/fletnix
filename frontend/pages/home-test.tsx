import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { isAuthenticated, getLocalToken } from '@/lib/auth';
import Link from 'next/link';

const HomeTest: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // Get the token on the client side
    setToken(getLocalToken());
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Home Test - Fletnix</title>
      </Head>
      
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Fletnix</h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Home Test Page</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold text-gray-900 dark:text-white">Authentication Status:</h3>
            <p className="text-gray-800 dark:text-gray-200">
              {isAuthenticated() ? '✅ Authenticated' : '❌ Not Authenticated'}
            </p>
          </div>
          
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-bold text-gray-900 dark:text-white">Token:</h3>
            <p className="text-gray-800 dark:text-gray-200 break-all text-xs">
              {token ? token.substring(0, 20) + '...' : 'No token found'}
            </p>
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
              Go to Home
            </Link>
            
            <Link href="/login" className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTest; 