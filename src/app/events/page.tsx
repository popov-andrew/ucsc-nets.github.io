'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Gallery from "../components/gallery";
import RentPromoPage from "../components/rentPromo";
import EventElement, { EventItem } from "./components/eventElement";
import EventJoinModal from "./components/eventJoinModal";
import EventGallery from "./components/eventGallery";

const GOOGLE_SHEET_TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ--5JnLaze9dpX_Im9gVUl8FxAEr2Mv0Z-87gEetjDqTtIhMfmXIzYzY2T5hxu1XJThAqVupyVABgm/pub?gid=975355094&single=true&output=tsv";
const COLUMN_MAPPING = ['eventName', 'host', 'date', 'time', 'description', 'imageUrl'];

const parseTSV = (tsvText: string, mapping: string[]): EventItem[] => {
    const lines = tsvText.trim().split('\n');
    if (lines.length === 0 || lines[0] === '') return [];

    return lines.map((line, index) => {
        const values = line.split('\t');
        const rowObject: any = { uid: `event-${index}` };

        mapping.forEach((keyName, colIndex) => {
            rowObject[keyName] = values[colIndex]?.replace(/[\r\n]+/g, '').trim() || '';
        });

        return rowObject as EventItem;
    });
};

export default function eventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [imgSrc, setImgSrc] = useState('/treenet-background-low.webp');
    const [isHighResLoaded, setIsHighResLoaded] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [showRefresh, setShowRefresh] = useState(false);

    const fetchEvents = () => {
        setIsLoading(true);
        setShowRefresh(false);
        fetch(GOOGLE_SHEET_TSV_URL)
            .then(res => res.text())
            .then(text => setEvents(parseTSV(text, COLUMN_MAPPING)))
            .catch(err => console.error("Failed to load events", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = setTimeout(() => setShowRefresh(true), 2500);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);

    const mt1 = events.length > 1;
    const mt2 = events.length > 2;
    const buttonVisibilityClasses = 
        `${events.length > 2 ? "flex" : "hidden"} ` +
        `${events.length > 1 ? "lg:flex" : "lg:hidden"} ` +
        `${events.length > 2 ? "2xl:flex" : "2xl:hidden"}`;

    const galleryVisibilityClasses = 
        `${events.length > 2 ? "flex" : "hidden"} ` +
        `${events.length > 1 ? "lg:flex" : "lg:hidden"} ` +
        `${events.length > 2 ? "2xl:flex" : "2xl:hidden"}`;


    const galleryImages = [
        "community-weaving.webp",
        "weaving-treenet-shadow.webp",
        "weaving-lesson.webp",
  
    ]

    useEffect(() => {
        if (sessionStorage.getItem('bg-high-res-loaded')) {
            setImgSrc('/treenet-background.webp');
            setIsHighResLoaded(true);
        }
    }, []);

    return (

        <div className="relative min-h-screen lg:min-h-[calc(100vh-6.26rem)] w-full flex flex-col items-center justify-center font-sans bg-black gap-16">
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

            <main className="flex flex-col w-full lg:h-[calc(100vh-8.9rem)] z-20 -mt-32 lg:mt-0 items-center px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-7 w-full h-[calc(80vh)]">
                    <div className="flex flex-col col-span-1 md:col-span-1 lg:col-span-5 mr-0 lg:mr-8">
                        <div className="flex flex-col lg:flex-row h-2/3 lg:h-5/7 mb-8 bg-white/60 backdrop-blur-sm rounded-lg">
                            <div className="flex lg:max-w-1/2 xl:max-w-1/3 flex-col gap-8 lg:mb-0 p-8 text-zinc-900">
                                <h1 className="text-4xl font-koh-santepheap font-medium">Events at the Treenets</h1>
                                <p className="text-lg hidden lg:block">
                                    Experience the treenets of Santa Cruz while exploring coastal redwood forests. Poise through a canopy of unique species, endemic to the Zayante soils of the Santa Cruz Mountains. Find equanimity through elevation; replenish your soul.
                                </p>
                                <p className="text-lg block lg:hidden">
                                    Experience the treenets of Santa Cruz while exploring coastal redwood forests. Find equanimity through elevation; replenish your soul.
                                </p>
                            </div>
                            <div className="flex lg:ml-auto pt-0 pb-8 lg:pt-8 px-8 lg:px-0 lg:pr-8  mx-auto">
                                <Gallery images={galleryImages} autoSlideInterval={7000} />
                            </div>
                        </div>
                        <div className="lg:h-1/3 flex flex-col lg:flex-row w-full p-4 gap-4 mb-8 lg:mb-0 rounded-lg bg-white/60 backdrop-blur-sm text-zinc-950">
                            <div className="flex flex-col gap-2 lg:mt-4 m-4 justify-center text-center">
                                <h2 className="text-4xl font-koh-santepheap lg:text-2xl font-medium">
                                    TOURS & EVENTS
                                </h2>
                                <h3 className="text-5xl lg:text-4xl font-qwitcher-grypen font-semibold">
                                    Tap In
                                </h3>
                            </div>
                            <div className="w-full flex flex-col lg:flex-row justify-center gap-4 rounded-lg text-zinc-950 bg-blu p-4 min-h-37.5 lg:max-h-50">
                                {isLoading ? (
                                    <div className="flex w-full h-full flex-col lg:flex-row gap-2">
                                        <div className="grow flex items-center justify-center bg-white/40 animate-pulse rounded-lg text-zinc-800 font-medium text-xl">
                                            Loading Events...
                                        </div>
                                        {showRefresh && (
                                            <button 
                                                onClick={fetchEvents} 
                                                className="w-full lg:w-30 bg-white/60 font-medium hover:brightness-115 transition-all duration-300 rounded-lg text-center flex flex-col text-xl justify-center items-center p-4 cursor-pointer"
                                            >
                                                Refresh
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mt-2">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {events[0] && (
                                            <div className="grow lg:w-full 2xl:w-75 lg:h-full rounded-lg">
                                                <EventElement item={events[0]} onJoinClick={() => { setSelectedEvent(events[0]); setIsModalOpen(true); }} />
                                            </div>
                                        )}

                                        {events[1] && (
                                            <div className="grow h-full rounded-lg block lg:hidden 2xl:block">
                                                <EventElement item={events[1]} onJoinClick={() => { setSelectedEvent(events[1]); setIsModalOpen(true); }} />
                                            </div>
                                        )}

                                        <Link href="#events" className={`w-full lg:w-30 h-full bg-white/60 font-medium hover:brightness-115 transition-all duration-300 rounded-lg text-center flex-col text-xl justify-center items-center align-center ${buttonVisibilityClasses}`}>
                                            View All Events
                                            <svg
                                                xmlns="http://w3.org"
                                                fill="none"
                                                viewBox="0 0 48 20"
                                                strokeWidth={1}
                                                stroke="currentColor"
                                                className="w-20 h-10 mt-2"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m31 4.25-7.5 7.5-7.5-7.5" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m31 6.50-7.5 7.5-7.5-7.5" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m31 8.75-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="h-[calc(100dvh/3*2)] lg:h-[calc(100vh-12rem)] col-span-1 md:col-span-1 lg:col-span-2 p-8 bg-white/60 backdrop-blur-sm rounded-lg text-zinc-950">
                        <RentPromoPage />
                    </div>

                    <div id="events" className={`pb-16 lg:col-span-7 w-full justify-center mt-8 ${galleryVisibilityClasses}`}>
                        <EventGallery
                            events={events}
                            onEventSelect={(event) => { setSelectedEvent(event); setIsModalOpen(true); }}
                        />
                    </div>
                </div>
            </main>



            {selectedEvent && (
                <EventJoinModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    event={selectedEvent}
                    eventImageUrl={selectedEvent.imageUrl || '/default-event-bg.jpg'}
                />
            )}
        </div>
    );
}