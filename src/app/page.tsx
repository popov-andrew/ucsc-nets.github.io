'use client'

import Image from "next/image";
import Link from "next/link";
import Gallery from "./components/gallery";
import { useEffect, useState } from "react";

const galleryImages = [
    "community-weaving.webp",
    "baskin-treenet.webp",
    "relax-refresh-rejuvenate.webp",
    "treenet-weaving.webp",
    "high-treenet.webp",
    "treenet-floor.webp",
    "big-treenet.webp",
    "weaving-lesson.webp",
    "weaving-treenet-shadow.webp"
]

export default function Test() {

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
        <div className="relative h-screen lg:h-[calc(100vh-6.26rem)] w-full flex items-center justify-center font-sans bg-black">
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <Image
                    src={imgSrc}
                    alt="Background Treenet Image"
                    fill
                    priority
                    className={`
                      object-cover object-center z-0 transition-all duration-700  scale-101
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

            <main className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-7 h-screen lg:h-[calc(100vh-8.9rem)] w-full z-20 mb-12">
                <div className="hidden lg:flex col-span-1 md:col-span-1 lg:col-span-2 p-8">
                    <div className="bg-white/60 backdrop-blur-xs w-full h-full rounded-lg p-8 border border-t-white/80 border-l-white/80 border-b-black/20 border-r-black/20">
                        <div className="flex flex-col font-koh-santepheap h-full gap-8">
                            <Link href="/learn" className="relative w-full h-full rounded-lg overflow-hidden group">
                                <Image
                                    src="/images/weaving-lesson.webp"
                                    alt="Free Treenet Lesson Promotion"
                                    fill
                                    className="w-auto h-auto object-cover group-hover:scale-110 transform ease-in-out transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <span className="text-white text-2xl 2xl:text-4xl font-bold tracking-wide drop-shadow-md">
                                        Lessons
                                    </span>
                                </div>
                            </Link>
                            <Link href="/events" className="relative w-full h-full rounded-lg overflow-hidden group">
                                <Image
                                    src="https://images.unsplash.com/photo-1542273917363-3b1817f69a56?auto=format&fit=crop&q=80&w=800"
                                    alt="Event Promotion"
                                    fill
                                    className="w-auto h-auto object-cover group-hover:scale-110 transform ease-in-out transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <span className="text-white text-2xl 2xl:text-4xl font-bold tracking-wide drop-shadow-md">
                                        Events
                                    </span>
                                </div>
                            </Link>
                            <Link href="/contact" className="relative w-full h-full rounded-lg overflow-hidden group">
                                <Image
                                    src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800"
                                    alt="Contact"
                                    fill
                                    className="w-auto h-auto object-cover group-hover:scale-110 transform ease-in-out transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <span className="text-white text-2xl 2xl:text-4xl font-bold tracking-wide drop-shadow-md">
                                        Contact
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-5 m-4 sm:m-8 pb-8 lg:ml-0 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-7 xl:grid-cols-7  bg-white/60 backdrop-blur-sm rounded-lg ">
                    <div className="col-span-1 md:col-span-1 lg:col-span-4 xl:col-span-3 text-zinc-900 p-8 flex flex-col ">
                        <h1 className="text-4xl font-medium font-koh-santepheap text-zinc-900">
                            Weaving in the Birthplace of Treenets
                        </h1>
                        <p className="text-lg mt-2 lg:mt-8">
                            We are a guild of students and locals weaving treenets to restore their historical significance to Santa Cruz.
                            We want to share our insights by teaching anyone interested, and weave huge treenets with everyone who wants to get involved!
                        </p>
                        <div className="flex bg-slug border-slug/20 border-2 rounded-xl h-fit p-4 mt-4 items-center flex-col text-zinc-800">
                            <span className="hidden md:flex">
                                Interested in learning how to weave? Find free in-person lessons that are right for you
                            </span>
                            <span className="flex md:hidden">
                                Find free in-person lessons
                            </span>
                            <div className="flex gap-8 flex-row mt-4">
                                <Link href="/learn" className="flex font-koh-santepheap flex-row gap-1 bg-white/75 hover:bg-white border-white/10 border-2 transition-colors duration-300 text-zinc-800 w-fit p-2 pr-0.5 rounded-xl ml-auto">
                                    Lessons
                                    <svg className="w-5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4m0 0l-4 4m4-4H3"></path>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:flex bg-white/60 rounded-xl h-fit p-4 items-center flex-col mt-auto">
                            Get involved, send us a message on Instagram!
                            <div className="flex gap-8 flex-row mt-4">
                                <a
                                    className="flex w-fit p-2 items-center justify-center gap-2 rounded-xl transition-colors bg-white/95 hover:bg-[#ccc] border-black/20 border-2"
                                    href="https://www.instagram.com/ucsc.nets"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Image
                                        src="/instagram.svg"
                                        alt="Instagram logo"
                                        width={32}
                                        height={32}
                                    />
                                </a>
                                <a
                                    className="flex w-fit p-2 items-center justify-center gap-2 rounded-xl transition-colors bg-white/95 hover:bg-[#ccc] border-black/20 border-2"
                                    href="https://www.instagram.com/ucsc_nature"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Image
                                        src="/instagram.svg"
                                        alt="Instagram logo"
                                        width={32}
                                        height={32}
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1 lg:col-span-3 xl:col-span-4 flex flex-col p-8 gap-8 lg:gap-0">
                        <div className="w-full bg-white/30 backdrop-blur-lg rounded-xl">
                            <Gallery images={galleryImages} autoSlideInterval={7000} />
                        </div>

                        <div className="w-full bg-blu border-2 border-blu/20 backdrop-blur-lg text-neutral rounded-lg p-8 mt-0 lg:mt-auto flex flex-col min-[1474px]:flex-row">
                            Want to visit a treenet? Sign up for our next event
                            <Link href="/events" className="flex font-koh-santepheap flex-row gap-1 bg-white/75 hover:bg-white transition-colors duration-300 text-zinc-800 w-fit p-2 pr-0.5 rounded-xl ml-auto">
                                Tours
                                <svg className="w-5 h-6.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}