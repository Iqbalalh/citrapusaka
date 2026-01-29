'use client';

import { useState } from 'react';
import { Category, Region } from '@/lib/types';

interface CategoryNavProps {
  categories: Category[];
  regions: Region[];
  selectedCategory: number | null;
  selectedRegion: number | null;
  onCategorySelect: (categoryId: number | null) => void;
  onRegionSelect: (regionId: number | null) => void;
}

export default function CategoryNav({
  categories,
  regions,
  selectedCategory,
  selectedRegion,
  onCategorySelect,
  onRegionSelect,
}: CategoryNavProps) {
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const selectedRegionName = selectedRegion
    ? regions.find(r => r.id === selectedRegion)?.name
    : 'Semua Wilayah';

  return (
    <nav className="w-full bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YP</span>
            </div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Yayasan Pusaka
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Region Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-sm font-medium text-gray-700">{selectedRegionName}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isRegionDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRegionDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        onRegionSelect(null);
                        setIsRegionDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors sticky top-0 bg-white"
                    >
                      Semua Wilayah
                    </button>
                    {regions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => {
                          onRegionSelect(region.id);
                          setIsRegionDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {region.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => onCategorySelect(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === null
                    ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}