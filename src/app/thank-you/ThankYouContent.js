"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
      return;
    }
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router, sessionId]);

  if (!sessionId) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4">
      {/* Universe simulation background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1500&q=80"
          alt="Universe simulation background"
          fill
          className="size-full object-cover object-center opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>
      <div className="z-10 flex flex-col items-center">
        <div className="mb-6 animate-bounce">
          <svg className="size-20 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#fff" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4" />
          </svg>
        </div>
        <h1 className="mb-2 text-4xl font-extrabold text-green-200 drop-shadow-lg">Thank You!</h1>
        <p className="mb-4 max-w-md text-center text-lg text-gray-100 drop-shadow">Your support means a lot. We appreciate your generosity!<br/>You will be redirected to the homepage in a moment.</p>
        <div className="text-sm text-gray-300">If you are not redirected, <button className="text-blue-300 underline" onClick={() => router.push("/")}>click here</button>.</div>
      </div>
    </div>
  );
} 