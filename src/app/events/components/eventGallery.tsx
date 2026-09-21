'use client';

import EventElement, { EventItem } from './eventElement';

interface EventGalleryProps {
  events: EventItem[];
  onEventSelect?: (event: EventItem) => void;
}

export default function EventGallery({ events, onEventSelect }: EventGalleryProps) {
  
  if (!events || events.length === 0) {
    return null; // Prevents rendering an empty container if there are no overflow events
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-20">
      {events.map((event) => (
        <EventElement 
          key={event.uid} 
          item={event} 
          onJoinClick={() => onEventSelect && onEventSelect(event)}
        />
      ))}
    </div>
  );
}