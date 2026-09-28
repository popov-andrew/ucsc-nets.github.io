'use client';

import { useState, useEffect, useRef } from 'react';
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { EventItem } from './eventElement';
import ShaderBackground from '@/app/components/shaderBackground';

interface EventJoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventItem;
    eventImageUrl: string;
}

export default function EventJoinModal({ isOpen, onClose, event, eventImageUrl }: EventJoinModalProps) {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const watercolorUniforms = {
        u_complexity: 3.7,
        u_saturation: 1.2,
        u_twist: 1.0,
        u_light: 1.0,
        u_mix: 1.8,
        u_red: 0.09,
        u_green: 0.16,
        u_blue: 0.99,
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.dispatchEvent(new Event('modalOpen'));
        } else {
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('modalClose'));
        }

        return () => {
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('modalClose'));
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const instagramRegex = /^@?[a-zA-Z0-9._]{1,30}$/;

    const isEmailUsed = email.trim().length > 0;
    const isInstaUsed = instagram.trim().length > 0;

    const isFormValid = () => {
        if (!name.trim() || !turnstileToken) return false;
        if (!isEmailUsed && !isInstaUsed) return false;
        if (isEmailUsed && !emailRegex.test(email)) return false;
        if (isInstaUsed && !instagramRegex.test(instagram)) return false;
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsSubmitting(true);
        setStatus('idle');

        const payload = {
            action: 'join-event', // Updated route target for Event signups
            eventReference: `${event.eventName} on ${event.date} at ${event.time}`,
            name,
            instagram: instagram || "N/A",
            email: email || "N/A",
            turnstileToken
        };

        try {
            const scriptUrl = process.env.NEXT_PUBLIC_GAS_BOOKING_URL;
            if (!scriptUrl) throw new Error("Booking Server URL is not defined");

            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload),
            });

            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setTurnstileToken(null);
                turnstileRef.current?.reset();
                setName(''); setInstagram(''); setEmail('');
            }, 2000);

        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage('Failed to connect to the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClasses = "w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-md";
    const isInstagram = typeof event.host === 'string' && event.host.startsWith('@');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm  duration-200 h-dvh w-screen overflow-y-auto" onClick={onClose}>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="fixed top-7 right-7 z-60 p-2 rounded-full bg-black/10 text-neutral-50/90 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative w-full max-w-5xl my-auto bg-black/40 border border-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 text-neutral-50" onClick={(e) => e.stopPropagation()}>

                {/* Left Column: Form */}
                <div className="flex-1 w-full flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-3xl font-koh-santepheap font-black text-white tracking-tight">{event.eventName}</h2>
                        <p className="text-white/70 mt-1 text-sm lg:text-md">
                            {isInstagram ? (
                                <> Hosted by &nbsp;
                                    <a
                                        href={`https://www.instagram.com/${event.host.slice(1)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-all cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <br className="hidden lg:block xl:hidden" />{event.host}
                                    </a>
                                </>
                            ) : (
                                `Hosted by ${event.host}`
                            )}
                        </p>

                        <div className='flex lg:hidden py-4 text-lg'>
                            {event.description}
                        </div>

                        <div className="flex flex-row gap-6 pt-4 pb-2 border-b border-white/10">
                            <div className="flex items-center text-sm font-medium text-white/90">
                                <svg className="w-4 h-4 mr-2 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                {event.date}
                            </div>
                            <div className="flex items-center text-sm font-medium text-white/90">
                                <svg className="w-4 h-4 mr-2 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                {event.time}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 grow mt-2">
                        <div>
                            <label className="block font-koh-santepheap text-sm font-semibold text-white/80 mb-1.5 ml-1">Full Name <span className="text-red-400">*</span></label>
                            <input type="text" placeholder="Your Name" required className={inputBaseClasses} value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="col-span-full">
                                <label className="block font-koh-santepheap text-sm font-semibold text-white/80 ml-1">Contact Method <span className="text-white/50 font-normal">(Provide at least one)</span></label>
                            </div>
                            <div>
                                <input type="text" placeholder="Instagram (@handle)" className={inputBaseClasses} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                            </div>
                            <div>
                                <input type="email" placeholder="Email Address" className={inputBaseClasses} value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-center mt-2">
                            {siteKey && <Turnstile siteKey={siteKey} onSuccess={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken(null)} ref={turnstileRef} options={{ theme: 'dark' }} />}
                        </div>

                        <div className="mt-auto pt-4 font-koh-santepheap">
                            <button
                                type="submit"
                                disabled={!isFormValid() || isSubmitting}
                                className="relative w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/30 text-zinc-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg cursor-pointer disabled:cursor-not-allowed overflow-hidden"
                            >
                                {/* 1. Wrap the text in a relative container with a higher z-index */}
                                <span className="relative z-20">
                                    {isSubmitting ? 'Securing Spot...' : status === 'success' ? 'Confirmed!' : 'Get Notified'}
                                </span>

                                {/* 2. Absolute background layer (z-10) */}
                                <div className="absolute inset-0 w-full h-full bg-white/10 rounded-xl blur-xs z-10">
                                    {(isFormValid() || isSubmitting) && (
                                        <ShaderBackground
                                            shaderName="watercolor"
                                            uniforms={watercolorUniforms}
                                        />
                                    )}
                                </div>
                            </button>
                            {status === 'error' && <p className="text-red-400 text-sm mt-2 text-center">{errorMessage}</p>}
                        </div>
                    </form>
                </div>

                {/* Right Column: Custom Event Image */}
                <div className="flex-1 w-full rounded-2xl hidden flex-col justify-center relative overflow-hidden lg:flex bg-black/20 border border-white/10">
                    <img
                        src={eventImageUrl}
                        alt={`${event.eventName} promotional graphic`}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute w-full h-full flex items-end justify-center inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-10" >
                        <div className='mb-8 p-2 rounded-lg backdrop-blur-lg text-white'>
                            {event.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}