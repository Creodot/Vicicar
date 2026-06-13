"use client";

/**
 * videoManager — shared playback registry for every v3 loop (spec §3.4).
 *
 * Usage (scene builders / VideoStage):
 *
 *   useEffect(() => register(videoEl, { threshold: 0.25 }), []);
 *
 * Markup contract (owned by callers):
 *   <video muted loop playsInline preload="none"
 *          poster={asset("/videos/X-poster.jpg")}>…</video>
 *
 * Behaviour:
 * - IntersectionObserver: entering past `threshold` (default .25) → first
 *   `load()` then `play()`; leaving → `pause()`.
 * - Global cap MAX_PLAYING = 2: when a third video asks to play, the
 *   lowest-visibility currently-playing video is paused (the asker is
 *   refused only when strictly LESS visible — ties favour the newest
 *   asker). When a slot frees (IO exit / unregister), the most visible
 *   eligible paused video is promoted back in.
 * - Hidden tab → everything pauses; visible again → eligible videos resume.
 * - requestVideoFrameCallback watchdog: 5 consecutive frame deltas > 50 ms
 *   (after a short post-play() warm-up) → playbackRate = .5 (weak-GPU
 *   degradation; rate resets to 1 on the next managed play).
 * - prefers-reduced-motion OR navigator.connection.saveData: never autoplay;
 *   poster stays; tap on the video toggles play/pause.
 */

export const MAX_PLAYING = 2;

export type RegisterOptions = {
  /** IO visibility ratio required to start playback. Default 0.25. */
  threshold?: number;
};

type Entry = {
  el: HTMLVideoElement;
  threshold: number;
  ratio: number;
  loaded: boolean;
  /** paused only because the tab is hidden — resume on visibilitychange */
  hiddenPaused: boolean;
  onTap?: () => void;
  vfcId?: number;
  /** Monotonic play-session id — guards stale play() rejections. */
  playGen?: number;
};

const entries = new Map<HTMLVideoElement, Entry>();
const playing = new Set<Entry>();

let io: IntersectionObserver | null = null;
let visListener = false;

/* ------------------------------------------------------------------ */

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const saveData = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return conn?.saveData === true;
};

/** True when videos are allowed to autoplay via IO (no RM, no saveData). */
export const canAutoplay = (): boolean =>
  !prefersReducedMotion() && !saveData();

/* ------------------------------------------------------------------ */

function ensureLoaded(entry: Entry): void {
  if (entry.loaded) return;
  entry.loaded = true;
  /* preload="none" → kick the fetch on first need */
  if (entry.el.preload === "none" && entry.el.readyState === 0) {
    entry.el.load();
  }
}

type VFCVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

/** Presented-frame deltas slower than this count as "slow" (sources are
 *  ~24-30 fps → healthy deltas are 33-42 ms; a lone compositor hiccup —
 *  a clip-path wipe, a Lenis momentum frame — must NOT trip degradation). */
const SLOW_FRAME_MS = 50;
/** Consecutive slow frames required before degrading playbackRate. */
const SLOW_FRAMES_TO_DEGRADE = 5;
/** Callbacks ignored after play() — startup/ramp-up jitter. */
const WARMUP_FRAMES = 3;

function startWatchdog(entry: Entry): void {
  const el = entry.el as VFCVideo;
  if (typeof el.requestVideoFrameCallback !== "function") return;
  if (entry.vfcId !== undefined) return; // already armed
  let last = 0;
  let frames = 0;
  let slowStreak = 0;
  const tick = (now: number) => {
    if (!playing.has(entry)) {
      entry.vfcId = undefined;
      return;
    }
    frames += 1;
    if (frames > WARMUP_FRAMES && last > 0) {
      if (now - last > SLOW_FRAME_MS) {
        slowStreak += 1;
        if (slowStreak >= SLOW_FRAMES_TO_DEGRADE && el.playbackRate !== 0.5) {
          el.playbackRate = 0.5;
        }
      } else {
        slowStreak = 0;
      }
    }
    last = now;
    entry.vfcId = el.requestVideoFrameCallback!(tick);
  };
  entry.vfcId = el.requestVideoFrameCallback(tick);
}

function stopWatchdog(entry: Entry): void {
  const el = entry.el as VFCVideo;
  if (entry.vfcId !== undefined && typeof el.cancelVideoFrameCallback === "function") {
    el.cancelVideoFrameCallback(entry.vfcId);
  }
  entry.vfcId = undefined;
}

