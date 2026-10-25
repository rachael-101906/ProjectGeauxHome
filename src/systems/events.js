// Random world events (dust storms, ...). Runs as an async loop that sleeps a random
// time, checks that the moment is OK, then runs an event from start to finish.
// Stop it with the AbortController signal (React cleanup).

export const EVENTS = {
  dustStorm: {
    id: "dustStorm",
    name: "DUST STORM",
    warning: "DUST STORM INCOMING! MOVEMENT SLOWED, SUIT TAKING DAMAGE",
    clear: "THE DUST STORM HAS PASSED",
    durationMs: [14000, 20000],
    speedMultiplier: 0.6,
  },
  // Only possible after a real strong solar flare (NASA DONKI), see canRun in Base.jsx.
  radiation: {
    id: "radiation",
    name: "SOLAR RADIATION",
    warning: "RADIATION SPIKE FROM A REAL SOLAR FLARE! GET INTO THE VOLCANO",
    clear: "RADIATION LEVELS BACK TO NORMAL",
    durationMs: [10000, 15000],
    speedMultiplier: 1,
  },
};

const MIN_GAP_MS = 45000;
const MAX_GAP_MS = 100000;

const between = ([min, max]) => min + Math.random() * (max - min);

export function sleep(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve(false);
    const id = setTimeout(() => resolve(true), ms);
    signal?.addEventListener("abort", () => { clearTimeout(id); resolve(false); }, { once: true });
  });
}

/**
 * Starts the loop. Callbacks: canTrigger() -> boolean, onStart(event), onEnd(event).
 * getGapMs() -> [min, max] wait between events (optional; real Mars wind sets it).
 * canRun(event) -> boolean: whether this event type is possible right now (optional).
 * Returns { stop, trigger } - trigger(id) fires an event right now (used for testing).
 */
export function startRandomEvents({ canTrigger, onStart, onEnd, getGapMs = () => [MIN_GAP_MS, MAX_GAP_MS], canRun = () => true }) {
  const controller = new AbortController();
  const { signal } = controller;
  let running = false;

  async function runEvent(event) {
    running = true;
    onStart(event);
    await sleep(between(event.durationMs), signal);
    onEnd(event);
    running = false;
  }

  (async () => {
    while (!signal.aborted) {
      if (!(await sleep(between(getGapMs()), signal))) break;
      if (running) continue;
      if (!canTrigger()) { // bad moment (cutscene, menu): try again shortly
        if (!(await sleep(5000, signal))) break;
        if (!canTrigger()) continue;
      }
      const options = Object.values(EVENTS).filter(canRun);
      if (!options.length) continue;
      await runEvent(options[Math.floor(Math.random() * options.length)]);
    }
  })();

  return {
    stop: () => controller.abort(),
    trigger: (id = "dustStorm") => { if (!running && EVENTS[id]) runEvent(EVENTS[id]); },
  };
}