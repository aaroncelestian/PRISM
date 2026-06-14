import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { id: "field",    label: "Field Tests" },
  { id: "surface",  label: "Surface" },
  { id: "classify", label: "Classification" },
  { id: "wrongs",   label: "Impostors" },
  { id: "verdict",  label: "Verdict" },
];

const FIELD_Q = [
  { id: "heavy",     label: "Noticeably heavy for its size",              yes: 2,  no: -1, unsure: 0,
    desc: "Meteorites are dense — 3.5 to 7.9 g/cm³. A baseball-sized stony meteorite feels roughly twice as heavy as an ordinary rock of the same size. An iron meteorite of the same size feels extraordinary." },
  { id: "magnetic",  label: "A magnet is attracted to it",                 yes: 3,  no: -1, unsure: 1,
    desc: "Use the strongest magnet available — a neodymium magnet is ideal. Most meteorites contain iron-nickel metal. Irons give strong response; stony chondrites give moderate; rare achondrites (lunar, Martian) give little or none." },
  { id: "no_streak", label: "No colored streak on unglazed porcelain",    yes: 2,  no: -3, unsure: 0,
    yesLabel: "No streak / faint gray only", noLabel: "Has a colored streak",
    desc: "Drag it firmly across the back of an unglazed tile. Meteorites leave no streak or faint gray. A red-brown streak = hematite or limonite; black streak = magnetite. Either rules out a meteorite." },
  { id: "dark_crust",label: "Thin dark exterior crust (black or brown)",  yes: 2,  no: 0,  unsure: 0,
    desc: "Fusion crust forms as the outer millimeter ablates during atmospheric entry. Fresh falls: glassy black, matte or slightly shiny. Older finds weather to rusty brown. Chip a corner — the interior should be lighter than the exterior." },
  { id: "no_quartz", label: "No visible quartz or clear glassy crystals", yes: 3,  no: -4, unsure: 0,
    yesLabel: "No quartz visible", noLabel: "Has quartz or clear crystals",
    desc: "Quartz (SiO₂) is essentially absent from all meteorite classes. If you see clear, angular, glassy crystal grains — or the rock resembles granite or sandstone — it is almost certainly a terrestrial rock. This is one of the most reliable disqualifiers." },
];

const SURFACE_Q = [
  { id: "regmaglypts", label: "Thumbprint-like depressions on the exterior", yes: 2, no: 0, unsure: 0,
    desc: "Regmaglypts are shallow rounded indentations formed by ablation during flight — like thumb impressions pressed into clay. Typically 1–5 cm across. One of the most distinctive meteorite features." },
  { id: "flow_lines",  label: "Flow lines or oriented surface texture",       yes: 1, no: 0, unsure: 0,
    desc: "Subtle ridges or grooves on the fusion crust all oriented in the same direction — the direction of travel during atmospheric entry." },
  { id: "no_vesicles", label: "No holes, bubbles, or vesicle cavities",       yes: 2, no: -3, unsure: 0,
    yesLabel: "Solid — no holes or bubbles", noLabel: "Has holes or bubble cavities",
    desc: "Holes or bubble-like vesicles are characteristic of slag and basalt — not meteorites. Meteorites are solid throughout. Any surface pitting is ablation or weathering, not gas bubbles." },
  { id: "metal_int",   label: "Metal flecks or bright specks on a fresh break", yes: 2, no: 0, unsure: 0,
    desc: "A fresh break may show bright silver iron-nickel grains, bronze troilite, or — in stony meteorites — small round spheres (chondrules, 0.5–2 mm) unique to meteorites and absent from all terrestrial rocks." },
];

