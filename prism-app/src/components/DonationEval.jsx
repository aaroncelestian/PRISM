import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, ChevronLeft, ChevronRight, MapPin, Search, Download, Printer, Copy, CheckCheck } from "lucide-react";
import { lookupCountryFlag, STATUS_COLORS, STATUS_LABELS } from "../data/countryFlags.js";
import { GRADES, WEIGHTS, CONTEXTS, THRESHOLD, applyNonLinearTransform } from "../data/prism.js";

function _ctxScore(ctxKey, scores) {
  const W = WEIGHTS[ctxKey];
  const adj = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, applyNonLinearTransform(k, v ?? 0)]));
  return Math.round(Object.entries(W).reduce((a, [k, w]) => a + (adj[k] ?? 0) * w, 0));
}
function _bestScore(scores) {
  const all = CONTEXTS.map(c => ({ key: c.key, score: _ctxScore(c.key, scores) }));
  const best = all.find(c => c.score >= THRESHOLD) || all[0];
  const grade = GRADES.find(g => best.score >= g.min) || GRADES[GRADES.length - 1];
  return { score: best.score, grade };
}

// ── Specimen Picker ───────────────────────────────────────────────────────────

function DonationPickerScreen({ initScores, initSpec, records, onSelect, onClose }) {
  const { score: curScore, grade: curGrade } = _bestScore(initScores);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(4,8,18,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px", maxHeight: "92vh", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}>🏛️ Museum Donation Evaluation</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>Select the specimen to evaluate</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Current session */}
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Current Evaluation</div>
            <button
              onClick={() => onSelect(initScores, initSpec)}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.25)", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.25)"}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>
                  {initSpec.name || initSpec.species || "Unnamed Specimen"}
                </div>
                {(initSpec.species || initSpec.locality) && (
                  <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {[initSpec.species, initSpec.locality].filter(Boolean).join(" \u00b7 ")}
                  </div>
                )}
                <div style={{ marginTop: "4px", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Active session — not yet saved to history</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--mono)", color: curGrade.color, lineHeight: 1 }}>{curScore}</div>
                <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${curGrade.color}15`, color: curGrade.color, border: `1px solid ${curGrade.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{curGrade.emoji} {curGrade.label}</div>
              </div>
            </button>
          </div>

          {/* Saved collection */}
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              Saved Collection {records.length > 0 ? `(${records.length})` : ""}
            </div>
            {records.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)", lineHeight: 1.6 }}>
                No specimens saved to history yet.<br />Save a PRISM evaluation first using the Save button.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {records.map(rec => {
                  const gradeObj = GRADES.find(g => g.label === rec.grade) || GRADES[GRADES.length - 1];
                  const dateStr = new Date(rec.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <button
                      key={rec.id}
                      onClick={() => onSelect(rec.scores, rec.spec)}
                      style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "2px" }}>
                          {rec.spec?.name || rec.spec?.species || "Unnamed Specimen"}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" \u00b7 ")}
                        </div>
                        <div style={{ marginTop: "3px", fontSize: "9px", color: "var(--text-muted)" }}>Saved {dateStr}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--mono)", color: gradeObj.color, lineHeight: 1 }}>{rec.prismScore}</div>
                        <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${gradeObj.color}15`, color: gradeObj.color, border: `1px solid ${gradeObj.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{rec.gradeEmoji} {rec.grade}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>
            <X size={13} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Fix Leaflet default marker icons broken by Vite's asset pipeline
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Acquisition types ────────────────────────────────────────────────────────

const ACQUISITION_TYPES = [
  { key: "self",      icon: "⛏️",  label: "Self-collected",          desc: "I personally collected this specimen from the field." },
  { key: "dealer",    icon: "🏪",  label: "Purchased from dealer",   desc: "Bought from a mineral shop, dealer, or professional seller." },
  { key: "collector", icon: "🤝",  label: "Collector-to-collector",  desc: "Traded with or purchased from another collector." },
  { key: "auction",   icon: "🔨",  label: "Auction / gem show",      desc: "Purchased at an auction house, gem show, or estate sale." },
  { key: "gift",      icon: "🎁",  label: "Gift or inheritance",     desc: "Received as a gift, bequest, or through an estate." },
  { key: "unknown",   icon: "❓",  label: "Unknown / undocumented",  desc: "Acquisition history is unclear or cannot be verified." },
];

// Chain strength rating per acquisition type — affects summary score
const CHAIN_STRENGTH = {
  self:      { base: 90, label: "Strong" },
  dealer:    { base: 65, label: "Variable — depends on dealer documentation" },
  collector: { base: 60, label: "Variable — depends on chain completeness" },
  auction:   { base: 55, label: "Moderate — auction records help considerably" },
  gift:      { base: 50, label: "Moderate — prior-owner history often uncertain" },
  unknown:   { base: 10, label: "Weak — severely limits donation value" },
};

// ── Land types ────────────────────────────────────────────────────────────────

const LAND_TYPES = [
  { key: "blm",     label: "BLM Land",                color: "#f5c842", desc: "Bureau of Land Management — casual collecting generally allowed under 43 CFR 8365." },
  { key: "usfs",    label: "US Forest Service",        color: "#52c275", desc: "National Forest — limited casual collecting typically permitted; check local forest plan." },
  { key: "nps",     label: "National Park / Monument", color: "#e06a2a", desc: "Collecting almost universally prohibited; scientific permits or pre-designation status required." },
  { key: "state",   label: "State Land",               color: "#7ab0e0", desc: "Rules vary by state — consult the relevant state land management agency." },
  { key: "private", label: "Private Land",             color: "#c89058", desc: "Landowner permission required; written documentation strongly preferred." },
  { key: "tribal",  label: "Tribal / Native Land",    color: "#c060c0", desc: "Tribal permission and/or federal permit required; NHPA Section 106 may apply." },
  { key: "dod",     label: "Military / DOD Land",     color: "#b03030", desc: "Department of Defense controlled installation — collecting strictly prohibited; access requires explicit military authorization." },
  { key: "unknown", label: "Unknown / Undocumented",  color: "#607090", desc: "Insufficient locality data — provenance severely limited for institutional acquisition." },
];

const LAND_LEGAL = {
  blm: {
    status: "allowed",
    color: "#00c880",
    heading: "Generally Permitted",
    detail: "Casual recreational collecting allowed under 43 CFR 8365 for personal use. Commercial collection, use of power tools, and collection from ACECs, Wilderness Areas, or other special management areas require a permit or are prohibited.",
  },
  usfs: {
    status: "conditional",
    color: "#ffa028",
    heading: "Conditionally Permitted",
    detail: "Limited casual collecting typically permitted on most National Forests for personal use (~25 lbs/day, ~250 lbs/yr guideline). Some forests restrict or prohibit collecting — always verify the local forest management plan before collecting.",
  },
  nps: {
    status: "prohibited",
    color: "#ff5050",
    heading: "Collecting Prohibited",
    detail: "Collection of rocks, minerals, and fossils is prohibited in virtually all National Parks and Monuments under 36 CFR 2.1. Exceptions require a valid NPS scientific collection permit. Violations carry civil and criminal penalties.",
    action: "A specimen collected here is not eligible for institutional donation without documented NPS scientific collection permit authorization.",
  },
  state: {
    status: "conditional",
    color: "#ffa028",
    heading: "Varies by State / Jurisdiction",
    detail: "Rules differ significantly by state or country — some allow casual collecting; others require permits or prohibit it entirely. Verify with the relevant land management agency that collecting was legal at this site.",
  },
  private: {
    status: "conditional",
    color: "#f0c040",
    heading: "Landowner Permission Required",
    detail: "Collecting on private land without the landowner's explicit permission is trespass. Written permission is strongly preferred. Many institutions require documented landowner consent as part of the donation review.",
  },
  tribal: {
    status: "prohibited",
    color: "#ff5050",
    heading: "Restricted — Permit / Tribal Authority Required",
    detail: "Collecting on Tribal or Indigenous lands without explicit permission from the governing tribal authority is a federal offense under ARPA. NHPA Section 106 consultation may also apply. Institutional acquisition is heavily scrutinized.",
    action: "Do not proceed without documented tribal authority permission and all applicable federal permits on file.",
  },
  dod: {
    status: "prohibited",
    color: "#c04040",
    heading: "Collecting Strictly Prohibited",
    detail: "Military installations and Department of Defense lands are strictly controlled federal areas. Collecting any materials, unauthorized access, or removal of any resources is a federal crime punishable by fines and imprisonment.",
    action: "No mineral collection permit exists for active military land. A specimen claimed from here cannot be accepted by any institution without verified military authorization.",
  },
  unknown: {
    status: "unknown",
    color: "#607090",
    heading: "Land Status Undocumented",
    detail: "Without knowing the land management type, legal collecting cannot be confirmed. This significantly limits provenance credibility for institutional acquisition.",
  },
};

const LAND_QUESTIONS = {
  blm: [
    { id: "casual",          label: "Casual / recreational purpose",     desc: "Collection was for personal use — not for commercial resale at time of collection.",       required: true },
    { id: "no_machine",      label: "No mechanical equipment used",       desc: "Only hand tools (picks, chisels, hammers) — no power tools, explosives, or machinery.",  required: true },
    { id: "reasonable_qty",  label: "Reasonable personal quantity",       desc: "Amount collected is reasonable for personal use (~250 lbs/yr guideline for minerals).",   required: true },
    { id: "no_restricted",   label: "Not from a special management area", desc: "Site is not an ACEC, Research Natural Area, Wilderness Area, or other closed zone.",     required: true },
    { id: "no_vert_fossil",  label: "No vertebrate fossils collected",    desc: "Vertebrate fossils (bone/teeth) require a permit — invertebrate/plant fossils are casual.", required: false },
  ],
  usfs: [
    { id: "casual_usfs",     label: "Casual/recreational collection",     desc: "Personal use within Forest Service limits (typically ≤25 lbs/day, ≤250 lbs/yr).",       required: true },
    { id: "no_special_usfs", label: "Not from a restricted area",         desc: "Site is not in a Wilderness Area, Research Natural Area, or otherwise restricted zone.", required: true },
    { id: "no_sale_usfs",    label: "Not collected for commercial resale", desc: "Material collected under casual use provisions may not be sold commercially.",          required: true },
  ],
  nps: [
    { id: "pre_designation", label: "Collected before NPS designation",   desc: "Specimen was collected before the area became a National Park / Monument.",             required: false },
    { id: "sci_permit",      label: "Scientific collection permit held",   desc: "A valid NPS scientific collection permit (VEGPMT or equivalent) was in effect.",       required: false },
  ],
  state: [
    { id: "state_rules",     label: "State regulations followed",         desc: "Applicable state laws governing collecting on state-managed land were followed.",        required: true },
    { id: "state_permit",    label: "Required state permit obtained",      desc: "If a collecting permit was required, it was in hand at time of collection.",            required: false },
  ],
  private: [
    { id: "permission",      label: "Landowner permission obtained",       desc: "Written or verbal permission was given by the landowner prior to collecting.",          required: true },
    { id: "written_perm",    label: "Written permission available",        desc: "A letter, email, or signed agreement documenting the landowner's consent exists.",     required: false },
  ],
  tribal: [
    { id: "tribal_perm",     label: "Tribal authority permission obtained", desc: "Formal permission from the governing tribal authority was obtained.",                  required: true },
    { id: "federal_permit",  label: "Federal permit held (if required)",   desc: "Any required ARPA or NHPA Section 106 permit was obtained.",                          required: false },
  ],
  unknown: [],
};

const PROVENANCE_QUESTIONS = [
  { id: "field_label",   label: "Original field label exists",        desc: "A label written at or near the time of collection accompanies the specimen. Significantly strengthens institutional confidence.",          required: false, recommended: true  },
  { id: "gps_coords",    label: "GPS / precise location recorded",    desc: "GPS coordinates, UTM grid, or a detailed locality description was documented.",        required: true  },
  { id: "date_known",    label: "Collection date documented",         desc: "The year (at minimum) the specimen was collected is known and recorded. Undated specimens are often declined by institutions.",              required: false, recommended: true  },
  { id: "chain_doc",     label: "Full chain of custody documented",   desc: "All owners since original collection can be accounted for with records.",              required: false },
  { id: "no_cites",      label: "No international export restrictions", desc: "Specimen was not illegally exported from its country of origin; no CITES issues.",   required: true  },
  { id: "no_deaccession", label: "Not an accessioned museum specimen", desc: "Confirm title is free and clear — this specimen has not been formally accessioned into another institutional collection and was not improperly removed from one.", required: true  },
];

// ── Acquisition-specific documentation questions ─────────────────────────────

const DEALER_QUESTIONS = [
  { id: "dealer_named",     label: "Dealer name recorded",             desc: "The dealer's name and business are documented with the specimen.",              required: true  },
  { id: "dealer_location",  label: "Dealer location documented",       desc: "The dealer's city and country are recorded.",                                   required: true  },
  { id: "dealer_receipt",   label: "Receipt or invoice available",     desc: "A purchase receipt, invoice, or email confirmation exists.",                    required: false },
  { id: "dealer_locality",  label: "Locality confirmed by dealer",     desc: "The dealer stated and stands behind the specimen's collecting locality.",       required: true  },
  { id: "dealer_source",    label: "Dealer's own source documented",   desc: "The dealer can trace where they sourced the specimen (mine, importer, etc.).", required: false },
];

const COLLECTOR_QUESTIONS = [
  { id: "collector_named",  label: "Previous collector(s) identified", desc: "All previous collectors in the chain are identified by name.",                  required: true  },
  { id: "chain_complete",   label: "Complete chain of custody",        desc: "Every ownership transfer from original collection to present is accounted for.", required: false },
  { id: "original_known",   label: "Original source known",            desc: "How the first collector obtained the specimen is known.",                       required: false },
  { id: "locality_verified","label": "Locality verified by prior owner", "desc": "A prior owner confirms the stated collecting locality.",                    required: true  },
];

const AUCTION_QUESTIONS = [
  { id: "auction_named",    label: "Auction / show documented",        desc: "Auction house, gem show, or estate name is recorded.",                          required: true  },
  { id: "sale_date",        label: "Sale date documented",             desc: "The date of the auction or show is known.",                                     required: true  },
  { id: "catalog_ref",      label: "Catalog or lot reference",        desc: "An auction catalog number, lot number, or show reference is available.",        required: false },
  { id: "prov_in_catalog",  label: "Provenance stated in catalog",    desc: "The catalog entry included provenance information for this specimen.",           required: false },
];

const GIFT_QUESTIONS = [
  { id: "donor_named",      label: "Donor / previous owner named",    desc: "The person who gave or bequeathed the specimen is identified.",                  required: true  },
  { id: "donor_history",    label: "Donor's acquisition history known", desc: "How the donor originally obtained the specimen is documented.",               required: false },
  { id: "estate_doc",       label: "Estate documentation available",  desc: "Probate records or estate inventory exists (for inherited specimens).",         required: false },
];

function getAcquisitionQuestions(acquisitionType) {
  const map = { dealer: DEALER_QUESTIONS, collector: COLLECTOR_QUESTIONS, auction: AUCTION_QUESTIONS, gift: GIFT_QUESTIONS };
  return map[acquisitionType] || [];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 9), { animate: true, duration: 0.8 });
  }, [target, map]);
  return null;
}

