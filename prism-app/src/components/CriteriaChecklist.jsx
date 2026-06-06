export default function CriteriaChecklist({ criteria, checked, onChange }) {
  const toggle = (i) => {
    const next = [...checked];
    next[i] = !next[i];
    onChange(next);
  };

  const count = checked.filter(Boolean).length;
  const score = count * 20;
  const scoreColor = score >= 80 ? "#00c880" : score >= 40 ? "var(--cyan)" : "var(--text-muted)";

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {criteria.map((c, i) => (
          <label
            key={c.key}
            style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              padding: "10px 14px", borderRadius: "5px", cursor: "pointer",
              background: checked[i] ? "rgba(0,212,255,0.07)" : "var(--bg-card)",
              border: `1px solid ${checked[i] ? "rgba(0,212,255,0.38)" : "var(--border)"}`,
              transition: "all 0.15s",
            }}
          >
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              style={{
                marginTop: "2px", flexShrink: 0,
                accentColor: "var(--cyan)", width: "14px", height: "14px",
                cursor: "pointer",
              }}
            />
            <div>
              <div style={{
                fontSize: "12px",
                fontWeight: checked[i] ? 600 : 500,
                color: checked[i] ? "var(--cyan)" : "var(--text)",
                marginBottom: "2px",
              }}>
                {c.label}
              </div>
              <div style={{
                fontSize: "11px", lineHeight: 1.45,
                color: checked[i] ? "rgba(0,212,255,0.65)" : "var(--text-muted)",
              }}>
                {c.desc}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div style={{
        marginTop: "10px", padding: "8px 12px",
        background: "var(--bg-panel)", borderRadius: "4px",
        border: "1px solid var(--border-dim)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {count} of 5 criteria met
        </span>
        <span style={{
          fontFamily: "var(--mono)", fontSize: "20px", fontWeight: 600,
          color: scoreColor, transition: "color 0.2s",
        }}>
          {score}
        </span>
      </div>
    </div>
  );
}
