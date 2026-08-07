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
 * Full-width score slider that magnetically snaps to labeled anchors,
 * with ±5 wiggle room around the active band. No button grid.
 */
export default function SnapScoreControl({ anchors, value, onChange, compact = false }) {
  if (!anchors?.length) return null;

  const band = nearestAnchor(anchors, value);
  const offset = value - (band?.value ?? 0);
  const barColor = value >= 75 ? "#0a7a52" : value >= 50 ? "var(--cyan)" : "var(--text-label)";

  const handleInput = (raw) => {
    onChange(snapWithWiggle(raw, anchors));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? "4px" : "6px" }}>
      {/* Slider with custom visible rail + snap ticks */}
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
            transition: "width 0.05s, background 0.15s",
          }} />
          {/* Snap tick marks */}
          {anchors.map(a => (
            <div
              key={a.value}
              title={`${a.value} — ${a.label}`}
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
          onChange={e => handleInput(+e.target.value)}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", margin: 0, height: "100%" }}
        />
      </div>

      {/* Anchor value labels along the track */}
      <div style={{ position: "relative", height: compact ? "12px" : "14px", marginTop: "-2px" }}>
        {anchors.map(a => (
          <span
            key={a.value}
            style={{
              position: "absolute",
              left: `${a.value}%`,
              transform: "translateX(-50%)",
              fontFamily: "var(--mono)",
              fontSize: compact ? "8px" : "9px",
              color: band?.value === a.value ? "var(--cyan)" : "var(--text-muted)",
              fontWeight: band?.value === a.value ? 600 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {a.value}
          </span>
        ))}
      </div>

      {/* Current band label + offset */}
      {band && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          gap: "8px", padding: "0 1px",
        }}>
          <span style={{
            fontSize: compact ? "10px" : "11px",
            color: "var(--text-dim)",
            lineHeight: 1.35,
            minWidth: 0,
          }}>
            <span style={{ fontWeight: 500, color: "var(--text)" }}>{band.label}</span>
            {!compact && (
              <span style={{ color: "var(--text-muted)" }}> — {band.hint}</span>
            )}
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: "10px", flexShrink: 0,
            color: offset === 0 ? "var(--text-muted)" : "var(--cyan)",
          }}>
            {offset === 0 ? `snap ${band.value}` : `${offset > 0 ? "+" : ""}${offset} · snap ${band.value}`}
          </span>
        </div>
      )}
    </div>
  );
}
