// Real Mars weather from NASA's InSight lander (Elysium Planitia), via the
// /api/mars-weather proxy in vite.config.js. The readings tune the dust storms:
//  - colder nights  -> storms bite more often (shorter damage tick) and regen slows outdoors
//  - windier sols   -> storms come sooner and hit a little harder
//  - southern summer (real dust-storm season) -> storms come sooner
//  - wind direction -> which way the storm streaks blow
// Live solar flares from NASA DONKI unlock a radiation event (see loadSpaceWeather).
// Damage is deliberately slight and never knocks Hugh out.

// Used when NASA is unreachable or a sensor has no reading.
// Typical InSight values, labelled as an estimate in the HUD - not presented as live data.
export const FALLBACK_WEATHER = {
  source: "fallback",
  sol: null,
  utc: null,
  season: null,
  temp: { av: -63, mn: -95, mx: -17 },
  wind: { av: 5, mn: 0.3, mx: 18 },
  pressure: { av: 720, mn: 700, mx: 740 },
  windFrom: null,
  southernSeason: null,
};

export async function loadMarsWeather() {
  try {
    const res = await fetch("/api/mars-weather");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const live = await res.json();
    return {
      ...live,
      // InSight's later sols are missing some sensors; fill gaps but remember we did.
      estimated: !live.temp || !live.wind,
      temp: live.temp ?? FALLBACK_WEATHER.temp,
      wind: live.wind ?? FALLBACK_WEATHER.wind,
      pressure: live.pressure ?? FALLBACK_WEATHER.pressure,
    };
  } catch (error) {
    console.warn("Mars weather unavailable, using typical values:", error.message);
    return FALLBACK_WEATHER;
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function weatherEffects(weather) {
  const low = weather.temp.mn;
  const gust = weather.wind.mx;
  const windFactor = clamp(gust / 18, 0.6, 1.6); // 18 m/s gusts = normal
  const dustSeason = /summer/i.test(weather.southernSeason ?? "");
  const gapScale = windFactor * (dustSeason ? 1.35 : 1);
  return {
    stormDamage: gust >= 20 ? 2 : 1, // HP per tick
    stormTickMs: low <= -90 ? 2000 : low <= -70 ? 2500 : 3000,
    stormGapMs: [45000 / gapScale, 100000 / gapScale],
    regenMultiplier: low <= -80 ? 2 / 3 : 1, // frostbite: 3 HP/s -> 2 HP/s outdoors
    // Meteorological convention: wind FROM the east blows streaks to the left.
    stormBlowsLeft: (weather.windFrom?.right ?? -1) > 0,
    dustSeason,
  };
}

export function weatherLabel(weather) {
  const temp = `${Math.round(weather.temp.mn)}°C LOW`;
  const wind = `WIND ${Math.round(weather.wind.mx)} M/S`;
  if (weather.source === "fallback") return `MARS WEATHER (OFFLINE ESTIMATE) · ${temp} · ${wind}`;
  const year = weather.utc ? ` (${weather.utc.slice(0, 4)})` : "";
  const from = weather.windFrom?.point ? ` FROM ${weather.windFrom.point}` : "";
  const season = weather.season ? ` · ${weather.season.toUpperCase()}` : "";
  return `NASA INSIGHT · SOL ${weather.sol}${year} · ${temp} · ${wind}${from}${season}${weather.estimated ? " · PARTIAL" : ""}`;
}

// ---- Live space weather (NASA DONKI): real solar flares in the last 3 days ----

export const NO_SPACE_WEATHER = { source: "fallback", strongestFlare: null, flareCount: 0, sepCount: 0, radiation: "none" };

export async function loadSpaceWeather() {
  try {
    const res = await fetch("/api/space-weather");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Space weather unavailable:", error.message);
    return NO_SPACE_WEATHER; // no data = no radiation event, never a made-up flare
  }
}

// Radiation event tuning; null = the sun has been quiet, so the event can't happen.
export function radiationEffects(space) {
  if (space.radiation === "none") return null;
  return { damage: 1, tickMs: space.radiation === "severe" ? 2000 : 3000 };
}

export function spaceWeatherLabel(space) {
  if (space.source === "fallback") return "NASA DONKI · OFFLINE";
  if (!space.strongestFlare) return "NASA DONKI · SUN QUIET (72H)";
  const date = space.strongestFlare.peakTime?.slice(5, 10) ?? "";
  const sep = space.sepCount ? ` · ${space.sepCount} RADIATION STORM${space.sepCount > 1 ? "S" : ""}` : "";
  return `NASA DONKI · LIVE · ${space.strongestFlare.classType} FLARE ${date}${sep}`;
}