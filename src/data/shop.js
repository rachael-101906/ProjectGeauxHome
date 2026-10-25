// DJ-CMoney's gear inventory. The Sulfur Filter is a permanent unlock purchased once.
const shop = [
  { id: "t1d", name: "T1D DRILL", type: "drill", tier: 1, oreDamage: 5, description: "Starter drill. Free to use.", cost: 0 },
  { id: "t2d", name: "T2D DRILL", type: "drill", tier: 2, oreDamage: 10, description: "Breaks tougher deposits faster.", cost: 20 },
  { id: "t3d", name: "T3D DRILL", type: "drill", tier: 3, oreDamage: 20, description: "Heavy-duty drill for advanced ore.", cost: 30 },
  { id: "t4d", name: "T4D DRILL", type: "drill", tier: 4, oreDamage: 40, description: "Top-tier drill. Makes basalt manageable.", cost: 40 },
  { id: "filter", name: "SULFUR FILTER", type: "filter", description: "Permanent suit upgrade. Required to enter Olympus Mons and mine sulfur or basalt.", cost: 80 },
  { id: "t1b", name: "T1B BLASTER", type: "blaster", description: "Starter defense against Zenos.", damage: 2, cost: 40 },
  { id: "t2b", name: "T2B BLASTER", type: "blaster", description: "Higher damage against Zenos.", damage: 5, cost: 80 },
  { id: "t3b", name: "T3B BLASTER", type: "blaster", description: "High-powered Zeno melter.", damage: 10, cost: 100 },
];
const SHOP = shop.map((item) => ({ ...item, kind: item.type, price: item.cost }));
const SHOP_BY_ID = Object.fromEntries(SHOP.map((item) => [item.id, item]));
export { SHOP, SHOP_BY_ID };
export default shop;