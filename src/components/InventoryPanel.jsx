export default function InventoryPanel({
  inventory = {},
  gear = {},
  onClose,
}) {
  const items = [
    { name: "Ice", amount: inventory.ice ?? 0 },
    { name: "Sulfur", amount: inventory.sulfur ?? 0 },
    { name: "Basalt", amount: inventory.basalt ?? 0 },
    { name: "Tintinas", amount: inventory.tintinas ?? 0 },
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
        <button
          className="inventory-close"
          onClick={onClose}
          type="button"
          aria-label="Close inventory"
        >
          ×
        </button>

        <p className="game-eyebrow">EXPLORER STATUS</p>
        <h2>Inventory</h2>

        <h3>Resources</h3>
        <div className="inventory-grid">
          {items.map((item) => (
            <div className="inventory-item" key={item.name}>
              <span>{item.name}</span>
              <strong>{item.amount}</strong>
            </div>
          ))}
        </div>

        <h3>Equipment</h3>
        <div className="inventory-item">
          <span>Sulfur Filter</span>
          <strong>{gear.hasFilter ? "Installed" : "Not owned"}</strong>
        </div>
      </section>
    </div>
  );
}