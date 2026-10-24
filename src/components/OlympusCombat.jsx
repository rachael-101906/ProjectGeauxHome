import { useEffect, useRef, useState } from "react";
import mobs from "../data/mobs.js";
import { MOB_ART } from "../data/art.js";
import fireball from "./assets/icons/fireball.png";

// Mob tuning (positions/speeds are in % of the screen).
const MOB_TUNING = {
  bZero: { speed: 9, reward: 5, size: 56, weight: 0.7 },
  aZero: { speed: 13, reward: 15, size: 72, weight: 0.3 },
};
const MAX_MOBS = 4;
const SPAWN_EVERY_MS = 2800;
const HIT_COOLDOWN_MS = 900; // how often one mob can hurt Hugh
const TOUCH_RANGE = { x: 4, y: 7 };
const SHOT_SPEED = 80;
const SHOT_LIFE_S = 1.2;
const SHOT_HIT_RANGE = { x: 4, y: 8 };
const BOUNDS = { minX: 6, maxX: 94, minY: 52, maxY: 90 };

let nextId = 1;

function spawnMob() {
  const type = Math.random() < MOB_TUNING.bZero.weight ? "bZero" : "aZero";
  const fromLeft = Math.random() < 0.5;
  return {
    id: nextId++,
    type,
    x: fromLeft ? BOUNDS.minX : BOUNDS.maxX,
    y: BOUNDS.minY + Math.random() * (BOUNDS.maxY - BOUNDS.minY),
    hp: mobs[type].health,
    lastHit: 0,
    flash: 0,
  };
}

/**
 * Real-time mob fight for Olympus Mons. Owns its own animation loop so the
 * big Base screen doesn't re-render every frame.
 *  - hughPosition: ref to { x, y } (percent), hughRef: Hugh's DOM node (for facing)
 *  - blasterDamage: damage per shot; armed: Blaster is the selected tool
 *  - onHurt(damage), onKill(reward, mobName)
 */
export default function OlympusCombat({
  hughPosition,
  hughRef,
  armed,
  blasterDamage,
  paused,
  onHurt,
  onKill,
}) {
  const world = useRef({ mobs: [], shots: [], lastSpawn: 0 });
  const [, setFrame] = useState(0);
  const props = useRef({});
  props.current = { armed, blasterDamage, paused, onHurt, onKill };

  // Shooting: Space fires the way Hugh faces; clicking fires at the cursor.
  useEffect(() => {
    function fire(dirX, dirY) {
      const { armed: isArmed, paused: isPaused } = props.current;
      if (!isArmed || isPaused) return;
      const length = Math.hypot(dirX, dirY) || 1;
      const { x, y } = hughPosition.current;
      world.current.shots.push({
        id: nextId++,
        x,
        y: y - 5,
        vx: (dirX / length) * SHOT_SPEED,
        vy: (dirY / length) * SHOT_SPEED,
        age: 0,
      });
    }
    function onKey(event) {
      if (event.code !== "Space" || event.repeat) return;
      event.preventDefault();
      fire(hughRef.current?.dataset.facing === "left" ? -1 : 1, 0);
    }
    function onPointer(event) {
      if (event.button !== 0 || event.target.closest("button, [role=dialog]")) return;
      const { x, y } = hughPosition.current;
      const px = (event.clientX / window.innerWidth) * 100;
      const py = (event.clientY / window.innerHeight) * 100;
      fire(px - x, py - (y - 5));
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [hughPosition, hughRef]);

  useEffect(() => {
    let raf;
    let last = performance.now();
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = world.current;
      const p = props.current;

      if (!p.paused) {
        if (w.mobs.length < MAX_MOBS && now - w.lastSpawn > SPAWN_EVERY_MS) {
          w.mobs.push(spawnMob());
          w.lastSpawn = now;
        }

        const hugh = hughPosition.current;
        for (const mob of w.mobs) {
          const dx = hugh.x - mob.x;
          const dy = hugh.y - mob.y;
          const dist = Math.hypot(dx, dy) || 1;
          const speed = MOB_TUNING[mob.type].speed;
          if (Math.abs(dx) > TOUCH_RANGE.x / 2 || Math.abs(dy) > TOUCH_RANGE.y / 2) {
            mob.x += (dx / dist) * speed * dt;
            mob.y += (dy / dist) * speed * dt;
          }
          mob.facing = dx < 0 ? "left" : "right";
          if (
            Math.abs(dx) < TOUCH_RANGE.x &&
            Math.abs(dy) < TOUCH_RANGE.y &&
            now - mob.lastHit > HIT_COOLDOWN_MS
          ) {
            mob.lastHit = now;
            p.onHurt(mobs[mob.type].damage);
          }
          mob.flash = Math.max(0, mob.flash - dt);
        }

        for (const shot of w.shots) {
          shot.x += shot.vx * dt;
          shot.y += shot.vy * dt;
          shot.age += dt;
          const target = w.mobs.find(
            (mob) =>
              mob.hp > 0 &&
              Math.abs(mob.x - shot.x) < SHOT_HIT_RANGE.x &&
              Math.abs(mob.y - 4 - shot.y) < SHOT_HIT_RANGE.y,
          );
          if (target) {
            target.hp -= p.blasterDamage;
            target.flash = 0.15;
            shot.age = SHOT_LIFE_S;
            if (target.hp <= 0) p.onKill(MOB_TUNING[target.type].reward, mobs[target.type].name);
          }
        }
        w.shots = w.shots.filter((s) => s.age < SHOT_LIFE_S);
        w.mobs = w.mobs.filter((m) => m.hp > 0);
      }

      setFrame((f) => (f + 1) % 1e6);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hughPosition]);

  const { mobs: liveMobs, shots } = world.current;
  return (
    <>
      {liveMobs.map((mob) => (
        <div
          aria-label={mobs[mob.type].name}
          className={`mob${mob.flash ? " mob--hit" : ""}`}
          key={mob.id}
          role="img"
          style={{
            left: `${mob.x}%`,
            top: `${mob.y}%`,
            width: MOB_TUNING[mob.type].size,
          }}
        >
          <span className="mob__bar">
            <span style={{ width: `${(mob.hp / mobs[mob.type].health) * 100}%` }} />
          </span>
          <img
            alt=""
            draggable="false"
            src={MOB_ART[mob.type]}
            style={{ transform: mob.facing === "right" ? "scaleX(-1)" : undefined }}
          />
        </div>
      ))}
      {shots.map((shot) => (
        <img
          alt=""
          className="blaster-shot"
          key={shot.id}
          src={fireball}
          style={{ left: `${shot.x}%`, top: `${shot.y}%` }}
        />
      ))}
    </>
  );
}
