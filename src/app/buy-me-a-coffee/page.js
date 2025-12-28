"use client";
import Image from "next/image";
import { useState } from "react";

export default function BuyMeACoffee() {
  const [amount, setAmount] = useState(2);
  const [custom, setCustom] = useState("");

  const handleSelect = (value) => {
    setAmount(value);
    setCustom("");
  };

  const handleCustom = (e) => {
    setCustom(e.target.value);
    setAmount(Number(e.target.value) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4">
      {/* Universe background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1500&q=80"
          alt="Universe background"
          fill
          className="size-full object-cover object-center opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>
      <h1 className="z-10 mb-6 flex items-center gap-2 text-3xl font-bold text-gray-100">
        Buy Me a Coffee <span role="img" aria-label="coffee">☕</span>
      </h1>
      <form onSubmit={handleSubmit} className="z-10 w-full max-w-sm space-y-4 rounded-xl border border-gray-200 bg-white/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => handleSelect(2)} className={`rounded border px-4 py-2 font-semibold text-gray-900 transition ${amount===2 ? 'bg-yellow-300' : 'bg-gray-100 hover:bg-yellow-200'}`}>Coffee (€2)</button>
          <button type="button" onClick={() => handleSelect(7)} className={`rounded border px-4 py-2 font-semibold text-gray-900 transition ${amount===7 ? 'bg-yellow-300' : 'bg-gray-100 hover:bg-yellow-200'}`}>Guinness Pint (€7)</button>
          <input type="number" min="1" placeholder="Custom amount" value={custom} onChange={handleCustom} className="rounded border bg-gray-200 px-4 py-2 text-gray-900 focus:bg-white focus:outline-accent1" />
        </div>
        <button type="submit" className="w-full rounded bg-yellow-400 py-2 font-semibold text-black shadow transition hover:bg-yellow-500">
          Proceed to Payment
        </button>
      </form>
    </div>
  );
} 