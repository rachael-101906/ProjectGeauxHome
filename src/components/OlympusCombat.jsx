import { useEffect, useRef, useState } from "react";
import mobs from "../data/mobs.js";
import { ALPHA_FRAMES, MOB_ART } from "../data/art.js";
import fireball from "./assets/icons/fireball.png";

// Mob tuning (positions/speeds are in % of the screen).
// Keys match src/data/mobs.js.
const MOB_TUNING = {
  bZeno: { speed: 9, reward: 5, size: 56, weight: 0.7 },
  aZeno: { speed: 13, reward: 15, size: 72, weight: 0.3 },
  alphaZeno: { speed: 6, reward: 150, size: 140 },
};
// Boss arena: Alpha Zeno lunges every few seconds and calls in B-Zeno minions.
const BOSS_LUNGE_EVERY_MS = 5000;
const BOSS_LUNGE_MS = 800;
const BOSS_LUNGE_SPEED_X = 3.2;
const BOSS_MINION_EVERY_MS = 7000;
const BOSS_MAX_MINIONS = 2;
const ALPHA_FRAME_MS = 300;
const MAX_MOBS = 4;
const SPAWN_EVERY_MS = 2800;
const HIT_COOLDOWN_MS = 900; // how often one mob can hurt Hugh
const TOUCH_RANGE = { x: 4, y: 7 };
const SHOT_SPEED = 80;
const SHOT_LIFE_S = 1.2;
const SHOT_HIT_RANGE = { x: 4, y: 8 };
const BOUNDS = { minX: 6, maxX: 94, minY: 52, maxY: 90 };

let nextId = 1;

function spawnMob(forcedType) {
  const type = forcedType ?? (Math.random() < MOB_TUNING.bZeno.weight ? "bZeno" : "aZeno");
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
 *  - boss: arena mode. Only Alpha Zeno (plus a few minions) spawn; onBossDefeated() fires once.
 *    bossCleared: the boss was already beaten, so the arena stays quiet.
 */
export default function OlympusCombat({
  hughPosition,
  hughRef,
  armed,
  blasterDamage,
  paused,
  onHurt,
  onKill,
  boss = false,
  bossCleared = false,
  onBossDefeated,
}) {
  const world = useRef({ mobs: [], shots: [], lastSpawn: 0, kills: 0, alphaSpawned: false });
  const [, setFrame] = useState(0);
  const props = useRef({});
  props.current = { armed, blasterDamage, paused, onHurt, onKill, boss, bossCleared, onBossDefeated };

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
        if (p.boss) {
          if (!w.alphaSpawned && !p.bossCleared) {
            w.alphaSpawned = true;
            const alpha = spawnMob("alphaZeno");
            alpha.x = 50;
            alpha.y = BOUNDS.minY + 6;
            alpha.nextLunge = now + BOSS_LUNGE_EVERY_MS;
            alpha.lastHit = now + 2500 - HIT_COOLDOWN_MS; // grace period so Hugh can line up a shot
            w.mobs.push(alpha);
            w.lastSpawn = now;
          } else if (
            w.alphaSpawned &&
            w.mobs.some((m) => m.type === "alphaZeno") &&
            w.mobs.filter((m) => m.type !== "alphaZeno").length < BOSS_MAX_MINIONS &&
            now - w.lastSpawn > BOSS_MINION_EVERY_MS
          ) {
            w.mobs.push(spawnMob("bZeno"));
            w.lastSpawn = now;
          }
        } else if (w.mobs.length < MAX_MOBS && now - w.lastSpawn > SPAWN_EVERY_MS) {
          w.mobs.push(spawnMob());
          w.lastSpawn = now;
        }

        const hugh = hughPosition.current;
        for (const mob of w.mobs) {
          const dx = hugh.x - mob.x;
          const dy = hugh.y - mob.y;
          const dist = Math.hypot(dx, dy) || 1;
          let speed = MOB_TUNING[mob.type].speed;
          if (mob.type === "alphaZeno") {
            if (now > mob.nextLunge) {
              mob.lungeUntil = now + BOSS_LUNGE_MS;
              mob.nextLunge = now + BOSS_LUNGE_EVERY_MS;
            }
            if (now < (mob.lungeUntil ?? 0)) speed *= BOSS_LUNGE_SPEED_X;
          }
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
          const target = w.mobs.find((mob) => {
            const scale = mob.type === "alphaZeno" ? 2.5 : 1;
            return (
              mob.hp > 0 &&
              Math.abs(mob.x - shot.x) < SHOT_HIT_RANGE.x * scale &&
              Math.abs(mob.y - 4 * scale - shot.y) < SHOT_HIT_RANGE.y * scale
            );
          });
          if (target) {
            target.hp -= p.blasterDamage;
            target.flash = 0.15;
            shot.age = SHOT_LIFE_S;
            if (target.hp <= 0) {
              w.kills += 1;
              p.onKill(MOB_TUNING[target.type].reward, mobs[target.type].name);
              if (target.type === "alphaZeno") p.onBossDefeated?.();
            }
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
  const alphaFrame = ALPHA_FRAMES[Math.floor(performance.now() / ALPHA_FRAME_MS) % ALPHA_FRAMES.length];
  const alpha = liveMobs.find((mob) => mob.type === "alphaZeno");
  return (
    <>
      {boss && alpha && (
        <div className="boss-bar" role="progressbar" aria-label="Alpha Zeno health" aria-valuenow={Math.max(0, Math.round(alpha.hp))} aria-valuemax={mobs.alphaZeno.health}>
          ALPHA ZENO
          <div className="boss-bar__track">
            <div className="boss-bar__fill" style={{ width: `${Math.max(0, (alpha.hp / mobs.alphaZeno.health) * 100)}%` }} />
          </div>
        </div>
      )}
      {liveMobs.map((mob) => (
        <div
          aria-label={mobs[mob.type].name}
          className={`mob${mob.flash ? " mob--hit" : ""}${mob.type === "alphaZeno" ? " mob--boss" : ""}`}
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
            src={mob.type === "alphaZeno" ? alphaFrame : MOB_ART[mob.type]}
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
