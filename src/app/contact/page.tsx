'use client'

import { useState } from "react";
import ContactForm from "./components/contactForm";
import Image from "next/image";
import RentPromoPage from "../components/rentPromo";

export default function ContactPage() {
    const [imgSrc, setImgSrc] = useState('/treenet-background-low.webp');
    const [isHighResLoaded, setIsHighResLoaded] = useState(false);

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
                    <div className="text-zinc-950 flex flex-col col-span-1 md:col-span-1 lg:col-span-5 mr-0 lg:mr-8 bg-white/60 rounded-lg backdrop-blur-sm">
                        <div className="flex flex-col gap-8 md:flex-row h-full mb-auto m-8">
                            <h1 className="h-fit font-koh-santepheap text-white p-8 bg-blu text-5xl w-fit rounded-lg my-auto">
                                Contact Us
                            </h1>
                            <div className="flex bg-white/60 rounded-xl p-4 m-4 items-center flex-col my-auto ml-auto">
                                Get involved, send us a message on Instagram!
                                <div className="flex gap-8 flex-row mt-2">
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
                        <div className="mx-8 w-fit border-t-2 border-black/10 pt-4 mt-8 mb-8">
                            <span className="text-lg lg:text-2xl">
                                Regarding Publicity of Locations
                            </span>
                            <p className="text-sm lg:text-lg mt-2">
                                Unfortunately, we cannot publicly disclose the locations of any treenets. Public treenets around Santa Cruz are rapidly cut down once their location becomes widely known. We spend hundreds of hours weaving each treenet, and seeing our work get destroyed overnight is devastating.
                                To preserve and extend the lifespan of our treenets, we must limit who knows where our nets are located. To reiterate, we unfortunately have to apply scrutiny over who we can trust with knowledge of any locations.
                                Currently, the best way to access our nets is by learning to weave. All large projects are reserved for advanced and hands-on classes, although intermediate projects may take students to works in progress. We plan to host tours and provide greater public access to our projects in the future.
                                <br />
                                We ask that if you find any treenets throughout your travels, please respect the weavers by keeping their locations secret.
                                Thank you,
                                Weavers of Santa Cruz
                            </p>
                        </div>

                        <div className="mt-auto m-8">
                            <ContactForm />
                        </div>
                    </div>
                    <div className="h-[calc(100dvh/3*2)] lg:h-[calc(100vh-12rem)] mt-8 lg:mt-0 col-span-1 md:col-span-1 lg:col-span-2 p-8 bg-white/60 backdrop-blur-sm rounded-lg text-zinc-950">
                        <RentPromoPage />
                    </div>
                </div>
            </main>
        </div>
    );
}