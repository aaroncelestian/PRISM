const FINE_TUNE = 5;

export function nearestAnchor(anchors, value) {
  if (!anchors?.length) return null;
  return anchors.reduce((best, a) =>
    Math.abs(a.value - value) < Math.abs(best.value - value) ? a : best
  );
}

export function fineTuneRange(anchorValue) {
  return {
    min: Math.max(0, anchorValue - FINE_TUNE),
    max: Math.min(100, anchorValue + FINE_TUNE),
  };
}

/**
 * Discrete band selector with optional ±5 fine-tune around the chosen anchor.
 * Used by Expert Mode (and Wizard fine-tune) for comparable scores.
 */
export default function SnapScoreControl({ anchors, value, onChange, compact = false }) {
  if (!anchors?.length) return null;

  const band = nearestAnchor(anchors, value);
  const { min, max } = fineTuneRange(band.value);
  const sliderVal = Math.max(min, Math.min(max, value));
  const offset = value - band.value;
  const outOfBand = Math.abs(offset) > FINE_TUNE;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? "6px" : "8px" }}>
      {/* Band buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${anchors.length}, minmax(0, 1fr))`,
        gap: compact ? "3px" : "4px",
      }}>
        {anchors.map(anchor => {
          const selected = band.value === anchor.value;
          return (
            <button
              key={anchor.value}
              type="button"
              title={`${anchor.label}: ${anchor.hint}`}
              onClick={() => onChange(anchor.value)}
              style={{
                padding: compact ? "6px 4px" : "8px 6px",
                background: selected ? "rgba(10,111,136,0.10)" : "var(--bg-card)",
                border: `1px solid ${selected ? "rgba(10,111,136,0.45)" : "var(--border)"}`,
                borderRadius: "5px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.12s",
                minWidth: 0,
              }}
            >
              <div style={{
                fontFamily: "var(--mono)",
                fontSize: compact ? "12px" : "13px",
                fontWeight: 600,
                color: selected ? "var(--cyan)" : "var(--text-muted)",
                lineHeight: 1.2,
              }}>
                {anchor.value}
              </div>
              <div style={{
                fontSize: compact ? "8px" : "9px",
                color: selected ? "rgba(10,111,136,0.75)" : "var(--text-muted)",
                lineHeight: 1.25,
                marginTop: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {anchor.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected band hint */}
      {!compact && (
        <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4, padding: "0 1px" }}>
          {band.hint}
        </div>
      )}

      {/* ±5 fine-tune */}
      <div style={{
        padding: compact ? "6px 8px" : "8px 10px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-dim)",
        borderRadius: "5px",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "4px", gap: "8px",
        }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
            Fine-tune ±{FINE_TUNE}
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: "11px",
            color: outOfBand ? "var(--warn)" : "var(--text-dim)",
          }}>
            {outOfBand
              ? `outside band — adjust or reselect`
              : offset === 0
                ? `at ${band.value}`
                : `${offset > 0 ? "+" : ""}${offset} from ${band.value}`}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={sliderVal}
          onChange={e => onChange(+e.target.value)}
          style={{ width: "100%", margin: 0, display: "block" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1px" }}>
          <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)" }}>{min}</span>
          <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)" }}>{band.value}</span>
          <span style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)" }}>{max}</span>
        </div>
      </div>
    </div>
  );
}
