// Random world events (dust storms, ...). Runs as an async loop that sleeps a random
// time, checks that the moment is OK, then runs an event from start to finish.
// Stop it with the AbortController signal (React cleanup).

export const EVENTS = {
  dustStorm: {
    id: "dustStorm",
    name: "DUST STORM",
    warning: "DUST STORM INCOMING! MOVEMENT SLOWED",
    clear: "THE DUST STORM HAS PASSED",
    durationMs: [14000, 20000],
    speedMultiplier: 0.6,
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
 * Returns { stop, trigger } - trigger(id) fires an event right now (used for testing).
 */
export function startRandomEvents({ canTrigger, onStart, onEnd }) {
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
      if (!(await sleep(MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS), signal))) break;
      if (running) continue;
      if (!canTrigger()) { // bad moment (cutscene, menu): try again shortly
        if (!(await sleep(5000, signal))) break;
        if (!canTrigger()) continue;
      }
      const options = Object.values(EVENTS);
      await runEvent(options[Math.floor(Math.random() * options.length)]);
    }
  })();

  return {
    stop: () => controller.abort(),
    trigger: (id = "dustStorm") => { if (!running && EVENTS[id]) runEvent(EVENTS[id]); },
  };
}
