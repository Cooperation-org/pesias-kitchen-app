'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getEventById, updateEvent } from '@/services/api';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

type ActivityType = 'food_sorting' | 'food_distribution' | 'food_pickup';

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'food_sorting', label: 'Food Sorting' },
  { value: 'food_distribution', label: 'Food Distribution' },
  { value: 'food_pickup', label: 'Food Pickup' },
];

interface ApiEventResponse {
  data: {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number;
    activityType: ActivityType;
    defaultQuantity: number;
    participants: string[];
    createdBy: string;
    createdAt: string;
    __v: number;
  }
}

interface EditEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  activityType: ActivityType;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onEventUpdated: () => void;
}

export default function EditEventModal({ isOpen, onClose, eventId, onEventUpdated }: EditEventModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EditEventData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: 0,
    activityType: 'food_sorting',
  });

  useEffect(() => {
    if (isOpen && eventId) {
      fetchEvent();
    }
  }, [isOpen, eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await getEventById(eventId);
      const eventData = (response as unknown as ApiEventResponse).data;

      // Parse the ISO date string to separate date and time
      const eventDate = new Date(eventData.date);
      const dateString = eventDate.toISOString().split('T')[0];
      const timeString = eventDate.toTimeString().slice(0, 5);

      // Set form data
      setFormData({
        title: eventData.title,
        description: eventData.description,
        date: dateString,
        time: timeString,
        location: eventData.location,
        capacity: eventData.capacity,
        activityType: eventData.activityType || 'food_sorting',
      });
    } catch (error: unknown) {
      toast.error('Failed to fetch event details');
      console.error('Error fetching event details:', error);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine date and time fields for the API request
      const { date, time, ...restData } = formData;
      const combinedDateTime = date && time ? `${date}T${time}:00` : date;

      // Create the request data with combined date
      const requestData = {
        ...restData,
        date: combinedDateTime,
      };

      // Send update request
      await updateEvent(eventId, requestData);
      toast.success('Event updated successfully!');
      onEventUpdated();
      onClose();
    } catch (error: unknown) {
      toast.error('Failed to update event. Please try again.');
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
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
              <h2 className="text-2xl font-bold text-foreground">Edit Event</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-secondary rounded"></div>
                <div className="h-8 bg-secondary rounded"></div>
                <div className="h-24 bg-secondary rounded"></div>
              </div>
            ) : (
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
                    {isSubmitting ? 'Updating...' : 'Update Event'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}