const CLASS_Q = [
  { id: "chondrules",   label: "Small round spheres visible on fresh break",
    desc: "Chondrules (0.3–3 mm spherical silicate droplets) are found only in chondritic meteorites — 86% of all falls. Under magnification they look like tiny balls of rock in a finer matrix." },
  { id: "all_metal",    label: "Entirely or predominantly metallic throughout",
    desc: "Solid metal — dense, shiny on a fresh face, strongly magnetic — with little or no rocky material suggests an iron meteorite." },
  { id: "widmanstatten",label: "Geometric crystalline bands on a polished/etched face",
    desc: "The Widmanstätten pattern (interlocking bands of kamacite and taenite) is unique to meteoric iron. Visible only on a polished face acid-etched with dilute nitric acid. Do not attempt etching without professional guidance." },
  { id: "olivine_metal",label: "Yellowish-green crystals in a silvery metal matrix",
    desc: "Olivine crystals set in iron-nickel metal is the hallmark of a pallasite. The olivine is often gem-quality peridot, ranging from pale yellow to deep green." },
  { id: "no_metal_rock",label: "Entirely rock-like, no visible metal or spheres",
    desc: "Achondrites — including rare lunar and Martian meteorites — have no metal and no chondrules. They resemble igneous rock. Confirmation requires laboratory analysis only." },
];

const METEORITE_TYPES = [
  { name: "Stony — Chondrite",       freq: "86% of falls", fc: "#00c880",
    desc: "Most abundant class. Rock-like with fusion crust and variable magnetic response. Chondrules visible on fresh break. H, L, LL groups most common.",
    notable: "Allende (Mexico, 1969) · Murchison (Australia, 1969) · Chelyabinsk (Russia, 2013)" },
  { name: "Stony — Achondrite",      freq: "8% of falls",  fc: "#7ab0e0",
    desc: "Igneous meteorites, no chondrules. HED group from asteroid Vesta. Rare Martian (SNC) and lunar meteorites. Weakly or non-magnetic. Lab-confirmed only.",
    notable: "ALH 84001 (Mars) · Zagami (Nigeria/Mars) · NWA 6950 (Moon)" },
  { name: "Iron",                    freq: "5% of falls",  fc: "#f5c842",
    desc: "Nearly pure iron-nickel metal. Extremely dense (7.5–8 g/cm³), strongly magnetic. Polished acid-etched face reveals the Widmanstätten pattern — unique to meteoric iron.",
    notable: "Gibeon (Namibia) · Canyon Diablo (Arizona) · Cape York (Greenland)" },
  { name: "Pallasite (Stony-Iron)",  freq: "< 1% of falls", fc: "#c060ff",
    desc: "Olivine crystals (often gem peridot) suspended in iron-nickel metal. Visually spectacular. Strongly magnetic.",
    notable: "Brenham (Kansas) · Esquel (Argentina) · Fukang (China)" },
  { name: "Mesosiderite (Stony-Iron)", freq: "< 1% of falls", fc: "#c89058",
    desc: "Chaotic mix of silicate rock and metal — brecciated rather than organized. Moderately to strongly magnetic.",
    notable: "Vaca Muerta (Chile) · Morristown (Arizona)" },
];

const METEORWRONGS = [
  { name: "Slag",                rank: "Most common imposter", rc: "#e03040",
    desc: "Industrial waste from smelting. Found near old industrial sites, railroad tracks, quarries.",
    tells: ["Holes, vesicles, or bubble cavities — definitive", "Lighter than expected", "Glassy flow-like surface", "Irregular splatter shape", "Can be magnetic"] },
  { name: "Magnetite",           rank: "Strongly magnetic — frequent confusion", rc: "#e06a2a",
    desc: "Iron oxide (Fe₃O₄). Dense, common in igneous and metamorphic rocks worldwide.",
    tells: ["Black streak on porcelain — definitive", "Octahedral crystal habit", "No fusion crust or regmaglypts", "Sp. gr. ~5.2 vs. 7.5–8 for iron meteorites"] },
  { name: "Hematite (Kidney Ore)", rank: "Dense, iron-rich", rc: "#e06a2a",
    desc: "Iron oxide (Fe₂O₃). Dense, sometimes weakly magnetic. Botryoidal form mimics regmaglypts closely.",
    tells: ["Red-brown to cherry-red streak — definitive", "Botryoidal surface resembles regmaglypts", "No fusion crust"] },
  { name: "Basalt",              rank: "Dark volcanic rock", rc: "#607090",
    desc: "Common dark fine-grained volcanic rock. Superficially similar to stony meteorites.",
    tells: ["Vesicles typically present — definitive", "Lighter for its size", "Little or no magnetic response", "No fusion crust"] },
  { name: "Limonite / Goethite Nodule", rank: "Rounded, rusty, heavy", rc: "#607090",
    desc: "Hydrated iron oxide nodules from sedimentary settings. Rounded and heavy.",
    tells: ["Yellow to orange-brown streak", "Concentric internal banding", "Earthy porous surface — no fusion crust", "Usually not magnetic"] },
  { name: "Pyrite Concretion",   rank: "Heavy and dark", rc: "#607090",
    desc: "Iron sulfide nodules. Can form rounded masses in sedimentary rock.",
    tells: ["Greenish-black to brassy streak", "Sulfur smell when struck", "Brassy color on fresh surface", "Not magnetic"] },
  { name: "Industrial Iron / Steel", rank: "Strongly magnetic, very heavy", rc: "#e06a2a",
    desc: "Scrap metal, castings, rail fragments. Common finds with strong magnets.",
    tells: ["No fusion crust", "Machining evidence: saw marks, threads, welds", "No Widmanstätten pattern on etched face", "May have paint or stamped markings"] },
];

