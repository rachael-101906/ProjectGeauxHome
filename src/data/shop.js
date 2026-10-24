// Human's gear in shop (T1P-T4P, Filter, T1B-T3B).
const shop = [
    { id: 't1p', name: 'T1P', type: "pickaxe", tier: 1, oreDamage: 5, description: 'Tier 1 pickaxe, Free to use', cost: 0 },
    { id: 't2p', name: 'T2P', type: "pickaxe", tier: 2, oreDamage: 10, description: 'Tier 2 pickaxe, More durable', cost: 100 },
    { id: 't3p', name: 'T3P', type: "pickaxe", tier: 3, oreDamage: 20, description: 'Tier 3 pickaxe, Highly durable', cost: 600 },
    { id: 't4p', name: 'T4P', type: "pickaxe", tier: 4, oreDamage: 40, description: 'Tier 4 pickaxe, Extremely durable', cost: 1200 },
    { id: 'filter', name: 'Filter', type: "filter", description: 'Filters sulfur, required to level up to olympus', cost: 800 },
    { id: 't1b', name: 'T1B', type: "blaster", description: 'Tier 1 backpack, Basic storage', damage: 2, cost: 400 },
    { id: 't2b', name: 'T2B', type: "blaster", description: 'Tier 2 backpack, More storage', damage: 5, cost: 800 },
    { id: 't3b', name: 'T3B', type: "blaster", description: 'Tier 3 backpack, High storage', damage: 10, cost: 1600 }
];

export default shop;
