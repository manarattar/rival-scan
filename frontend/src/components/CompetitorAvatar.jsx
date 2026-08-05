/**
 * Monogram avatar for a competitor, drawn from its name and brand colour.
 *
 * Replaces the previous per-competitor emoji: emoji render differently on
 * every platform and read as decoration rather than as a brand mark.
 */
export default function CompetitorAvatar({ name, color = "#6366f1", size = 28, className = "" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold leading-none ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.45),
        color,
        background: `color-mix(in srgb, ${color} 18%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
      }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
