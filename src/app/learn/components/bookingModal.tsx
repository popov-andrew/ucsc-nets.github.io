'use client';

import { useState, useEffect, useRef } from 'react';
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import LessonElement, { LessonItem } from './lessonElement';
import ShaderBackground from '@/app/components/shaderBackground';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
    // Turnstile Ref & State
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Form State
    const [type, setType] = useState('Intro');
    const [instagram, setInstagram] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Submission State
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

    // Lock scrolling when modal is open
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

    if (!siteKey) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs">
                <p className="text-red-500 bg-white p-4 rounded-xl">System configuration error: Missing security key.</p>
            </div>
        );
    }

    // REGEX Patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Instagram allows max 30 chars containing letters, numbers, periods, underscores. (Optional @ at start)
    const instagramRegex = /^@?[a-zA-Z0-9._]{1,30}$/;

    const isEmailUsed = email.trim().length > 0;
    const isInstaUsed = instagram.trim().length > 0;

    // Validation Logic
    const isFormValid = () => {
        // 1. Check base required fields & security token
        if (!date || !time || !type || !turnstileToken) return false;

        // 2. Must provide at least one contact method
        if (!isEmailUsed && !isInstaUsed) return false;

        // 3. Validate provided contact methods against Regex
        if (isEmailUsed && !emailRegex.test(email)) return false;
        if (isInstaUsed && !instagramRegex.test(instagram)) return false;

        // 4. If email is used, Name is strictly required
        if (isEmailUsed && !name.trim()) return false;

        return true;
    };

    const previewItem: LessonItem = {
        uid: 'preview-01',
        typeKey: type,
        contactKey: 'TBD',
        dateKey: date || 'Select Date',
        timeKey: time || 'Select Time',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsSubmitting(true);
        setStatus('idle');

        const payload = {
            type,
            instagram,
            email,
            name: isEmailUsed ? name : "N/A", // Always send a string to GAS
            date,
            time,
            turnstileToken
        };

        try {
            const scriptUrl = process.env.NEXT_PUBLIC_GAS_BOOKING_URL;
            if (!scriptUrl) throw new Error("Booking Server URL is not defined");

            await fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors', // Bypasses CORS policy for GAS 
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload),
            });

            // Because 'no-cors' provides an opaque response, we assume success if no network error occurred
            setStatus('success');

            // Reset form after 2 seconds and close
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setTurnstileToken(null);
                turnstileRef.current?.reset();
                // Reset fields
                setType('Intro'); setInstagram(''); setEmail(''); setName(''); setDate(''); setTime('');
            }, 2000);

        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage('Failed to connect to the booking server. Please try again.');
            setTurnstileToken(null);
            turnstileRef.current?.reset();
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClasses = "w-full bg-zinc-950/10 hover:bg-zinc-950/15 focus:bg-zinc-950/20 border border-zinc-950/20 rounded-xl px-4 py-3 bg-zinc-950 placeholder-bg-zinc-950/50 focus:outline-none focus:ring-2 focus:ring-zinc-950/30 transition-all backdrop-blur-md";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-in fade-in duration-200 h-dvh w-screen overflow-y-auto" onClick={onClose}>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="fixed top-7 right-7 z-60 p-2 rounded-full bg-black/10 text-neutral-50/90 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative w-full max-w-5xl my-auto bg-white/60 border border-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 text-zinc-950" onClick={(e) => e.stopPropagation()}>

                {/* LEFT COLUMN: Form */}
                <div className="flex-1 w-full flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-3xl font-koh-santepheap font-black text-zinc-950 tracking-tight">Request a Lesson</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 grow">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block font-koh-santepheap text-sm font-semibold text-text-zinc-950/80 mb-1.5 ml-1">Lesson Type</label>
                                <select className={`${inputBaseClasses} appearance-none cursor-pointer`} value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="Intro" className="bg-gray-900">Intro to Weaving</option>
                                    <option value="Intermediate" className="bg-gray-900">Intermediate Knots</option>
                                    <option value="Advanced" className="bg-gray-900">Advanced Structures</option>
                                    <option value="Hands" className="bg-gray-900">Hands-on Weaving</option>
                                    <option value="Height" className="bg-gray-900">Weaving at Height</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-koh-santepheap text-sm font-semibold text-text-zinc-950/80 mb-1.5 ml-1">Instagram Handle</label>
                                <input type="text" placeholder="@yourhandle" className={inputBaseClasses} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-koh-santepheap font-semibold text-text-zinc-950/80 mb-1.5 ml-1">Email Address <span className="text-text-zinc-700 font-normal">(Instagram Alternative)</span></label>
                            <input type="email" placeholder="hello@example.com" className={inputBaseClasses} value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        {isEmailUsed && (
                            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                                <label className="block font-koh-santepheap text-sm font-semibold text-text-zinc-950/80 mb-1.5 ml-1">Full Name <span className="text-red-400">*</span></label>
                                <input type="text" placeholder="Required for email bookings" required={isEmailUsed} className={`${inputBaseClasses} border-indigo-400/50 bg-indigo-500/10`} value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-koh-santepheap font-semibold text-text-zinc-950/80 mb-1.5 ml-1">Date</label>
                                <input type="date" className={`color-scheme-dark ${inputBaseClasses}`} style={{ colorScheme: 'dark' }} value={date} onChange={(e) => setDate(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-koh-santepheap font-semibold text-text-zinc-950/80 mb-1.5 ml-1">Start Time</label>
                                <input type="time" className={`color-scheme-dark ${inputBaseClasses}`} style={{ colorScheme: 'dark' }} value={time} onChange={(e) => setTime(e.target.value)} required />
                            </div>
                        </div>

                        <div className="flex-1 w-full rounded-2xl p-6 flex flex-row justify-center relative overflow-hidden lg:hidden">
                            <div className="absolute inset-0 w-full h-full bg-white/10 rounded-2xl blur-xs">
                                <ShaderBackground
                                    shaderName="watercolor"
                                    uniforms={watercolorUniforms}
                                />
                            </div>

                            <div className="relative z-10 w-full">
                                <div className="pointer-events-none">
                                    <LessonElement item={previewItem} columnMapping={['typeKey', 'contactKey', 'dateKey', 'timeKey']} />
                                    <h3 className="text-zinc-950 text-sm font-bold uppercase tracking-widest mt-4 text-center">We will try our best to accommodate your availability</h3>
                                </div>
                            </div>
                        </div>

                        {/* Cloudflare Turnstile Integration */}
                        <div className="flex justify-center mt-2">
                            <Turnstile
                                siteKey={siteKey}
                                onSuccess={(token) => setTurnstileToken(token)}
                                onExpire={() => setTurnstileToken(null)}
                                ref={turnstileRef}
                                options={{ theme: 'dark' }}
                            />
                        </div>

                        <div className="mt-auto pt-4 font-koh-santepheap">
                            <button
                                type="submit"
                                disabled={!isFormValid() || isSubmitting}
                                className="relative w-full bg-transparent hover:bg-white disabled:bg-white/10 disabled:text-zinc-950/30 text-zinc-950 disabled:font-bold font-extrabold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg cursor-pointer disabled:cursor-not-allowed overflow-hidden"
                            >
                                {/* Text layered on top */}
                                <span className="relative z-20">
                                    {isSubmitting ? 'Securing Booking...' : status === 'success' ? 'Request Confirmed!' : 'Request Lesson'}
                                </span>

                                {/* Absolute background layer */}
                                <div className="absolute inset-0 w-full h-full bg-white/10 rounded-xl blur-xs z-10 pointer-events-none">
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

                {/* RIGHT COLUMN: Preview */}
                <div className="flex-1 w-full rounded-2xl p-6 hidden flex-col justify-center relative overflow-hidden lg:flex">
                    <div className="absolute inset-0 w-full h-full bg-white/10 rounded-2xl blur-xs">
                        <ShaderBackground
                            shaderName="watercolor"
                            uniforms={watercolorUniforms}
                        />
                    </div>

                    <div className="relative z-10 w-full">
                        <div className="pointer-events-none">
                            <LessonElement item={previewItem} columnMapping={['typeKey', 'contactKey', 'dateKey', 'timeKey']} />
                            <h3 className="text-zinc-950 font-koh-santepheap text-sm font-bold uppercase tracking-widest mt-4 text-center">We will try our best to accommodate your availability</h3>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}