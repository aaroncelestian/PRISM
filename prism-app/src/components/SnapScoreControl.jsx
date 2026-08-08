import { useEffect, useState } from "react";

const FINE_TUNE = 5;

export function nearestAnchor(anchors, value) {
  if (!anchors?.length) return null;
  return anchors.reduce((best, a) =>
    Math.abs(a.value - value) < Math.abs(best.value - value) ? a : best
  );
}

export function fineTuneRange(anchorValue, wiggle = FINE_TUNE) {
  return {
    min: Math.max(0, anchorValue - wiggle),
    max: Math.min(100, anchorValue + wiggle),
  };
}

/** Snap raw 0–100 input to nearest anchor, then clamp to ±wiggle around it. */
export function snapWithWiggle(raw, anchors, wiggle = FINE_TUNE) {
  const band = nearestAnchor(anchors, raw);
  if (!band) return Math.round(raw);
  const { min, max } = fineTuneRange(band.value, wiggle);
  return Math.max(min, Math.min(max, Math.round(raw)));
}

/**
 * Full-width score slider. Drag freely across 0–100.
 * Anchor numbers are clickable: jump to that value with a brief glow, then fine-tune.
 */
export default function SnapScoreControl({ anchors, value, onChange, compact = false }) {
  const [glowValue, setGlowValue] = useState(null);

  useEffect(() => {
    if (glowValue == null) return;
    const t = setTimeout(() => setGlowValue(null), 450);
    return () => clearTimeout(t);
  }, [glowValue]);

  if (!anchors?.length) return null;

  const band = nearestAnchor(anchors, value);
  const barColor = value >= 75 ? "#0a7a52" : value >= 50 ? "var(--cyan)" : "var(--text-label)";

  const jumpTo = (v) => {
    onChange(v);
    setGlowValue(v);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? "4px" : "6px" }}>
      {/* Slider with custom visible rail + reference ticks */}
      <div style={{ position: "relative", height: compact ? "22px" : "24px" }}>
        {/* Rail + fill */}
        <div style={{
          position: "absolute", pointerEvents: "none",
          top: "calc(50% - 1.5px)", left: 0, right: 0,
          height: "3px", background: "var(--border)", borderRadius: "2px",
        }}>
          <div style={{
            position: "absolute", height: "100%", width: `${value}%`,
            borderRadius: "2px", background: barColor, opacity: 0.7,
            transition: "width 0.12s ease, background 0.15s",
          }} />
          {/* Reference tick marks */}
          {anchors.map(a => (
            <div
              key={a.value}
              title={`${a.value}`}
              style={{
                position: "absolute",
                left: `${a.value}%`,
                top: "-4px",
                width: "2px",
                height: "11px",
                marginLeft: "-1px",
                borderRadius: "1px",
                background: band?.value === a.value ? "var(--cyan)" : "var(--text-muted)",
                opacity: band?.value === a.value ? 0.9 : 0.35,
                boxShadow: glowValue === a.value ? "0 0 8px 2px rgba(var(--accent-rgb), 0.75)" : "none",
                transition: "box-shadow 0.25s ease, opacity 0.15s",
              }}
            />
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={e => onChange(Math.round(+e.target.value))}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", margin: 0, height: "100%" }}
        />
      </div>

      {/* Clickable anchor numbers */}
      <div style={{ position: "relative", height: compact ? "14px" : "16px", marginTop: "-2px" }}>
        {anchors.map(a => {
          const active = band?.value === a.value;
          const glowing = glowValue === a.value;
          return (
            <button
              key={a.value}
              type="button"
              title={`Jump to ${a.value}`}
              onClick={() => jumpTo(a.value)}
              style={{
                position: "absolute",
                left: `${a.value}%`,
                transform: "translateX(-50%)",
                fontFamily: "var(--mono)",
                fontSize: compact ? "8px" : "9px",
                color: glowing || active ? "var(--cyan)" : "var(--text-muted)",
                fontWeight: glowing || active ? 600 : 400,
                whiteSpace: "nowrap",
                background: "none",
                border: "none",
                padding: "4px 6px",
                margin: "-4px -6px",
                cursor: "pointer",
                lineHeight: 1,
                borderRadius: "3px",
                boxShadow: glowing
                  ? "0 0 10px 3px rgba(var(--accent-rgb), 0.55), 0 0 0 1px rgba(var(--accent-rgb), 0.35)"
                  : "none",
                transition: "box-shadow 0.25s ease, color 0.15s, font-weight 0.15s",
              }}
            >
              {a.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
