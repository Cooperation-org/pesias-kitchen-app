import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { ChartBarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { getEventImpact } from '@/services/api';

interface EventImpact {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  activityType: string;
  stats: {
    totalVolunteers: number;
    totalRecipients: number;
    totalActivities: number;
    totalFoodProcessed: number;
  };
  generatedAt: string;
}

interface EventImpactModalProps {
  isOpen: boolean;
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

export default function EventImpactModal({
  isOpen,
  eventId,
  eventTitle,
  onClose
}: EventImpactModalProps) {
  const [impact, setImpact] = useState<EventImpact | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !eventId) return;
    const fetchEventImpact = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getEventImpact(eventId);
        setImpact(response.data as unknown as EventImpact);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load event impact data'));
        toast.error('Failed to load event impact data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventImpact();
  }, [isOpen, eventId]);

  const handleRetry = async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getEventImpact(eventId);
      setImpact(response.data as unknown as EventImpact);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load event impact data'));
      toast.error('Failed to load event impact data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-transparent" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Event Impact: {impact?.eventTitle || eventTitle}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </Dialog.Title>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>{error.message}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : impact ? (
                  <div className="space-y-6">
                    {/* Event Info */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">{impact.eventDate && new Date(impact.eventDate).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{impact.eventLocation}</div>
                      <div className="text-sm text-gray-500 capitalize">Type: {impact.activityType ? impact.activityType.replace('_', ' ') : ''}</div>
                    </div>
                    
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Volunteers</p>
                        <p className="text-2xl font-semibold text-gray-900">{impact.stats.totalVolunteers}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Recipients</p>
                        <p className="text-2xl font-semibold text-gray-900">{impact.stats.totalRecipients}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Activities</p>
                        <p className="text-2xl font-semibold text-gray-900">{impact.stats.totalActivities}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Food Processed</p>
                        <p className="text-2xl font-semibold text-gray-900">{impact.stats.totalFoodProcessed}</p>
                      </div>
                    </div>

                    {/* Generated At */}
                    <div className="text-xs text-gray-400 mt-4">
                      Generated: {impact.generatedAt && new Date(impact.generatedAt).toLocaleString()}
                    </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}