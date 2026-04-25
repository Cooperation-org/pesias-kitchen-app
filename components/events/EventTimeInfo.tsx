'use client';

import { formatShortDateTime } from '@/utils/event-utils';

interface EventTimeInfoProps {
  date: string | undefined;
}

const EventTimeInfo: React.FC<EventTimeInfoProps> = ({ date }) => {
  return (
    <div className="flex items-center gap-1">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{formatShortDateTime(date)}</span>
    </div>
  );
};

export default EventTimeInfo;