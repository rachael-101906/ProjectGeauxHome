import { create } from 'zustand';
import initialState from './initialState';
import { mine } from '../systems/mining';
import { sell } from '../systems/selling';

const useGameStore = create((set) => ({
    ...initialState,
    mine: (ore) => set((state) => mine(state, ore)),
    sell: (ore, quantity) => set((state) => sell(state, ore, quantity)),
    travel: (location) => set((state) => ({ ...state, player: { ...state.player, location: location } })),
    reset: () => set(() => ({ ...initialState })),
}));

export default useGameStore;