function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) { setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <div style={{ width: "9px", height: "9px", borderRadius: "2px", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function CheckItem({ q, checked, onToggle }) {
  return (
    <label style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "8px 12px", borderRadius: "5px", cursor: "pointer",
      background: checked ? "rgba(0,212,255,0.05)" : "var(--bg-card)",
      border: `1px solid ${checked ? "rgba(0,212,255,0.3)" : "var(--border)"}`,
      transition: "all 0.15s",
    }}>
      <input
        type="checkbox" checked={checked} onChange={onToggle}
        style={{ marginTop: "2px", flexShrink: 0, accentColor: "var(--cyan)", width: "13px", height: "13px", cursor: "pointer" }}
      />
      <div>
        <div style={{ fontSize: "12px", fontWeight: checked ? 600 : 400, color: checked ? "var(--cyan)" : "var(--text)", marginBottom: "1px" }}>
          {q.label}
          {q.required && <span style={{ color: "#ffa028", marginLeft: "5px", fontSize: "9px" }}>★ required</span>}
          {q.recommended && <span style={{ color: "#00c880", marginLeft: "5px", fontSize: "9px" }}>⊕ highly recommended</span>}
        </div>
        <div style={{ fontSize: "10px", color: checked ? "rgba(0,212,255,0.55)" : "var(--text-muted)", lineHeight: 1.4 }}>
          {q.desc}
        </div>
      </div>
    </label>
  );
}

// ── Step 1: Acquisition ───────────────────────────────────────────────────────

function AcquisitionStep({ acquisitionType, setAcquisitionType, acquisitionDetails, setAcquisitionDetails }) {
  const set = (key, val) => setAcquisitionDetails(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          How did you obtain this specimen?
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          The acquisition method determines what provenance documentation is needed and
          how it affects donation value. Each route has different strengths and gaps.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
        {ACQUISITION_TYPES.map(at => {
          const sel = acquisitionType === at.key;
          return (
            <button key={at.key} onClick={() => setAcquisitionType(at.key)} style={{
              padding: "10px 12px", borderRadius: "6px", textAlign: "left",
              background: sel ? "rgba(0,212,255,0.07)" : "var(--bg-card)",
              border: `1px solid ${sel ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
              color: sel ? "var(--cyan)" : "var(--text-dim)",
              transition: "all 0.15s",
            }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{at.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: sel ? 600 : 500, marginBottom: "2px" }}>{at.label}</div>
              <div style={{ fontSize: "10px", color: sel ? "rgba(0,212,255,0.6)" : "var(--text-muted)", lineHeight: 1.4 }}>{at.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Conditional detail fields */}
      {acquisitionType === "dealer" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
            Dealer Information
          </div>
          <input type="text" placeholder="Dealer name ★" value={acquisitionDetails.dealerName || ""} onChange={e => set("dealerName", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <input type="text" placeholder="Dealer city / country" value={acquisitionDetails.dealerLocation || ""} onChange={e => set("dealerLocation", e.target.value)} />
            <input type="text" placeholder="Approx. year purchased" value={acquisitionDetails.purchaseYear || ""} onChange={e => set("purchaseYear", e.target.value)} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-dim)", cursor: "pointer" }}>
            <input type="checkbox" checked={!!acquisitionDetails.hasReceipt} onChange={e => set("hasReceipt", e.target.checked)} style={{ accentColor: "var(--cyan)" }} />
            Receipt or invoice available
          </label>
        </div>
      )}

      {acquisitionType === "collector" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
            Collector Chain
          </div>
          <input type="text" placeholder="Collector name(s) ★" value={acquisitionDetails.collectorNames || ""} onChange={e => set("collectorNames", e.target.value)} />
          <input type="text" placeholder="Approx. year of trade/purchase" value={acquisitionDetails.purchaseYear || ""} onChange={e => set("purchaseYear", e.target.value)} />
          <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5, padding: "7px 10px", background: "var(--bg-card)", borderRadius: "4px", border: "1px solid var(--border-dim)" }}>
            💡 The more complete the chain back to the original collector, the stronger the provenance.
            Unknown links in the chain each reduce institutional confidence in the specimen's origin.
          </div>
        </div>
      )}

      {acquisitionType === "auction" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
            Auction / Show Details
          </div>
          <input type="text" placeholder="Auction house or show name ★" value={acquisitionDetails.auctionHouse || ""} onChange={e => set("auctionHouse", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <input type="text" placeholder="Sale date" value={acquisitionDetails.saleDate || ""} onChange={e => set("saleDate", e.target.value)} />
            <input type="text" placeholder="Lot / catalog reference" value={acquisitionDetails.catalogRef || ""} onChange={e => set("catalogRef", e.target.value)} />
          </div>
        </div>
      )}

      {acquisitionType === "gift" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "2px" }}>
            Donor / Previous Owner
          </div>
          <input type="text" placeholder="Donor's name ★" value={acquisitionDetails.donorName || ""} onChange={e => set("donorName", e.target.value)} />
          <input type="text" placeholder="Their relationship to you" value={acquisitionDetails.donorRelationship || ""} onChange={e => set("donorRelationship", e.target.value)} />
        </div>
      )}

      {acquisitionType === "unknown" && (
        <div style={{ padding: "10px 12px", background: "rgba(255,160,40,0.07)", border: "1px solid rgba(255,160,40,0.25)", borderRadius: "5px", fontSize: "11px", color: "#ffa028", lineHeight: 1.55 }}>
          ⚠️ Unknown acquisition history significantly limits donation value. Most institutions require
          at least partial provenance documentation before accepting specimens into permanent collections.
          This evaluation will still complete, but donation prospects will be limited.
        </div>
      )}

    </div>
  );
}

// ── Reverse-geocoding helpers ─────────────────────────────────────────────────

// Maps ADMIN_DEPT_CODE and ADMIN_AGENCY_CODE from BLM_Natl_SMA_LimitedScale to internal land type keys.
// DEPT takes precedence; AGENCY is checked as a fallback for disambiguation.
const BLM_DEPT_MAP = {
  DOD: "dod",           // All DoD branches (USAF, ARMY, NAVY, USMC, USACE, DOD)
  NTVALL: "tribal",     // Native American / All Tribes
  NTVPIC: "tribal",     // Native American / Tribal
  PVT: "private",       // Private
  LG: "state",          // Local Government
  ST: "state",          // State
};
const BLM_AGENCY_MAP = {
  BLM: "blm",
  NPS: "nps",
  USFS: "usfs",
  FWS: "nps",           // Fish & Wildlife — treat as protected/NPS tier
  USBR: "blm",          // Bureau of Reclamation — federal, BLM-comparable
  BIA: "tribal",        // Bureau of Indian Affairs
  USAF: "dod",
  ARMY: "dod",
  NAVY: "dod",
  USMC: "dod",
  USACE: "dod",
  USCG: "dod",          // Coast Guard
  VA: "unknown",
  DOE: "unknown",
  BPA: "unknown",
  FAA: "unknown",
  NOAA: "unknown",
  GSA: "unknown",
  HHS: "unknown",
  USPS: "unknown",
  BOP: "unknown",
  DOT: "unknown",
  FHA: "unknown",
  OTHFE: "unknown",
  UND: "unknown",
};

function blmSmaKey(deptCode, agencyCode) {
  const dept   = (deptCode   || "").toUpperCase().trim();
  const agency = (agencyCode || "").toUpperCase().trim();
  return BLM_DEPT_MAP[dept] ?? BLM_AGENCY_MAP[agency] ?? null;
}

const MILITARY_KEYWORDS = ["air force base", "army base", "naval air station", "naval station", "marine corps base", "military reservation", "army post", "air national guard", "joint base"];

const NPS_KEYWORDS  = ["national park","national monument","national recreation area","national seashore","national lakeshore","national battlefield","national preserve","national historic site","national memorial"];
const USFS_KEYWORDS = ["national forest","national grassland"];

async function geocodePlace(query) {
  try {
    const data = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "User-Agent": "PRISM-MineralEval/1.0" } }
    ).then(r => r.json());
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

async function detectMapLocation({ lat, lng, currentCountry, wasCountryAutoDetected, setOriginCountry, setLandType, setIsDetecting, setAutoSource }) {
  setIsDetecting(true);
  const src = {};
  try {
    const NOM_HEADERS = { headers: { "User-Agent": "PRISM-MineralEval/1.0" } };
    const BASE = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en&extratags=1`;

    // Overpass is_in() — returns ALL OSM area polygons that CONTAIN the clicked point.
    // This is the same underlying data the base map renders. It reliably finds national parks,
    // national forests, military reservations, tribal land, etc. by their polygon boundaries.
    // CORS-safe: overpass-api.de explicitly allows cross-origin requests.
    const overpassQuery = `[out:json][timeout:12];is_in(${lat},${lng})->.a;.a out tags;`;

    // BLM GIS API — authoritative federal surface management dataset (same source as the map overlay).
    // Queried in parallel with Overpass so it can cross-check ambiguous military/range polygons.
    // Service: BLM_Natl_SMA_LimitedScale layer 1 (queryable; uses ADMIN_DEPT_CODE / ADMIN_AGENCY_CODE).
    const blmLayerUrl =
      `https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_LimitedScale/MapServer/1/query` +
      `?geometry=${lng}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326` +
      `&spatialRel=esriSpatialRelIntersects&outFields=ADMIN_DEPT_CODE,ADMIN_AGENCY_CODE,ADMIN_UNIT_NAME&returnGeometry=false&f=json`;

    // Run all sources in parallel — BLM GIS is no longer a last resort
    const [nomFine, nomBroad, overpassData, blmResult] = await Promise.all([
      fetch(BASE,              NOM_HEADERS).then(r => r.json()).catch(() => null),
      fetch(BASE + "&zoom=10", NOM_HEADERS).then(r => r.json()).catch(() => null),
      fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)
        .then(r => r.json()).catch(() => null),
      fetch(blmLayerUrl).then(r => r.json()).catch(() => null),
    ]);

    const country = nomFine?.address?.country || nomBroad?.address?.country || "";
    const cc = ((nomFine?.address?.country_code || nomBroad?.address?.country_code) ?? "").toUpperCase();

    if (country && (!currentCountry || wasCountryAutoDetected)) {
      setOriginCountry(country);
      src.country = true;
    }

    if (cc === "US") {
      // ── Resolve BLM GIS result first (authoritative federal surface dataset) ──
      // This is the same data the map overlay tiles render, so it's ground-truth for
      // BLM, NPS, USFS, DOD, State, Tribal, and Private managed lands.
      let blmGisKey = null;
      const blmAttrs = blmResult?.features?.[0]?.attributes;
      if (blmAttrs) {
        blmGisKey = blmSmaKey(blmAttrs.ADMIN_DEPT_CODE, blmAttrs.ADMIN_AGENCY_CODE);
      }

      // ── TIER 1: Overpass — scan all containing OSM polygons ──────────────────
      // Collect every land type found AND classify the DOD signal strength.
      // "Strong" DOD = boundary=military OR confirmed DOD operator (actual installation).
      // "Weak"  DOD = landuse=military OR military=* tag WITHOUT operator confirmation
      //               (catches training ranges, restricted airspace, etc. that overlap BLM).
      const found = new Set();
      let dodSignalStrong = false;

      for (const el of (overpassData?.elements || [])) {
        const t   = el.tags || {};
        const bnd = (t.boundary || "").toLowerCase();
        const use = (t.landuse  || "").toLowerCase();
        const ops = (t.operator || t.owner || "").toLowerCase();
        const nm  = (t.name || "").toLowerCase();
        const milTag = (t.military || "").toLowerCase();

        if (bnd === "national_park" ||
            (bnd === "protected_area" && (ops.includes("national park") || ops.includes("nps") || t.protect_class === "2")))
          { found.add("nps"); }

        if (bnd === "national_forest" || bnd === "national_grassland" ||
            ops.includes("forest service") || ops.includes("usda forest") ||
            (bnd === "protected_area" && (ops.includes("forest") || ops.includes("usfs"))))
          { found.add("usfs"); }

        // BLM in Overpass (operator-based; BLM GIS is more authoritative but this helps triage)
        if (ops.includes("bureau of land management") || ops.includes("u.s. bureau of land management"))
          { found.add("blm"); }

        // Distinguish strong vs weak military signal
        const hasDodOperator = ops.includes("air force") || ops.includes("department of defense") ||
          ops.includes("u.s. army") || ops.includes("us army") || ops.includes("us navy") ||
          ops.includes("u.s. marine") || ops.includes("us marine") || ops.includes("space force");
        const hasMilitaryBoundary = bnd === "military";
        const hasMilitaryLanduse  = use === "military";
        // military=airfield / airbase / base / barracks = actual installation; range/danger_area = may be BLM
        const isInstallationMilTag = ["airfield","airbase","base","barracks","naval_base","checkpoint"].includes(milTag);
        const isRangeMilTag        = ["range","danger_area","training_area","restricted_area"].includes(milTag);

        if (hasMilitaryBoundary || hasDodOperator || isInstallationMilTag ||
            MILITARY_KEYWORDS.some(kw => nm.includes(kw))) {
          found.add("dod");
          if (hasMilitaryBoundary || hasDodOperator || isInstallationMilTag) dodSignalStrong = true;
        } else if (hasMilitaryLanduse || isRangeMilTag) {
          // Weak signal — mark found but do NOT set dodSignalStrong
          found.add("dod");
        }

        if (t.type === "reservation" || nm.includes("indian reservation") ||
            ops.includes("tribe") || ops.includes("tribal nation") || ops.includes("band of"))
          { found.add("tribal"); }

        if ((bnd === "protected_area" || bnd === "administrative") && ops.includes("state"))
          { found.add("state"); }
      }

      // ── Resolve: merge Overpass + BLM GIS with conflict handling ─────────────
      // Rule: if Overpass says DOD but the signal is weak (range/landuse only)
      //       AND BLM GIS returns a non-DOD type, trust BLM GIS — it is the
      //       authoritative surface management dataset and correctly shows whether
      //       the surface is administered by BLM even inside a military range polygon.
      if (found.has("dod") && !dodSignalStrong && blmGisKey && blmGisKey !== "dod") {
        found.delete("dod");
      }

      // Also add BLM GIS result to found set so it participates in priority resolution
      if (blmGisKey) found.add(blmGisKey);

      // Priority: NPS > Tribal > DOD (strong only at this point) > USFS > BLM > State
      const overpassType = ["nps","tribal","dod","usfs","blm","state"].find(k => found.has(k)) || null;

      if (overpassType) {
        setLandType(overpassType);
        src.landType = LAND_TYPES.find(lt => lt.key === overpassType)?.label || overpassType;
      } else if (blmGisKey) {
        // BLM GIS returned something but Overpass found nothing — use BLM GIS directly
        setLandType(blmGisKey);
        src.landType = LAND_TYPES.find(lt => lt.key === blmGisKey)?.label || blmGisKey;
      } else {
        // ── TIER 2: Nominatim keyword matching (fallback when both Overpass and BLM GIS miss) ──
        const allText = [
          nomFine?.display_name, nomBroad?.display_name,
          ...Object.values(nomFine?.address  || {}),
          ...Object.values(nomBroad?.address || {}),
          nomFine?.extratags?.boundary, nomBroad?.extratags?.boundary,
          nomFine?.extratags?.operator, nomBroad?.extratags?.operator,
          nomFine?.extratags?.military, nomBroad?.extratags?.military,
          nomFine?.type, nomBroad?.type, nomFine?.class, nomBroad?.class,
        ].filter(Boolean).join(" ").toLowerCase();

        const boundary = ((nomBroad?.extratags?.boundary || nomFine?.extratags?.boundary) ?? "").toLowerCase();
        const operator = ((nomBroad?.extratags?.operator || nomFine?.extratags?.operator ||
                           nomBroad?.extratags?.owner    || nomFine?.extratags?.owner) ?? "").toLowerCase();
        const nomType  = ((nomBroad?.type  || nomFine?.type)  ?? "").toLowerCase();
        const nomClass = ((nomBroad?.class || nomFine?.class) ?? "").toLowerCase();

        const isNPS  = boundary === "national_park" || nomType === "national_park" ||
          operator.includes("national park service") || NPS_KEYWORDS.some(kw => allText.includes(kw));
        const isUSFS = operator.includes("forest service") || operator.includes("usda forest") ||
          USFS_KEYWORDS.some(kw => allText.includes(kw));
        const isDOD  = nomClass === "military" || nomType === "military" ||
          operator.includes("air force") || operator.includes("department of defense") ||
          operator.includes("u.s. army") || MILITARY_KEYWORDS.some(kw => allText.includes(kw));

        if      (isNPS)  { setLandType("nps");  src.landType = LAND_TYPES.find(lt => lt.key === "nps")?.label  || "National Park Service"; }
        else if (isDOD)  { setLandType("dod");  src.landType = LAND_TYPES.find(lt => lt.key === "dod")?.label  || "Military / DOD"; }
        else if (isUSFS) { setLandType("usfs"); src.landType = LAND_TYPES.find(lt => lt.key === "usfs")?.label || "US Forest Service"; }
      }
    }
  } catch {} // Network failure — user selects manually
  finally {
    setIsDetecting(false);
    setAutoSource(src);
  }
}

// ── Step 2: Origin & Location ─────────────────────────────────────────────────

function LocationStep({ location, setLocation, landType, setLandType, originCountry, setOriginCountry, localityText, setLocalityText, acquisitionType }) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [autoSource, setAutoSource] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const countryRef = useRef(originCountry);
  const autoSourceRef = useRef(autoSource);
  countryRef.current = originCountry;
  autoSourceRef.current = autoSource;

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsGeocoding(true);
    const coords = await geocodePlace(searchInput.trim());
    setIsGeocoding(false);
    if (coords) {
      setLocation(coords);
      setFlyTarget({ ...coords, _t: Date.now() });
    }
  };

  const flag = lookupCountryFlag(originCountry);
  const isSelf = acquisitionType === "self";
  const legalInfo = landType ? LAND_LEGAL[landType] : null;

  useEffect(() => {
    if (!location) return;
    detectMapLocation({
      lat: location.lat, lng: location.lng,
      currentCountry: countryRef.current,
      wasCountryAutoDetected: !!autoSourceRef.current?.country,
      setOriginCountry, setLandType,
      setIsDetecting, setAutoSource,
    });
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Origin &amp; Collection Location
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Click the map or use the search box to pin the site. Country and US land management type
          are auto-detected from the pin. The colored overlay shows US federal surface management
          boundaries — most people find this helpful for quickly identifying the land type.
        </p>
      </div>

      {/* Country of origin — always shown */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Country of Origin ★
          </div>
          {isDetecting && (
            <span style={{ fontSize: "9px", color: "rgba(0,212,255,0.5)" }}>⟳ detecting…</span>
          )}
          {!isDetecting && autoSource.country && (
            <span style={{ fontSize: "9px", color: "rgba(0,212,255,0.65)", display: "flex", alignItems: "center", gap: "3px" }}>
              <MapPin size={9} /> auto-detected
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder='e.g. "Afghanistan", "Brazil", "USA"'
          value={originCountry}
          onChange={e => { setOriginCountry(e.target.value); setAutoSource(prev => ({ ...prev, country: false })); }}
        />
        {/* Country flag notice */}
        {flag && (
          <div style={{
            marginTop: "8px", padding: "10px 12px", borderRadius: "5px",
            background: `${STATUS_COLORS[flag.status]}0e`,
            border: `1px solid ${STATUS_COLORS[flag.status]}40`,
          }}>
            <div style={{ fontSize: "10px", fontWeight: 600, color: STATUS_COLORS[flag.status], letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>
              ⚑ {STATUS_LABELS[flag.status]} — {flag.name}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>{flag.heading}</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "6px" }}>{flag.detail}</div>
            {flag.minerals.length > 0 && (
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                <strong>Commonly affected minerals:</strong> {flag.minerals.join(", ")}
              </div>
            )}
            {flag.action && (
              <div style={{ marginTop: "6px", fontSize: "10px", color: STATUS_COLORS[flag.status], lineHeight: 1.5 }}>
                ➜ {flag.action}
              </div>
            )}
            <div style={{ marginTop: "5px", fontSize: "9px", color: "var(--text-muted)", fontStyle: "italic" }}>
              Sources: {flag.sources.join(" · ")}
            </div>
          </div>
        )}
        {!flag && originCountry.trim().length > 2 && (
          <div style={{ marginTop: "5px", fontSize: "10px", color: "var(--text-muted)" }}>
            ✓ No active sanctions or conflict-mineral flags for this country in PRISM's database.
          </div>
        )}
      </div>

      {/* Map + right panel — two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "10px", alignItems: "start" }}>

        {/* Left: map */}
        <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border)", height: "420px" }}>
          <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              opacity={0.65}
            />
            <TileLayer
              url="https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Cached_with_PriUnk/MapServer/tile/{z}/{y}/{x}"
              attribution="BLM National GIS — Surface Management Agency"
              opacity={0.55}
            />
            <FlyToLocation target={flyTarget} />
            <LocationPicker location={location} setLocation={setLocation} />
          </MapContainer>
        </div>

        {/* Right: search + result + legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: "420px", overflowY: "auto" }}>

          {/* Search box */}
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "5px" }}>
              Collection Site / Locality
            </div>
            <div style={{ display: "flex", gap: "5px", marginBottom: "4px" }}>
              <input
                type="text"
                placeholder="Mine, canyon, or place name…"
                value={localityText}
                onChange={e => setLocalityText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setSearchInput(localityText); handleSearch(); } }}
                style={{ flex: 1, fontSize: "11px" }}
              />
              <button
                onClick={() => { setSearchInput(localityText); handleSearch(); }}
                disabled={isGeocoding || !localityText.trim()}
                title="Search this location on the map"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg-card)", color: isGeocoding ? "rgba(0,212,255,0.5)" : "var(--text-dim)", fontSize: "11px", cursor: isGeocoding ? "default" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                <Search size={11} /> {isGeocoding ? "…" : "Find"}
              </button>
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Press <strong>Find</strong> to pin and auto-detect, or click the map directly.
            </div>
          </div>

          {/* Coords + detecting spinner */}
          {(location || isDetecting) && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "rgba(0,212,255,0.6)", fontFamily: "var(--mono)", padding: "5px 8px", background: "rgba(0,212,255,0.05)", borderRadius: "4px", border: "1px solid rgba(0,212,255,0.12)" }}>
              <MapPin size={10} />
              {location && `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
              {isDetecting && <span style={{ fontFamily: "sans-serif", fontSize: "9px", color: "rgba(0,212,255,0.5)" }}>⟳ detecting…</span>}
            </div>
          )}

          {/* Detection result */}
          {location && !isDetecting && landType && (
            <div style={{
              padding: "9px 11px", borderRadius: "6px",
              background: `${(LAND_TYPES.find(lt => lt.key === landType)?.color || "#607090")}12`,
              border: `1px solid ${(LAND_TYPES.find(lt => lt.key === landType)?.color || "#607090")}45`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "2px", background: LAND_TYPES.find(lt => lt.key === landType)?.color, flexShrink: 0 }} />
                <div style={{ fontSize: "11px", fontWeight: 700, color: LAND_TYPES.find(lt => lt.key === landType)?.color }}>
                  {LAND_TYPES.find(lt => lt.key === landType)?.label}
                  {autoSource.landType && <span style={{ fontWeight: 400, fontSize: "9px", opacity: 0.7 }}> · auto-detected</span>}
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.55 }}>
                {LAND_TYPES.find(lt => lt.key === landType)?.desc}
              </div>
              {legalInfo && (
                <div style={{ marginTop: "6px", fontSize: "11px", fontWeight: 600, color: legalInfo.color }}>
                  {legalInfo.status === "allowed" ? "✓" : legalInfo.status === "conditional" ? "⚠" : "✗"} {legalInfo.heading}
                </div>
              )}
              {legalInfo?.detail && (
                <div style={{ marginTop: "3px", fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>{legalInfo.detail}</div>
              )}
              {legalInfo?.action && (
                <div style={{ marginTop: "4px", fontSize: "10px", color: legalInfo.color, lineHeight: 1.5 }}>➜ {legalInfo.action}</div>
              )}
              {!isSelf && <div style={{ marginTop: "5px", fontSize: "9px", color: "var(--text-muted)", fontStyle: "italic" }}>Click map to override.</div>}
            </div>
          )}

          {/* Could not detect */}
          {location && !isDetecting && !landType && originCountry.toLowerCase().includes("united states") && (
            <div style={{ padding: "9px 11px", borderRadius: "6px", background: "rgba(96,112,144,0.08)", border: "1px solid rgba(96,112,144,0.30)" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", marginBottom: "3px" }}>Not in federal dataset</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                Likely private, county, or small state parcel. Select the type below if known.
              </div>
            </div>
          )}

          {/* No pin yet — prompt */}
          {!location && !isDetecting && (
            <div style={{ padding: "9px 11px", borderRadius: "6px", background: "rgba(96,112,144,0.06)", border: "1px solid rgba(96,112,144,0.20)", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                Click the map or search a location to auto-detect land type.
              </div>
            </div>
          )}

          {/* Map legend */}
          <div style={{ padding: "7px 9px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)", marginTop: "auto" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "5px" }}>Overlay Legend (zoom 8+)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 8px" }}>
              <LegendDot color="#f5c842" label="BLM" />
              <LegendDot color="#52c275" label="US Forest Service" />
              <LegendDot color="#e06a2a" label="National Park Service" />
              <LegendDot color="#5580c8" label="Bureau of Reclamation" />
              <LegendDot color="#60b0b0" label="Fish & Wildlife" />
              <LegendDot color="#7ab0e0" label="State" />
            </div>
          </div>

        </div>
      </div>

      {/* Land type — only for self-collected */}
      {isSelf && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Land Management Type ★
            </div>
            {isDetecting && (
              <span style={{ fontSize: "9px", color: "rgba(0,212,255,0.5)" }}>⟳ detecting…</span>
            )}
            {!isDetecting && autoSource.landType && (
              <span style={{ fontSize: "9px", color: "rgba(0,212,255,0.65)", display: "flex", alignItems: "center", gap: "3px" }}>
                <MapPin size={9} /> {autoSource.landType} · click to override
              </span>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
            {LAND_TYPES.map(lt => (
              <button key={lt.key} onClick={() => { setLandType(lt.key); setAutoSource(prev => ({ ...prev, landType: null })); }} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 10px", borderRadius: "5px", textAlign: "left",
                background: landType === lt.key ? `${lt.color}12` : "var(--bg-card)",
                border: `1px solid ${landType === lt.key ? lt.color + "55" : "var(--border)"}`,
                color: landType === lt.key ? lt.color : "var(--text-dim)",
                transition: "all 0.15s",
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: lt.color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", fontWeight: landType === lt.key ? 600 : 400 }}>{lt.label}</span>
              </button>
            ))}
          </div>
          {legalInfo && (
            <div style={{
              marginTop: "8px", padding: "10px 12px", borderRadius: "5px",
              background: `${legalInfo.color}0e`, border: `1px solid ${legalInfo.color}45`,
            }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: legalInfo.color, marginBottom: "5px", letterSpacing: "0.04em" }}>
                {legalInfo.status === "allowed" ? "✓" : legalInfo.status === "prohibited" ? "✗" : legalInfo.status === "unknown" ? "?" : "⚠"} {legalInfo.heading}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6 }}>{legalInfo.detail}</div>
              {legalInfo.action && (
                <div style={{ marginTop: "6px", fontSize: "10px", color: legalInfo.color, lineHeight: 1.5 }}>➜ {legalInfo.action}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Supporting-document uploads ───────────────────────────────────────────────

const UPLOAD_SLOTS = {
  self: [
    { id: "field_photo",  label: "Field Photo",          desc: "Photo of the collection site or specimen in-situ", accept: "image/*" },
    { id: "attestation",  label: "Signed Attestation",   desc: "Signed statement attesting to collection details and legality", accept: "image/*,application/pdf" },
    { id: "permit_copy",  label: "Permit / License",     desc: "Collecting permit or land-access agreement (if applicable)", accept: "image/*,application/pdf" },
  ],
  dealer: [
    { id: "receipt",      label: "Receipt / Invoice",    desc: "Purchase receipt or invoice from the dealer", accept: "image/*,application/pdf" },
    { id: "dealer_prov",  label: "Provenance Document",  desc: "Locality or provenance documentation from the dealer", accept: "image/*,application/pdf" },
  ],
  collector: [
    { id: "chain_doc",    label: "Chain of Custody",     desc: "Documentation of the collector-to-collector transfer", accept: "image/*,application/pdf" },
  ],
  auction: [
    { id: "catalog_page", label: "Catalog / Lot Page",   desc: "Auction catalog entry or lot description", accept: "image/*,application/pdf" },
    { id: "receipt",      label: "Sale Receipt",         desc: "Purchase confirmation from the auction house", accept: "image/*,application/pdf" },
  ],
  gift: [
    { id: "gift_letter",  label: "Gift Letter / Estate", desc: "Letter from donor or probate / estate documentation", accept: "image/*,application/pdf" },
  ],
  unknown: [],
};

function UploadSlot({ slot, file, onFile }) {
  const inputRef = useRef(null);
  const handleChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => onFile({ name: f.name, size: f.size, type: f.type, dataUrl: ev.target.result });
    reader.readAsDataURL(f);
  };
  return (
    <div style={{
      padding: "10px 12px", borderRadius: "5px",
      background: file ? "rgba(0,212,255,0.04)" : "var(--bg-card)",
      border: `1px solid ${file ? "rgba(0,212,255,0.28)" : "var(--border)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: file ? 600 : 400, color: file ? "var(--cyan)" : "var(--text)", marginBottom: "2px" }}>
            {slot.label}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>{slot.desc}</div>
          {file && (
            <div style={{ fontSize: "9px", color: "rgba(0,212,255,0.55)", fontFamily: "var(--mono)", marginTop: "4px" }}>
              📎 {file.name} · {(file.size / 1024).toFixed(0)} KB
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept={slot.accept} onChange={handleChange} style={{ display: "none" }} />
        <button
          onClick={() => file ? onFile(null) : inputRef.current?.click()}
          style={{
            padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 500, whiteSpace: "nowrap",
            background: file ? "rgba(255,80,80,0.07)" : "rgba(0,212,255,0.07)",
            border: `1px solid ${file ? "rgba(255,80,80,0.25)" : "rgba(0,212,255,0.25)"}`,
            color: file ? "#ff8080" : "var(--cyan)", cursor: "pointer", flexShrink: 0,
          }}
        >
          {file ? "Remove" : "Attach"}
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Documentation ─────────────────────────────────────────────────────

function DocumentationStep({ acquisitionType, landType, checks, setChecks, uploads, setUploads }) {
  const toggle = id => setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  const isSelf = acquisitionType === "self";
  const landQs = isSelf ? (LAND_QUESTIONS[landType] || []) : [];
  const acqQs  = getAcquisitionQuestions(acquisitionType);
  const acqMeta = ACQUISITION_TYPES.find(a => a.key === acquisitionType);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Documentation Checklist
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Check everything that applies. <span style={{ color: "#ffa028" }}>★ required</span> items are necessary for museum consideration. <span style={{ color: "#00c880" }}>⊕ highly recommended</span> items significantly strengthen the evaluation.
        </p>
      </div>

      {/* Acquisition context note */}
      {acqMeta && (
        <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
          {acqMeta.icon} <strong style={{ color: "var(--text)" }}>{acqMeta.label}:</strong>{" "}
          {acquisitionType === "dealer" && "Museums accept dealer-purchased specimens but require the dealer to be named and the locality to be confirmed. The dealer's own documentation of the collection chain matters."}
          {acquisitionType === "collector" && "Traceable collector-to-collector chains are accepted, but each link in the chain must be identified. Unknown links reduce institutional confidence."}
          {acquisitionType === "auction" && "Auction-purchased specimens often have published catalog descriptions which serve as provenance documentation. Request the catalog page if available."}
          {acquisitionType === "gift" && "Gift or inherited specimens are accepted but require documentation of the donor's acquisition history where possible."}
          {acquisitionType === "self" && "Self-collected specimens have the strongest potential provenance — full locality, date, and legal collection documentation can be provided firsthand."}
          {acquisitionType === "unknown" && "Most institutions will not accept specimens with entirely unknown acquisition history into permanent collections."}
        </div>
      )}

      {/* NPS / unknown land warnings */}
      {isSelf && landType === "nps" && (
        <div style={{ padding: "10px 12px", background: "rgba(224,106,42,0.08)", border: "1px solid rgba(224,106,42,0.3)", borderRadius: "5px", fontSize: "11px", color: "#e06a2a", lineHeight: 1.5 }}>
          ⚠️ Collecting in National Parks and Monuments is generally prohibited (16 U.S.C. § 1).
          Museum donation is only possible for pre-designation specimens or those collected under a scientific permit.
        </div>
      )}
      {isSelf && landType === "unknown" && (
        <div style={{ padding: "10px 12px", background: "rgba(255,160,40,0.07)", border: "1px solid rgba(255,160,40,0.25)", borderRadius: "5px", fontSize: "11px", color: "#ffa028", lineHeight: 1.5 }}>
          ⚠️ Unknown collection locality severely limits donation value.
        </div>
      )}

      {/* Land / legal questions (self-collected only) */}
      {isSelf && landQs.length > 0 && (
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            {LAND_TYPES.find(lt => lt.key === landType)?.label} — Collecting Rules
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {landQs.map(q => <CheckItem key={q.id} q={q} checked={!!checks[q.id]} onToggle={() => toggle(q.id)} />)}
          </div>
        </div>
      )}

      {/* Acquisition-specific questions */}
      {acqQs.length > 0 && (
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            {acqMeta?.label} Documentation
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {acqQs.map(q => <CheckItem key={q.id} q={q} checked={!!checks[q.id]} onToggle={() => toggle(q.id)} />)}
          </div>
        </div>
      )}

      {/* Universal provenance */}
      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
          Universal Provenance Documentation
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {PROVENANCE_QUESTIONS.map(q => <CheckItem key={q.id} q={q} checked={!!checks[q.id]} onToggle={() => toggle(q.id)} />)}
        </div>
      </div>

      {/* Supporting document uploads */}
      {(UPLOAD_SLOTS[acquisitionType] || []).length > 0 && (
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            Supporting Documents
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5, marginBottom: "8px", padding: "7px 10px", background: "var(--bg-card)", borderRadius: "4px", border: "1px solid var(--border-dim)" }}>
            💡 Attach supporting files to include in your curator report. Files are stored locally in this browser session — nothing is sent to any server.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(UPLOAD_SLOTS[acquisitionType] || []).map(slot => (
              <UploadSlot
                key={slot.id}
                slot={slot}
                file={uploads[slot.id] || null}
                onFile={f => setUploads(prev => ({ ...prev, [slot.id]: f }))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Curator export helpers ────────────────────────────────────────────────────

function buildTextReport({ spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText, location, checks, uploads, pct, chainScore, reqPassed, optPassed, required, attestorName }) {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const acqMeta  = ACQUISITION_TYPES.find(a => a.key === acquisitionType);
  const landMeta = LAND_TYPES.find(lt => lt.key === landType);
  const flag     = lookupCountryFlag(originCountry);
  const status   = pct === 100 ? "READY FOR CONSIDERATION" : pct >= 60 ? "CONDITIONALLY SUITABLE" : "NOT CURRENTLY SUITABLE";
  const isSelf   = acquisitionType === "self";
  const allQs    = [
    ...(isSelf ? (LAND_QUESTIONS[landType] || []) : []),
    ...getAcquisitionQuestions(acquisitionType),
    ...PROVENANCE_QUESTIONS,
  ];
  const LINE = "\u2500".repeat(52);
  const lines = ["PRISM \u2014 MINERAL DONATION EVALUATION REPORT", `Generated: ${now}`, LINE, ""];
  if (spec?.name || spec?.species || spec?.locality) {
    lines.push("SPECIMEN");
    if (spec?.name)     lines.push(`  Name:      ${spec.name}`);
    if (spec?.species)  lines.push(`  Species:   ${spec.species}`);
    if (spec?.locality) lines.push(`  Locality:  ${spec.locality}`);
    lines.push("");
  }
  lines.push(
    `OVERALL STATUS: ${status}`,
    `  Required criteria: ${reqPassed.length} of ${required.length} met`,
    ...(optPassed.length > 0 ? [`  Optional criteria: ${optPassed.length} met`] : []),
    "",
    `PROVENANCE CHAIN SCORE: ${chainScore}/100`,
    `  Acquisition type: ${acqMeta?.label || acquisitionType}`,
  );
  if (acquisitionDetails?.dealerName)     lines.push(`  Dealer:       ${acquisitionDetails.dealerName}`);
  if (acquisitionDetails?.collectorNames) lines.push(`  Collector(s): ${acquisitionDetails.collectorNames}`);
  if (acquisitionDetails?.auctionHouse)   lines.push(`  Auction/Show: ${acquisitionDetails.auctionHouse}`);
  if (acquisitionDetails?.donorName)      lines.push(`  Donor:        ${acquisitionDetails.donorName}`);
  lines.push("", "COLLECTION SITE");
  lines.push(`  Country:   ${originCountry || "Unknown"}`);
  if (landMeta) lines.push(`  Land type: ${landMeta.label}`);
  if (location) lines.push(`  Coordinates: ${location.lat.toFixed(5)}\u00b0, ${location.lng.toFixed(5)}\u00b0`);
  lines.push("");
  if (flag) {
    lines.push(`COUNTRY FLAG: \u2691 ${flag.name}`, `  ${flag.heading}`);
    if (flag.action) lines.push(`  \u279c ${flag.action}`);
    lines.push("");
  }
  lines.push("DOCUMENTATION CHECKLIST");
  allQs.forEach(q => lines.push(`  ${checks[q.id] ? "\u2713" : "\u2717"} ${q.label}`));
  lines.push("");
  const attached = Object.entries(uploads || {}).filter(([, f]) => f);
  if (attached.length > 0) {
    lines.push("ATTACHED DOCUMENTS");
    attached.forEach(([, f]) => lines.push(`  \u2022 ${f.name}  (${(f.size / 1024).toFixed(0)} KB)`));
    lines.push("");
  }
  lines.push(
    LINE,
    "ATTESTATION",
    `  "To the best of my knowledge, all information provided in this evaluation`,
    `  is accurate and complete to the best of my ability."`,
    "",
    `  Signed: ${attestorName || "_______________________________"}`,
    `  Date:   ${now}`,
    "",
    LINE,
    "PRISM (Precision Rating Index of Specimen Minerals)",
    "This report is for informational purposes and is not legal advice.",
    "Consult the receiving institution for their specific requirements.",
  );
  return lines.join("\n");
}

function buildJSONReport({ spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText, location, checks, uploads, pct, chainScore, attestorName }) {
  return JSON.stringify({
    generated: new Date().toISOString(),
    generator: "PRISM Mineral Donation Evaluator v1",
    specimen: { name: spec?.name || null, species: spec?.species || null, locality: spec?.locality || null },
    assessment: {
      status: pct === 100 ? "ready" : pct >= 60 ? "conditional" : "not_suitable",
      readinessPercent: pct,
      provenanceChainScore: chainScore,
    },
    acquisition: { type: acquisitionType, details: acquisitionDetails },
    location: {
      locality: localityText || null,
      country: originCountry || null,
      landType: landType || null,
      coordinates: location ? { lat: location.lat, lng: location.lng } : null,
    },
    attestation: {
      statement: "To the best of my knowledge, all information provided in this evaluation is accurate and complete to the best of my ability.",
      signedBy: attestorName || null,
      date: new Date().toISOString().split("T")[0],
    },
    checks,
    attachments: Object.entries(uploads || {})
      .filter(([, f]) => f)
      .map(([id, f]) => ({ id, name: f.name, sizeBytes: f.size, mimeType: f.type })),
  }, null, 2);
}

// ── Step 4: Donation Assessment ───────────────────────────────────────────────

function SummaryStep({ acquisitionType, acquisitionDetails, landType, checks, location, originCountry, localityText, spec, uploads, onExported }) {
  const [copied, setCopied] = useState(false);
  const [attestorName, setAttestorName] = useState("");
  const isSelf = acquisitionType === "self";
  const landQs  = isSelf ? (LAND_QUESTIONS[landType] || []) : [];
  const acqQs   = getAcquisitionQuestions(acquisitionType);
  const allQs   = [...landQs, ...acqQs, ...PROVENANCE_QUESTIONS];
  const required = allQs.filter(q => q.required);
  const optional = allQs.filter(q => !q.required);

  const reqPassed = required.filter(q => checks[q.id]);
  const reqFailed = required.filter(q => !checks[q.id]);
  const optPassed = optional.filter(q => checks[q.id]);

  const pct = required.length > 0 ? Math.round((reqPassed.length / required.length) * 100)
    : landType === "unknown" ? 0 : 100;

  const acqMeta     = ACQUISITION_TYPES.find(a => a.key === acquisitionType);
  const chainStrength = CHAIN_STRENGTH[acquisitionType] || { base: 50, label: "Unknown" };
  const flag          = lookupCountryFlag(originCountry);
  const landMeta      = LAND_TYPES.find(lt => lt.key === landType);

  // Adjust chain strength up based on documentation checked
  const docBoost = Math.round((reqPassed.length / Math.max(required.length, 1)) * 20);
  const chainScore = Math.min(100, chainStrength.base + docBoost);

  const statusColor = pct === 100 ? "#00c880" : pct >= 60 ? "#ffa028" : "#ff5050";
  const statusLabel = pct === 100
    ? "Ready for Museum Donation Consideration"
    : pct >= 60
    ? "Conditionally Suitable — Documentation Gaps Exist"
    : "Not Currently Suitable — Critical Requirements Unmet";
  const statusEmoji = pct === 100 ? "✅" : pct >= 60 ? "⚠️" : "❌";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Donation Assessment
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Based on the information provided. Not legal advice — consult the receiving institution for their requirements.
        </p>
      </div>

      {/* Readiness badge */}
      <div style={{ padding: "16px", borderRadius: "6px", textAlign: "center", background: `${statusColor}0a`, border: `1px solid ${statusColor}30` }}>
        <div style={{ fontSize: "28px", marginBottom: "6px" }}>{statusEmoji}</div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: statusColor, lineHeight: 1.4, marginBottom: "5px" }}>{statusLabel}</div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {reqPassed.length} of {required.length} required criteria met
          {optPassed.length > 0 && ` · ${optPassed.length} optional criteria also met`}
        </div>
      </div>

      {/* Provenance chain summary */}
      <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase" }}>Provenance Chain</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            {acqMeta?.icon} <strong style={{ color: "var(--text)" }}>{acqMeta?.label}</strong>
            {acquisitionDetails?.dealerName ? ` — ${acquisitionDetails.dealerName}` : ""}
            {acquisitionDetails?.collectorNames ? ` — ${acquisitionDetails.collectorNames}` : ""}
            {acquisitionDetails?.auctionHouse ? ` — ${acquisitionDetails.auctionHouse}` : ""}
            {acquisitionDetails?.donorName ? ` — ${acquisitionDetails.donorName}` : ""}
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: chainScore >= 70 ? "#00c880" : chainScore >= 45 ? "#ffa028" : "#ff6060" }}>
            {chainScore}/100
          </div>
        </div>
        <div style={{ height: "4px", background: "var(--bg)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${chainScore}%`, background: chainScore >= 70 ? "#00c880" : chainScore >= 45 ? "#ffa028" : "#ff6060", borderRadius: "2px", transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{chainStrength.label}</div>
      </div>

      {/* Country flag (if any) */}
      {flag && (
        <div style={{ padding: "9px 12px", borderRadius: "5px", background: `${STATUS_COLORS[flag.status]}0a`, border: `1px solid ${STATUS_COLORS[flag.status]}35`, fontSize: "11px", color: STATUS_COLORS[flag.status], lineHeight: 1.5 }}>
          ⚑ <strong>{flag.name}</strong> — {flag.heading}
          {flag.action && <div style={{ marginTop: "3px", fontSize: "10px", opacity: 0.85 }}>➜ {flag.action}</div>}
        </div>
      )}

      {/* PRISM note */}
      <div style={{ padding: "9px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
        📊 PRISM <strong style={{ color: "var(--text)" }}>Museum Specimen</strong> context weights Provenance at 42% and Scientific Value at 21%.
        Improving documentation directly raises your museum-context PRISM score.
      </div>

      {/* Unmet requirements */}
      {reqFailed.length > 0 && (
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#ff5050", textTransform: "uppercase", marginBottom: "6px" }}>✗ Unmet Requirements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {reqFailed.map(q => (
              <div key={q.id} style={{ padding: "6px 10px", background: "rgba(255,80,80,0.05)", border: "1px solid rgba(255,80,80,0.18)", borderRadius: "4px", fontSize: "11px", color: "#ff8080" }}>{q.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* Met requirements */}
      {reqPassed.length > 0 && (
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#00c880", textTransform: "uppercase", marginBottom: "6px" }}>✓ Requirements Met</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {reqPassed.map(q => (
              <div key={q.id} style={{ padding: "6px 10px", background: "rgba(0,200,128,0.05)", border: "1px solid rgba(0,200,128,0.18)", borderRadius: "4px", fontSize: "11px", color: "#00c880" }}>{q.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* Location summary */}
      {(originCountry || localityText || location || spec?.locality) && (
        <div style={{ padding: "9px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>Collection Site</div>
          {localityText && <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{localityText}</div>}
          {!localityText && spec?.locality && <div style={{ fontSize: "12px", color: "var(--text)", marginBottom: "3px" }}>{spec.locality}</div>}
          {originCountry && <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "3px" }}>Country: <strong>{originCountry}</strong></div>}
          {landMeta && <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "3px" }}>Land: <strong style={{ color: landMeta.color }}>{landMeta.label}</strong></div>}
          {location && <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>{location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°</div>}
        </div>
      )}

      {/* Attestation */}
      <div style={{ borderTop: "1px solid var(--border-dim)", paddingTop: "14px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Attestation</div>
        <div style={{
          padding: "12px 14px", background: "rgba(0,212,255,0.03)",
          border: "1px solid rgba(0,212,255,0.15)", borderRadius: "6px",
          fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.65,
          fontStyle: "italic", marginBottom: "10px",
        }}>
          "To the best of my knowledge, all information provided in this evaluation is accurate and complete to the best of my ability."
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "10px", color: "var(--text-muted)", whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase" }}>Signed by</label>
          <input
            type="text"
            placeholder="Your full name"
            value={attestorName}
            onChange={e => setAttestorName(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Share with curator */}
      <div style={{ borderTop: "1px solid var(--border-dim)", paddingTop: "14px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
          Share with Curator / Collections Manager
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
          <button
            onClick={() => {
              const txt = buildTextReport({ spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText, location, checks, uploads, pct, chainScore, reqPassed, optPassed, required, attestorName });
              navigator.clipboard.writeText(txt)
                .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); onExported?.(); })
                .catch(() => {});
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: copied ? "rgba(0,200,128,0.09)" : "var(--bg-card)", border: `1px solid ${copied ? "rgba(0,200,128,0.4)" : "var(--border)"}`, color: copied ? "#00c880" : "var(--text-dim)", transition: "all 0.2s" }}
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={() => {
              const json = buildJSONReport({ spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText, location, checks, uploads, pct, chainScore, attestorName });
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `prism-donation-eval-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
              onExported?.();
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
          >
            <Download size={12} /> Download JSON
          </button>
          <button
            onClick={() => { window.print(); onExported?.(); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-dim)" }}
          >
            <Printer size={12} /> Print
          </button>
        </div>
        {Object.values(uploads || {}).some(Boolean) && (
          <div style={{ marginTop: "7px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.5 }}>
            📎 {Object.values(uploads).filter(Boolean).length} document(s) attached — send these files alongside this report to the curator.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

const STEPS = ["Acquisition", "Origin & Location", "Documentation", "Assessment"];

export default function DonationEval({ scores: initScores, spec: initSpec, records = [], onClose }) {
  const [showPicker, setShowPicker]           = useState(true);
  const [workingScores, setWorkingScores]     = useState(initScores);
  const [workingSpec, setWorkingSpec]         = useState(initSpec);
  const [step, setStep]                       = useState(0);
  const [acquisitionType, setAcquisitionType] = useState(null);
  const [acquisitionDetails, setAcquisitionDetails] = useState({});
  const [originCountry, setOriginCountry]     = useState("");
  const [localityText, setLocalityText]       = useState("");
  const [location, setLocation]               = useState(null);
  const [landType, setLandType]               = useState(null);
  const [checks, setChecks]                   = useState({});
  const [uploads, setUploads]                 = useState({});
  const [exported, setExported]               = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const handlePickerSelect = (scores, spec) => {
    setWorkingScores(scores);
    setWorkingSpec(spec);
    setShowPicker(false);
  };

  if (showPicker) {
    return (
      <DonationPickerScreen
        initScores={initScores} initSpec={initSpec}
        records={records}
        onSelect={handlePickerSelect}
        onClose={onClose}
      />
    );
  }

  const scores = workingScores;
  const spec   = workingSpec;

  const guardedClose = () => {
    if (step === STEPS.length - 1 && !exported) { setShowLeaveWarning(true); }
    else { onClose(); }
  };

  const canAdvance = () => {
    if (step === 0) return !!acquisitionType;
    if (step === 1) return originCountry.trim().length >= 2 && (acquisitionType !== "self" || !!landType);
    return true;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(4,8,18,0.88)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "660px",
        maxHeight: "92vh",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, background: "var(--bg-panel)",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}>
              🏛️ Museum Donation Evaluation
            </div>
            {(spec?.name || spec?.species) && (
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                {[spec.name, spec.species].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          <button onClick={guardedClose} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: "4px", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "9px 0", textAlign: "center",
              fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: i === step ? "var(--cyan)" : i < step ? "#00c880" : "var(--text-muted)",
              borderBottom: `2px solid ${i === step ? "var(--cyan)" : i < step ? "#00c880" : "transparent"}`,
              transition: "all 0.2s",
              fontWeight: i === step ? 600 : 400,
            }}>
              {i < step ? "✓ " : `${i + 1}. `}{s}
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "22px 24px" }}>
          {step === 0 && (
            <AcquisitionStep
              acquisitionType={acquisitionType} setAcquisitionType={setAcquisitionType}
              acquisitionDetails={acquisitionDetails} setAcquisitionDetails={setAcquisitionDetails}
            />
          )}
          {step === 1 && (
            <LocationStep
              location={location} setLocation={setLocation}
              landType={landType} setLandType={setLandType}
              originCountry={originCountry} setOriginCountry={setOriginCountry}
              localityText={localityText} setLocalityText={setLocalityText}
              acquisitionType={acquisitionType}
            />
          )}
          {step === 2 && (
            <DocumentationStep
              acquisitionType={acquisitionType} landType={landType}
              checks={checks} setChecks={setChecks}
              uploads={uploads} setUploads={setUploads}
            />
          )}
          {step === 3 && (
            <SummaryStep
              acquisitionType={acquisitionType} acquisitionDetails={acquisitionDetails}
              landType={landType} checks={checks}
              location={location} originCountry={originCountry} localityText={localityText} spec={spec}
              uploads={uploads} onExported={() => { setExported(true); setShowLeaveWarning(false); }}
            />
          )}
        </div>

        {/* Unsaved warning banner */}
        {showLeaveWarning && (
          <div style={{
            padding: "10px 18px", background: "rgba(255,160,40,0.09)",
            borderTop: "1px solid rgba(255,160,40,0.35)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: "11px", color: "#ffa028", lineHeight: 1.4 }}>
              ⚠️ <strong>Assessment not saved.</strong> Copy, download, or print the report before closing so it isn't lost.
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => setShowLeaveWarning(false)}
                style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: "rgba(255,160,40,0.1)", border: "1px solid rgba(255,160,40,0.4)", color: "#ffa028" }}
              >Go back</button>
              <button
                onClick={onClose}
                style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "10px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >Close anyway</button>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div style={{
          padding: "12px 18px", borderTop: "1px solid var(--border-dim)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, background: "var(--bg-panel)",
        }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : setShowPicker(true)}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 14px", background: "none",
              border: "1px solid var(--border)", borderRadius: "4px",
              color: "var(--text-muted)", fontSize: "11px", cursor: "pointer",
            }}
          >
            <ChevronLeft size={13} />
            {step === 0 ? "Change Specimen" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 20px",
                background: canAdvance() ? "rgba(0,212,255,0.09)" : "transparent",
                border: `1px solid ${canAdvance() ? "rgba(0,212,255,0.4)" : "var(--border)"}`,
                borderRadius: "4px",
                color: canAdvance() ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: 600, cursor: canAdvance() ? "pointer" : "default",
              }}
            >
              Next <ChevronRight size={13} />
            </button>
          ) : (
            <button
              onClick={guardedClose}
              style={{
                padding: "7px 20px",
                background: exported ? "rgba(0,200,128,0.09)" : "rgba(255,160,40,0.07)",
                border: `1px solid ${exported ? "rgba(0,200,128,0.4)" : "rgba(255,160,40,0.4)"}`,
                borderRadius: "4px",
                color: exported ? "#00c880" : "#ffa028",
                fontSize: "11px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Done{!exported ? " ⚠︎" : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
