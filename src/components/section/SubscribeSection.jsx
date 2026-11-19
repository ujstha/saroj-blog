"use client";

import { useTranslation } from "@/utils/useTranslation";
import emailjs from "@emailjs/browser";
import { useState } from "react";
import { toast } from "react-toastify";
import { Container } from "../ui";

export const SubscribeSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        e.target,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          toast.success(t("subscribe.success"));
          setLoading(false);
        },
        () => {
          toast.error(t("subscribe.error"));
          setLoading(false);
        }
      );
    setEmail("");
  };

  return (
    <Container className="mb-16 mt-4 max-w-5xl">
      <div className="border-primary/10 relative overflow-hidden rounded-[30px] border bg-[linear-gradient(135deg,rgba(var(--primary-text-color-rgb),0.96),rgba(var(--accent-color-1-rgb),0.82))] px-5 py-6 text-white shadow-[0_24px_60px_rgba(10,18,28,0.16)] md:p-10">
        <div className="pointer-events-none absolute right-0 top-0 size-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 size-32 rounded-full bg-black/10 blur-3xl" />
        <p className="text-[11px] uppercase tracking-[0.34em] text-white/70">Stay in the loop</p>
        <p className="mt-3 text-2xl font-bold text-tertiary md:text-3xl">{t("subscribe.title")}</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
          {t("subscribe.description")}
        </p>
        <form
          onSubmit={handleSubmit}
          className="relative mt-5 overflow-hidden rounded-[22px] bg-white/10 p-2 backdrop-blur-md md:mt-6"
        >
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("subscribe.placeholder")}
            className="animation bg-background/95 min-h-12 w-full rounded-[18px] border-none px-4 py-3 pr-32 text-primary outline-none md:pr-40"
          />
          <div className="absolute inset-y-0 right-0 p-2">
            <button
              type="submit"
              className="animation min-h-10 rounded-[16px] bg-[linear-gradient(135deg,rgba(var(--primary-text-color-rgb),0.94),rgba(var(--accent-color-1-rgb),0.92))] px-4 py-2 text-sm font-semibold text-tertiary hover:shadow-[0_10px_20px_rgba(10,18,28,0.18)] md:px-5 md:text-base"
            >
              {loading ? t("subscribe.loading") : t("subscribe.button")}
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
};
