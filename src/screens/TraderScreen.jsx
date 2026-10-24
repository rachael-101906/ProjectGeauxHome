import "../components/game-ui.css";

const ITEMS = [
  { id: "oxygenFilters", name: "OXYGEN FILTER", price: 35, seller: "DJ-TMONEY" },
  { id: "repairKits", name: "REPAIR KIT", price: 25, seller: "DJ-TMONEY" },
  { id: "drillUpgrades", name: "DRILL UPGRADE", price: 50, seller: "DR. OXY GENN" },
];

export default function TraderScreen({ credits, oreCount, inventory, onSellOre, onBuyItem, onClose }) {
  return (
    <section className="trader-screen" role="dialog" aria-modal="true" aria-labelledby="trader-screen-title">
      <div className="game-panel trader-screen__panel">
        <header className="trader-screen__header">
          <div>
            <p className="game-eyebrow">VASTITAS BOREALIS // FRONTIER MARKET</p>
            <h2 className="trader-screen__title" id="trader-screen-title">MARS TRADING POST</h2>
            <p className="game-eyebrow">Meet the local traders and exchange supplies.</p>
          </div>
          <div className="trader-screen__wallet">CREDITS: {credits} T<br />MARTIAN ORE: {oreCount}</div>
        </header>
        <div className="trader-screen__traders">
          <article className="trader-card">
            <div className="trader-card__portrait" aria-hidden="true">👽</div>
            <h3>MARTY MCMARS</h3>
            <p>Local Martian buyer. Sell ore to earn credits for equipment.</p>
            <div className="trader-card__stock">
              <div className="trader-card__item">
                <span>Martian ore — 10 T each</span>
                <button className="game-button" disabled={oreCount < 1} onClick={() => onSellOre(1)} type="button">SELL 1 ORE</button>
                <button className="game-button" disabled={oreCount < 1} onClick={() => onSellOre("all")} type="button">SELL ALL ORE</button>
              </div>
            </div>
          </article>
          <article className="trader-card">
            <div className="trader-card__portrait" aria-hidden="true">🧑‍🚀</div>
            <h3>DJ-TMONEY</h3>
            <p>Human supply dealer. Starter stock now; more gear can be added later.</p>
            <div className="trader-card__stock">
              {ITEMS.filter((item) => item.seller === "DJ-TMONEY").map((item) => (
                <div className="trader-card__item" key={item.id}>
                  <span>{item.name} — {item.price} T</span>
                  <span>OWNED: {inventory[item.id] || 0}</span>
                  <button className="game-button" disabled={credits < item.price} onClick={() => onBuyItem(item.id, item.price)} type="button">BUY</button>
                </div>
              ))}
            </div>
          </article>
          <article className="trader-card">
            <div className="trader-card__portrait" aria-hidden="true">🤖</div>
            <h3>DR. OXY GENN</h3>
            <p>Engineer and upgrade specialist. His advanced stock is a placeholder for future upgrades.</p>
            <div className="trader-card__stock">
              {ITEMS.filter((item) => item.seller === "DR. OXY GENN").map((item) => (
                <div className="trader-card__item" key={item.id}>
                  <span>{item.name} — {item.price} T</span>
                  <span>OWNED: {inventory[item.id] || 0}</span>
                  <button className="game-button" disabled={credits < item.price} onClick={() => onBuyItem(item.id, item.price)} type="button">BUY</button>
                </div>
              ))}
            </div>
          </article>
        </div>
        <footer className="trader-screen__footer">
          <button className="game-button" onClick={onClose} type="button">LEAVE MARKET / RETURN TO VASTITAS</button>
        </footer>
      </div>
    </section>
  );
}
