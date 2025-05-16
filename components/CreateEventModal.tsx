'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { createEvent } from '@/services/api';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Event } from '@/hooks/useEvents';
import { mutate } from 'swr';

type ActivityType = 'food_sorting' | 'food_distribution' | 'food_pickup';

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'food_sorting', label: 'Food Sorting' },
  { value: 'food_distribution', label: 'Food Distribution' },
  { value: 'food_pickup', label: 'Food Pickup' },
];

interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  imageUrl?: string;
  activityType: ActivityType;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: Event) => void;
  eventsApiUrl: string; // Add this prop to access the correct SWR cache key
}

export default function CreateEventModal({ 
  isOpen, 
  onClose, 
  onEventCreated,
  eventsApiUrl 
}: CreateEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
    price: 0,
    imageUrl: '',
    activityType: 'food_sorting',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      capacity: 0,
      price: 0,
      imageUrl: '',
      activityType: 'food_sorting',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine date and time fields
      const { date, time, ...restData } = formData;
      const combinedDateTime = date && time 
        ? `${date}T${time}:00` 
        : date;
      
      // Create the request data with combined date
      const requestData = {
        ...restData,
        date: combinedDateTime
      };

      // Optimistically update the cache before the API call
      // This makes the new event appear immediately in the UI
      const optimisticEvent = {
        _id: `temp-${Date.now()}`, // Temporary ID that will be replaced
        ...requestData,
        participants: [],
        createdAt: new Date().toISOString(),
      } as Event;

      // Update the SWR cache optimistically
      await mutate(
        eventsApiUrl,
        (currentEvents: Event[] = []) => {
          return [...currentEvents, optimisticEvent];
        },
        false // Don't revalidate yet
      );

      // Send the request to create the event
      const response = await createEvent(requestData);
      const createdEvent = response.data;
      
      toast.success('Event created successfully!');
      
      // Call the callback with the created event
      if (onEventCreated) {
        onEventCreated(createdEvent);
      }
      
      // Force refresh the cache to get the actual event with real ID
      mutate(eventsApiUrl);
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
      console.error('Error creating event:', error);
      
      // Revalidate cache on error to remove optimistic update
      mutate(eventsApiUrl);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'price' ? Number(value) : value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-xl shadow-lg p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Create New Event</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Activity Type
                  </label>
                  <div className="relative">
                    <TagIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <select
                      name="activityType"
                      value={formData.activityType}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none"
                    >
                      {ACTIVITY_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter event location"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Capacity
                  </label>
                  <div className="relative">
                    <UsersIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter maximum capacity"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter event description"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-secondary/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}