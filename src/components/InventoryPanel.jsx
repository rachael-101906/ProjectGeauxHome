import { BLASTER_ART, DRILL_FRAMES, T_BIT } from "../data/art.js";
import shop from "../data/shop.js";
import { ORE_ICONS } from "../screens/TradingPost.jsx";

const ORES = ["ice", "iron", "silica", "sulfur", "basalt"];

// Opened with [3] or the Inventory hotbar slot. Close with [3], [Esc], X, or clicking outside.
export default function InventoryPanel({ inventory = {}, gear = {}, tintinas = 0, onClose }) {
  const drillTier = gear.drill || 1;
  const blasters = shop.filter((item) => item.type === "blaster" && gear.blasters?.includes(item.id));

  const equipment = [
    { name: `T${drillTier}D DRILL`, icon: DRILL_FRAMES[drillTier]?.[0], status: "EQUIPPED [1]" },
    ...(blasters.length
      ? blasters.map((b) => ({ name: b.name, icon: BLASTER_ART[b.id], status: `${b.damage} DMG` }))
      : [{ name: "NO BLASTER", icon: BLASTER_ART.t1b, status: "BUY FROM CAPTAIN McMARS", dim: true }]),
    { name: "SULFUR FILTER", icon: null, status: gear.hasFilter ? "INSTALLED" : "NOT OWNED", dim: !gear.hasFilter },
  ];

  return (
    <div className="inventory-overlay" onClick={onClose}>
      <section
        aria-label="Player inventory"
        aria-modal="true"
        className="game-panel inventory-panel"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="inventory-close" onClick={onClose} type="button" aria-label="Close inventory">
          ×
        </button>

        <p className="game-eyebrow">EXPLORER STATUS // [3] OR [ESC] TO CLOSE</p>
        <h2>Inventory</h2>

        <div className="inventory-item inventory-item--money">
          <span>
            {T_BIT && <img className="inventory-icon" src={T_BIT} alt="" />} TINTINAS
          </span>
          <strong>{tintinas}</strong>
        </div>

        <h3>Resources</h3>
        <div className="inventory-grid">
          {ORES.map((id) => (
            <div className="inventory-item" key={id}>
              <span>
                <img className="inventory-icon" src={ORE_ICONS[id]} alt="" /> {id.toUpperCase()}
              </span>
              <strong>{inventory[id] ?? 0}</strong>
            </div>
          ))}
        </div>

        <h3>Equipment</h3>
        <div className="inventory-grid inventory-grid--gear">
          {equipment.map((item) => (
            <div className={`inventory-item${item.dim ? " inventory-item--dim" : ""}`} key={item.name}>
              <span>
                {item.icon && <img className="inventory-icon" src={item.icon} alt="" />} {item.name}
              </span>
              <strong>{item.status}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
