'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import CategoryNav from '@/components/CategoryNav';
import MasonryGrid from '@/components/MasonryGrid';
import { fetchGalleriesPaginated, fetchCategories, fetchRegions } from '@/lib/api';
import { Category, Image, Region } from '@/lib/types';

const ITEMS_PER_PAGE = 30;

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [galleries, setGalleries] = useState<Image[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch categories and regions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, regionsData] = await Promise.all([
          fetchCategories(),
          fetchRegions()
        ]);
        setCategories(categoriesData);
        setRegions(regionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Fetch galleries based on current page, category, and region
  const fetchGalleriesData = useCallback(async (page: number, categoryId: number | null, regionId: number | null) => {
    try {
      const result = await fetchGalleriesPaginated(
        page,
        ITEMS_PER_PAGE,
        categoryId || undefined,
        regionId || undefined
      );
      
      if (page === 1) {
        setGalleries(result.data);
      } else {
        setGalleries((prev) => [...prev, ...result.data]);
      }
      
      setHasMore(result.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    }
  }, []);

  // Initial load and filter change
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setCurrentPage(1);
      await fetchGalleriesData(1, selectedCategory, selectedRegion);
      setLoading(false);
    };

    loadInitialData();
  }, [selectedCategory, selectedRegion, fetchGalleriesData]);

  // Infinite scroll observer
  const lastImageRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchGalleriesData(nextPage, selectedCategory, selectedRegion).then(() => {
          setLoadingMore(false);
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loading, currentPage, selectedCategory, selectedRegion, fetchGalleriesData]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleRegionChange = (regionId: number | null) => {
    setSelectedRegion(regionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Memuat galeri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CategoryNav
        categories={categories}
        regions={regions}
        selectedCategory={selectedCategory}
        selectedRegion={selectedRegion}
        onCategorySelect={handleCategoryChange}
        onRegionSelect={handleRegionChange}
      />
      
      <div className="flex-1 pt-4">
        <MasonryGrid
          images={galleries}
          categories={categories}
          lastImageRef={lastImageRef}
        />
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!hasMore && galleries.length > 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          {/* Semua galeri telah ditampilkan */}
        </div>
      )}
      
      <footer className="bg-linear-to-r from-blue-500 to-indigo-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-white text-sm">
              © 2025 Yayasan Pusaka. Membangun masa depan yang lebih baik.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
