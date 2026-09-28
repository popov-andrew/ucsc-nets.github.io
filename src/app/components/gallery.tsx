'use client'

import { useState, useEffect, useRef, useMemo } from 'react';

interface GalleryProps {
    images: string[];
    autoSlideInterval?: number;
}

export default function Gallery({ images, autoSlideInterval = 5000 }: GalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [websiteLoaded, setWebsiteLoaded] = useState(false);
    // Start at 1 so the LCP image is authorized to resolve immediately
    const [loadedCount, setLoadedCount] = useState(1); 
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Defer initial execution until the page's structural layout is fully ready
    useEffect(() => {
        if (document.readyState === 'complete') {
            setWebsiteLoaded(true);
        } else {
            const handleLoad = () => setWebsiteLoaded(true);
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

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

    // Preload the very first image asset in the document head for optimal LCP metrics
    const firstImageSrc = parsedImages[0]?.src;

    // Natural sliding interval
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
    }, [currentIndex, autoSlideInterval, images.length]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    // Sequential load progression
    const handleImageLoad = (index: number) => {
        if (index + 1 === loadedCount && loadedCount < images.length) {
            setLoadedCount((prev) => prev + 1);
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full flex flex-col items-center gap-4">
            {/* Dynamic Core Preload Hint for the LCP element */}
            {firstImageSrc && (
                <link rel="preload" href={firstImageSrc} as="image" type="image/webp" />
            )}
            
            {/* INLINE CAROUSEL GALLERY - Non-interactive */}
            <div className="w-full max-w-4xl relative overflow-hidden rounded-xl aspect-video bg-gray-100">
                {/* Sliding Track */}
                <div 
                    className="flex w-full h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {parsedImages.map((info, idx) => {
                        const isFirst = idx === 0;
                        // Unlocks asset if sequential turns arrive, page finishes loading, or the carousel slides onto it early
                        const shouldLoad = isFirst || websiteLoaded || idx < loadedCount || idx === currentIndex;

                        return (
                            <div key={idx} className="w-full h-full shrink-0 relative bg-gray-100">
                                <img 
                                    src={shouldLoad ? info.src : undefined} 
                                    alt={info.description}
                                    onLoad={() => handleImageLoad(idx)}
                                    // Eager load only the first viewport image, lazy load all trailing assets
                                    loading={isFirst ? "eager" : "lazy"}
                                    fetchPriority={isFirst ? "high" : "low"}
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                                        shouldLoad ? 'opacity-100' : 'opacity-0'
                                    }`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}