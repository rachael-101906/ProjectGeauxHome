import { useEffect, useState } from "react";
import { MARTY_FRAMES, T_BIT } from "../data/art.js";
import "../components/game-ui.css";

import sellOres from "../data/sellOres.js";
import shop from "../data/shop.js";
import upgrades from "../data/upgrades.js";

import iceIcon from "../components/assets/ores/Ice_Icon.png";
import ironIcon from "../components/assets/ores/Iron.png";
import silicaIcon from "../components/assets/ores/Silica.png";
import sulfurIcon from "../components/assets/ores/Sulfur.png";
import basaltIcon from "../components/assets/ores/Basalt.png";

export const ORE_ICONS = {
  ice: iceIcon,
  iron: ironIcon,
  silica: silicaIcon,
  sulfur: sulfurIcon,
  basalt: basaltIcon,
};

// Traders. `frames` = animated sprite art; `portrait` = emoji placeholder until art exists.
const TRADERS = [
  {
    id: "martian",
    name: "MARTY McMARS",
    role: "ORE BUYER",
    frames: MARTY_FRAMES,
    greeting: "Ooh, shiny rocks! Marty pays top Tintinas. Mostly top. Sometimes.",
  },
  {
    id: "human",
    name: "DJ-TMONEY",
    role: "GEAR DEALER",
    portrait: "🧑‍🚀",
    greeting: "Fresh drills, fresh blasters, fresh beats. Cash only, space cowboy.",
  },
  {
    id: "robot",
    name: "DR. OXY GENN",
    role: "SHIP UPGRADES",
    portrait: "🤖",
    greeting: "Bring me raw materials and I will make your ship fly. Probably.",
  },
];

const formatCost = (cost) =>
  Object.entries(cost)
    .map(([id, amount]) => `${amount} ${id.toUpperCase()}`)
    .join(" + ");

function TraderPortrait({ trader, animate }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!trader.frames || !animate) return undefined;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % trader.frames.length), 350);
    return () => window.clearInterval(id);
  }, [trader.frames, animate]);
  return (
    <span className="trading-post__portrait" aria-hidden="true">
      {trader.frames ? <img src={trader.frames[frame]} alt="" /> : trader.portrait}
    </span>
  );
}

const Coin = () => <img className="t-bit" src={T_BIT} alt="T" />;

