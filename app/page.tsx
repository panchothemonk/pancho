"use client";

import PanchoStickerRain from "./components/PanchoStickerRain";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import PanchoGame from "./components/PanchoGame";

type Tone = "good" | "bad";

type Chapter = {
  id: string;
  tone: Tone;
  when: string;
  title: string;
  body: string;
  quote: string;      // types in on unlock
  punchline: string;  // toggles on click
  image?: string;     // optional panel image (later)
  moment?: {
    title: string;
    text: string;
    tags?: string[];
    image?: string; // optional later: /moments/b3.png
  };


};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Page() {
  // --- CHAPTERS (edit these anytime) ---
  const chapters: Chapter[] = useMemo(
    () => [
      {
        id: "c1",
        tone: "good",
        when: "Chapter 01",
        title: "Woke up",
        body: "Eyes open. Already tired.",
        quote: "ok.",
        punchline: "still tired.",
      },

      // GOOD path
      {
        id: "g2",
        tone: "good",
        when: "Chapter 02",
        title: "Coffee didn’t spill",
        body: "Cup full. Floor clean. Rare event.",
        quote: "nice.",
        punchline: "don’t get used to it.",
        moment: {
  title: "Rare W",
  text: "Pancho holds the coffee like it’s a loaded weapon. Zero spills. He stares at the cup… suspicious.",
  tags: ["☕ coffee", "✅ rare win", "😐 no emotion"],
  image: "/moments/g2.png",
},


      },
      {
        id: "g3",
        tone: "good",
        when: "Chapter 03",
        title: "Bank app loaded",
        body: "Balance visible. No error message.",
        quote: "we move.",
        punchline: "for now.",
      },
      {
        id: "g4",
        tone: "good",
        when: "Chapter 04",
        title: "Someone liked the video",
        body: "One notification. Not hate.",
        quote: "gracias.",
        punchline: "who are you?",
      },
      {
        id: "g5",
        tone: "good",
        when: "Chapter 05",
        title: "Gym (briefly)",
        body: "One machine. Seven minutes. Leaves.",
        quote: "ya estuvo.",
        punchline: "I basically trained.",
      },
      {
        id: "g6",
        tone: "good",
        when: "Chapter 06",
        title: "Paid rent",
        body: "Account sad. Lights still on.",
        quote: "sobreviví.",
        punchline: "barely.",
      },

      // BAD path
      {
        id: "b2",
        tone: "bad",
        when: "Chapter 02",
        title: "Opened the chart",
        body: "Green candle. Pancho taps buy.",
        quote: "uh.",
        punchline: "my fault.",
      },
      {
        id: "b3",
        tone: "bad",
        when: "Chapter 03",
        title: "Chart kept going",
        body: "Down. Still down. Keeps going.",
        quote: "ya valí.",
        punchline: "classic.",
        moment: {
  title: "It’s Not Coming Back",
  text: "Phone in hand. Candle turns red. Pancho doesn’t move. His wallet screams in silence.",
  tags: ["📉 chart", "💀 ya valí", "🔕 dead inside"],
  image: "/moments/b3.png",
},


      },
      {
        id: "b4",
        tone: "bad",
        when: "Chapter 04",
        title: "Group chat exploded",
        body: "94 messages. Same argument.",
        quote: "bro.",
        punchline: "I’m not reading that.",
      },
      {
        id: "b5",
        tone: "bad",
        when: "Chapter 05",
        title: "Woke up canceled",
        body: "Apology requested. Reason unclear.",
        quote: "perdón… creo.",
        punchline: "for what though?",
        moment: {
  title: "Apology With No Crime",
  text: "Ring light on. Notes app open. Comments demand an apology… for something nobody can explain.",
  tags: ["🎥 apology", "🧾 misinformation", "😵 confused"],
  image: "/moments/b5.png",
},


      },
      {
        id: "b6",
        tone: "bad",
        when: "Chapter 06",
        title: "Phone storage full",
        body: "Can’t record. Can’t update.",
        quote: "perfect.",
        punchline: "love that for me.",
      },

      // Ending (both paths converge)
      {
        id: "end",
        tone: "good",
        when: "Final Chapter",
        title: "Still here",
        body: "World loud. Pancho quiet.",
        quote: "mañana vemos.",
        punchline: "if I wake up.",
        moment: {
  title: "Log Off Therapy",
  text: "The world is loud. Pancho closes the laptop like it’s self-care and disappears into a nap.",
  tags: ["🌙 mañana vemos", "🫠 exhausted", "🧘 low energy"],
  image: "/moments/end.png",
},


      },
    ],
    []
  );

  // Path selector
  const [path, setPath] = useState<Tone>("good");

  // Filtered story: always include intro + ending, plus selected path
  const filtered = useMemo(() => {
    const intro = chapters.find((c) => c.id === "c1");
    const ending = chapters.find((c) => c.id === "end");
    const mid = chapters.filter((c) => c.id !== "c1" && c.id !== "end" && c.tone === path);
    return [intro, ...mid, ending].filter(Boolean) as Chapter[];
  }, [chapters, path]);

  // Track unlock progress
  const [seen, setSeen] = useState<Record<string, boolean>>({ c1: true });
  const seenCount = Object.keys(seen).length;
  const total = filtered.length;
  const progressRatio = clamp(seenCount / Math.max(1, total), 0, 1);

  // Scroll progress bar
  const mainRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: mainRef, offset: ["start start", "end end"] });
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  // Subtle parallax on portrait
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -22]);

  // Reset seen when path changes
  useEffect(() => {
    setSeen({ c1: true });
  }, [path]);

  return (
    <>
      {/* NAV */}
      <div className="nav">
        <div className="container">
          <div className="navInner">
            <a className="brand" href="#top">
  <img
    src="/pancho-face.png"
    alt="Pancho"
    className="navPancho"
  />
  <span>Pancho</span>
  <span className="pill">sin ganas • click for punchline</span>
</a>


            <div className="links">
              <a className="link" href="#story">Story</a>
              <a className="link" href="#game">Game</a>
              <a className="link" href="#episodes">Episodes</a>
              
            </div>
          </div>

          {/* scroll indicator */}
          <div style={{ height: 2, background: "rgba(18,18,18,.10)", borderRadius: 999, overflow: "hidden" }}>
            <motion.div
              style={{
                height: 2,
                scaleX: bar,
                transformOrigin: "0% 50%",
                background: "linear-gradient(90deg, rgba(255,61,184,.95), rgba(110,168,255,.85))",
              }}
            />
          </div>
        </div>
      </div>

      <main id="top" ref={mainRef as any}>
        {/* HERO */}
        <section className="hero">
          <div className="container">
            <div className="grid">
              <div className="card">
                <div className="pad">
                  <div className="kicker">
                    <span className="dot" />
                    Scroll. Unlock. Click. Pancho reacts (barely).
                  </div>

                  <h1>
                    Pancho’s life
                    <br /> good days. bad days. same Pancho.
                  </h1>

                  <p className="sub">
                    Pancho style: underreaction, awkward silence, tiny wins. Pick GOOD or BAD, scroll to unlock, click for the second line.
                  </p>

                  <div className="actions">
                    <button
                      className={`btn ${path === "good" ? "btnPrimary" : ""}`}
                      onClick={() => setPath("good")}
                      aria-pressed={path === "good"}
                    >
                      GOOD path
                    </button>
                    <button
                      className={`btn ${path === "bad" ? "btnPrimary" : ""}`}
                      onClick={() => setPath("bad")}
                      aria-pressed={path === "bad"}
                    >
                      BAD path
                    </button>
                    <a className="btn" href="#story">Start Story</a>
                    <a className="btn" href="#game">Play Game</a>
                  </div>
<div className="panchoRow" style={{ marginTop: 16 }}>
  <div className="panchoChip">
    <div className="panchoChipFace">
      <img src="/pancho-face.png" alt="Pancho" />
    </div>
    <div className="panchoChipText">Pancho approves (barely).</div>
  </div>

  <div className="panchoChip" style={{ background: "var(--yellow)" }}>
    <div className="panchoChipFace">
      <img src="/pancho-face.png" alt="Pancho" />
    </div>
    <div className="panchoChipText">“ok.”</div>
  </div>

  <div className="panchoChip" style={{ background: "var(--mint)" }}>
    <div className="panchoChipFace">
      <img src="/pancho-face.png" alt="Pancho" />
    </div>
    <div className="panchoChipText">Good day… segun tu.</div>
  </div>
</div>

                  <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span className="pill">Unlocked: {seenCount}/{total}</span>
                    <span className="pill">Mode: {path.toUpperCase()}</span>
                    <span className="pill">Completion: {Math.round(progressRatio * 100)}%</span>
                  </div>
                </div>
              </div>

              <motion.div className="card portrait" style={{ y: yParallax }}>
  <PanchoStickerRain />

  <div className="caption">
    <strong>Pancho</strong>
    <span> • sin ganas • fed up • still vibing • to the moon</span>
  </div>
</motion.div>

            </div>
          </div>
        </section>

        {/* STORY */}
        <section id="story" className="section">
          <div className="container">
            <div className="head">
              <div>
                <h2>Story Mode</h2>
                <p className="desc">
                  Chapters unlock on scroll. Quotes type in. Click a chapter to switch to the second punchline.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span className="pill">Mode: GOOD/BAD {path.toUpperCase()}</span>
                <span className="pill">Click for punchline</span>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(18,18,18,.10)", overflow: "hidden" }}>
                <div
                  style={{
                    height: 10,
                    width: `${Math.round(progressRatio * 100)}%`,
                    background: "linear-gradient(90deg, rgba(255,61,184,.95), rgba(110,168,255,.85))",
                    borderRadius: 999,
                    transition: "width .25s ease",
                  }}
                />
              </div>
              <div style={{ marginTop: 8, color: "rgba(18,18,18,.72)", fontSize: 12, fontWeight: 1000 }}>
                Progress: {Math.round(progressRatio * 100)}% • {seenCount} unlocked
              </div>
            </div>

            <div className="timeline">
              {filtered.map((c, idx) => (
                <StoryCard
                  key={c.id}
                  chapter={c}
                  index={idx}
                  unlocked={!!seen[c.id]}
                  onUnlock={() => setSeen((s) => (s[c.id] ? s : { ...s, [c.id]: true }))}
                />
              ))}
            </div>
          </div>
        </section>

        {/* GAME */}
        <section id="game" className="section">
          <div className="container">
            <div className="head">
              <div>
                <h2>Play</h2>
                <p className="desc">Pancho vs real life. Avoid shit. Stay tired.</p>
              </div>
              <span className="pill">mini-game</span>
            </div>

            <PanchoGame />
          </div>
        </section>

        {/* EPISODES */}
        <section id="episodes" className="section">
          <div className="container">
            <div className="head">
              <div>
                <h2>Episodes</h2>
                <p className="desc">Episodes from the timeline. Click one (soon).</p>
              </div>
              <span className="pill">episodes</span>
            </div>

            <div className="epGrid">
  <Episode
  num="Episode 01"
  title="Pancho compra el dip"
  desc="He buys the dip. It keeps dipping. It wasn’t the dip."
  thumb="/episodes/ep-01.png"
  url="https://youtube.com/shorts/L0WCgr1eLlg?feature=share"
/>

<Episode
  num="Episode 02"
  title="Pancho descubre que $0.00"
  desc="The dev vanishes. Wallet empty. It was his primo."
  thumb="/episodes/ep-02.png"
  url="https://youtube.com/shorts/j3fjtHJ2MfQ?feature=share"
/>

<Episode
  num="Episode 03"
  title="Pancho intenta explicar crypto"
  desc="Family dinner. Charts come out. Nobody asked."
  thumb="/episodes/ep-03.png"
  url="https://youtube.com/shorts/jTcSQNI546w?feature=share"
/>

<Episode
  num="Episode 04"
  title='Pancho dice “I’m early”'
  desc="He buys confidently. It was the literal top."
  thumb="/episodes/ep-04.png"
  url="https://youtube.com/shorts/XHpuSsLzCfU?feature=share"
/>

<Episode
  num="Episode 05"
  title="Pancho corre de ICE"
  desc="Paid taxes in crypto. Timing was terrible."
  thumb="/episodes/ep-05.png"
  url="https://youtube.com/shorts/TzFV9kU1uQw?feature=share"
/>

<Episode
  num="Episode 06"
  title="Pancho entra al gym motivado"
  desc="New routine. Seven minutes later, he leaves."
  thumb="/episodes/ep-06.png"
  url="https://youtube.com/shorts/GruL9OT-sDc?feature=share"
/>

<Episode
  num="Episode 07"
  title="Pancho intenta comer sano"
  desc="Salad plan fails. Ends up crying at Taco Bell."
  thumb="/episodes/ep-07.png"
  url="https://youtube.com/shorts/QdgGjeMcgxY?feature=share"
/>

<Episode
  num="Episode 08"
  title="Pancho se despierta temprano"
  desc="Big plans. Zero productivity. Back to bed."
  thumb="/episodes/ep-08.png"
  url="https://youtube.com/shorts/vUh-WG2s-Ts?feature=share"
/>

<Episode
  num="Episode 09"
  title="Pancho vende en pérdida"
  desc="He sells for peace. Token does 10x right after."
  thumb="/episodes/ep-09.png"
  url="https://youtube.com/shorts/LfRR8Luu6cc?feature=share"
/>

<Episode
  num="Episode 10"
  title="Todo va a estar bien"
  desc="He stares at the ceiling. Says it anyway."
  thumb="/episodes/ep-10.png"
  url="https://youtube.com/shorts/76j7jGMMiVY?feature=share"
/>

<Episode
  num="Episode 11"
  title="Pancho se hace rico en crypto"
  desc="Buys the top. Wins anyway. Still tired."
  thumb="/episodes/ep-11.png"
  url="https://youtube.com/shorts/4o8kwPFSTLk?feature=share"
/>

<Episode
  num="Episode 12"
  title="Pancho se vuelve viral"
  desc="Brushes teeth. Internet explodes. He doesn’t care."
  thumb="/episodes/ep-12.png"
  url="https://youtube.com/shorts/HQzVK5mrPho?feature=share"
/>

<Episode
  num="Episode 13"
  title="Pancho y Steve"
  desc="Backstage chaos. Money everywhere. Pancho stays bored."
  thumb="/episodes/ep-13.png"
  url="https://youtube.com/shorts/ycdltoL9V3c?feature=share"
/>

<Episode
  num="Episode 14"
  title="Pancho abre OnlyFans"
  desc="Checks earnings. Expectations vs reality. Awkward silence."
  thumb="/episodes/ep-14.png"
  url="https://youtube.com/shorts/Y3sS1MJC0ac?feature=share"
/>

<Episode
  num="Episode 15"
  title="Pancho y Tekashi 69"
  desc="Loud party. Flashy phones. Pancho unimpressed."
  thumb="/episodes/ep-15.png"
  url="https://youtube.com/shorts/sfL3I12UReM?feature=share"
/>

</div>

          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section">
          <div className="container">
            <div className="head">
              <div>
                <h2>About</h2>
                <p className="desc">
                  The world is loud. Pancho says “ok.”
                </p>
              </div>
              <a
  href="https://www.youtube.com/@Panchojourney"
  target="_blank"
  rel="noopener noreferrer"
  className="pill"
  style={{ textDecoration: "none", cursor: "pointer" }}
>
  who is pancho
</a>

            </div>
          </div>
        </section>

        <div className="footer">© Pancho — sin ganas, still here.</div>
      </main>
    </>
  );
}

