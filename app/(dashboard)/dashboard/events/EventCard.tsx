'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon, 
  PencilIcon,
  QrCodeIcon,
  EyeIcon,
  UserCircleIcon,
  ArrowDownCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { ProcessedEvent, ACTIVITY_TYPE_COLORS, ACTIVITY_TYPE_GRADIENTS, ACTIVITY_TYPE_LABELS } from './types';
import { formatDate, formatTime, isEventPast } from './utils';

interface EventCardProps {
  event: ProcessedEvent;
  isCreator: boolean;
  isAdmin: boolean;
  userJoined: boolean;
  isAuthenticated: boolean;
  onJoin: (eventId: string) => void;
  onGenerateQRCode: (eventId: string, eventTitle: string) => void;
  onViewQRCode: (eventId: string, eventTitle: string) => void;
  onEdit: (eventId: string) => void;
}

export default function EventCard({
  event,
  isCreator,
  isAdmin,
  userJoined,
  onJoin,
  onGenerateQRCode,
  onViewQRCode,
  onEdit
}: EventCardProps) {
  const [expandedDescription, setExpandedDescription] = useState<boolean>(false);
  
  const isPast = isEventPast(event);
  const canEdit = isCreator || isAdmin;
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15
      }
    },
    hover: {
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-card rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col h-full border border-secondary/30"
    >
      {/* Event type banner */}
      <div className={`h-2 w-full bg-gradient-to-r ${ACTIVITY_TYPE_GRADIENTS[event.activityType]}`}></div>
      
      {/* Creator badge */}
      {isCreator && (
        <div className="absolute top-4 left-4 z-10">
          <motion.span 
            className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-primary/50 shadow-lg shadow-primary/20"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <UserCircleIcon className="w-3 h-3" />
            Created by you
          </motion.span>
        </div>
      )}

      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-foreground mb-4">
            {event.title}
          </h3>
          
          {/* Activity type badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${ACTIVITY_TYPE_COLORS[event.activityType]}`}>
            {ACTIVITY_TYPE_LABELS[event.activityType]}
          </span>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary/70" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-primary/70" />
            <span>{formatTime(event.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-primary/70" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-primary/70" />
            <span>Capacity: {event.capacity} people</span>
          </div>
          
          {/* Participants count */}
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-primary/70" />
            <span>Participants: {event.participants.length} joined</span>
          </div>
        </div>

        <div className="mt-4">
          <AnimatePresence>
            <motion.div
              className={`text-muted-foreground relative overflow-hidden ${expandedDescription ? '' : 'line-clamp-2'}`}
              initial={{ height: expandedDescription ? 'auto' : '3em' }}
              animate={{ height: expandedDescription ? 'auto' : '3em' }}
              exit={{ height: '3em' }}
            >
              {event.description}
              
              {!expandedDescription && event.description.length > 120 && (
                <div className="absolute bottom-0 right-0 left-0 h-6 bg-gradient-to-t from-card to-transparent"></div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {event.description.length > 120 && (
            <button 
              onClick={toggleDescription}
              className="text-primary text-sm mt-2 flex items-center gap-1 hover:underline focus:outline-none"
            >
              {expandedDescription ? 'Show less' : 'Read more'}
              <motion.span
                animate={{ rotate: expandedDescription ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowDownCircleIcon className="w-4 h-4" />
              </motion.span>
            </button>
          )}
        </div>

        {/* Actions area */}
        <div className="mt-6 flex items-center gap-4">
          {canEdit && !isPast && (
            <motion.button 
              onClick={() => onEdit(event.id)}
              className="p-2 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary/80 rounded-full transition-colors flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilIcon className="w-4 h-4" />
              <span className="text-sm">Edit</span>
            </motion.button>
          )}
          
          <div className="flex-grow">
            {isCreator ? (
              <motion.button
                className={`w-full py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium ${
                  isPast
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : event.hasQrCode
                      ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                onClick={() => !isPast && (event.hasQrCode 
                  ? onViewQRCode(event.id, event.title)
                  : onGenerateQRCode(event.id, event.title)
                )}
                disabled={isPast}
                whileHover={!isPast ? "hover" : undefined}
                whileTap={!isPast ? "tap" : undefined}
                variants={buttonVariants}
              >
                {isPast ? (
                  'Event Ended'
                ) : event.hasQrCode ? (
                  <>
                    <EyeIcon className="w-5 h-5" />
                    View QR Code
                  </>
                ) : (
                  <>
                    <QrCodeIcon className="w-5 h-5" />
                    Generate QR Code
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                className={`w-full py-3 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 ${
                  isPast
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : userJoined
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                onClick={() => !isPast && !userJoined && onJoin(event.id)}
                
                disabled={isPast || userJoined}
                whileHover={!isPast && !userJoined ? "hover" : undefined}
                whileTap={!isPast && !userJoined ? "tap" : undefined}
                variants={buttonVariants}
              >
                {isPast ? (
                  'Event Ended'
                ) : userJoined ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    You&apos;ve Joined
                  </>
                ) : (
                  'Join Event'
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}