const LEGAL_NOTES = [
  { zone: "US Federal Public Land", detail: "BLM · USFS · NPS · BOR", status: "restricted", color: "#e06a2a",
    text: "Collecting meteorites on federal land is illegal without authorization under ARPA and federal land regulations (43 CFR 8365). The meteorite is property of the US government. Penalties include significant fines and criminal charges." },
  { zone: "US Private Land", detail: "With landowner permission", status: "allowed", color: "#00c880",
    text: "A meteorite found on private land belongs to the surface property owner, not the finder — unless they are the same person. Courts have consistently applied this. Obtain written permission before searching and document the find with GPS and photographs." },
  { zone: "US State Land", detail: "Parks, state forests, trust land", status: "variable", color: "#f5c842",
    text: "Regulations vary by state. Some prohibit collection entirely; others allow it under conditions. Contact the relevant state land management agency or state geological survey before collecting." },
  { zone: "Antarctica", detail: "All Antarctic territories", status: "prohibited", color: "#e03040",
    text: "Under the Antarctic Conservation Act and the Madrid Protocol, removing any Antarctic material — including meteorites — is prohibited for US citizens and most treaty nationals. ANSMET-recovered specimens belong to the Smithsonian and NASA." },
  { zone: "International Finds", detail: "NWA · Saharan · Omani · Other country finds", status: "variable", color: "#f5c842",
    text: "Many nations prohibit meteorite export. Purchasing an illegally exported meteorite can constitute receipt of stolen property. NWA (Northwest Africa) specimens from Morocco, Algeria, and Mauritania have historically had legal export pathways, though laws evolve. Always verify provenance before purchasing." },
];

const NEXT_STEPS = [
  { title: "University Meteoritics Programs",
    text: "Contact a university geology or earth sciences department with a planetary science program. Many provide informal assessments at little or no cost. Prepare multiple clear photographs first.",
    examples: "ASU Center for Meteorite Studies · UCLA IGPP · OU Meteorite Lab · NHM London · AMNH New York" },
  { title: "The Meteoritical Society / NomCom",
    text: "The Meteoritical Society coordinates official meteorite classification. Official recognition requires physical submission to an accredited laboratory. The Meteoritical Bulletin Database lists all officially classified meteorites.",
    examples: "meteoritical-society.org · Meteoritical Bulletin: lpi.usra.edu/meteor/" },
  { title: "IMCA Dealers and Professional Hunters",
    text: "Members of the International Meteorite Collectors Association (IMCA) agree to a code of ethics including accurate identification and legal provenance. IMCA dealers can often provide field assessments.",
    examples: "imca.cc — member directory" },
  { title: "Online Community Assessment",
    text: "Experienced collectors can provide rapid preliminary assessments from photographs. Provide multiple photos: overall shape, exterior texture, fresh break, and a scale reference. Do not grind or acid-etch without professional guidance.",
    examples: "r/meteorites (Reddit) · Meteorite-list (email listserv) · Facebook meteorite identification groups" },
];

// ── Scoring ─────────────────────────────────────────────────────────────────

