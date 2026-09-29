'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import ShaderBackground from './shaderBackground';

// Desktop & Root Navigation Links[cite: 2]
const navLinks = [
    { href: '/', label: 'Home', desktop: 'Home' },
    { href: '/learn', label: 'Lessons', desktop: 'Free Lessons' },
    { href: '/events', label: 'Events', desktop: 'Events' },
    { href: '/contact', label: 'Contact', desktop: 'Contact' },
];

const mobileBoxes = [
    { href: '/learn', label: 'Lessons', bg: '/images/weaving-lesson.webp' },
    { href: '/events', label: 'Events', bg: '/images/community-weaving.webp' },
    { href: '/contact', label: 'Contact', bg: '/images/secluded-levitation.webp' }
];

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isModalActive, setIsModalActive] = useState(false);
    const pathname = usePathname();
    const lastScrollY = useRef(0);
    const headerHeight = 96;

    const watercolorUniforms = {
        u_complexity: 3.7,
        u_saturation: 1.2,
        u_twist: 8.0,
        u_light: 1.0,
        u_mix: 1.8,
        u_red: 0.09,
        u_green: 0.16,
        u_blue: 0.99,
    };

    const displayedMobileLinks = mobileBoxes
        .filter(link => link.href !== pathname)
        .slice(0, 3);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            setIsScrolled(currentScrollY > headerHeight);

            if (isOpen && Math.abs(currentScrollY - lastScrollY.current) > 5) {
                setIsOpen(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isOpen]);

    useEffect(() => {
        const isMobile = window.innerWidth < 856;

        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleModalOpen = () => {
            setIsModalActive(true);
            setIsOpen(false); // Ensure the mobile menu closes if a modal is triggered
        };
        const handleModalClose = () => setIsModalActive(false);

        window.addEventListener('modalOpen', handleModalOpen);
        window.addEventListener('modalClose', handleModalClose);

        return () => {
            window.removeEventListener('modalOpen', handleModalOpen);
            window.removeEventListener('modalClose', handleModalClose);
        };
    }, []);

    const DesktopHeaderContent = (
        <>
            <div className="flex items-center gap-4 text-black">
                <div className="w-12 h-12 object-cover object-center bg-black rounded-full flex items-center justify-center border-black/30 border-6 shadow-inner">
                    <img
                        src={"https://ucsctree.net/logo.svg"}
                        alt="Company Logo"
                        className="w-12 h-12 rounded-full object-fit absolute"
                    />
                </div>
                <span className="hidden lg:flex text-[clamp(1rem,2.5vi,2.2rem)] font-medium font-koh-santepheap tracking-wide font-inter w-fit">Treenets at University of California, Santa Cruz</span>
                <span className="flex lg:hidden text-2xl font-medium font-koh-santepheap tracking-wide font-inter w-fit">Treenets at UCSC</span>
            </div>

            <nav className='flex items-center gap-8 text-neutral-850 font-semibold transition mr-16 text-xl'>
                {navLinks.map((link) => {
                    if (pathname === link.href) return null;

                    const colorMap: Record<string, string> = {
                        "/learn": 'bg-slug text-zinc-950 font-medium min-w-35',
                        "/events": 'bg-blu text-neutral-50 font-medium',
                        "/": "bg-black/66 hover:bg-black/75 text-neutral-50 font-medium"
                    };

                    const bgColor = colorMap[link.href] || 'bg-black/66 hover:bg-black/75 duration-300 font-medium text-neutral-50 min-w-19';

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={`${bgColor} p-2 rounded-lg -mx-1 font-semibold hover:-translate-y-px transition-all duration-200 max-w-full`}
                        >
                            {link.desktop}
                        </Link>
                    );
                })}
            </nav>
        </>
    );

    return (
        <>
            {/* STATIC IN-PAGE DESKTOP HEADER*/}
            <div className="hidden min-[856px]:flex w-full h-24 bg-white/60 backdrop-blur-xl border-b border-black/40 items-center justify-between px-10 relative z-30">
                {DesktopHeaderContent}
            </div>

            {/* STATIC IN-PAGE MOBILE HEADER */}
            <div className="flex min-[856px]:hidden w-full h-24 bg-white/60 backdrop-blur-xl px-6 items-center gap-4 text-black relative z-30">
                <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl shrink-0">
                    <img
                        src={"https://ucsctree.net/logo.svg"}
                        alt="Company Logo"
                        className="w-12 h-12 rounded-full object-cover"
                    />
                </div>
                <span className="text-[clamp(1rem,6vi,2.2rem)] font-koh-santepheap sm:tracking-wide text-shadow-sm font-inter font-medium flex flex-row gap-2 sm:gap-3">
                    <p>Treenets at</p>
                    <p className=' tracking-tight'>
                        UCSC
                    </p>
                </span>
            </div>

            {/* UNIVERSAL FLOATING TOGGLE BUTTON*/}
            <button
                className={`rounded-lg fixed p-2 text-black right-6 top-6 bg-neutral-50/70 hover:bg-neutral-50/90 duration-300 backdrop-blur-md border border-black/20 shadow-xl transition-all z-60 ${isModalActive
                    ? 'opacity-0 invisible pointer-events-none'
                    : isScrolled
                        ? 'opacity-100 visible'
                        : 'max-[855px]:opacity-100 max-[855px]:visible min-[856px]:opacity-0 min-[856px]:invisible min-[856px]:pointer-events-none'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close Menu" : "Open Menu"}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className='w-8 h-8'>
                        <path strokeLinecap='round' strokeLinejoin='round' d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                )}
            </button>

            {/* SLIDING DESKTOP DROPDOWN HEADER*/}
            <div
                className={`hidden min-[856px]:flex fixed top-0 left-0 w-full h-24 z-50 bg-white/60 backdrop-blur-xl border-b border-black/40 items-center justify-between px-10 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen && isScrolled ? 'translate-y-0' : '-translate-y-full'}`}
            >
                {DesktopHeaderContent}
            </div>

            {/* MOBILE POPUP MENU OVERLAY*/}
            {isOpen && (
                <div
                    className='min-[856px]:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-200 h-dvh w-screen overscroll-contain'
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className='relative bg-white/60 border border-white/20 backdrop-blur-xl shadow-2xl rounded-3xl p-6 flex flex-col items-center text-neutral-50 w-full max-w-sm gap-4'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <nav className='flex font-koh-santepheap flex-col items-center gap-4 w-full'>
                            {displayedMobileLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className='relative w-full h-40 rounded-2xl overflow-hidden group shadow-lg border border-white/10'
                                >
                                    <img
                                        src={link.bg}
                                        alt={link.label}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-inter font-bold tracking-normal text-white drop-shadow-md">
                                            {link.label}
                                        </span>
                                    </div>

                                    {/* {NEW banner} */}
                                    {link.label === "Events" && (
                                        <div className="absolute top-0 right-0 pointer-events-none">
                                            <svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://w3.org" role="img" aria-label="Corner Top Right ribbon: NEW" className="w-40 h-40">
                                                <g>
                                                    <g transform="translate(172.8 67.2) rotate(45)">
                                                        <rect x="-156" y="-21.6" width="312" height="43.2" fill="#6d89c2" />
                                                        <text x="0" y="2" textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-hurricane), cursive" fontWeight="400" fontSize="40" fill="#ffffff">New</text>
                                                    </g>
                                                </g>
                                            </svg>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        {/* Dynamic return/home link */}
                        {pathname === '/' ? (
                            <>
                            </>
                        ) : (
                            <Link
                                href="/"
                                onClick={() => setIsOpen(false)}
                                className="relative w-full flex flex-row items-center justify-center gap-3 py-4 mt-2 rounded-2xl bg-white/10 hover:bg-white backdrop-blur-md border border-white/10 transition-all shadow-inner text-white"
                            >

                                <div className="absolute inset-0 w-full h-full bg-white/10 rounded-xl blur-xs z-10">
                                    <ShaderBackground
                                        shaderName="watercolor"
                                        uniforms={watercolorUniforms}
                                    />
                                </div>

                                <div className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center border border-white/10">
                                    <img
                                        src={"https://ucsctree.net/logo.svg"}
                                        alt="Company Logo"
                                        className="w-8 h-8 rounded-full object-cover absolute z-30"
                                    />
                                </div>

                                
                                <span className="text-zinc-950 text-lg font-semibold font-koh-santepheap tracking-wide text-shadow-sm z-30">Treenets at UCSC</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}