function startPlayback(entry: Entry): void {
  ensureLoaded(entry);
  playing.add(entry);
  entry.hiddenPaused = false;
  /* A past watchdog degradation must not outlive its slow spell. */
  entry.el.playbackRate = 1;
  /* Stale-rejection guard: pause → re-play before the FIRST play() promise
     settles (IO flicker at a threshold edge, rapid Méthode swaps) rejects
     that first promise (AbortError) AFTER the second play() succeeded. The
     stale catch must not unbook a genuinely-playing entry — that would
     undercount the cap and self-terminate the rVFC watchdog. */
  const gen = (entry.playGen = (entry.playGen ?? 0) + 1);
  entry.el.play().catch(() => {
    if (entry.playGen === gen && entry.el.paused) {
      playing.delete(entry);
      stopWatchdog(entry);
    }
  });
  startWatchdog(entry);
}

function stopPlayback(entry: Entry, hiddenPaused = false): void {
  playing.delete(entry);
  stopWatchdog(entry);
  entry.hiddenPaused = hiddenPaused;
  entry.el.pause();
}

/** A slot just freed (IO exit / unregister): resume the most visible
 *  eligible paused video. IO cannot refire while a sticky scene is pinned
 *  (ratios are static), so an earlier cap refusal/eviction would otherwise
 *  never be retried. */
function promoteCandidate(): void {
  if (document.visibilityState === "hidden") return;
  if (playing.size >= MAX_PLAYING) return;
  let best: Entry | null = null;
  for (const entry of entries.values()) {
    if (playing.has(entry)) continue;
    if (entry.ratio <= 0 || entry.ratio < entry.threshold) continue;
    if (!best || entry.ratio > best.ratio) best = entry;
  }
  if (best) startPlayback(best);
}

/** Ask to play `entry`, respecting the global cap. */
function requestPlay(entry: Entry): void {
  if (playing.has(entry)) return;
  if (document.visibilityState === "hidden") {
    entry.hiddenPaused = true; // resume candidate when the tab returns
    return;
  }
  if (playing.size >= MAX_PLAYING) {
    let lowest: Entry | null = null;
    for (const p of playing) {
      if (lowest === null || p.ratio < lowest.ratio) lowest = p;
    }
    /* Asker loses only when strictly LESS visible — on equal ratios the
       newest asker wins, so identically-sized stacked loops (Méthode
       panel) can never deadlock-starve the visible step. */
    if (!lowest || lowest.ratio > entry.ratio) return;
    stopPlayback(lowest);
  }
  startPlayback(entry);
}

/* ------------------------------------------------------------------ */

function onIntersect(records: IntersectionObserverEntry[]): void {
  for (const record of records) {
    const entry = entries.get(record.target as HTMLVideoElement);
    if (!entry) continue;
    entry.ratio = record.isIntersecting ? record.intersectionRatio : 0;
    if (record.isIntersecting && record.intersectionRatio >= entry.threshold) {
      requestPlay(entry);
    } else if (playing.has(entry) || entry.hiddenPaused) {
      stopPlayback(entry);
      promoteCandidate();
    }
  }
}

function getObserver(): IntersectionObserver {
  if (!io) {
    io = new IntersectionObserver(onIntersect, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
  }
  return io;
}

function onVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    for (const p of Array.from(playing)) stopPlayback(p, true);
  } else {
    for (const entry of entries.values()) {
      if (entry.hiddenPaused && entry.ratio >= entry.threshold) {
        requestPlay(entry);
      } else {
        entry.hiddenPaused = false;
      }
    }
  }
}

/* ------------------------------------------------------------------ */

/**
 * Register a <video> with the playback manager.
 * Returns an unregister/cleanup function (pause + detach observers).
 */
export function register(
  el: HTMLVideoElement,
  opts: RegisterOptions = {}
): () => void {
  if (typeof window === "undefined") return () => {};

  const entry: Entry = {
    el,
    threshold: opts.threshold ?? 0.25,
    ratio: 0,
    loaded: el.readyState > 0,
    hiddenPaused: false,
  };
  entries.set(el, entry);

  if (canAutoplay()) {
    getObserver().observe(el);
  } else {
    /* Reduced motion / data saver: poster shown, tap toggles play/pause. */
    entry.onTap = () => {
      if (el.paused) {
        if (playing.size >= MAX_PLAYING) {
          const first = playing.values().next().value as Entry | undefined;
          if (first) stopPlayback(first);
        }
        startPlayback(entry);
      } else {
        stopPlayback(entry);
      }
    };
    el.addEventListener("click", entry.onTap);
  }

  if (!visListener) {
    visListener = true;
    document.addEventListener("visibilitychange", onVisibilityChange);
  }

  return () => {
    stopPlayback(entry);
    io?.unobserve(el);
    if (entry.onTap) el.removeEventListener("click", entry.onTap);
    entries.delete(el);
    promoteCandidate();
    /* Last video gone (e.g. / → /avis): release the document listener and
       the IO. Both re-attach lazily on the next register(). */
    if (entries.size === 0) {
      if (visListener) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        visListener = false;
      }
      io?.disconnect();
      io = null;
    }
  };
}
