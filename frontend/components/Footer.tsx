import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';

// Use simple function declaration
function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Fletnix</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your personal media streaming service powered by Jellyfin.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    Home
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/movies" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    Movies
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/series" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    TV Series
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/watchlist" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    My List
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    Help Center
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    Contact Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    FAQ
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy" legacyBehavior>
                  <a className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                    Privacy Policy
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {currentYear} Fletnix. All rights reserved.
            </p>
            
            <div className="flex mt-4 md:mt-0 space-x-4">
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <FaGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <FaTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a 
                href="mailto:contact@example.com" 
                className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
              >
                <FaEnvelope className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 