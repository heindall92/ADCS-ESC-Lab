import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

import "@hyperframes/player";

type HyperframesPlayerEl = HTMLElement & {
  play?: () => void;
  pause?: () => void;
  ready?: boolean;
};

export function HeroMotion() {
  const reduce = useReducedMotion();
  const playerRef = useRef<HyperframesPlayerEl | null>(null);

  useEffect(() => {
    if (reduce) return;
    const player = playerRef.current;
    if (!player) return;

    const start = () => {
      player.play?.();
    };

    if (player.ready) {
      start();
      return;
    }

    player.addEventListener("ready", start, { once: true });
    return () => player.removeEventListener("ready", start);
  }, [reduce]);

  if (reduce) {
    return (
      <div
        className="hero-motion-fallback glass-surface-strong relative aspect-square w-full overflow-hidden rounded-3xl"
        role="img"
        aria-label="Visual ADCS ESC Lab"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(61,214,140,0.2),transparent_55%),radial-gradient(ellipse_at_85%_15%,rgba(79,140,255,0.18),transparent_50%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            ADCS · Certipy v5
          </div>
          <p className="font-mono text-sm text-muted-foreground">ESC1 · ESC4 · ESC8</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-motion-shell glass-surface-strong relative w-full overflow-hidden rounded-3xl p-2 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]">
      <hyperframes-player
        ref={playerRef}
        src="/hyperframes/hero/index.html"
        width="1080"
        height="1080"
        autoplay
        loop
        muted
        className="hero-motion-player block w-full"
      />
    </div>
  );
}
