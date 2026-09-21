import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function RentPromoPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        if (mediaQuery.matches) {
            setPrefersReducedMotion(true);
            setIsPlaying(false);
        }

        // Optional: Listen for changes in user preference
        const change = (e: MediaQueryListEvent) => {
            if (e.matches) {
                videoRef.current?.pause();
                setIsPlaying(false);
            }
        };

        mediaQuery.addEventListener("change", change);
        return () => mediaQuery.removeEventListener("change", change);
    }, []);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="w-full h-full relative flex justify-center items-end text-zinc-900">
            <div className="w-full h-full   absolute">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-lg"
                    autoPlay={!prefersReducedMotion}
                    loop
                    muted
                    playsInline
                    poster="/fallback-image.jpg" //TODO
                >
                    <source src="/video/RentPromo.webm" type="video/webm" />
                    <source src="/video/RentPromo.mp4" type="video/mp4" />

                    Your browser does not support the video tag. {/* Fallback */}
                </video>

                <button
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className="absolute bottom-4 right-4 flex items-center justify-center bg-white/75 hover:bg-white transition-colors duration-300 p-2 rounded-xl backdrop-blur-sm"
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 pl-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 5v16l14-8z" />
                        </svg>
                    )}
                </button>
                <Link href="/contact" className="absolute inset-0 flex flex-row gap-1 bg-white/75 hover:bg-white backdrop-blur-sm transition-colors duration-300 w-fit h-fit p-2 pl-3 pr-0.5 rounded-xl mt-auto mr-auto m-4">
                    Rent a Net
                    <svg className="w-5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                </Link>
            </div>
            <div className="absolute w-full rounded-lg bg-white/75 backdrop-blur-sm max-w-[calc(100%-2rem)] m-4 mb-18 p-4 gap-1 flex flex-col">
                <h2 className="text-2xl font-medium">
                    Event Installations
                </h2>
                <p className="text-md">
                    Experience our Treenets at pop-ups and community-organized events
                </p>
            </div>
        </div>
    );
}