import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { setLocalToken, isAuthenticated } from '@/lib/auth';

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log("Login page loaded");
    // If user is already authenticated, redirect to home
    if (isAuthenticated()) {
      console.log("User already authenticated, redirecting to home");
      router.push('/');
    }
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log("Attempting login with username:", username);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      console.log("Login response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Login successful, token received");
        setLocalToken(data.token);
        router.push('/');
      } else {
        const errorData = await response.json();
        console.error("Login error:", errorData);
        setError(errorData.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Login - Fletnix</title>
        <meta name="description" content="Login to your Fletnix account" />
      </Head>
      
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Fletnix</h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Sign in to your account</h2>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 