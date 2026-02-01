"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Sticker = {
  id: number;
  x: number; // percent
  size: number; // px
  delay: number; // seconds
  duration: number; // seconds
  drift: number; // px (left/right sway)
  vibe: "float" | "shake";
  kind: "face" | "quote";
  content?: string;
};

const QUOTES = ["ok.", "ya valí.", "bro.", "mañana vemos.", "sin ganas"];

export default function PanchoStickerRain() {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    const COUNT = 18;

    const generated: Sticker[] = Array.from({ length: COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 92 + 4, // spread across width
      size: 44 + Math.random() * 34, // 44–78px
      delay: Math.random() * 3.5, // stagger start
      duration: 6 + Math.random() * 7, // 6–13s (prevents syncing)
      drift: Math.random() * 40 - 20, // -20..20px side drift (Step 4)
      vibe: Math.random() > 0.6 ? "shake" : "float",
      kind: Math.random() > 0.55 ? "face" : "quote",
      content: QUOTES[Math.floor(Math.random() * QUOTES.length)],
    }));

    setStickers(generated);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 420,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {stickers.map((s) => {
        const vibeAnim =
          s.vibe === "shake" ? { rotate: [-2, 2, -2] } : { y: [-6, 6, -6] };

        // keep this simple to avoid TS deploy issues
        const vibeTrans =
          s.vibe === "shake"
            ? { duration: 0.35, repeat: Infinity }
            : { duration: 0.9, repeat: Infinity };

        return (
          <motion.div
            key={s.id}
            initial={{ y: -90, opacity: 0 }}
            animate={{
              y: 460,
              x: [0, s.drift, 0], // ✅ Step 4: subtle sideways drift
              opacity: 1,
            }}
            transition={{
              delay: s.delay,
              duration: s.duration,
              repeat: Infinity,
            }}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              width: s.size,
              height: s.size,
              zIndex: 1,
            }}
          >
            <motion.div animate={vibeAnim} transition={vibeTrans}>
              {s.kind === "face" ? (
                <img
                  src="/pancho-face.png"
                  alt="Pancho"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 6px 0 rgba(0,0,0,.15))",
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#fff",
                    border: "3px solid #121212",
                    fontWeight: 900,
                    fontSize: 13,
                    boxShadow: "0 10px 0 rgba(18,18,18,.12)",
                    whiteSpace: "nowrap",
                    filter: "drop-shadow(0 6px 0 rgba(0,0,0,.10))",
                  }}
                >
                  {s.content}
                </div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
