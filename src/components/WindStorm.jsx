// Dust-storm overlay. Drawn entirely in code (SVG + CSS), no image files.
// To use hand-made art instead, replace the <svg> streaks with your own <img> layers.
const STREAKS = [
  // top %, delay s, duration s, scale, opacity
  [8, 0, 2.6, 1.2, 0.55], [18, 0.7, 3.1, 0.8, 0.4], [29, 1.4, 2.4, 1, 0.6],
  [40, 0.3, 3.4, 1.4, 0.45], [52, 1.9, 2.8, 0.9, 0.5], [63, 0.9, 2.5, 1.1, 0.6],
  [74, 2.3, 3.2, 0.8, 0.4], [85, 0.1, 2.7, 1.3, 0.55], [93, 1.2, 3.0, 1, 0.45],
];

const SWIRL = "M2 30 C40 30 60 6 100 6 C132 6 140 26 120 30 C104 33 98 20 110 16";

export default function WindStorm() {
  return (
    <div aria-hidden="true" className="wind-storm">
      <div className="wind-storm__haze" />
      {STREAKS.map(([top, delay, duration, scale, opacity], i) => (
        <svg
          className="wind-storm__streak"
          key={i}
          viewBox="0 0 160 36"
          style={{
            top: `${top}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            "--streak-scale": scale,
            "--streak-opacity": opacity,
          }}
        >
          <path d={SWIRL} />
          <path d="M0 22 H70" />
          <path d="M20 34 H110" />
        </svg>
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <span
          className="wind-storm__grit"
          key={i}
          style={{
            top: `${(i * 37) % 100}%`,
            animationDelay: `${(i * 0.23) % 2}s`,
            animationDuration: `${0.9 + (i % 5) * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
}
