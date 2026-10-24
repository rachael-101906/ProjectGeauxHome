const initialState = {
    player: {
        name: 'Hugh Mann',
        location: 'arcadia', 
        level: 1,
        health: 100,
        maxHealth: 100,
        combat: 0, 
        flags: {}, 
        tintinas: 0,
        inventory: { ice: 0, iron: 0, silica: 0, sulfur: 0, basalt: 0 },
        gear: { pickaxe: 1, blaster: 0, hasFilter: false },
        mining: { oreHealth: {} },
        upgrades: { comm: 0, life: 0, fusion: 0, propulsion: 0 }
    }
}

export default initialState;