function StoryCard(props: { chapter: Chapter; index: number; unlocked: boolean; onUnlock: () => void }) {
  const [typed, setTyped] = useState("");
  const [clicked, setClicked] = useState(false);
  const [openMoment, setOpenMoment] = useState(false);

  const full = `“${props.chapter.quote}”`;

  useEffect(() => {
    setClicked(false);
    setOpenMoment(false);
  }, [props.chapter.id]);

  useEffect(() => {
    if (!props.unlocked) return;
    setTyped("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [props.unlocked, full]);

  const shownLine = clicked ? `“${props.chapter.punchline}”` : (typed || " ");

  return (
    <motion.article
      className="moment"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: props.index * 0.03 }}
      onViewportEnter={() => props.onUnlock()}
      style={{
        filter: props.unlocked ? "none" : "blur(4px)",
        opacity: props.unlocked ? 1 : 0.55,
        transformOrigin: "center",
        transition: "filter .35s ease, opacity .35s ease",
      }}
    >
      <div className="mTop">
        <span className={`badge ${props.chapter.tone === "good" ? "good" : "bad"}`}>
          <i /> {props.chapter.tone.toUpperCase()}
        </span>
        <span className="when">{props.chapter.when}</span>
      </div>

      <div className="mBody">
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div className="panchoChipFace" style={{ width: 28, height: 28 }}>
            <img src="/pancho-face.png" alt="Pancho" />
          </div>
          <div style={{ fontWeight: 1000, color: "rgba(18,18,18,.7)", fontSize: 12 }}>
            Same Pancho. Different problems.
          </div>
        </div>

        <h3>{props.chapter.title}</h3>
        <p>{props.chapter.body}</p>

        {/* Quote click toggles punchline */}
        <div
          className="quote"
          onClick={() => props.unlocked && setClicked((v) => !v)}
          style={{ cursor: props.unlocked ? "pointer" : "default" }}
        >
          <b>Pancho:</b>{" "}
          <span style={{ opacity: props.unlocked ? 1 : 0 }}>{shownLine}</span>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ color: "rgba(18,18,18,.70)", fontSize: 12, fontWeight: 1000 }}>
            Click quote for punchline
          </div>

          {props.chapter.moment && (
            <button
              className="btn"
              style={{ padding: "8px 10px", borderRadius: 14 }}
              onClick={() => props.unlocked && setOpenMoment((v) => !v)}
              disabled={!props.unlocked}
            >
              {openMoment ? "Close moment" : "View moment"}
            </button>
          )}
        </div>

        {/* EXPANDABLE MOMENT PANEL */}
        <AnimatePresence initial={false}>
          {props.chapter.moment && openMoment && props.unlocked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                marginTop: 12,
                borderRadius: 18,
                border: "3px solid #121212",
                background: "linear-gradient(135deg, rgba(255,61,184,.12), rgba(255,224,102,.22))",
                boxShadow: "0 18px 0 rgba(18,18,18,.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "10px 12px",
                  borderBottom: "3px solid #121212",
                  background: "rgba(255,255,255,.75)",
                }}
              >
                <div style={{ fontWeight: 1000, fontSize: 13, color: "rgba(18,18,18,.85)" }}>
                  Moment: {props.chapter.moment.title}
                </div>
                <div style={{ fontWeight: 1000, fontSize: 12, color: "rgba(18,18,18,.65)" }}>
                  unlocked
                </div>
              </div>

              <div style={{ padding: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
             {props.chapter.moment.image && (
  <div
    style={{
      width: 220,
      height: 160,
      borderRadius: 18,
      border: "3px solid #121212",
      overflow: "hidden",
      background: `#fff url(${props.chapter.moment.image}) center / contain no-repeat`,
      flex: "0 0 auto",
      boxShadow: "0 10px 0 rgba(18,18,18,.10)",
    }}
  />
)}


                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 18,
                    border: "3px solid #121212",
                    background: "#fff",
                    overflow: "hidden",
                    flex: "0 0 auto",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <img src="/pancho-face.png" alt="Pancho moment" style={{ width: "88%", height: "88%", objectFit: "contain" }} />
                </div>

                <div>
                  <div style={{ fontSize: 13.5, color: "rgba(18,18,18,.75)", lineHeight: 1.55 }}>
                    {props.chapter.moment.text}
                  </div>

                  {props.chapter.moment.tags?.length ? (
                    <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {props.chapter.moment.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "3px solid #121212",
                            background: "#fff",
                            fontSize: 12,
                            fontWeight: 1000,
                            boxShadow: "0 10px 0 rgba(18,18,18,.10)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
function Episode(props: {
  num: string;
  title: string;
  desc: string;
  thumb: string;
  url: string;
}) {
  return (
    <motion.a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="ep"
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        cursor: "pointer",
      }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="cover">
        <img
          src={props.thumb}
          alt={props.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      <div className="meta">
        <div className="num">{props.num}</div>
        <div className="title">{props.title}</div>
        <div className="small">{props.desc}</div>
      </div>
    </motion.a>
  );
}




