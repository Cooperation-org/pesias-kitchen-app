'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, Share2, Calendar, Clock, Info, AlertCircle } from "lucide-react";
import { useApi } from '@/hooks/useApi';

// Define the activity type based on your API response
interface Activity {
  _id: string;
  event: string;
  qrCode: string;
  user: string;
  quantity: number;
  verified: boolean;
  nftId: string | null;
  timestamp: string;
  notes: string;
}

export default function ActivitiesPage() {
  const api = useApi();
  const { 
    data: activities, 
    loading, 
    error, 
    execute: fetchActivities 
  } = api.useGet<Activity[]>();

  // Fetch activities when the component mounts
  useEffect(() => {
    fetchActivities('/api/activity/user');
  }, [fetchActivities]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Share activity handler
  const handleShare = (activityId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this activity!',
        text: 'I participated in this activity through the Global Classrooms app.',
        url: `${window.location.origin}/activities/${activityId}`,
      }).catch(err => {
        console.log('Error sharing:', err);
      });
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  return (
    <div className="w-full bg-white min-h-screen p-4 md:p-6 lg:p-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2">
            <ArrowLeft className="h-6 w-6 text-gray-800" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Activities</h1>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500">Loading activities...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Error loading activities</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button 
              onClick={() => fetchActivities('/api/activity/user')} 
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!activities || activities.length === 0) && (
        <div className="max-w-7xl mx-auto bg-gray-50 border border-gray-200 rounded-lg p-8 flex flex-col items-center">
          <Info className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-800 text-lg">No activities yet</h3>
          <p className="text-gray-500 text-center max-w-md mt-2">
            You haven't participated in any activities yet. Check back later or join an activity by scanning a QR code.
          </p>
        </div>
      )}

      {/* Activity Cards */}
      {!loading && !error && activities && activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {activities.map((activity) => (
            <div key={activity._id} className="border border-gray-200 rounded-lg p-4 flex items-start">
              <div className="w-12 h-12 rounded-full bg-gray-100 mr-4 flex-shrink-0 flex items-center justify-center">
                {activity.verified ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#10b981" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f59e0b" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75v.75m0 3v.75m0 3v.75" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {activity.event || "Activity"}
                  {activity.verified && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </h3>
                
                <div className="text-gray-500 text-sm mb-3">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>{formatDate(activity.timestamp)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    <span>{formatTime(activity.timestamp)}</span>
                  </div>
                  {activity.notes && (
                    <p className="mt-2 text-gray-600">{activity.notes}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!activity.verified && (
                    <button className="px-4 py-2 text-sm border border-yellow-400 text-yellow-500 rounded-md hover:bg-yellow-50">
                      Verify
                    </button>
                  )}
                  <button 
                    onClick={() => handleShare(activity._id)}
                    className="px-4 py-2 text-sm bg-yellow-400 text-white rounded-md flex items-center gap-1 hover:bg-yellow-500"
                  >
                    <span>Share</span>
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}