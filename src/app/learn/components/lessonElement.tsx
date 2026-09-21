import React from 'react';

export interface LessonItem {
    uid: string;
    [key: string]: string;
}

interface LessonElementProps {
    item: LessonItem;
    columnMapping: string[];
    onJoinClick?: (uid: string) => void;
}

// Dictionary to map the short identifier from the sheet to rich content
const LESSON_DICTIONARY: Record<string, { name: string; description: string, prerequisites?: string, warning?: string }> = {
    "Intro": { 
        name: "Introduction to Weaving", 
        description: "Learn the basics of weaving a treenet. Perfect for beginners with no prior experience." 
    },
    "Intermediate": { 
        name: "Intermediate Knots & Patterns", 
        description: "Expand your skills with patterns and improved knots. Develop proactive risk awareness & safety knowledge.", 
        prerequisites: "Introduction to Weaving"
    },
    "Advanced": { 
        name: "Advanced Patterns & Design", 
        description: "Advanced multi-level nets, walls, strength & structural integridy; weaving with purpose.", 
        prerequisites: "Intermediate Knots & Patterns, previous weaving experience"
    },
    "Hands":{
        name: "Hands-on Workshop",
        description:"Participate in all stages of treenet construction. From perimeter setup to a complete net in one day.",
        prerequisites: "Intermediate Knots & Patterns, previous weaving experience"
    },
    "Height":{
        name: "Weaving at Height",
        description:"Construction of treenets high above the ground. Scaffold installation, platform setup and weaving.",
        prerequisites:"Advanced Patterns & Design or Hands-on Workshop attendance",
        warning:"Climbing equipment recommended for safety. Participate at your own risk."
    }
    
};

export default function LessonElement({ item, columnMapping, onJoinClick }: LessonElementProps) {
    // Ensure we have all 4 columns mapped
    if (!columnMapping || columnMapping.length < 4) return null;

  // Destructure based on the new 4-element mapping array
    const [typeKey, instaKey, dateKey, timeKey] = columnMapping;

  // Extract values
    const typeId = item[typeKey] || 'Unknown';
    const instaHandle = item[instaKey] || 'TBD';
    const dateStr = item[dateKey] || 'TBD';
    const timeStr = item[timeKey] || 'TBD';

    const lessonDetails = LESSON_DICTIONARY[typeId] || { 
        name: typeId, 
        description: "No description available for this lesson type." 
    };

    const isInstagram = typeof instaHandle === 'string' && instaHandle.startsWith('@');

    return (
        <div 
            className="cursor-pointer group flex flex-col p-6 bg-white/60 backdrop-blur-lg border border-white/10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 z-30"
            onClick={() => onJoinClick && onJoinClick(item.uid)}
        >
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div>
                <h3 className="text-2xl font-semibold text-zinc-950 leading-tight tracking-tight">
                    {lessonDetails.name}
                </h3>
            </div>
            
            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-sm font-bold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                {isInstagram ? (
                    <a 
                        href={`https://www.instagram.com/${instaHandle.slice(1)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-indigo-900 transition-colors cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Instructor: 
                        <br className="hidden lg:block xl:hidden"/> &nbsp;{instaHandle}
                    </a>
                ) : (
                    <>Instructor: &nbsp; ${instaHandle}</>
                )}
            </span>
        </div>

        <div className="mb-6">
            <p className="text-zinc-900 leading-relaxed">
                {lessonDetails.description}
            </p>

            {lessonDetails.prerequisites && (
                <div className="mt-4 -mb-8 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Prerequisites</p>
                    <p className="text-sm text-amber-900 leading-snug">{lessonDetails.prerequisites}</p>
                
                    {lessonDetails.warning && (
                        <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-950 leading-snug">
                                <svg 
                                    className="w-5 h-5 text-orange-700 mr-1 inline-block mt-0.5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                {lessonDetails.warning}
                            </p>
                        </div>  
                    )}
                
                </div>
            )}
        </div>     
        
            <div className={`mt-auto pt-4 grid grid-cols-2 gap-4 ${lessonDetails.prerequisites ? '' : 'border-t border-zinc-800'}`}>            <div className="flex items-center text-sm font-medium text-zinc-800">
                <svg className="w-4 h-4 mr-2 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Date: {dateStr}
            </div>
            <div className="flex items-center justify-end text-sm font-medium text-zinc-800">
                <svg className="w-4 h-4 mr-2 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {timeStr}
            </div>
        </div>
    </div>
    );
}