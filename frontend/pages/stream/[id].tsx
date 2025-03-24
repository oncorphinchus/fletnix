import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { isAuthenticated, fetchWithAuth } from '../../lib/auth';
import { FaArrowLeft, FaExpand, FaPause, FaPlay, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

interface MediaDetails {
  id: number;
  title: string;
  stream_url: string;
  type: string;
}

const StreamPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    // Only fetch if we have an ID
    if (id) {
      fetchMediaDetails(id as string);
    }
    
    // Set up event listeners for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [id, router]);
  
  const fetchMediaDetails = async (mediaId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/media/${mediaId}/stream`);
      if (response.ok) {
        const data = await response.json();
        setMediaDetails(data.data);
      } else {
        setError('Failed to load stream details.');
      }
    } catch (err) {
      console.error('Error fetching stream details:', err);
      setError('An error occurred while loading the stream.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };
  
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    setCurrentTime(videoRef.current.currentTime);
    
    // Update progress bar
    if (progressRef.current && duration) {
      const percentage = (videoRef.current.currentTime / duration) * 100;
      progressRef.current.style.width = `${percentage}%`;
    }
  };
  
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    
    setDuration(videoRef.current.duration);
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    videoRef.current.currentTime = pos * duration;
  };
  
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
  };
  
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setIsControlsVisible(true);
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setIsControlsVisible(false);
      }
    }, 3000);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const goBack = () => {
    router.push(`/watch/${id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (error || !mediaDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-white p-4">
        <p className="text-xl mb-4">{error || 'Stream not available'}</p>
        <button 
          onClick={goBack} 
          className="flex items-center bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded"
        >
          <FaArrowLeft className="mr-2" /> Go back
        </button>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Now Playing: {mediaDetails.title} - Fletnix</title>
        <meta name="description" content={`Watch ${mediaDetails.title} on Fletnix`} />
      </Head>
      
      <div 
        ref={videoContainerRef}
        className="relative h-screen w-full bg-black overflow-hidden"
        onMouseMove={resetControlsTimeout}
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          className="h-full w-full"
          src={mediaDetails.stream_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          autoPlay
        />
        
        {/* Back button */}
        <div 
          className={`absolute top-4 left-4 z-10 transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={goBack}
            className="flex items-center bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
        
        {/* Video controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div 
            className="h-1 w-full bg-gray-600 cursor-pointer mb-4 rounded-full overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              ref={progressRef}
              className="h-full bg-primary"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause button */}
              <button 
                onClick={togglePlay}
                className="text-white hover:text-primary"
              >
                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
              </button>
              
              {/* Volume controls */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-primary"
                >
                  {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 md:w-32 accent-primary"
                />
              </div>
              
              {/* Time display */}
              <div className="text-white text-sm hidden sm:block">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* Fullscreen button */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-primary"
            >
              <FaExpand size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StreamPage; 