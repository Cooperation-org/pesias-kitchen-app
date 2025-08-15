'use client';

import React from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { motion } from 'framer-motion';

interface NFTFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedActivityType: string;
  onActivityTypeChange: (type: string) => void;
  sortBy: 'date' | 'activityType';
  onSortByChange: (sortBy: 'date' | 'activityType') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const activityTypes = [
  { value: '', label: 'All Activities', color: '#9C27B0' },
  { value: 'food_sorting', label: 'Food Sorting', color: '#4CAF50' },
  { value: 'food_distribution', label: 'Food Distribution', color: '#2196F3' },
  { value: 'food_pickup', label: 'Food Pickup', color: '#FF9800' },
];

export default function NFTFilter({
  searchQuery,
  onSearchChange,
  selectedActivityType,
  onActivityTypeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: NFTFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-6"
    >
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by location or activity type..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Filters and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Activity Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-gray-600 mr-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          {activityTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onActivityTypeChange(type.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedActivityType === type.value
                  ? 'text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedActivityType === type.value ? type.color : undefined,
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-600">
            <span className="text-sm font-medium">Sort by:</span>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as 'date' | 'activityType')}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="date">Date Earned</option>
            <option value="activityType">Activity Type</option>
          </select>

          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <SortAsc size={16} className="text-gray-600" />
            ) : (
              <SortDesc size={16} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {(searchQuery || selectedActivityType) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Search: "{searchQuery}"
            </span>
          )}
          {selectedActivityType && (
            <span 
              className="text-white px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: activityTypes.find(t => t.value === selectedActivityType)?.color 
              }}
            >
              {activityTypes.find(t => t.value === selectedActivityType)?.label}
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange('');
              onActivityTypeChange('');
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </motion.div>
  );
}