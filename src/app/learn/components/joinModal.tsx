'use client';

import { useState, useEffect, useRef } from 'react';
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import LessonElement, { LessonItem } from './lessonElement';
import ShaderBackground from '@/app/components/shaderBackground';

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessons: LessonItem[];
    columnMapping: string[];
    initialLessonUid?: string;
}

export default function JoinModal({ isOpen, onClose, lessons, columnMapping, initialLessonUid }: JoinModalProps) {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Form State
    const [selectedLessonUid, setSelectedLessonUid] = useState<string>('');
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

            if (initialLessonUid) {
                setSelectedLessonUid(initialLessonUid);
            } else if (lessons.length > 0 && !selectedLessonUid) {
                setSelectedLessonUid(lessons[0].uid);
            }
        } else {
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('modalClose'));
        }

        return () => {
            document.body.style.overflow = '';
            window.dispatchEvent(new Event('modalClose'));
        };
    }, [isOpen, initialLessonUid, lessons, selectedLessonUid]);

    if (!isOpen) return null;

    if (!siteKey) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
                <p className="text-red-500 bg-white p-4 rounded-xl">System configuration error: Missing security key.</p>
            </div>
        );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const instagramRegex = /^@?[a-zA-Z0-9._]{1,30}$/;

    const isEmailUsed = email.trim().length > 0;
    const isInstaUsed = instagram.trim().length > 0;

    const isFormValid = () => {
        if (!selectedLessonUid || !name.trim() || !turnstileToken) return false;
        if (!isEmailUsed && !isInstaUsed) return false;
        if (isEmailUsed && !emailRegex.test(email)) return false;
        if (isInstaUsed && !instagramRegex.test(instagram)) return false;
        return true;
    };

    const selectedLesson = lessons.find(l => l.uid === selectedLessonUid);
    const [typeKey, instaKey, dateKey, timeKey] = columnMapping;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid() || !selectedLesson) return;

        setIsSubmitting(true);
        setStatus('idle');

        const payload = {
            action: 'join',
            lessonReference: `${selectedLesson[typeKey]} on ${selectedLesson[dateKey]} at ${selectedLesson[timeKey]}`,
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
                if (lessons.length > 0) setSelectedLessonUid(lessons[0].uid);
            }, 2000);

        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage('Failed to connect to the server. Please try again.');
            setTurnstileToken(null);
            turnstileRef.current?.reset();
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClasses = "w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-md";

    const PreviewCard = (
        <div className="pointer-events-none w-full">
            {selectedLesson ? (
                <LessonElement item={selectedLesson} columnMapping={columnMapping} />
            ) : (
                <p className="text-center text-gray-500">No lesson selected.</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200 h-dvh w-screen overflow-y-auto" onClick={onClose}>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="fixed top-7 right-7 z-60 p-2 rounded-full bg-black/10 text-neutral-50/90 hover:bg-black/70 hover:text-white backdrop-blur-md transition-all hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="relative w-full max-w-5xl my-auto bg-black/40 border border-white/20 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 text-neutral-50" onClick={(e) => e.stopPropagation()}>

                <div className="flex-1 w-full flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-3xl font-koh-santepheap font-black text-white tracking-tight">Join a Lesson</h2>
                        <p className="text-white/70 mt-1">Select an upcoming lesson to attend.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 grow">

                        <div>
                            <label className="block font-koh-santepheap text-sm font-semibold text-white/80 mb-1.5 ml-1">Select Lesson</label>
                            <select
                                className={`${inputBaseClasses} appearance-none cursor-pointer`}
                                value={selectedLessonUid}
                                onChange={(e) => setSelectedLessonUid(e.target.value)}
                            >
                                {lessons.map((lesson) => (
                                    <option key={lesson.uid} value={lesson.uid} className="bg-gray-900 text-white">
                                        {lesson[typeKey]} &ndash; {lesson[dateKey]} @ {lesson[timeKey]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-koh-santepheap text-sm font-semibold text-white/80 mb-1.5 ml-1">Full Name <span className="text-red-400">*</span></label>
                            <input type="text" placeholder="Your Name" required className={inputBaseClasses} value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-white/10 pt-5 mt-2">
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

                        <div className="relative lg:hidden rounded-2xl flex items-center justify-center">
                            <div className="absolute inset-0 w-full h-full bg-white/10 rounded-2xl blur-xs">
                                <ShaderBackground
                                    shaderName="watercolor"
                                    uniforms={watercolorUniforms}
                                />
                            </div>
                            <div className='relative w-full h-full px-4 py-6'>
                                <p className="text-md font-bold text-zinc-950 uppercase tracking-widest text-center pb-2">Selected Lesson</p>
                                {PreviewCard}
                                <p className="text-xs font-bold text-zinc-950 uppercase tracking-widest mt-2 text-center">You will be notified in advance by your instructor</p>
                            </div>
                        </div>

                        <div className="flex justify-center mt-2">
                            <Turnstile siteKey={siteKey} onSuccess={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken(null)} ref={turnstileRef} options={{ theme: 'dark' }} />
                        </div>

                        <div className="mt-auto pt-4 font-koh-santepheap">
                            <button
                                type="submit"
                                disabled={!isFormValid() || isSubmitting}
                                className="relative w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg cursor-pointer disabled:cursor-not-allowed overflow-hidden"
                            >
                                {/* Text layered on top */}
                                <span className="relative z-20">
                                    {isSubmitting ? 'Securing Spot...' : status === 'success' ? 'Confirmed!' : 'Join Lesson'}
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

                <div className="flex-1 w-full rounded-2xl p-6 hidden flex-col justify-center relative overflow-hidden lg:flex">
                    <div className="absolute inset-0 w-full h-full bg-white/10 rounded-2xl blur-xs">
                        <ShaderBackground
                            shaderName="watercolor"
                            uniforms={watercolorUniforms}
                        />
                    </div>
                    <div className="relative z-10 w-full">
                        <h3 className="text-zinc-950 font-koh-santepheap text-xl font-bold uppercase tracking-widest mb-4 text-center">Selected Lesson</h3>
                        {PreviewCard}
                        <h3 className="text-xs font-bold font-koh-santepheap text-zinc-950 uppercase tracking-widest mt-2 text-center">You will be notified in advance by your instructor</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}