"use client";

import React, { useEffect, useRef, useState } from "react";

type GameState = "idle" | "playing" | "over";

type Drop = {
  x: number;
  y: number;
  r: number;
  v: number;
  kind: "poop";
};

export default function PanchoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [state, setState] = useState<GameState>("idle");
  const [uiScore, setUiScore] = useState(0);
  const [uiBest, setUiBest] = useState(0);

  // stable refs (avoid stale React state inside RAF)
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  const keysRef = useRef({ left: false, right: false });
  const pointerXRef = useRef<number | null>(null);

  const panchoRef = useRef({ x: 0, y: 0, w: 80, h: 80, vx: 0 });
  const dropsRef = useRef<Drop[]>([]);
  const tRef = useRef({ last: 0, spawn: 0, elapsed: 0, difficulty: 1 });

  // Browser-only image loader (fixes "Image is not defined")
  const panchoImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const img = new window.Image();
    img.src = "/pancho-face.png"; // must exist at /public/pancho-face.png
    panchoImgRef.current = img;
  }, []);

  function resetGame(canvas: HTMLCanvasElement) {
    const p = panchoRef.current;
    p.x = canvas.width / 2 - p.w / 2;
    p.vx = 0;

    dropsRef.current = [];
    tRef.current = { last: 0, spawn: 0, elapsed: 0, difficulty: 1 };

    scoreRef.current = 0;
    setUiScore(0);
  }

  function start() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resetGame(canvas);
    setState("playing");
  }

  function gameOver() {
    // update best
    bestRef.current = Math.max(bestRef.current, scoreRef.current);
    setUiBest(bestRef.current);
    setState("over");
  }

  function spawnDrop(canvas: HTMLCanvasElement) {
    const r = rand(18, 24);
    const x = rand(r + 12, canvas.width - r - 12);
    const v = rand(140, 220) * tRef.current.difficulty;
    dropsRef.current.push({ x, y: -40, r, v, kind: "poop" });
  }

  function loop(ts: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const t = tRef.current;
    if (!t.last) t.last = ts;
    const dt = Math.min(0.033, (ts - t.last) / 1000);
    t.last = ts;

    // difficulty ramps slowly
    t.elapsed += dt;
    t.difficulty = 1 + t.elapsed / 25;

    // clear & background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#FFFDF7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // subtle dots
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#FF3DB8";
    for (let y = 18; y < canvas.height; y += 30) {
      for (let x = 18; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // movement
    const p = panchoRef.current;
    const k = keysRef.current;

    let dir = 0;
    if (k.left) dir -= 1;
    if (k.right) dir += 1;

    if (pointerXRef.current !== null) {
      const target = pointerXRef.current - p.w / 2;
      p.x += (target - p.x) * 0.2;
    } else {
      p.vx = dir * 420;
      p.x += p.vx * dt;
    }

    p.x = clamp(p.x, 10, canvas.width - p.w - 10);
    p.y = canvas.height - p.h - 18;

    // spawn drops
    t.spawn += dt;
    const spawnEvery = Math.max(0.28, 0.85 - t.elapsed / 30);
    if (t.spawn >= spawnEvery) {
      t.spawn = 0;
      spawnDrop(canvas);
    }

    // update drops + collision
    const ds = dropsRef.current;
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      d.y += d.v * dt;

      if (rectCircleHit(p.x, p.y, p.w, p.h, d.x, d.y, d.r)) {
        gameOver();
        return;
      }
      if (d.y > canvas.height + 70) ds.splice(i, 1);
    }

    // draw drops
    for (const d of ds) drawDrop(ctx, d);

    // draw Pancho sprite (your exact face)
    if (panchoImgRef.current) {
      drawPanchoSprite(ctx, panchoImgRef.current, p.x, p.y, p.w, p.h);
    } else {
      // fallback if image hasn't loaded yet
      ctx.strokeStyle = "#121212";
      ctx.lineWidth = 4;
      ctx.fillStyle = "#FF3DB8";
      roundRect(ctx, p.x, p.y, p.w, p.h, 20);
      ctx.fill();
      ctx.stroke();
    }

    // score
    scoreRef.current += Math.floor(60 * dt);
    // lightweight UI sync (keeps React from re-rendering every frame)
    if (Math.random() < 0.2) setUiScore(scoreRef.current);

    // HUD
    ctx.fillStyle = "#121212";
    ctx.font = "1000 14px system-ui";
    ctx.fillText(`Score: ${scoreRef.current}`, 14, 24);
    ctx.fillText(`Best: ${bestRef.current}`, 14, 44);

    rafRef.current = requestAnimationFrame(loop);
  }

  // resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = Math.min(980, parent ? parent.clientWidth : 980);
      canvas.width = w;
      canvas.height = 420;
      panchoRef.current.x = w / 2 - panchoRef.current.w / 2;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keysRef.current.left = true;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keysRef.current.right = true;
      if (e.key === "Enter" && state !== "playing") start();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") keysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") keysRef.current.right = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [state]);

  // RAF start/stop
  useEffect(() => {
    if (state !== "playing") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    tRef.current.last = 0;
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div
      style={{
        border: "3px solid #121212",
        borderRadius: 22,
        background: "#FFFDF7",
        boxShadow: "0 16px 0 rgba(18,18,18,.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "3px solid #121212",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          fontWeight: 1000,
        }}
      >
        <div>Mini-Game: Dodge the 💩</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={chipStyle}>←/→ or A/D</span>
          <span style={chipStyle}>Mobile: drag</span>
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: 420, display: "block", borderRadius: 16, border: "3px solid #121212" }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
            pointerXRef.current = e.nativeEvent.offsetX * (e.currentTarget.width / e.currentTarget.clientWidth);
            if (state !== "playing") start();
          }}
          onPointerMove={(e) => {
            if (pointerXRef.current === null) return;
            pointerXRef.current = e.nativeEvent.offsetX * (e.currentTarget.width / e.currentTarget.clientWidth);
          }}
          onPointerUp={() => (pointerXRef.current = null)}
          onPointerCancel={() => (pointerXRef.current = null)}
        />

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {state !== "playing" && (
            <button style={btnStyle} onClick={start}>
              {state === "over" ? "Restart" : "Start"}
            </button>
          )}
          {state === "playing" && (
            <button style={btnStyle} onClick={() => setState("over")}>
              Quit
            </button>
          )}
          {state === "over" && (
            <div style={{ fontWeight: 1000, color: "rgba(18,18,18,.75)" }}>
              Pancho: “ok.” — Score {uiScore} • Best {uiBest}
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(18,18,18,.7)", fontWeight: 900 }}>
          Sprite file required: <span style={{ fontWeight: 1000 }}>/public/pancho-face.png</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- drawing ---------- */

function drawPanchoSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  // sticker shadow
  ctx.save();
  ctx.fillStyle = "rgba(18,18,18,.10)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 10, w / 2.1, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // if not loaded yet
  if (!img.complete || img.naturalWidth === 0) {
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 4;
    ctx.fillStyle = "#FF3DB8";
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // cover crop (fill w,h without distortion)
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;

  // clip rounded rect
  ctx.save();
  roundRect(ctx, x, y, w, h, 20);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  // outline
  ctx.strokeStyle = "#121212";
  ctx.lineWidth = 4;
  roundRect(ctx, x, y, w, h, 20);
  ctx.stroke();

  ctx.restore();
}

function drawDrop(ctx: CanvasRenderingContext2D, d: Drop) {
  ctx.save();
  ctx.translate(d.x, d.y);

  // Draw poop emoji (centered)
  ctx.font = `900 ${Math.round(d.r * 2.2)}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // subtle shadow for readability
  ctx.fillStyle = "rgba(18,18,18,.18)";
  ctx.fillText("💩", 2, 2);

  ctx.fillStyle = "#121212";
  ctx.fillText("💩", 0, 0);

  ctx.restore();
}

function rectCircleHit(rx: number, ry: number, rw: number, rh: number, cx: number, cy: number, cr: number) {
  const nx = clamp(cx, rx, rx + rw);
  const ny = clamp(cy, ry, ry + rh);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy <= cr * cr;
}

/* ---------- utils ---------- */

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const chipStyle: React.CSSProperties = {
  border: "3px solid #121212",
  borderRadius: 999,
  padding: "6px 10px",
  background: "#FFE066",
  fontWeight: 1000,
  fontSize: 12,
  boxShadow: "0 10px 0 rgba(18,18,18,.16)",
};

const btnStyle: React.CSSProperties = {
  border: "3px solid #121212",
  borderRadius: 16,
  padding: "10px 14px",
  background: "#fff",
  fontWeight: 1000,
  cursor: "pointer",
  boxShadow: "0 10px 0 rgba(18,18,18,.16)",
};