export default function TradingPost({ wallet, onChange, onLeave }) {
  const [traderId, setTraderId] = useState("martian");
  const [notice, setNotice] = useState("");
  const trader = TRADERS.find((t) => t.id === traderId);
  const { tintinas, inventory, gear, upgrades: installed } = wallet;

  function commit(next, message) {
    onChange(next);
    setNotice(message);
  }

  function sell(oreId, qty) {
    const n = Math.min(qty, inventory[oreId] || 0);
    if (!n) return;
    const earned = n * sellOres[oreId];
    commit(
      {
        ...wallet,
        tintinas: tintinas + earned,
        inventory: { ...inventory, [oreId]: inventory[oreId] - n },
      },
      `SOLD ${n} ${oreId.toUpperCase()} FOR ${earned} T`,
    );
  }

  function gearStatus(item) {
    if (item.type === "pickaxe" && gear.pickaxe >= item.tier) return "OWNED";
    if (item.type === "filter" && gear.hasFilter) return "OWNED";
    if (item.type === "blaster" && gear.blasters?.includes(item.id)) return "OWNED";
    if (item.type === "pickaxe" && item.tier !== gear.pickaxe + 1) return "LOCKED";
    if (tintinas < item.cost) return "NEED T";
    return null;
  }

  function buyGear(item) {
    if (gearStatus(item)) return;
    const nextGear = { ...gear };
    if (item.type === "pickaxe") nextGear.pickaxe = item.tier;
    if (item.type === "filter") nextGear.hasFilter = true;
    if (item.type === "blaster") nextGear.blasters = [...(gear.blasters || []), item.id];
    commit(
      { ...wallet, tintinas: tintinas - item.cost, gear: nextGear },
      `BOUGHT ${item.name} FOR ${item.cost} T`,
    );
  }

  function canAfford(cost) {
    return Object.entries(cost).every(([id, n]) => (inventory[id] || 0) >= n);
  }

  function install(up) {
    if (installed[up.id] || !canAfford(up.cost)) return;
    const nextInv = { ...inventory };
    for (const [id, n] of Object.entries(up.cost)) nextInv[id] -= n;
    commit(
      { ...wallet, inventory: nextInv, upgrades: { ...installed, [up.id]: 1 } },
      `${up.name.toUpperCase()} INSTALLED!`,
    );
  }

  return (
    <section className="trading-post" role="dialog" aria-modal="true" aria-label="Trading post">
      <div className="game-panel trading-post__panel">
        <header className="trading-post__header">
          <div>
            <p className="game-eyebrow">VASTITAS BOREALIS // FRONTIER MARKET</p>
            <h2>MARS TRADING POST</h2>
          </div>
          <div className="trading-post__wallet">
            <strong><Coin /> {tintinas}</strong>
            <div className="trading-post__ores">
              {Object.keys(ORE_ICONS).map((id) => (
                <span key={id} title={id}>
                  <img src={ORE_ICONS[id]} alt={id} /> {inventory[id] || 0}
                </span>
              ))}
            </div>
          </div>
        </header>

        <nav className="trading-post__tabs">
          {TRADERS.map((t) => (
            <button
              className={`trading-post__tab${t.id === traderId ? " is-selected" : ""}`}
              key={t.id}
              onClick={() => { setTraderId(t.id); setNotice(""); }}
              type="button"
            >
              <TraderPortrait animate={t.id === traderId} trader={t} />
              <span>
                {t.name}
                <small>{t.role}</small>
              </span>
            </button>
          ))}
        </nav>

        <p className="trading-post__greeting">“{trader.greeting}”</p>

        <ul className="trading-post__list">
          {traderId === "martian" &&
            Object.entries(sellOres).map(([id, price]) => (
              <li key={id}>
                <span className="trading-post__item">
                  <img src={ORE_ICONS[id]} alt="" /> {id.toUpperCase()}
                  <small>{price} T EACH · HAVE {inventory[id] || 0}</small>
                </span>
                <span className="trading-post__buttons">
                  <button className="game-button" disabled={!inventory[id]} onClick={() => sell(id, 1)} type="button">SELL 1</button>
                  <button className="game-button" disabled={!inventory[id]} onClick={() => sell(id, Infinity)} type="button">SELL ALL</button>
                </span>
              </li>
            ))}

          {traderId === "human" &&
            shop.map((item) => {
              const status = gearStatus(item);
              return (
                <li key={item.id}>
                  <span className="trading-post__item">
                    {item.name}
                    <small>{item.description}{item.oreDamage ? ` · ${item.oreDamage} DRILL DMG` : ""}</small>
                  </span>
                  <span className="trading-post__buttons">
                    <small>{item.cost === 0 ? "FREE" : `${item.cost} T`}</small>
                    <button className="game-button" disabled={Boolean(status)} onClick={() => buyGear(item)} type="button">
                      {status || "BUY"}
                    </button>
                  </span>
                </li>
              );
            })}

          {traderId === "robot" &&
            upgrades.map((up) => (
              <li key={up.id}>
                <span className="trading-post__item">
                  {up.name.toUpperCase()}
                  <small>COST: {formatCost(up.cost)}</small>
                </span>
                <button
                  className="game-button"
                  disabled={Boolean(installed[up.id]) || !canAfford(up.cost)}
                  onClick={() => install(up)}
                  type="button"
                >
                  {installed[up.id] ? "INSTALLED" : "INSTALL"}
                </button>
              </li>
            ))}
        </ul>

        <footer className="trading-post__footer">
          <p aria-live="polite">{notice}</p>
          <button className="game-button" onClick={onLeave} type="button">LEAVE MARKET</button>
        </footer>
      </div>
    </section>
  );
}
