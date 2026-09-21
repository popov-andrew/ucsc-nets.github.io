'use client'

import { useState, useEffect, useRef, useMemo } from 'react';

interface GalleryProps {
    images: string[];
    autoSlideInterval?: number;
}

export default function Gallery({ images, autoSlideInterval = 5000 }: GalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const parsedImages = useMemo(() => {
        return images.map((filename) => {
            if (!filename) return { date: '', location: '', description: '', src: '' };
            const nameWithoutExt = filename.replace('.webp', '');
            const parts = nameWithoutExt.split('-');
            
            return {
                date: parts[0]?.replace(/_/g, '/') || 'Unknown Date',
                location: parts[1]?.replace(/_/g, ' ') || 'Unknown Location',
                description: parts[2]?.replace(/_/g, ' ') || 'No Description',
                src: `/images/${filename}`
            };
        });
    }, [images]);

    const activeImageInfo = parsedImages[currentIndex] || { date: '', location: '', description: '', src: '' };

    // Natural sliding interval (runs continuously now)
    useEffect(() => {
        const startTimer = () => {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                handleNext();
            }, autoSlideInterval);
        };

        startTimer();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex, autoSlideInterval]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full flex flex-col items-center gap-4">
            
            {/* INLINE CAROUSEL GALLERY - Non-interactive */}
            <div className="w-full max-w-4xl relative overflow-hidden rounded-xl aspect-video">
                {/* Sliding Track */}
                <div 
                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {parsedImages.map((info, idx) => (
                        <div key={idx} className="w-full h-full shrink-0 relative">
                            <img 
                                src={info.src} 
                                alt={info.description}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}