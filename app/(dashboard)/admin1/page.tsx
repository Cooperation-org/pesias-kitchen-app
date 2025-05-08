'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getAllUsers, getEvents } from '@/services/api';
import { 
  UsersIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  TagIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  role: string;
  walletAddress: string;
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  participants: string[];
}


export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, eventsResponse] = await Promise.all([
        getAllUsers(),
        getEvents(),
       
      ]);

      setUsers(usersResponse.data);
      setEvents(eventsResponse.data);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalUsers = users.length;
  const totalEvents = events.length;
  const totalParticipants = events.reduce((acc, event) => acc + event.participants.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Total Users</h3>
            </div>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Total Events</h3>
            </div>
            <p className="text-3xl font-bold">{totalEvents}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Total Activities</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Total Participants</h3>
            </div>
            <p className="text-3xl font-bold">{totalParticipants}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <TagIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Total Quantity</h3>
            </div>
          
          </motion.div>
        </div>

     

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 6).map((event) => (
              <div key={event._id} className="border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium mb-2">{event.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  {event.location}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Participants: </span>
                  <span className="font-medium">{event.participants.length}/{event.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 