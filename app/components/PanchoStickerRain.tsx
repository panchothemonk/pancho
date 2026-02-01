"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type StickerKind = "face" | "quote";

type Sticker = {
  id: string;
  kind: StickerKind;
  x: number;       // 0..1
  rot: number;     // degrees
  size: number;    // px
  delay: number;   // s
  life: number;    // s
  quote?: string;
  variant?: "ok" | "mint" | "yellow" | "pink";
  vibe?: "float" | "shake" | "bob";
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function PanchoStickerRain() {
  const quotes = useMemo(
    () => [
      "bro relax",
      "ya valí",
      "no pues wow",
      "ok.",
      "mañana vemos",
      "ni modo",
      "qué hueva",
      "con permiso",
      "no gracias",
      "a ver",
      "todo bien (mentira)",
    ],
    []
  );

  const [items, setItems] = useState<Sticker[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const spawn = () => {
      const isFace = Math.random() < 0.58;
      const variants: Sticker["variant"][] = ["ok", "mint", "yellow", "pink"];
      const vibes: Sticker["vibe"][] = ["float", "shake", "bob"];

      const it: Sticker = {
        id: uid(),
        kind: isFace ? "face" : "quote",
        x: Math.random() * 0.82 + 0.06,
        rot: (Math.random() * 18 - 9) | 0,
        size: isFace ? ((Math.random() * 28 + 92) | 0) : ((Math.random() * 18 + 120) | 0),
        delay: Math.random() * 0.2,
        life: Math.random() * 1.2 + 3.2,
        quote: isFace ? undefined : quotes[(Math.random() * quotes.length) | 0],
        variant: variants[(Math.random() * variants.length) | 0],
        vibe: vibes[(Math.random() * vibes.length) | 0],
      };

      setItems((prev) => {
        const next = [...prev, it];
        return next.length > 14 ? next.slice(next.length - 14) : next;
      });

      window.setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.id !== it.id));
      }, (it.life + it.delay) * 1000 + 50);
    };

    spawn();
    timerRef.current = window.setInterval(spawn, 900);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [quotes]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: 28,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {items.map((s) => (
          <FallingSticker key={s.id} s={s} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FallingSticker({ s }: { s: Sticker }) {
  const bg = variantBg(s.variant);

  const vibeAnim =
    s.vibe === "shake"
      ? { rotate: [s.rot, s.rot - 2, s.rot + 2, s.rot] }
      : s.vibe === "bob"
      ? { y: [0, -6, 0] }
      : { x: [0, -6, 6, 0] };

  const vibeTrans =
    s.vibe === "shake"
      ? { duration: 0.35, repeat: Infinity as const, ease: "easeInOut" as const }
      : { duration: 0.9, repeat: Infinity as const, ease: "easeInOut" as const };

  return (
    <motion.div
      initial={{ opacity: 0, y: -140, scale: 0.95 }}
      animate={{ opacity: 1, y: 760, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: s.delay, duration: s.life, ease: "linear" }}
      style={{
        position: "absolute",
        left: `${s.x * 100}%`,
        top: 0,
        width: s.size,
        height: s.size,
        transform: `rotate(${s.rot}deg)`,
        borderRadius: 26,
        border: "4px solid #121212",
        background: bg,
        boxShadow: "0 18px 0 rgba(18,18,18,.14)",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
        zIndex: 1,
      }}
    >
      <motion.div animate={vibeAnim} transition={vibeTrans} style={{ width: "100%", height: "100%", position: "relative" }}>
        {s.kind === "face" ? <FaceSticker /> : <QuoteSticker quote={s.quote || "ok."} />}
        <OverlayFX />
      </motion.div>
    </motion.div>
  );
}

function FaceSticker() {
  return (
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "rgba(255,255,255,.55)" }}>
      <img src="/pancho-face.png" alt="" style={{ width: "86%", height: "86%", objectFit: "contain", display: "block" }} />
    </div>
  );
}

function QuoteSticker({ quote }: { quote: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        padding: 14,
        textAlign: "center",
        fontWeight: 1000,
        color: "rgba(18,18,18,.86)",
        background: "rgba(255,255,255,.65)",
        lineHeight: 1.05,
        fontSize: 20,
      }}
    >
      {quote}
    </div>
  );
}

function OverlayFX() {
  const which = Math.random();
  if (which < 0.33) return <SweatDrop />;
  if (which < 0.66) return <Sparkle />;
  return <RageVein />;
}

function SweatDrop() {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 12,
        width: 16,
        height: 22,
        borderRadius: "10px 10px 12px 12px",
        background: "rgba(110,168,255,.9)",
        border: "3px solid #121212",
        transform: "rotate(12deg)",
      }}
    />
  );
}

function Sparkle() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        width: 18,
        height: 18,
        background: "rgba(255,224,102,.95)",
        border: "3px solid #121212",
        transform: "rotate(45deg)",
      }}
    />
  );
}

function RageVein() {
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        width: 18,
        height: 18,
        borderRadius: 8,
        background: "rgba(255,61,184,.9)",
        border: "3px solid #121212",
      }}
    />
  );
}

function variantBg(v?: "ok" | "mint" | "yellow" | "pink") {
  switch (v) {
    case "mint":
      return "linear-gradient(135deg, rgba(70,255,210,.9), rgba(255,255,255,.9))";
    case "yellow":
      return "linear-gradient(135deg, rgba(255,224,102,.95), rgba(255,255,255,.9))";
    case "pink":
      return "linear-gradient(135deg, rgba(255,61,184,.92), rgba(255,255,255,.9))";
    default:
      return "linear-gradient(135deg, rgba(255,255,255,.95), rgba(245,245,245,.9))";
  }
}
