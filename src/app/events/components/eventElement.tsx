import React from 'react';

export interface EventItem {
    uid: string;
    eventName: string;
    host: string;
    date: string;
    time: string;
    imageUrl?: string;
    description?: string;
    location?: string;
    [key: string]: string | undefined;
}

interface EventElementProps {
    item: EventItem;
    onJoinClick?: () => void;
}

export default function EventElement({ item, onJoinClick }: EventElementProps) {
    if (!item) return null;

    const isInstagram = typeof item.host === 'string' && item.host.startsWith('@');

    return (
        <div 
            className="cursor-pointer group flex flex-col p-6 bg-white/60 backdrop-blur-lg border border-white/10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 z-30 h-full"
            onClick={onJoinClick}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div>
                    <h3 className="text-2xl font-semibold text-zinc-950 leading-tight tracking-tight">
                        {item.eventName}
                    </h3>
                    {item.location && (
                        <p className="text-sm text-zinc-600 mt-1 font-medium">
                            📍 {item.location}
                        </p>
                    )}
                </div>
                
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-sm font-bold tracking-wider bg-indigo-50 text-indigo-700 shrink-0 border border-indigo-100 shadow-sm">
                        {item.host}
                </span>
            </div>  
            
            <div className="mt-auto h-full flex flex-row gap-2 lg:gap-4 border-t border-zinc-300/50">
                <div className="mr-auto flex items-center text-sm font-medium text-zinc-800">
                    <svg className="w-4 h-4 mr-2 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {item.date}
                </div>
                <div className="ml-auto flex items-center justify-end text-sm font-medium text-zinc-800">
                    <svg className="w-4 h-4 mr-2 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {item.time}
                </div>
            </div>
        </div>
    );
}