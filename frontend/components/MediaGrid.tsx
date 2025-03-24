import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MediaItem {
  id: string;
  title: string;
  thumbnailPath: string;
  type: string;
}

interface MediaGridProps {
  items: MediaItem[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <Link
          href={`/watch/${item.id}`}
          key={item.id}
          className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative aspect-video">
            <Image
              src={item.thumbnailPath || '/placeholder/default.jpg'}
              alt={item.title}
              className="object-cover"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="rounded-full bg-primary p-3 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{item.type}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MediaGrid; 