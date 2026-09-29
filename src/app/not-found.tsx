'use client'

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useState, useEffect } from "react";

const C404 = () => {
    const [imgSrc, setImgSrc] = useState('/treenet-background-low.webp');
    const [isHighResLoaded, setIsHighResLoaded] = useState(false);

    useEffect(() => {
        // Run once on mount: check if high-res was already loaded during this session.
        // If it was, skip the low-res transition entirely.
        if (sessionStorage.getItem('bg-high-res-loaded')) {
            setImgSrc('/treenet-background.webp');
            setIsHighResLoaded(true);
        }
    }, []);

    return (
        <div className="relative h-[calc(100vh-6.26rem)] w-full flex items-center justify-center font-sans bg-black">
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <Image
                    src={imgSrc}
                    alt="Background Treenet Image"
                    fill
                    priority
                    className={`
                                  object-cover object-center z-0 transition-all duration-700 scale-101
                                  ${isHighResLoaded ? 'blur-0' : 'blur-[2px]'}
                                `}
                    onLoad={() => {
                        if (!isHighResLoaded) {
                            if (imgSrc === '/treenet-background-low.webp') {
                                setImgSrc('/treenet-background.webp');
                            }
                            else if (imgSrc === '/treenet-background.webp') {
                                setIsHighResLoaded(true);
                                sessionStorage.setItem('bg-high-res-loaded', 'true');
                            }
                        }
                    }}
                />
            </div>

            <main className="h-[calc(100vh-8.9rem)] w-full relative flex flex-col justify-center text-xl lg:text-2xl p-4">
                <div className="p-4 bg-black/35 backdrop-blur-sm rounded-xl w-fit mx-auto">
                    <h1 className="text-4xl md:text-6xl xl:text-8xl font-bold text-center">404 - Page Not Found</h1>
                    <p className="text-center mt-4">The page you are looking for does not exist.</p>
                    <p className="text-center mt-2">We are sorry you have found your way here</p>

                    <div className="flex justify-center mt-6">
                        <Link href="/" className="text-2xl font-light uppercase px-4 py-2 rounded-md hover:underline hover:text-(--headerHover) hover:font-semibold bg-zinc-950/65">
                            Return Home
                        </Link>
                    </div>
                </div>

            </main>
        </div >
    );
    ;
}

export default C404;