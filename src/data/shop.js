// Human's gear in shop (T1P-T4P, Filter, T1B-T3B).
const shop = [
    { id: 't1d', name: 'T1D', type: "drill", tier: 1, oreDamage: 5, description: 'Tier 1 drill, Free to use', cost: 0 },
    { id: 't2d', name: 'T2D', type: "drill", tier: 2, oreDamage: 10, description: 'Tier 2 drill, More durable', cost: 100 },
    { id: 't3d', name: 'T3D', type: "drill", tier: 3, oreDamage: 20, description: 'Tier 3 drill, Highly durable', cost: 600 },
    { id: 't4d', name: 'T4D', type: "drill", tier: 4, oreDamage: 40, description: 'Tier 4 drill, Extremely durable', cost: 1200 },
    { id: 'filter', name: 'Filter', type: "filter", description: 'Filters sulfur, required to level up to olympus', cost: 800 },
    { id: 't1b', name: 'T1B', type: "blaster", description: 'Tier 1 backpack, Basic storage', damage: 2, cost: 400 },
    { id: 't2b', name: 'T2B', type: "blaster", description: 'Tier 2 backpack, More storage', damage: 5, cost: 800 },
    { id: 't3b', name: 'T3B', type: "blaster", description: 'Tier 3 backpack, High storage', damage: 10, cost: 1600 }
];

const SHOP = shop.map((item) => ({
    ...item,
    kind: item.type,
    price: item.cost,
}));

const SHOP_BY_ID = Object.fromEntries(SHOP.map((item) => [item.id, item]));

export { SHOP, SHOP_BY_ID };
export default shop;
