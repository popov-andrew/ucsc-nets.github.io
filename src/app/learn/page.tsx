'use client'

import Image from "next/image";
import Link from "next/link";
import Gallery from "../components/gallery";
import { useEffect, useState } from "react";
import { LessonItem } from "./components/lessonElement";
import LessonGallery from "./components/lessonGallery";
import BookingModal from "./components/bookingModal";
import JoinModal from "./components/joinModal";

const parseTSV = (tsvText: string, columnMapping: string[]): LessonItem[] => {
    const lines = tsvText.trim().split('\n');
    if (lines.length === 0 || lines[0] === '') return [];
    return lines.map((line, index) => {
        const values = line.split('\t');
        const rowObject: Partial<LessonItem> = { uid: `row-${index}` };
        columnMapping.forEach((keyName, colIndex) => {
            rowObject[keyName] = values[colIndex]?.replace(/[\r\n]+/g, '').trim() || '';
        });
        return rowObject as LessonItem;
    });
};

export default function LearnPage() {

    const galleryImages = [
        "treenet-weaving.webp",
        "weaving-lesson.webp",
        "community-weaving.webp"
    ]

    const [imgSrc, setImgSrc] = useState('/treenet-background-low.webp');
    const [isHighResLoaded, setIsHighResLoaded] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [lessonsData, setLessonsData] = useState<LessonItem[]>([]);
    const [selectedLessonUid, setSelectedLessonUid] = useState<string>('');

    const GOOGLE_SHEET_TSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ--5JnLaze9dpX_Im9gVUl8FxAEr2Mv0Z-87gEetjDqTtIhMfmXIzYzY2T5hxu1XJThAqVupyVABgm/pub?gid=1964891158&single=true&output=tsv";
    const COLUMN_MAPPING = ['type', 'instagram', 'date', 'time'];

    useEffect(() => {
        fetch(GOOGLE_SHEET_TSV_URL)
            .then(res => res.text())
            .then(text => setLessonsData(parseTSV(text, COLUMN_MAPPING)))
            .catch(err => console.error("Failed to load lessons", err));
    }, []);

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

            <main className="flex flex-col w-full lg:h-[calc(100vh-8.9rem)] z-20 mt-auto lg:my-12 items-center">
                <div className="m-8 flex flex-col lg:flex-row bg-white/60 backdrop-blur-md rounded-xl text-xl max-w-357">
                    <div className="flex flex-col gap-8 p-8 h-full lg:max-w-90 xl:max-w-2/5 shrink-0 text-zinc-900">
                        <h1 className="font-koh-santepheap text-2xl lg:text-4xl font-medium">
                            Learn how to weave treenets
                        </h1>
                        <p>
                            Take part in hands-on learn experiences. From basic knots to intricate patterns, we have the right lesson for you.
                        </p>
                        <p className="lg:mt-auto text-md lg:text-lg">
                            Join an existing lesson or request a time that works for you.
                        </p>
                        <div className="flex flex-row justify-center gap-8 font-koh-santepheap text-xl lg:text-xl xl:text-2xl">
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="flex flex-row gap-1 bg-zinc-950 hover:bg-zinc-950/80 transition-colors duration-300 text-zinc-50 w-fit p-2 xl:p-3 pr-0.5 rounded-xl">
                                Join a Lesson
                                <svg className="w-10 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex flex-row gap-1 bg-zinc-950 hover:bg-zinc-950/80 transition-colors duration-300 text-zinc-50 w-fit p-2 xl:p-3 pr-0.5 rounded-xl">
                                Request a Time
                                <svg className="w-10 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8l4 4m0 0l-4 4m4-4H3"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="lg:ml-auto lg:max-w-200 rounded-xl p-8">
                        <Gallery images={galleryImages} autoSlideInterval={7000} />
                    </div>
                </div>
                <div className="m-4 sm:m-8 lg:ml-0 grow p-8 pb-16">
                    <LessonGallery
                        sheetUrl={GOOGLE_SHEET_TSV_URL}
                        columnMapping={COLUMN_MAPPING}
                        onLessonSelect={(uid) => {
                            setSelectedLessonUid(uid);
                            setIsJoinModalOpen(true);
                        }}
                    />
                </div>
            </main>

            <BookingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />

            <JoinModal 
                isOpen={isJoinModalOpen} 
                onClose={() => setIsJoinModalOpen(false)} 
                lessons={lessonsData} 
                columnMapping={COLUMN_MAPPING}
                initialLessonUid={selectedLessonUid} 
            />
        </div>
    );
}