'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Image as ImageType, Category } from '@/lib/types';

interface MasonryGridProps {
  images: ImageType[];
  categories: Category[];
  lastImageRef?: (node: HTMLDivElement | null) => void;
}

export default function MasonryGrid({ images, lastImageRef }: MasonryGridProps) {
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [columnLayout, setColumnLayout] = useState<{ image: ImageType; index: number }[][]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCategoryNames = (imageCategories: Category[]) => {
    return imageCategories.map((cat) => cat.name);
  };

  const handleImageClick = (image: ImageType) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Calculate masonry layout - fill left to right, tightly packed vertically
  useEffect(() => {
    const calculateLayout = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const gap = 24; // gap-6 = 24px
      
      // Calculate number of columns based on container width
      let numColumns = 1;
      if (containerWidth >= 1280) numColumns = 5; // xl
      else if (containerWidth >= 1024) numColumns = 4; // lg
      else if (containerWidth >= 768) numColumns = 3; // md
      else if (containerWidth >= 640) numColumns = 2; // sm
      else numColumns = 1;

      // Initialize columns with their heights
      const columns: { image: ImageType; index: number }[][] = Array.from({ length: numColumns }, () => []);
      const columnHeights = Array(numColumns).fill(0);

      // Distribute images to columns, always placing in the shortest column
      images.forEach((image, imageIndex) => {
        // Find the column with the minimum height
        const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));
        
        columns[minHeightIndex].push({ image, index: imageIndex });
        
        // Estimate image height (aspect ratio based)
        // Default aspect ratio if we can't determine it
        const aspectRatio = 0.67; // 400x600 default
        const estimatedHeight = 400 * aspectRatio + 150; // image height + caption + spacing
        
        columnHeights[minHeightIndex] += estimatedHeight + gap;
      });

      setColumnLayout(columns);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, [images]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div ref={containerRef} className="flex gap-6">
        {columnLayout.map((column, colIndex) => (
          <div key={colIndex} className="flex-1 flex flex-col gap-6 min-w-0">
            {column.map(({ image, index }) => (
              <div
                key={image.id}
                ref={index === images.length - 1 ? lastImageRef : undefined}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredImage(image.id)}
                onMouseLeave={() => setHoveredImage(null)}
                onClick={() => handleImageClick(image)}
              >
            {/* Image container */}
            <div className="relative w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              {image.s3Path ? (
                <Image
                  src={image.s3Path}
                  alt={image.caption || 'Gallery image'}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              {/* Categories overlay - only visible on hover */}
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-end p-4 ${
                  hoveredImage === image.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  {getCategoryNames(image.categories).map((name) => (
                    <span
                      key={name}
                      className="px-2 py-1 bg-blue-500/90 text-white text-xs rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Caption outside image container */}
            {image.caption && (
              <p className="mt-3 text-gray-900 text-sm font-medium leading-relaxed">
                {image.caption}
              </p>
            )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">Tidak ada gambar ditemukan</p>
        </div>
      )}

      {/* Image Modal - only shows image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors shadow-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            
            <div className="relative w-full rounded-2xl overflow-hidden">
              {selectedImage.s3Path ? (
                <Image
                  src={selectedImage.s3Path}
                  alt={selectedImage.caption || 'Gallery image'}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}