function computeScore(fa, sa) {
  let s = 0;
  for (const q of FIELD_Q) {
    const a = fa[q.id];
    if (a === "yes") s += q.yes;
    else if (a === "no") s += q.no;
    else if (a === "unsure") s += (q.unsure ?? 0);
  }
  for (const q of SURFACE_Q) {
    const a = sa[q.id];
    if (a === "yes") s += q.yes;
    else if (a === "no") s += (q.no ?? 0);
    else if (a === "unsure") s += (q.unsure ?? 0);
  }
  return s;
}

function getVerdict(score) {
  if (score >= 12) return { label: "Strong Candidate",    color: "#00c880", pct: Math.min(100, Math.round(score / 16 * 100)),
    desc: "Multiple key meteorite indicators are present. Professional verification is strongly recommended." };
  if (score >= 6)  return { label: "Possible Candidate",  color: "#f5c842", pct: Math.round(score / 16 * 100),
    desc: "Some characteristics are consistent with a meteorite, but common terrestrial rocks or slag can share these traits. Further testing is advised." };
  if (score >= 1)  return { label: "Unlikely",            color: "#e06a2a", pct: Math.max(5, Math.round(score / 16 * 100)),
    desc: "Most key indicators are absent or disqualifying. Review the Impostors step carefully." };
  return             { label: "Very Unlikely",            color: "#e03040", pct: 3,
    desc: "Key identifying features are absent or disqualifying characteristics are present. Almost certainly a terrestrial rock or man-made object." };
}

