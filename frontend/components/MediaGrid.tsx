import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface MediaItem {
  id: string;
  title: string;
  thumbnailPath?: string;
  type: 'movie' | 'series';
}

interface MediaGridProps {
  items: MediaItem[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <Link
          href={`/media/${item.id}`}
          key={item.id}
          className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-700">
            <Image
              src={item.thumbnailPath || '/placeholder.jpg'}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10 text-white m-3"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {item.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {item.type === 'movie' ? 'Movie' : 'Series'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MediaGrid; 