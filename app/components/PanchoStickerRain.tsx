"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Sticker = {
  id: number;
  x: number;
  size: number;
  delay: number;
  vibe: "float" | "shake";
  kind: "face" | "quote";
  content?: string;
};

const QUOTES = ["ok.", "ya valí.", "bro.", "mañana vemos.", "sin ganas"];

export default function PanchoStickerRain() {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    const generated: Sticker[] = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      size: Math.random() * 26 + 48,
      delay: Math.random() * 4,
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
          s.vibe === "shake"
            ? { rotate: [-2, 2, -2] }
            : { y: [-6, 6, -6] };

        const vibeTrans =
          s.vibe === "shake"
            ? { duration: 0.35, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.9, repeat: Infinity, ease: "easeInOut" };

        return (
          <motion.div
            key={s.id}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 460, opacity: 1 }}
            transition={{
              duration: 10,
              delay: s.delay,
              repeat: Infinity,
              ease: "linear",
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
