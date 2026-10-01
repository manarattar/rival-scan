export default function CompetitorAvatar({ name, color = "#0f766e", size = 28, className = "" }) {
  const hex = /^#[0-9a-f]{6}$/i.test(color) ? color.slice(1) : "0f766e";
  const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  return <span aria-hidden="true" className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * .5), background: color, color: luminance > .179 ? "#10191d" : "#ffffff" }}>{(name || "?").trim().charAt(0).toUpperCase()}</span>;
}
