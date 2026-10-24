import { useEffect, useRef, useState } from "react";
import "./player-stage.css";

// Optional hand-made sprites. Drop hugh.png / rover.png (transparent background)
// into src/components/assets/characters/ and they replace the placeholders.
const sprites = import.meta.glob("./assets/characters/*.{png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

function spriteUrl(name) {
  const match = Object.keys(sprites).find((path) =>
    path.toLowerCase().includes(`/${name}.`),
  );
  return match ? sprites[match] : null;
}

const SPEED = 24; // percent of screen width per second
const MIN_X = 4;
const MAX_X = 96;
const REACH = 7; // how close (in %) Hugh must be to interact

// Things Hugh can walk up to. x is a percentage of screen width.
const spots = [
  {
    id: "rover",
    x: 28,
    prompt: "TALK TO R.O.V.E.R.",
    lines: [
      "Boss! Systems are 12% functional and my optimism is at 100%.",
      "Gather materials, trade at Vastitas, and let's get this ship flying!",
    ],
  },
  {
    id: "exit",
    x: 94,
    prompt: "TRAVEL TO A NEW LOCATION",
    action: "travel",
  },
];

const moveKeys = {
  left: ["arrowleft", "a"],
  right: ["arrowright", "d"],
};

export default function PlayerStage({ active = true, onTravel }) {
  const [x, setX] = useState(12);
  const [facing, setFacing] = useState(1);
  const [walking, setWalking] = useState(false);
  const [talk, setTalk] = useState(null); // { spot, index }

  const held = useRef({ left: false, right: false });
  const xRef = useRef(12);
  const talkRef = useRef(null);
  const nearRef = useRef(null);

  const near =
    spots.find((spot) => Math.abs(spot.x - x) <= REACH) ?? null;
  nearRef.current = near;
  talkRef.current = talk;

  // Movement loop
  useEffect(() => {
    if (!active || talk) {
      held.current = { left: false, right: false };
      setWalking(false);
      return undefined;
    }

    let frame;
    let last = performance.now();

    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const dir = (held.current.right ? 1 : 0) - (held.current.left ? 1 : 0);
      if (dir !== 0) {
        xRef.current = Math.min(MAX_X, Math.max(MIN_X, xRef.current + dir * SPEED * dt));
        setX(xRef.current);
        setFacing(dir);
      }
      setWalking((was) => (was === (dir !== 0) ? was : dir !== 0));
      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, talk]);

  // Keyboard
  useEffect(() => {
    function setKey(event, value) {
      const key = event.key.toLowerCase();
      if (moveKeys.left.includes(key)) held.current.left = value;
      if (moveKeys.right.includes(key)) held.current.right = value;
    }

    function onKeyDown(event) {
      if (!active || event.repeat) return;
      const key = event.key.toLowerCase();

      if (moveKeys.left.includes(key) || moveKeys.right.includes(key)) {
        event.preventDefault();
        setKey(event, true);
        return;
      }

      if (key === "e" || key === "enter" || key === " ") {
        const current = talkRef.current;
        if (current) {
          event.preventDefault();
          const nextIndex = current.index + 1;
          setTalk(
            nextIndex < current.spot.lines.length
              ? { spot: current.spot, index: nextIndex }
              : null,
          );
          return;
        }

        const spot = nearRef.current;
        if (!spot) return;
        event.preventDefault();
        if (spot.action === "travel") onTravel?.();
        else if (spot.lines) setTalk({ spot, index: 0 });
      }
    }

    function onKeyUp(event) {
      setKey(event, false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [active, onTravel]);

  const hugh = spriteUrl("hugh");
  const rover = spriteUrl("rover");

  return (
    <div aria-hidden={!active} className="player-stage">
      {spots.map((spot) => (
        <div
          className={`stage-spot stage-spot--${spot.id}`}
          key={spot.id}
          style={{ left: `${spot.x}%` }}
        >
          {spot.id === "rover" &&
            (rover ? (
              <img alt="R.O.V.E.R." className="stage-sprite" src={rover} />
            ) : (
              <div className="rover-placeholder" />
            ))}
          {spot.id === "exit" && <div className="exit-marker">EXIT &gt;</div>}
        </div>
      ))}

      <div
        className={`hugh ${walking ? "hugh--walking" : ""}`}
        style={{ left: `${x}%`, "--facing": facing }}
      >
        {hugh ? (
          <img alt="Hugh" className="stage-sprite" src={hugh} />
        ) : (
          <div className="hugh-placeholder" />
        )}
      </div>

      {active && near && !talk && (
        <p className="stage-prompt" style={{ left: `${near.x}%` }}>
          [E] {near.prompt}
        </p>
      )}

      {talk && (
        <div className="stage-dialogue" role="dialog">
          <p className="game-eyebrow">R.O.V.E.R.</p>
          <p>{talk.spot.lines[talk.index]}</p>
          <p className="stage-dialogue__hint">[E] CONTINUE</p>
        </div>
      )}

      <p className="stage-controls">A / D OR ARROWS: MOVE &nbsp; E: INTERACT</p>
    </div>
  );
}
