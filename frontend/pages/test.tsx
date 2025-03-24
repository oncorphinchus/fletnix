import React from 'react';
import Head from 'next/head';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Test Page - Fletnix</title>
      </Head>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Test Page</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-primary">This is a test page</h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
            If you can see this page with styling, the basic rendering is working.
          </p>
        </div>
        
        <div className="flex justify-center mt-6">
          <a 
            href="/"
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 