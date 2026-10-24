import { LOCATIONS } from '../data/locations';
import { ok, fail } from './helpers';

// Travel is free for now. Add oxygen/time costs here later.
export function travel(game, locationId) {
  if (!LOCATIONS[locationId]) return fail(game, 'Unknown location.')
  if (game.location === locationId) return fail(game, 'You are already here.')
  return ok({ ...game, location: locationId }, `arrive_${locationId}`, 'Transporting to ' + LOCATIONS[locationId].name);
}