function inferType(fa, cq) {
  if (cq.widmanstatten || cq.all_metal) return METEORITE_TYPES[2];
  if (cq.olivine_metal) return METEORITE_TYPES[3];
  if (cq.chondrules) return METEORITE_TYPES[0];
  if (cq.no_metal_rock) return METEORITE_TYPES[1];
  if (fa.magnetic === "yes") return METEORITE_TYPES[0];
  return null;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TriRadio({ value, onChange, yesLabel = "Yes", noLabel = "No" }) {
  const opts = [
    { v: "yes",    label: yesLabel,  bg: "rgba(0,200,128,0.15)",  border: "rgba(0,200,128,0.5)",  fg: "#00c880" },
    { v: "unsure", label: "Not sure", bg: "rgba(0,212,255,0.1)",   border: "rgba(0,212,255,0.35)", fg: "var(--cyan)" },
    { v: "no",     label: noLabel,   bg: "rgba(224,48,64,0.12)",  border: "rgba(224,48,64,0.4)",  fg: "#e03040" },
  ];
  return (
    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(value === o.v ? null : o.v)} style={{
          padding: "3px 10px", borderRadius: "4px", fontSize: "10px", letterSpacing: "0.05em",
          cursor: "pointer", transition: "all 0.15s",
          background: value === o.v ? o.bg : "transparent",
          border: `1px solid ${value === o.v ? o.border : "var(--border)"}`,
          color: value === o.v ? o.fg : "var(--text-muted)",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function QuestionCard({ q, answer, onAnswer }) {
  return (
    <div style={{ padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", marginBottom: "10px" }}>
      <div style={{ fontSize: "12px", color: "var(--text)", marginBottom: "6px", fontWeight: 500 }}>{q.label}</div>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, marginBottom: "10px" }}>{q.desc}</div>
      <TriRadio value={answer} onChange={onAnswer} yesLabel={q.yesLabel || "Yes"} noLabel={q.noLabel || "No"} />
    </div>
  );
}

function CheckCard({ q, checked, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      padding: "12px 16px", background: checked ? "rgba(0,212,255,0.06)" : "var(--bg-card)",
      border: `1px solid ${checked ? "rgba(0,212,255,0.35)" : "var(--border)"}`,
      borderRadius: "6px", marginBottom: "8px", cursor: "pointer", transition: "all 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div style={{
          width: "14px", height: "14px", borderRadius: "3px", flexShrink: 0, marginTop: "1px",
          background: checked ? "rgba(0,212,255,0.25)" : "transparent",
          border: `1px solid ${checked ? "var(--cyan)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {checked && <div style={{ width: "7px", height: "7px", borderRadius: "1px", background: "var(--cyan)" }} />}
        </div>
        <div>
          <div style={{ fontSize: "12px", color: checked ? "var(--cyan)" : "var(--text)", fontWeight: checked ? 600 : 400, marginBottom: "4px" }}>{q.label}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{q.desc}</div>
        </div>
      </div>
    </div>
  );
}

function StepBar({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "10px 20px", gap: "4px", borderBottom: "1px solid var(--border-dim)", background: "rgba(0,0,0,0.1)" }}>
      {STEPS.map((s, i) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? "1 1 auto" : "0 0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "3px 8px", borderRadius: "3px", flexShrink: 0,
            background: i === step ? "rgba(0,212,255,0.1)" : "transparent",
          }}>
            <div style={{
              width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i < step ? "rgba(0,200,128,0.2)" : i === step ? "rgba(0,212,255,0.2)" : "transparent",
              border: `1px solid ${i < step ? "rgba(0,200,128,0.4)" : i === step ? "rgba(0,212,255,0.45)" : "var(--border)"}`,
              fontSize: "8px", color: i < step ? "#00c880" : i === step ? "var(--cyan)" : "var(--text-muted)",
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: "9px", letterSpacing: "0.07em", color: i === step ? "var(--cyan)" : i < step ? "#00c880" : "var(--text-muted)", fontWeight: i === step ? 600 : 400, whiteSpace: "nowrap" }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: "1px", background: i < step ? "rgba(0,200,128,0.25)" : "var(--border-dim)", margin: "0 4px" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step content ─────────────────────────────────────────────────────────────

function StepField({ answers, setAnswers }) {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>FIELD TESTS</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          Answer based on observations you can make right now. If a test requires materials you don't have, select "Not sure."
        </div>
      </div>
      {FIELD_Q.map(q => (
        <QuestionCard key={q.id} q={q} answer={answers[q.id] ?? null}
          onAnswer={v => setAnswers(a => ({ ...a, [q.id]: v }))} />
      ))}
    </div>
  );
}

function StepSurface({ answers, setAnswers }) {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>SURFACE AND STRUCTURE</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          Examine the exterior carefully. A 10x hand lens is helpful but not required. If the specimen is weathered, some features may be obscured.
        </div>
      </div>
      {SURFACE_Q.map(q => (
        <QuestionCard key={q.id} q={q} answer={answers[q.id] ?? null}
          onAnswer={v => setAnswers(a => ({ ...a, [q.id]: v }))} />
      ))}
    </div>
  );
}

function StepClassify({ clues, setClues }) {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>CLASSIFICATION CLUES</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          Select any characteristics that match. These help narrow down the meteorite type. Multiple selections are possible — meteorite classification has significant overlap.
        </div>
      </div>
      {CLASS_Q.map(q => (
        <CheckCard key={q.id} q={q} checked={!!clues[q.id]}
          onToggle={() => setClues(c => ({ ...c, [q.id]: !c[q.id] }))} />
      ))}
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Meteorite Type Reference</div>
        <div style={{ display: "grid", gap: "8px" }}>
          {METEORITE_TYPES.map(t => (
            <div key={t.name} style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 600 }}>{t.name}</span>
                <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "3px", background: `${t.fc}20`, border: `1px solid ${t.fc}50`, color: t.fc }}>{t.freq}</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "4px" }}>{t.desc}</div>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", opacity: 0.7 }}>Notable finds: {t.notable}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepWrongs() {
  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>COMMON IMPOSTORS</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          These terrestrial rocks and man-made materials are responsible for the vast majority of "meteorite" submissions. Compare the specimen carefully against each.
        </div>
      </div>
      <div style={{ display: "grid", gap: "10px" }}>
        {METEORWRONGS.map(mw => (
          <div key={mw.name} style={{ padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 600 }}>{mw.name}</span>
              <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "3px", background: `${mw.rc}18`, border: `1px solid ${mw.rc}50`, color: mw.rc }}>{mw.rank}</span>
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "8px" }}>{mw.desc}</div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px" }}>Identifying features:</div>
            <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
              {mw.tells.map((t, i) => (
                <li key={i} style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px", lineHeight: 1.4 }}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepVerdict({ score, fa, cq }) {
  const verdict = getVerdict(score);
  const type = inferType(fa, cq);
  const pct = verdict.pct;

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>ASSESSMENT SUMMARY</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Based on responses from the previous steps.</div>
      </div>

      {/* Score meter */}
      <div style={{ padding: "16px 18px", background: "var(--bg-card)", border: `1px solid ${verdict.color}40`, borderRadius: "8px", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
          <span style={{ fontSize: "14px", color: verdict.color, fontWeight: 700, letterSpacing: "0.05em" }}>{verdict.label}</span>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>indicator score: {score}</span>
        </div>
        <div style={{ height: "6px", background: "var(--bg)", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: verdict.color, borderRadius: "3px", transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55 }}>{verdict.desc}</div>
      </div>

      {/* Likely type */}
      {type && (
        <div style={{ padding: "12px 16px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "6px", marginBottom: "14px" }}>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Most likely type if confirmed</div>
          <div style={{ fontSize: "13px", color: "var(--cyan)", fontWeight: 600, marginBottom: "4px" }}>{type.name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{type.desc}</div>
        </div>
      )}

      <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px", marginTop: "20px" }}>Legal Considerations</div>
      <div style={{ display: "grid", gap: "8px", marginBottom: "20px" }}>
        {LEGAL_NOTES.map(n => (
          <div key={n.zone} style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text)", fontWeight: 600 }}>{n.zone}</span>
              <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "3px", background: `${n.color}18`, border: `1px solid ${n.color}50`, color: n.color }}>{n.status}</span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "5px" }}>{n.detail}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5 }}>{n.text}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>Next Steps</div>
      <div style={{ display: "grid", gap: "8px" }}>
        {NEXT_STEPS.map(ns => (
          <div key={ns.title} style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "5px" }}>
            <div style={{ fontSize: "11px", color: "var(--text)", fontWeight: 600, marginBottom: "5px" }}>{ns.title}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "5px" }}>{ns.text}</div>
            <div style={{ fontSize: "10px", color: "var(--cyan)", opacity: 0.75 }}>{ns.examples}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MeteoriteID({ onClose }) {
  const [step, setStep] = useState(0);
  const [fieldAnswers,   setFieldAnswers]   = useState({});
  const [surfaceAnswers, setSurfaceAnswers] = useState({});
  const [classClues,     setClassClues]     = useState({});

  const score   = computeScore(fieldAnswers, surfaceAnswers);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: "680px", maxHeight: "92vh",
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <div style={{ fontSize: "14px", fontFamily: "var(--mono)", color: "var(--cyan)", fontWeight: 700, letterSpacing: "0.1em" }}>METEORITE IDENTIFICATION</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>Field verification guide — classification, impostors, and legality</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
            <X size={16} />
          </button>
        </div>

        {/* Step progress */}
        <StepBar step={step} />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          {step === 0 && <StepField    answers={fieldAnswers}   setAnswers={setFieldAnswers} />}
          {step === 1 && <StepSurface  answers={surfaceAnswers} setAnswers={setSurfaceAnswers} />}
          {step === 2 && <StepClassify clues={classClues}       setClues={setClassClues} />}
          {step === 3 && <StepWrongs />}
          {step === 4 && <StepVerdict  score={score} fa={fieldAnswers} cq={classClues} />}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-panel)" }}>
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{
            display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px",
            background: "transparent", border: "1px solid var(--border)", borderRadius: "5px",
            color: step === 0 ? "var(--border)" : "var(--text-muted)", fontSize: "11px",
            cursor: step === 0 ? "default" : "pointer", letterSpacing: "0.06em",
          }}>
            <ChevronLeft size={13} /> Back
          </button>
          <span style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            {step + 1} / {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px",
              background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.35)", borderRadius: "5px",
              color: "var(--cyan)", fontSize: "11px", cursor: "pointer", letterSpacing: "0.06em",
            }}>
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={onClose} style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px",
              background: "rgba(0,200,128,0.1)", border: "1px solid rgba(0,200,128,0.35)", borderRadius: "5px",
              color: "#00c880", fontSize: "11px", cursor: "pointer", letterSpacing: "0.06em",
            }}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
