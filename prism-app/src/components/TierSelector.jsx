export default function TierSelector({ tiers, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {tiers.map(tier => {
        const selected = value === tier.score;
        return (
          <button
            key={tier.id}
            onClick={() => onChange(tier.score)}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "10px",
              padding: "9px 12px",
              background: selected ? "rgba(0,212,255,0.08)" : "var(--bg-card)",
              border: `1px solid ${selected ? "rgba(0,212,255,0.45)" : "var(--border)"}`,
              borderRadius: "5px",
              textAlign: "left",
              width: "100%",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span style={{
              fontFamily: "var(--mono)", fontWeight: 600, fontSize: "11px",
              color: selected ? "var(--cyan)" : "var(--text-muted)",
              flexShrink: 0, minWidth: "20px",
            }}>
              {tier.id}
            </span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: "14px", fontWeight: 600,
              color: selected ? "var(--cyan)" : "var(--text-muted)",
              flexShrink: 0, minWidth: "30px",
            }}>
              {tier.score}
            </span>
            <span style={{
              fontSize: "11px", lineHeight: 1.45,
              color: selected ? "rgba(0,212,255,0.85)" : "var(--text-dim)",
            }}>
              {tier.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
