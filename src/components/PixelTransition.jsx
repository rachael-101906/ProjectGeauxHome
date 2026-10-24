const rows = 8;
const columns = 12;
const pixels = Array.from({ length: rows * columns }, (_, index) => ({
  column: index % columns,
  key: index,
  row: Math.floor(index / columns),
}));

export default function PixelTransition({ phase }) {
  if (!phase) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`pixel-transition pixel-transition--${phase}`}
    >
      {pixels.map(({ column, key, row }) => (
        <span
          className={`pixel-transition__tile pixel-transition__tile--row-${row} pixel-transition__tile--column-${column}`}
          key={key}
        />
      ))}
    </div>
  );
}
