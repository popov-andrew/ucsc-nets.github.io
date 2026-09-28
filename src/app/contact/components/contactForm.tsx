"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

interface FormStatus {
  message: string;
  type: "idle" | "success" | "error";
  timestamp?: number;
}

export default function ContactForm() {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
    // Safe Environment Variable check
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey) {
        return <p style={{ color: "red" }}>System configuration error: Missing security key.</p>;
    }

  // Modern React Action handler (Replaces onSubmit and FormEvent)
    const [state, formAction, isPending] = useActionState(
        async (prevState: FormStatus, formData: FormData): Promise<FormStatus> => {
            
            const currentToken = formData.get("turnstileToken") as string;
            if (!currentToken) {
                return { message: "Please wait for the security check to complete.", type: "error" };
            }

            const email = formData.get("email") as string;
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(email)) {
                return { message: "Please enter a valid email address.", type: "error", timestamp: Date.now() };
            }

            // Extract natively from FormData rather than using controlled state
            const payload = {
                name: formData.get("name") as string,
                email: email,
                message: formData.get("message") as string,
                turnstileToken: currentToken, //
            };

            try {
                const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
                if (!workerUrl) throw new Error("Worker URL is not defined");

                const response = await fetch(workerUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    document.querySelector("form")?.reset();
                    return { message: "Sent", type: "success" } as FormStatus
                } else {
                    // SECURITY FIX: Do not expose response.text() directly to the client UI
                    console.error("Server rejected the submission. Status:", response.status);
                    return { message: "There was a problem sending your message. Please try again.", type: "error" };
                }
            } catch (error) {
                console.error("Fetch error:", error);
                return { message: "Network error. Please check your connection.", type: "error" };
            } finally {
                setTurnstileToken(null);
                turnstileRef.current?.reset();
            }
        },
        { message: "", type: "idle" } as FormStatus
    );

    useEffect(() => {
        if (state.type === "success") {
            document.querySelector("form")?.reset();
        }
    }, [state]);

    return (
        <div className="z-50 bg-black/30 backdrop-blur-sm border-y border-white/20">
            <form action={formAction} className="flex-col mb-4 p-4 pb-0 text-3xl">
                <input type="hidden" name="turnstileToken" value={turnstileToken || ""} />
                
                <div className="grid-cols-2 gap-8 flex font-koh-santepheap">
                    <div className="max-w-60">
                        <input
                            placeholder="Name"
                            id="name"
                            name="name" // Required for FormData
                            type="text"
                            required
                            maxLength={100}
                            className="w-full text-lg sm:text-xl p-1 pl-3 placeholder:text-white placeholder:font-medium border-white/30 border bg-black/30 rounded-xs"
                        />
                    </div>

                    <div className="grow">
                        <input
                            placeholder="Email"
                            id="email"
                            name="email" // Required for FormData
                            type="email"
                            required
                            maxLength={100}
                            pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                            title="Please enter a valid email address (e.g., name@domain.com)"
                            className="w-full text-lg sm:text-xl p-1 pl-3 placeholder:text-white placeholder:font-medium border-white/30 border bg-black/30 rounded-xs"
                        />
                    </div>
                </div>
                
                <div className="my-6">
                    <textarea
                        placeholder="Message"
                        id="message"
                        name="message" // Required for FormData
                        required
                        rows={5}
                        maxLength={5000}
                        className="w-full text-lg sm:text-xl p-3 placeholder:text-white placeholder:font-medium border-white/30 border bg-black/30 rounded-xs h-20 max-h-40"
                    />
                </div>

                <div className="flex flex-col lg:flex-row grid-cols1 lg:grid-cols-2 justify-center md:justify-start gap-4 sm:gap-8">
                    <div>
                        <Turnstile
                            siteKey={siteKey}
                            onSuccess={(token) => setTurnstileToken(token)}
                            onExpire={() => setTurnstileToken(null)}
                            ref={turnstileRef}
                            className="-ml-3.25 lg:ml-0"
                        />
                    </div>
                    
                    <button 
                        className="text-zinc-100 hover:text-white font-koh-santepheap hover:scale-105 transition-all duration-200 bg-black/30 px-4 h-17 rounded-xl backdrop-blur-lg border border-white/30"
                        type="submit" 
                        disabled={isPending || !turnstileToken}
                        hidden={isPending || !turnstileToken}
                        style={{cursor: (isPending || !turnstileToken) ? "not-allowed" : "pointer" }}
                    >
                        {isPending ? "Sending..." : "Send"}
                    </button>

                    <div className="font-livvic">
                        {state.type !== "idle" && (
                            <p style={{ color: state.type === "success" ? "green" : "red" }}>
                                {state.message}
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );    
}