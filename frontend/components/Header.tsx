import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isAuthenticated, logout } from '../lib/auth';
import { FaSearch, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isAuthenticated_, setIsAuthenticated] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  React.useEffect(() => {
    setIsAuthenticated(isAuthenticated());
  }, [router.pathname]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" legacyBehavior>
            <a className="flex items-center">
              <span className="text-2xl font-bold text-primary">Fletnix</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" legacyBehavior>
              <a className={`text-sm font-medium ${router.pathname === '/' ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'}`}>
                Home
              </a>
            </Link>
            <Link href="/movies" legacyBehavior>
              <a className={`text-sm font-medium ${router.pathname === '/movies' ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'}`}>
                Movies
              </a>
            </Link>
            <Link href="/series" legacyBehavior>
              <a className={`text-sm font-medium ${router.pathname === '/series' ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'}`}>
                TV Series
              </a>
            </Link>
            <Link href="/watchlist" legacyBehavior>
              <a className={`text-sm font-medium ${router.pathname === '/watchlist' ? 'text-primary' : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'}`}>
                My List
              </a>
            </Link>
          </nav>
          
          {/* Search, User Menu and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1 px-3 pr-8 rounded-full text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              <button 
                type="submit" 
                className="absolute right-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              >
                <FaSearch className="h-4 w-4" />
              </button>
            </form>

            {/* User Menu - Only show if authenticated */}
            {isAuthenticated_ && (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary focus:outline-none"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <FaUser className="h-5 w-5" />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-10">
                    <Link href="/profile" legacyBehavior>
                      <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Profile
                      </a>
                    </Link>
                    <Link href="/settings" legacyBehavior>
                      <a className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Settings
                      </a>
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link href="/" legacyBehavior>
                <a className={`text-base font-medium ${router.pathname === '/' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                  Home
                </a>
              </Link>
              <Link href="/movies" legacyBehavior>
                <a className={`text-base font-medium ${router.pathname === '/movies' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                  Movies
                </a>
              </Link>
              <Link href="/series" legacyBehavior>
                <a className={`text-base font-medium ${router.pathname === '/series' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                  TV Series
                </a>
              </Link>
              <Link href="/watchlist" legacyBehavior>
                <a className={`text-base font-medium ${router.pathname === '/watchlist' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                  My List
                </a>
              </Link>
              
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="mt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-4 pr-10 rounded-md text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                  >
                    <FaSearch className="h-4 w-4" />
                  </button>
                </div>
              </form>
              
              {/* Mobile User options */}
              {isAuthenticated_ && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                  <Link href="/profile" legacyBehavior>
                    <a className="flex items-center py-2 text-gray-700 dark:text-gray-300">
                      <FaUser className="mr-3 h-5 w-5" />
                      Profile
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center py-2 text-red-600"
                  >
                    <FaSignOutAlt className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header; 