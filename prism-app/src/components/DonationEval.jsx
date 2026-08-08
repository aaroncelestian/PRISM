import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { X, ChevronLeft, ChevronRight, MapPin, Search, Download, Printer, Copy, CheckCheck } from "lucide-react";
import { lookupCountryFlag, STATUS_COLORS, STATUS_LABELS } from "../data/countryFlags.js";
import { GRADES, CONTEXTS, THRESHOLD, computeContextScore } from "../data/prism.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";

function _ctxScore(ctxKey, scores) {
  return computeContextScore(ctxKey, scores).score;
}
function _bestScore(scores) {
  const all = CONTEXTS.map(c => ({ key: c.key, score: _ctxScore(c.key, scores) }));
  const best = all.find(c => c.score >= THRESHOLD) || all[0];
  const grade = GRADES.find(g => best.score >= g.min) || GRADES[GRADES.length - 1];
  return { score: best.score, grade };
}

const COLLECTION_THRESHOLD = 11; // more than 10 → Collection Donation

function _routeHint(n) {
  if (n === 0) return "Select one or more saved specimens, or use Current Evaluation / Collection Donation.";
  if (n === 1) return "1 selected → single specimen guide";
  if (n < COLLECTION_THRESHOLD) return `${n} selected → batch donation guide`;
  return `${n} selected → Collection Donation (more than 10)`;
}

// ── Specimen Picker ───────────────────────────────────────────────────────────

function DonationPickerScreen({ initScores, initSpec, records, onSelect, onContinueSelected, onSkipCollection, onClose }) {
  const { score: curScore, grade: curGrade } = _bestScore(initScores);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const toggleId = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedRecords = records.filter(r => selectedIds.has(r.id));
  const n = selectedRecords.length;
  const canContinue = n > 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(4,8,18,0.88)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "600px", maxHeight: "92vh", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}>🏛️ Museum Donation Evaluation</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>
              Multi-select from history, or open a single evaluation
            </div>
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
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "rgba(10,111,136,0.04)", border: "1px solid rgba(10,111,136,0.25)", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.25)"}
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
                <div style={{ marginTop: "4px", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>Active session — opens single specimen guide</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--mono)", color: curGrade.color, lineHeight: 1 }}>{curScore}</div>
                <div style={{ marginTop: "3px", fontSize: "9px", padding: "2px 7px", borderRadius: "3px", background: `${curGrade.color}15`, color: curGrade.color, border: `1px solid ${curGrade.color}30`, fontWeight: 600, letterSpacing: "0.06em", display: "inline-block" }}>{curGrade.emoji} {curGrade.label}</div>
              </div>
            </button>
          </div>

          {/* Saved collection — multi-select */}
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              Saved Collection {records.length > 0 ? `(${records.length})` : ""}
            </div>
            {records.length > 0 && (
              <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5, marginBottom: "8px" }}>
                Check specimens to donate. 1 → single guide · 2–10 → batch · 11+ → Collection Donation.
              </div>
            )}
            {records.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-muted)", background: "var(--bg-panel)", borderRadius: "6px", border: "1px solid var(--border-dim)", lineHeight: 1.6 }}>
                No specimens saved to history yet.<br />Save a PRISM evaluation first using the Save button.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {records.map(rec => {
                  const gradeObj = GRADES.find(g => g.label === rec.grade) || GRADES[GRADES.length - 1];
                  const dateStr = new Date(rec.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const checked = selectedIds.has(rec.id);
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => toggleId(rec.id)}
                      style={{
                        width: "100%", textAlign: "left", padding: "10px 14px",
                        background: checked ? "rgba(10,111,136,0.08)" : "var(--bg-panel)",
                        border: `1px solid ${checked ? "rgba(10,111,136,0.45)" : "var(--border)"}`,
                        borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleId(rec.id)}
                        onClick={e => e.stopPropagation()}
                        style={{ flexShrink: 0, accentColor: "var(--cyan)", width: "14px", height: "14px", cursor: "pointer" }}
                      />
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

          {/* Whole-collection path */}
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Or donate without a PRISM score</div>
            <button
              onClick={onSkipCollection}
              style={{ width: "100%", textAlign: "left", padding: "12px 14px", background: "rgba(10,111,136,0.04)", border: "1px solid rgba(10,111,136,0.25)", borderRadius: "7px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "12px" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(10,111,136,0.25)"}
            >
              <div style={{ fontSize: "18px", lineHeight: 1.2, flexShrink: 0 }}>📦</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>
                  Collection Donation
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
                  Offering many objects at once? Open the Collection Donation guide — no need to pick or score each specimen first.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-dim)", flexShrink: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.45 }}>{_routeHint(n)}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", background: "none", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-muted)", fontSize: "11px", cursor: "pointer" }}>
              <X size={13} /> Cancel
            </button>
            <button
              onClick={() => canContinue && onContinueSelected(selectedRecords)}
              disabled={!canContinue}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 16px",
                background: canContinue ? "rgba(10,111,136,0.09)" : "transparent",
                border: `1px solid ${canContinue ? "rgba(10,111,136,0.4)" : "var(--border)"}`,
                borderRadius: "4px",
                color: canContinue ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: 600, cursor: canContinue ? "pointer" : "default",
              }}
            >
              Continue{n > 0 ? ` with ${n}` : ""} <ChevronRight size={13} />
            </button>
          </div>
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

// Qualitative chain strength per acquisition type (no numeric score in assessment)
const CHAIN_STRENGTH = {
  self:      { label: "Strong" },
  dealer:    { label: "Variable — depends on dealer documentation" },
  collector: { label: "Variable — depends on chain completeness" },
  auction:   { label: "Moderate — auction records help considerably" },
  gift:      { label: "Moderate — prior-owner history often uncertain" },
  unknown:   { label: "Weak — not acceptable for institutional acquisition" },
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
    color: "#0a7a52",
    heading: "Generally Permitted",
    detail: "Casual recreational collecting allowed under 43 CFR 8365 for personal use. Commercial collection, use of power tools, and collection from ACECs, Wilderness Areas, or other special management areas require a permit or are prohibited.",
  },
  usfs: {
    status: "conditional",
    color: "#a65d00",
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
    color: "#a65d00",
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
    heading: "Land Status Not Yet Documented",
    detail: "The land management type for this locality hasn’t been confirmed. Adding that detail — public, private, or other managed land — will strengthen the provenance record for institutional review.",
  },
};

/** Land messaging for secondary acquisition (dealer / gift / trade / auction) — origin context, not collector guilt. */
const LAND_ORIGIN_RISK = {
  blm: {
    status: "allowed",
    color: "#0a7a52",
    heading: "Common Legitimate Source Type",
    detail: "BLM lands often host legal casual collecting and commercial claim activity. You are not the collector of record — ask the seller or prior owner whether they can substantiate that the specimen left the land legally.",
  },
  usfs: {
    status: "conditional",
    color: "#a65d00",
    heading: "Managed Land — Verify Source Chain",
    detail: "National Forest localities can be legitimate, but rules vary by forest. For a purchased or gifted specimen, confirm the seller/donor can stand behind legal origin rather than reconstructing your own collecting permit.",
  },
  nps: {
    status: "prohibited",
    color: "#ff5050",
    heading: "High Origin Risk — Restricted Land",
    detail: "Specimens from National Parks and Monuments are frequently illegally collected. Museums will scrutinize the dealer or donor chain closely; undocumented origin from this land type is usually disqualifying.",
    action: "Obtain clear provenance that the piece was collected under a scientific permit, before park designation, or from an otherwise verifiable legal source before donation.",
  },
  state: {
    status: "conditional",
    color: "#a65d00",
    heading: "State / Jurisdictional Context",
    detail: "State-managed land rules vary widely. Pinning the locality helps the institution; your responsibility as buyer or recipient is reasonable diligence that the prior chain was legal, not personal collecting compliance.",
  },
  private: {
    status: "conditional",
    color: "#f0c040",
    heading: "Private / Mine Locality Context",
    detail: "Private land and commercial mines (e.g. Morenci) are common legitimate sources when material is sold through authorized channels. You did not need landowner permission yourself — confirm the dealer or prior owner can substantiate legal origin.",
  },
  tribal: {
    status: "prohibited",
    color: "#ff5050",
    heading: "High Origin Risk — Tribal / Indigenous Lands",
    detail: "Material from Tribal or Indigenous lands without proper authority is a serious federal and institutional concern. Museums will expect a documented legal chain; a purchase or gift alone does not clear title questions.",
    action: "Seek dealer/donor documentation of tribal authority or applicable permits before offering this specimen for institutional donation.",
  },
  dod: {
    status: "prohibited",
    color: "#c04040",
    heading: "High Origin Risk — Military / DOD Land",
    detail: "Military lands are strictly controlled. Specimens claimed from these areas face extreme institutional scrutiny regardless of whether you personally collected them.",
    action: "Without verified military authorization in the ownership chain, museums will almost certainly decline accession.",
  },
  unknown: {
    status: "unknown",
    color: "#607090",
    heading: "Land Context Not Yet Documented",
    detail: "Pinning or naming the locality still strengthens provenance. Land type here is informational for the institution — not a checklist of collecting permits you personally needed.",
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

/** Unknown / undocumented path — softer GPS/date expectations; knowledge-qualified export attestation. */
const UNKNOWN_PROVENANCE_QUESTIONS = [
  { id: "field_label",   label: "Original field label exists",              desc: "A label written at or near the time of collection accompanies the specimen. Significantly strengthens institutional confidence.", required: false, recommended: true  },
  { id: "gps_coords",    label: "GPS / precise location recorded",          desc: "GPS coordinates, UTM grid, or a detailed locality description was documented.", required: false, recommended: true  },
  { id: "date_known",    label: "Collection date documented",               desc: "The year (at minimum) the specimen was collected is known and recorded. Undated specimens are often declined by institutions.", required: false },
  { id: "chain_doc",     label: "Full chain of custody documented",         desc: "All owners since original collection can be accounted for with records.", required: false },
  { id: "no_cites",      label: "No known international export restrictions", desc: "To the best of my knowledge, the specimen was not illegally exported from its country of origin; no CITES issues.", required: true  },
  { id: "no_deaccession", label: "Not an accessioned museum specimen",      desc: "Confirm title is free and clear — this specimen has not been formally accessioned into another institutional collection and was not improperly removed from one.", required: true  },
];

function getProvenanceQuestions(acquisitionType) {
  return acquisitionType === "unknown" ? UNKNOWN_PROVENANCE_QUESTIONS : PROVENANCE_QUESTIONS;
}

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

/** Buyer / recipient due diligence — secondary acquisition only (not self-collected). */
const DUE_DILIGENCE_QUESTIONS_BASE = [
  {
    id: "dd_no_red_flags",
    label: "No known illegal-origin red flags",
    desc: "You have no reason to believe this specimen was stolen, poached, or taken from closed or prohibited land.",
    required: true,
  },
  {
    id: "dd_legitimate_locality",
    label: "Locality is a known legitimate source",
    desc: "The stated locality is a recognized commercial mine, published locality, or other source consistent with legal supply — not a closed park or similarly restricted site without explanation.",
    required: false,
    recommended: true,
  },
];

function getDueDiligenceQuestions(acquisitionType) {
  if (!acquisitionType || acquisitionType === "self" || acquisitionType === "unknown") return [];
  const sellerRequired = acquisitionType === "dealer";
  const sellerLabel =
    acquisitionType === "dealer" ? "Seller stands behind legality"
    : acquisitionType === "gift" ? "Donor stands behind legality"
    : acquisitionType === "auction" ? "Sale source stands behind legality"
    : "Prior owner stands behind legality";
  const sellerDesc =
    acquisitionType === "dealer"
      ? "The named dealer affirms or documents that the specimen was legally acquired and can be offered for sale."
      : acquisitionType === "gift"
      ? "The donor affirms, to the best of their knowledge, that the specimen was legally obtained."
      : acquisitionType === "auction"
      ? "The auction house, catalog, or seller representation supports legal title / legal origin."
      : "The prior collector affirms or documents that the specimen was legally obtained.";
  return [
    ...DUE_DILIGENCE_QUESTIONS_BASE,
    {
      id: "dd_seller_legality",
      label: sellerLabel,
      desc: sellerDesc,
      required: sellerRequired,
      recommended: !sellerRequired,
    },
  ];
}

function getDocumentationQuestions(acquisitionType, landType) {
  const isSelf = acquisitionType === "self";
  return [
    ...(isSelf ? (LAND_QUESTIONS[landType] || []) : []),
    ...getAcquisitionQuestions(acquisitionType),
    ...getDueDiligenceQuestions(acquisitionType),
    ...getProvenanceQuestions(acquisitionType),
  ];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 9), { animate: true, duration: 0.8 });
  }, [target, map]);
  return null;
}

/** Leaflet often initializes at 0×0 inside modals/tabs — force a remeasure after mount. */
function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const run = () => map.invalidateSize({ animate: false });
    run();
    const t1 = setTimeout(run, 100);
    const t2 = setTimeout(run, 400);
    window.addEventListener("resize", run);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", run);
    };
  }, [map]);
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
      background: checked ? "rgba(10,111,136,0.05)" : "var(--bg-card)",
      border: `1px solid ${checked ? "rgba(10,111,136,0.3)" : "var(--border)"}`,
      transition: "all 0.15s",
    }}>
      <input
        type="checkbox" checked={checked} onChange={onToggle}
        style={{ marginTop: "2px", flexShrink: 0, accentColor: "var(--cyan)", width: "13px", height: "13px", cursor: "pointer" }}
      />
      <div>
        <div style={{ fontSize: "12px", fontWeight: checked ? 600 : 400, color: checked ? "var(--cyan)" : "var(--text)", marginBottom: "1px" }}>
          {q.label}
          {q.required && <span style={{ color: "#a65d00", marginLeft: "5px", fontSize: "9px" }}>★ required</span>}
          {q.recommended && <span style={{ color: "#0a7a52", marginLeft: "5px", fontSize: "9px" }}>⊕ highly recommended</span>}
        </div>
        <div style={{ fontSize: "10px", color: checked ? "rgba(10,111,136,0.55)" : "var(--text-muted)", lineHeight: 1.4 }}>
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
              background: sel ? "rgba(10,111,136,0.07)" : "var(--bg-card)",
              border: `1px solid ${sel ? "rgba(10,111,136,0.4)" : "var(--border)"}`,
              color: sel ? "var(--cyan)" : "var(--text-dim)",
              transition: "all 0.15s",
            }}>
              <div style={{ fontSize: "18px", marginBottom: "4px" }}>{at.icon}</div>
              <div style={{ fontSize: "12px", fontWeight: sel ? 600 : 500, marginBottom: "2px" }}>{at.label}</div>
              <div style={{ fontSize: "10px", color: sel ? "rgba(10,111,136,0.6)" : "var(--text-muted)", lineHeight: 1.4 }}>{at.desc}</div>
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
        <div style={{ padding: "10px 12px", background: "rgba(166,93,0,0.07)", border: "1px solid rgba(166,93,0,0.25)", borderRadius: "5px", fontSize: "11px", color: "#a65d00", lineHeight: 1.55 }}>
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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const { width } = useBreakpoint();
  const stackLayout = width < 720;
  const countryRef = useRef(originCountry);
  const autoSourceRef = useRef(autoSource);
  countryRef.current = originCountry;
  autoSourceRef.current = autoSource;

  // Defer map mount one frame so the modal layout has a real size first
  useEffect(() => {
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleSearch = async (query) => {
    const q = (query || "").trim();
    if (!q) return;
    setIsGeocoding(true);
    const coords = await geocodePlace(q);
    setIsGeocoding(false);
    if (coords) {
      setLocation(coords);
      setFlyTarget({ ...coords, _t: Date.now() });
    }
  };

  const flag = lookupCountryFlag(originCountry);
  const isSelf = acquisitionType === "self";
  const legalInfo = landType
    ? (isSelf ? LAND_LEGAL[landType] : LAND_ORIGIN_RISK[landType])
    : null;

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
          {isSelf
            ? "Click the map or use the search box to pin where you collected. Country and US land management type are auto-detected from the pin. The colored overlay shows US federal surface management boundaries — use this to confirm collecting rules for that land type."
            : "Pin the specimen’s stated locality for provenance documentation. Country and US land management type are auto-detected as institutional context — not a checklist of permits you personally needed. You are responsible for reasonable diligence that the piece was legally obtained."}
        </p>
      </div>

      {/* Country of origin — always shown */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Country of Origin ★
          </div>
          {isDetecting && (
            <span style={{ fontSize: "9px", color: "rgba(10,111,136,0.5)" }}>⟳ detecting…</span>
          )}
          {!isDetecting && autoSource.country && (
            <span style={{ fontSize: "9px", color: "rgba(10,111,136,0.65)", display: "flex", alignItems: "center", gap: "3px" }}>
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

      {/* Map + right panel — two-column on wide, stacked on narrow */}
      <div style={{
        display: "grid",
        gridTemplateColumns: stackLayout ? "1fr" : "minmax(0, 1fr) 280px",
        gap: "10px",
        alignItems: "start",
      }}>

        {/* Left: map */}
        <div style={{
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid var(--border)",
          height: stackLayout ? "280px" : "420px",
          minWidth: 0,
          background: "var(--bg-card)",
          position: "relative",
          zIndex: 0,
        }}>
          {mapReady ? (
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                opacity={0.9}
              />
              <TileLayer
                url="https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_Cached_with_PriUnk/MapServer/tile/{z}/{y}/{x}"
                attribution="BLM National GIS — Surface Management Agency"
                opacity={0.55}
                maxZoom={15}
              />
              <MapInvalidateSize />
              <FlyToLocation target={flyTarget} />
              <LocationPicker location={location} setLocation={setLocation} />
            </MapContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "var(--text-muted)" }}>
              Loading map…
            </div>
          )}
        </div>

        {/* Right: search + result + legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", height: stackLayout ? "auto" : "420px", maxHeight: stackLayout ? "none" : "420px", overflowY: "auto" }}>

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
                onKeyDown={e => { if (e.key === "Enter") handleSearch(localityText); }}
                style={{ flex: 1, fontSize: "11px" }}
              />
              <button
                onClick={() => handleSearch(localityText)}
                disabled={isGeocoding || !localityText.trim()}
                title="Search this location on the map"
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--bg-card)", color: isGeocoding ? "rgba(10,111,136,0.5)" : "var(--text-dim)", fontSize: "11px", cursor: isGeocoding ? "default" : "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                <Search size={11} /> {isGeocoding ? "…" : "Find"}
              </button>
            </div>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", lineHeight: 1.4 }}>
              Press <strong>Find</strong> to pin and auto-detect, or click the map directly.
            </div>
          </div>

          {/* Coords + detecting spinner */}
          {(location || isDetecting) && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "rgba(10,111,136,0.6)", fontFamily: "var(--mono)", padding: "5px 8px", background: "rgba(10,111,136,0.05)", borderRadius: "4px", border: "1px solid rgba(10,111,136,0.12)" }}>
              <MapPin size={10} />
              {location && `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
              {isDetecting && <span style={{ fontFamily: "sans-serif", fontSize: "9px", color: "rgba(10,111,136,0.5)" }}>⟳ detecting…</span>}
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
              {!isSelf && (
                <div style={{
                  display: "inline-block", marginBottom: "5px", padding: "2px 7px", borderRadius: "3px",
                  fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase",
                  background: "rgba(96,112,144,0.12)", color: "var(--text-muted)",
                }}>
                  Land context (informational)
                </div>
              )}
              {isSelf && (
                <div style={{ fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.55 }}>
                  {LAND_TYPES.find(lt => lt.key === landType)?.desc}
                </div>
              )}
              {legalInfo && (
                <div style={{ marginTop: isSelf ? "6px" : "2px", fontSize: "11px", fontWeight: 600, color: legalInfo.color }}>
                  {legalInfo.status === "allowed" ? "✓" : legalInfo.status === "prohibited" ? "✗" : legalInfo.status === "unknown" ? "?" : "⚠"} {legalInfo.heading}
                </div>
              )}
              {legalInfo?.detail && (
                <div style={{ marginTop: "3px", fontSize: "10px", color: "var(--text-dim)", lineHeight: 1.5 }}>{legalInfo.detail}</div>
              )}
              {legalInfo?.action && (
                <div style={{ marginTop: "4px", fontSize: "10px", color: legalInfo.color, lineHeight: 1.5 }}>➜ {legalInfo.action}</div>
              )}
              {!isSelf && <div style={{ marginTop: "5px", fontSize: "9px", color: "var(--text-muted)", fontStyle: "italic" }}>Click map to override locality pin.</div>}
            </div>
          )}

          {/* Could not detect */}
          {location && !isDetecting && !landType && originCountry.toLowerCase().includes("united states") && (
            <div style={{ padding: "9px 11px", borderRadius: "6px", background: "rgba(96,112,144,0.08)", border: "1px solid rgba(96,112,144,0.30)" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-dim)", marginBottom: "3px" }}>Not in federal dataset</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                {isSelf
                  ? "Likely private, county, or small state parcel. Select the type below if known."
                  : "Likely private, county, or small state parcel. Locality is still useful provenance even without a federal land label."}
              </div>
            </div>
          )}

          {/* No pin yet — prompt */}
          {!location && !isDetecting && (
            <div style={{ padding: "9px 11px", borderRadius: "6px", background: "rgba(96,112,144,0.06)", border: "1px solid rgba(96,112,144,0.20)", textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.55 }}>
                {isSelf
                  ? "Click the map or search a location to auto-detect land type."
                  : "Click the map or search to pin the stated locality for provenance."}
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
              <span style={{ fontSize: "9px", color: "rgba(10,111,136,0.5)" }}>⟳ detecting…</span>
            )}
            {!isDetecting && autoSource.landType && (
              <span style={{ fontSize: "9px", color: "rgba(10,111,136,0.65)", display: "flex", alignItems: "center", gap: "3px" }}>
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
      background: file ? "rgba(10,111,136,0.04)" : "var(--bg-card)",
      border: `1px solid ${file ? "rgba(10,111,136,0.28)" : "var(--border)"}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "11px", fontWeight: file ? 600 : 400, color: file ? "var(--cyan)" : "var(--text)", marginBottom: "2px" }}>
            {slot.label}
          </div>
          <div style={{ fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>{slot.desc}</div>
          {file && (
            <div style={{ fontSize: "9px", color: "rgba(10,111,136,0.55)", fontFamily: "var(--mono)", marginTop: "4px" }}>
              📎 {file.name} · {(file.size / 1024).toFixed(0)} KB
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept={slot.accept} onChange={handleChange} style={{ display: "none" }} />
        <button
          onClick={() => file ? onFile(null) : inputRef.current?.click()}
          style={{
            padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 500, whiteSpace: "nowrap",
            background: file ? "rgba(255,80,80,0.07)" : "rgba(10,111,136,0.07)",
            border: `1px solid ${file ? "rgba(255,80,80,0.25)" : "rgba(10,111,136,0.25)"}`,
            color: file ? "#ff8080" : "var(--cyan)", cursor: "pointer", flexShrink: 0,
          }}
        >
          {file ? "Remove" : "Attach"}
        </button>
      </div>
    </div>
  );
}

function SpecimenRoster({ selectedRecords = [], title = "Selected Specimens" }) {
  if (!selectedRecords.length) return null;
  return (
    <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
        {title} ({selectedRecords.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "220px", overflowY: "auto" }}>
        {selectedRecords.map(rec => {
          const gradeObj = GRADES.find(g => g.label === rec.grade) || GRADES[GRADES.length - 1];
          return (
            <div key={rec.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "6px 8px", background: "var(--bg-panel)", borderRadius: "4px", border: "1px solid var(--border-dim)" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)" }}>
                  {rec.spec?.name || rec.spec?.species || "Unnamed Specimen"}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {[rec.spec?.species, rec.spec?.locality].filter(Boolean).join(" · ") || "—"}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, fontSize: "10px", color: gradeObj.color, fontWeight: 600 }}>
                {rec.prismScore} · {rec.gradeEmoji} {rec.grade}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function serializeSelectedSpecimens(selectedRecords = []) {
  return selectedRecords.map(rec => ({
    id: rec.id,
    name: rec.spec?.name || null,
    species: rec.spec?.species || null,
    locality: rec.spec?.locality || null,
    prismScore: rec.prismScore ?? null,
    grade: rec.grade || null,
  }));
}

// ── Batch path: selected specimens overview ───────────────────────────────────

function BatchSelectedStep({ selectedRecords }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Selected Specimens
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          You selected {selectedRecords.length} specimens from history. Documentation and assessment will cover this batch together — one shared acquisition type and checklist.
        </p>
      </div>
      <SpecimenRoster selectedRecords={selectedRecords} />
      <div style={{ padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border-dim)", borderRadius: "5px", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
        Localities from each specimen’s history are listed above. The Origin & Location map step is skipped for batch donations.
      </div>
    </div>
  );
}

// ── Collection Donation intro (whole-collection path) ─────────────────────────

function CollectionDonationIntroStep({ selectedRecords = [] }) {
  const fromHistory = selectedRecords.length > 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Collection Donation
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          {fromHistory
            ? `You selected ${selectedRecords.length} specimens from history — treated as a collection donation (more than 10 items).`
            : "Use this path when you are offering a group of specimens together — not a single rated piece."}
        </p>
      </div>

      {fromHistory && <SpecimenRoster selectedRecords={selectedRecords} title="Selected from History" />}

      <div style={{ padding: "14px 16px", background: "rgba(10,111,136,0.05)", border: "1px solid rgba(10,111,136,0.22)", borderRadius: "6px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>What this guide is for</div>
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "6px" }}>
          <li>You want to donate a whole collection, or many objects at once.</li>
          <li>You do <strong style={{ color: "var(--text)" }}>not</strong> need a PRISM score for every specimen.</li>
          <li>Stated locality stays blank — collections often mix many localities.</li>
          <li>You can add optional notes for a curator on the next page.</li>
        </ul>
      </div>

      <div style={{ padding: "12px 14px", background: "rgba(166,93,0,0.07)", border: "1px solid rgba(166,93,0,0.28)", borderRadius: "6px", fontSize: "12px", color: "#a65d00", lineHeight: 1.55 }}>
        <strong>Important:</strong> Institutions still care about provenance and legality. Collection Donation uses a documentation checklist suited to mixed / incomplete histories. A weak paper trail usually limits what museums can accession.
      </div>

      <div style={{ padding: "12px 14px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
        Next you will complete the <strong style={{ color: "var(--text)" }}>Collection Donation</strong> checklist, then review a summary you can share with a curator.
      </div>
    </div>
  );
}

// ── Collection Donation checklist (unknown-provenance items, collection framing) ─

function CollectionDonationStep({ checks, setChecks, collectionNotes, setCollectionNotes }) {
  const toggle = id => setChecks(prev => ({ ...prev, [id]: !prev[id] }));
  const questions = getProvenanceQuestions("unknown");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Collection Donation Checklist
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Check everything that applies across the collection. <span style={{ color: "#a65d00" }}>★ required</span> items are necessary for museum consideration. <span style={{ color: "#0a7a52" }}>⊕ highly recommended</span> items significantly strengthen the evaluation.
        </p>
      </div>

      <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
        📦 <strong style={{ color: "var(--text)" }}>Collection Donation:</strong>{" "}
        No single specimen or locality is assumed. Answer for the collection as a whole where you can; note gaps honestly in the optional details below.
      </div>

      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
          Additional Details <span style={{ letterSpacing: "0.06em", textTransform: "none", color: "var(--text-dim)" }}>(optional)</span>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, marginBottom: "8px" }}>
          Stated locality is left blank — a collection may include objects from many different localities. Add any notes that may help a curator (regions represented, approximate collecting eras, catalog references, etc.).
        </p>
        <textarea
          value={collectionNotes}
          onChange={e => setCollectionNotes(e.target.value)}
          rows={4}
          placeholder="Optional notes about this collection…"
          style={{
            width: "100%", resize: "vertical", minHeight: "88px",
            padding: "10px 12px", borderRadius: "5px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: "12px", lineHeight: 1.5,
            fontFamily: "inherit",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
          Provenance Documentation
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {questions.map(q => <CheckItem key={q.id} q={q} checked={!!checks[q.id]} onToggle={() => toggle(q.id)} />)}
        </div>
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
  const dueQs  = getDueDiligenceQuestions(acquisitionType);
  const acqMeta = ACQUISITION_TYPES.find(a => a.key === acquisitionType);
  const highRiskLand = !isSelf && (landType === "nps" || landType === "tribal" || landType === "dod");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Documentation Checklist
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Check everything that applies. <span style={{ color: "#a65d00" }}>★ required</span> items are necessary for museum consideration. <span style={{ color: "#0a7a52" }}>⊕ highly recommended</span> items significantly strengthen the evaluation.
        </p>
      </div>

      {/* Acquisition context note */}
      {acqMeta && (
        <div style={{ padding: "8px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border-dim)", fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5 }}>
          {acqMeta.icon} <strong style={{ color: "var(--text)" }}>{acqMeta.label}:</strong>{" "}
          {acquisitionType === "dealer" && "Museums accept dealer-purchased specimens but require the dealer to be named and the locality to be confirmed. You did not personally collect this piece — your role is buyer due diligence: a named dealer, locality confirmation, and no known illegal-origin red flags."}
          {acquisitionType === "collector" && "Traceable collector-to-collector chains are accepted, but each link in the chain must be identified. Unknown links reduce institutional confidence. Diligence is about the prior chain, not permits you personally held."}
          {acquisitionType === "auction" && "Auction-purchased specimens often have published catalog descriptions which serve as provenance documentation. Request the catalog page if available. Diligence focuses on sale records and stated origin, not your own field permits."}
          {acquisitionType === "gift" && "Gift or inherited specimens are accepted but require documentation of the donor's acquisition history where possible. You are responsible for reasonable diligence on legal origin, not for having collected the specimen yourself."}
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
      {highRiskLand && (
        <div style={{ padding: "10px 12px", background: "rgba(224,106,42,0.08)", border: "1px solid rgba(224,106,42,0.3)", borderRadius: "5px", fontSize: "11px", color: "#e06a2a", lineHeight: 1.5 }}>
          ⚠️ Stated locality land context is high-risk ({LAND_TYPES.find(lt => lt.key === landType)?.label}).
          Museums will scrutinize the ownership chain — document a verifiable legal source; a purchase or gift alone rarely clears origin questions.
        </div>
      )}
      {isSelf && landType === "unknown" && (
        <div style={{ padding: "10px 12px", background: "rgba(166,93,0,0.07)", border: "1px solid rgba(166,93,0,0.25)", borderRadius: "5px", fontSize: "11px", color: "#a65d00", lineHeight: 1.5 }}>
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

      {/* Buyer / recipient due diligence (secondary acquisition) */}
      {dueQs.length > 0 && (
        <div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
            Legal-Origin Due Diligence
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {dueQs.map(q => <CheckItem key={q.id} q={q} checked={!!checks[q.id]} onToggle={() => toggle(q.id)} />)}
          </div>
        </div>
      )}

      {/* Universal provenance */}
      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
          Universal Provenance Documentation
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {getProvenanceQuestions(acquisitionType).map(q => <CheckItem key={q.id} q={q} checked={!!checks[q.id]} onToggle={() => toggle(q.id)} />)}
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

const PRELIMINARY_NOTE =
  "PRELIMINARY STEP ONLY: This report helps gather documentation for museum review. Acceptance or accession is decided solely by the receiving institution — not by PRISM.";

function buildTextReport({
  spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText, location,
  checks, uploads, reqPassed, optPassed, required, attestorName, collectionMode, collectionNotes,
  donationMode = "single", selectedRecords = [],
}) {
  const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const acqMeta  = ACQUISITION_TYPES.find(a => a.key === acquisitionType);
  const landMeta = LAND_TYPES.find(lt => lt.key === landType);
  const flag     = lookupCountryFlag(originCountry);
  const chainStrength = CHAIN_STRENGTH[acquisitionType] || { label: "Unknown" };
  const isSelf   = acquisitionType === "self";
  const isBatch  = donationMode === "batch";
  const allQs    = getDocumentationQuestions(acquisitionType, landType);
  const notes    = (collectionNotes || "").trim();
  const roster   = serializeSelectedSpecimens(selectedRecords);
  const LINE = "\u2500".repeat(52);
  const lines = [
    "PRISM \u2014 MINERAL DONATION EVALUATION REPORT",
    `Generated: ${now}`,
    LINE,
    "",
    PRELIMINARY_NOTE,
    "",
  ];
  if (roster.length > 0) {
    lines.push(`SELECTED SPECIMENS (${roster.length})`);
    roster.forEach((s, i) => {
      lines.push(`  ${i + 1}. ${s.name || s.species || "Unnamed"}`);
      if (s.species) lines.push(`     Species:  ${s.species}`);
      if (s.locality) lines.push(`     Locality: ${s.locality}`);
      if (s.prismScore != null) lines.push(`     PRISM:    ${s.prismScore}${s.grade ? ` (${s.grade})` : ""}`);
    });
    lines.push("");
  } else if (spec?.name || spec?.species || spec?.locality) {
    lines.push(collectionMode ? "DONATION SCOPE" : "SPECIMEN");
    if (spec?.name)     lines.push(`  Name:      ${spec.name}`);
    if (spec?.species)  lines.push(`  Species:   ${spec.species}`);
    if (spec?.locality && !collectionMode) lines.push(`  Locality:  ${spec.locality}`);
    lines.push("");
  }
  const acqLabel = collectionMode ? "Collection Donation"
    : isBatch ? `${acqMeta?.label || acquisitionType} (batch)`
    : (acqMeta?.label || acquisitionType);
  lines.push(
    `PROVENANCE CHAIN: ${chainStrength.label}`,
    `  Acquisition type: ${acqLabel}`,
  );
  if (acquisitionDetails?.dealerName)     lines.push(`  Dealer:       ${acquisitionDetails.dealerName}`);
  if (acquisitionDetails?.collectorNames) lines.push(`  Collector(s): ${acquisitionDetails.collectorNames}`);
  if (acquisitionDetails?.auctionHouse)   lines.push(`  Auction/Show: ${acquisitionDetails.auctionHouse}`);
  if (acquisitionDetails?.donorName)      lines.push(`  Donor:        ${acquisitionDetails.donorName}`);
  lines.push(
    "",
    "DOCUMENTATION CHECKLIST SUMMARY",
    `  Required criteria checked: ${reqPassed.length} of ${required.length}`,
    ...(optPassed.length > 0 ? [`  Optional criteria checked: ${optPassed.length}`] : []),
    "",
  );
  if (collectionMode) {
    lines.push("STATED LOCALITY");
    lines.push("  (left blank — collection may include objects from many localities)");
    if (notes) {
      lines.push("", "ADDITIONAL DETAILS");
      notes.split("\n").forEach(line => lines.push(`  ${line}`));
    }
    lines.push("");
  } else if (isBatch) {
    lines.push("STATED LOCALITY");
    lines.push("  (per-specimen localities listed under SELECTED SPECIMENS)");
    lines.push("");
  } else {
    lines.push(isSelf ? "COLLECTION SITE" : "STATED LOCALITY");
    lines.push(`  Country:   ${originCountry || "Unknown"}`);
    if (landMeta) {
      lines.push(isSelf
        ? `  Land type: ${landMeta.label}`
        : `  Stated locality land context: ${landMeta.label}`);
    }
    if (localityText) lines.push(`  Locality:  ${localityText}`);
    if (location) lines.push(`  Coordinates: ${location.lat.toFixed(5)}\u00b0, ${location.lng.toFixed(5)}\u00b0`);
    lines.push("");
    if (flag) {
      lines.push(`COUNTRY FLAG: \u2691 ${flag.name}`, `  ${flag.heading}`);
      if (flag.action) lines.push(`  \u279c ${flag.action}`);
      lines.push("");
    }
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
    "This report is a preliminary document-prep aid and is not legal advice.",
    "Acceptance / accession is decided by the receiving institution, not by PRISM.",
  );
  return lines.join("\n");
}

function buildJSONReport({
  spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText, location,
  checks, uploads, attestorName, collectionMode, collectionNotes,
  donationMode = "single", selectedRecords = [],
}) {
  const isSelf = acquisitionType === "self";
  const isBatch = donationMode === "batch";
  const chainStrength = CHAIN_STRENGTH[acquisitionType] || { label: "Unknown" };
  const notes = (collectionNotes || "").trim() || null;
  const roster = serializeSelectedSpecimens(selectedRecords);
  return JSON.stringify({
    generated: new Date().toISOString(),
    generator: "PRISM Mineral Donation Evaluator v1",
    preliminary: true,
    preliminaryNote: "This report helps gather documentation for museum review. Acceptance or accession is decided solely by the receiving institution — not by PRISM.",
    specimen: {
      name: spec?.name || null,
      species: spec?.species || null,
      locality: collectionMode || isBatch ? null : (spec?.locality || null),
    },
    selectedSpecimens: roster.length > 0 ? roster : undefined,
    assessment: {
      scope: collectionMode ? "collection_donation" : isBatch ? "batch_donation" : "single_specimen",
      provenanceChainLabel: chainStrength.label,
      ...(notes ? { additionalDetails: notes } : {}),
    },
    acquisition: {
      type: collectionMode ? "collection_donation" : acquisitionType,
      label: collectionMode ? "Collection Donation" : undefined,
      details: acquisitionDetails,
    },
    location: collectionMode
      ? {
          locality: null,
          country: null,
          landType: null,
          note: "Stated locality left blank — collection may include objects from many localities",
        }
      : isBatch
      ? {
          locality: null,
          country: null,
          landType: null,
          note: "Per-specimen localities are listed under selectedSpecimens",
        }
      : {
          locality: localityText || null,
          country: originCountry || null,
          landType: landType || null,
          landTypeRole: isSelf ? "collector_compliance" : "stated_locality_context",
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

function SummaryStep({
  acquisitionType, acquisitionDetails, landType, checks, location, originCountry, localityText,
  spec, uploads, onExported, collectionMode = false, collectionNotes = "",
  donationMode = "single", selectedRecords = [],
}) {
  const [copied, setCopied] = useState(false);
  const [attestorName, setAttestorName] = useState("");
  const isSelf = acquisitionType === "self";
  const isBatch = donationMode === "batch";
  const allQs   = getDocumentationQuestions(acquisitionType, landType);
  const required = allQs.filter(q => q.required);
  const optional = allQs.filter(q => !q.required);

  const reqPassed = required.filter(q => checks[q.id]);
  const reqFailed = required.filter(q => !checks[q.id]);
  const optPassed = optional.filter(q => checks[q.id]);

  const acqMeta     = ACQUISITION_TYPES.find(a => a.key === acquisitionType);
  const chainStrength = CHAIN_STRENGTH[acquisitionType] || { label: "Unknown" };
  const flag          = lookupCountryFlag(originCountry);
  const landMeta      = LAND_TYPES.find(lt => lt.key === landType);
  const isWeakChain   = acquisitionType === "unknown";
  const notes         = (collectionNotes || "").trim();

  const reportArgs = {
    spec, acquisitionType, acquisitionDetails, landType, originCountry, localityText,
    location, checks, uploads, reqPassed, optPassed, required, attestorName, collectionMode, collectionNotes,
    donationMode, selectedRecords,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
          Donation Assessment
        </h3>
        <p style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.55 }}>
          Checklist summary based on the documentation items. Not legal advice — consult the receiving institution for their requirements.
        </p>
      </div>

      {/* Preliminary step — all donation modes */}
      <div style={{
        padding: "12px 14px",
        background: "rgba(10,111,136,0.07)",
        border: "1px solid rgba(10,111,136,0.3)",
        borderRadius: "6px",
      }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.14em", color: "var(--cyan)", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
          Preliminary document prep
        </div>
        <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.55 }}>
          This guide is a <strong>preliminary step</strong> to gather checklist answers and supporting notes for the museum.
          It does <strong>not</strong> decide acceptance. <strong>Accession is decided by the receiving institution</strong>, not by PRISM.
        </div>
      </div>

      {selectedRecords.length > 0 && (
        <SpecimenRoster
          selectedRecords={selectedRecords}
          title={collectionMode ? "Selected from History" : "Batch Specimens"}
        />
      )}

      {/* Provenance chain summary — qualitative only, no numeric score */}
      <div style={{ padding: "10px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase" }}>Provenance Chain</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            {collectionMode ? (
              <>📦 <strong style={{ color: "var(--text)" }}>Collection Donation</strong></>
            ) : (
              <>
                {acqMeta?.icon} <strong style={{ color: "var(--text)" }}>{acqMeta?.label}</strong>
                {isBatch ? ` · ${selectedRecords.length} specimens` : ""}
                {acquisitionDetails?.dealerName ? ` — ${acquisitionDetails.dealerName}` : ""}
                {acquisitionDetails?.collectorNames ? ` — ${acquisitionDetails.collectorNames}` : ""}
                {acquisitionDetails?.auctionHouse ? ` — ${acquisitionDetails.auctionHouse}` : ""}
                {acquisitionDetails?.donorName ? ` — ${acquisitionDetails.donorName}` : ""}
              </>
            )}
          </div>
          {(collectionMode || isWeakChain) && (
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#ff6060", letterSpacing: "0.04em", flexShrink: 0 }}>
              Weak
            </div>
          )}
        </div>
        <div style={{ fontSize: "10px", color: (collectionMode || isWeakChain) ? "#ff8080" : "var(--text-muted)" }}>{chainStrength.label}</div>
      </div>

      {/* Country flag (if any) — single-specimen path only */}
      {!isBatch && !collectionMode && flag && (
        <div style={{ padding: "9px 12px", borderRadius: "5px", background: `${STATUS_COLORS[flag.status]}0a`, border: `1px solid ${STATUS_COLORS[flag.status]}35`, fontSize: "11px", color: STATUS_COLORS[flag.status], lineHeight: 1.5 }}>
          ⚑ <strong>{flag.name}</strong> — {flag.heading}
          {flag.action && <div style={{ marginTop: "3px", fontSize: "10px", opacity: 0.85 }}>➜ {flag.action}</div>}
        </div>
      )}

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
          <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#0a7a52", textTransform: "uppercase", marginBottom: "6px" }}>✓ Requirements Met</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {reqPassed.map(q => (
              <div key={q.id} style={{ padding: "6px 10px", background: "rgba(10,122,82,0.05)", border: "1px solid rgba(10,122,82,0.18)", borderRadius: "4px", fontSize: "11px", color: "#0a7a52" }}>{q.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* Location summary */}
      {collectionMode ? (
        <div style={{ padding: "9px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            Stated Locality
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, fontStyle: "italic" }}>
            Left blank — this donation is a collection of objects that may come from many different localities.
          </div>
          {notes && (
            <>
              <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "12px", marginBottom: "6px" }}>
                Additional Details
              </div>
              <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{notes}</div>
            </>
          )}
        </div>
      ) : isBatch ? (
        <div style={{ padding: "9px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            Stated Locality
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, fontStyle: "italic" }}>
            Per-specimen localities are listed in the batch roster above.
          </div>
        </div>
      ) : (originCountry || localityText || location || spec?.locality) && (
        <div style={{ padding: "9px 12px", background: "var(--bg-card)", borderRadius: "5px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "9px", letterSpacing: "0.16em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            {isSelf ? "Collection Site" : "Stated Locality"}
          </div>
          {localityText && <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{localityText}</div>}
          {!localityText && spec?.locality && <div style={{ fontSize: "12px", color: "var(--text)", marginBottom: "3px" }}>{spec.locality}</div>}
          {originCountry && <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "3px" }}>Country: <strong>{originCountry}</strong></div>}
          {landMeta && (
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "3px" }}>
              {isSelf ? "Land:" : "Stated locality land context:"}{" "}
              <strong style={{ color: landMeta.color }}>{landMeta.label}</strong>
              {!isSelf && (
                <span style={{ display: "block", marginTop: "2px", fontSize: "10px", color: "var(--text-muted)" }}>
                  Informational for the institution — not collector-permit compliance for you.
                </span>
              )}
            </div>
          )}
          {location && <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--mono)" }}>{location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°</div>}
        </div>
      )}

      {/* Attestation */}
      <div style={{ borderTop: "1px solid var(--border-dim)", paddingTop: "14px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Attestation</div>
        <div style={{
          padding: "12px 14px", background: "rgba(10,111,136,0.03)",
          border: "1px solid rgba(10,111,136,0.15)", borderRadius: "6px",
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
              const txt = buildTextReport(reportArgs);
              navigator.clipboard.writeText(txt)
                .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); onExported?.(); })
                .catch(() => {});
            }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 10px", borderRadius: "5px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: copied ? "rgba(10,122,82,0.09)" : "var(--bg-card)", border: `1px solid ${copied ? "rgba(10,122,82,0.4)" : "var(--border)"}`, color: copied ? "#0a7a52" : "var(--text-dim)", transition: "all 0.2s" }}
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={() => {
              const json = buildJSONReport(reportArgs);
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
const BATCH_STEPS = ["Selected Specimens", "Acquisition", "Documentation", "Assessment"];
const COLLECTION_STEPS = ["Overview", "Collection Donation", "Assessment"];

function stepsForMode(mode) {
  if (mode === "collection") return COLLECTION_STEPS;
  if (mode === "batch") return BATCH_STEPS;
  return STEPS;
}

export default function DonationEval({ scores: initScores, spec: initSpec, records = [], onClose }) {
  const [showPicker, setShowPicker]           = useState(true);
  const [donationMode, setDonationMode]       = useState("single"); // single | batch | collection
  const [selectedRecords, setSelectedRecords] = useState([]);
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
  const [collectionNotes, setCollectionNotes] = useState("");
  const [exported, setExported]               = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);

  const collectionMode = donationMode === "collection";
  const batchMode = donationMode === "batch";
  const activeSteps = stepsForMode(donationMode);

  const resetGuideState = () => {
    setAcquisitionDetails({});
    setOriginCountry("");
    setLocalityText("");
    setLocation(null);
    setLandType(null);
    setChecks({});
    setUploads({});
    setCollectionNotes("");
    setExported(false);
  };

  const startSingle = (scores, spec) => {
    setDonationMode("single");
    setSelectedRecords([]);
    setWorkingScores(scores);
    setWorkingSpec(spec);
    setAcquisitionType(null);
    resetGuideState();
    setStep(0);
    setShowPicker(false);
  };

  const startBatch = (recs) => {
    setDonationMode("batch");
    setSelectedRecords(recs);
    setWorkingScores(null);
    setWorkingSpec({ name: `Batch donation (${recs.length} specimens)` });
    setAcquisitionType(null);
    resetGuideState();
    setStep(0);
    setShowPicker(false);
  };

  const startCollection = (recs = []) => {
    setDonationMode("collection");
    setSelectedRecords(recs);
    setWorkingScores(null);
    setWorkingSpec({ name: "Collection Donation" });
    setAcquisitionType("unknown");
    resetGuideState();
    setStep(0);
    setShowPicker(false);
  };

  const handlePickerSelect = (scores, spec) => startSingle(scores, spec);

  const handleContinueSelected = (recs) => {
    const n = recs.length;
    if (n === 1) startSingle(recs[0].scores, recs[0].spec);
    else if (n >= COLLECTION_THRESHOLD) startCollection(recs);
    else startBatch(recs);
  };

  const handleSkipCollection = () => startCollection([]);

  if (showPicker) {
    return (
      <DonationPickerScreen
        initScores={initScores} initSpec={initSpec}
        records={records}
        onSelect={handlePickerSelect}
        onContinueSelected={handleContinueSelected}
        onSkipCollection={handleSkipCollection}
        onClose={onClose}
      />
    );
  }

  const spec = workingSpec;

  const guardedClose = () => {
    if (step === activeSteps.length - 1 && !exported) { setShowLeaveWarning(true); }
    else { onClose(); }
  };

  const canAdvance = () => {
    if (collectionMode) return true;
    if (batchMode) {
      if (step === 0) return true;
      if (step === 1) return !!acquisitionType;
      return true;
    }
    if (step === 0) return !!acquisitionType;
    if (step === 1) return originCountry.trim().length >= 2 && (acquisitionType !== "self" || !!landType);
    return true;
  };

  const showingLocation = donationMode === "single" && step === 1;
  const showingBatchSelected = batchMode && step === 0;
  const showingBatchAcquisition = batchMode && step === 1;
  const showingBatchDocs = batchMode && step === 2;
  const showingCollectionIntro = collectionMode && step === 0;
  const showingCollectionChecklist = collectionMode && step === 1;
  const showingSingleAcquisition = donationMode === "single" && step === 0;
  const showingDocs = donationMode === "single" && step === 2;
  const showingAssessment =
    (donationMode === "single" && step === 3)
    || (batchMode && step === 3)
    || (collectionMode && step === 2);

  const headerTitle = collectionMode ? "Collection Donation"
    : batchMode ? "Batch Donation"
    : "Museum Donation Evaluation";
  const headerSub = collectionMode
    ? (selectedRecords.length > 0
      ? `${selectedRecords.length} from history · Collection Donation`
      : "Whole-collection guide — no PRISM score required")
    : batchMode
    ? `${selectedRecords.length} specimens from history`
    : [spec?.name, spec?.species].filter(Boolean).join(" · ");

  const backLabel = step === 0
    ? (collectionMode || batchMode ? "Change Selection" : "Change Specimen")
    : "Back";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(4,8,18,0.88)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: showingLocation ? "920px" : "660px",
        maxHeight: "92vh",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        transition: "max-width 0.2s ease",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, background: "var(--bg-panel)",
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: "7px" }}>
              🏛️ {headerTitle}
            </div>
            {headerSub && (
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                {headerSub}
              </div>
            )}
          </div>
          <button onClick={guardedClose} style={{ background: "none", border: "none", color: "var(--text-muted)", padding: "4px", display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Step tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {activeSteps.map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: "9px 0", textAlign: "center",
              fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: i === step ? "var(--cyan)" : i < step ? "#0a7a52" : "var(--text-muted)",
              borderBottom: `2px solid ${i === step ? "var(--cyan)" : i < step ? "#0a7a52" : "transparent"}`,
              transition: "all 0.2s",
              fontWeight: i === step ? 600 : 400,
            }}>
              {i < step ? "✓ " : `${i + 1}. `}{s}
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "22px 24px" }}>
          {showingSingleAcquisition && (
            <AcquisitionStep
              acquisitionType={acquisitionType} setAcquisitionType={setAcquisitionType}
              acquisitionDetails={acquisitionDetails} setAcquisitionDetails={setAcquisitionDetails}
            />
          )}
          {showingLocation && (
            <LocationStep
              location={location} setLocation={setLocation}
              landType={landType} setLandType={setLandType}
              originCountry={originCountry} setOriginCountry={setOriginCountry}
              localityText={localityText} setLocalityText={setLocalityText}
              acquisitionType={acquisitionType}
            />
          )}
          {showingBatchSelected && <BatchSelectedStep selectedRecords={selectedRecords} />}
          {showingBatchAcquisition && (
            <AcquisitionStep
              acquisitionType={acquisitionType} setAcquisitionType={setAcquisitionType}
              acquisitionDetails={acquisitionDetails} setAcquisitionDetails={setAcquisitionDetails}
            />
          )}
          {showingCollectionIntro && <CollectionDonationIntroStep selectedRecords={selectedRecords} />}
          {showingCollectionChecklist && (
            <CollectionDonationStep
              checks={checks} setChecks={setChecks}
              collectionNotes={collectionNotes} setCollectionNotes={setCollectionNotes}
            />
          )}
          {(showingDocs || showingBatchDocs) && (
            <DocumentationStep
              acquisitionType={acquisitionType} landType={landType}
              checks={checks} setChecks={setChecks}
              uploads={uploads} setUploads={setUploads}
            />
          )}
          {showingAssessment && (
            <SummaryStep
              acquisitionType={acquisitionType} acquisitionDetails={acquisitionDetails}
              landType={landType} checks={checks}
              location={location} originCountry={originCountry} localityText={localityText} spec={spec}
              uploads={uploads} collectionMode={collectionMode} collectionNotes={collectionNotes}
              donationMode={donationMode} selectedRecords={selectedRecords}
              onExported={() => { setExported(true); setShowLeaveWarning(false); }}
            />
          )}
        </div>

        {/* Unsaved warning banner */}
        {showLeaveWarning && (
          <div style={{
            padding: "10px 18px", background: "rgba(166,93,0,0.09)",
            borderTop: "1px solid rgba(166,93,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
            flexShrink: 0,
          }}>
            <div style={{ fontSize: "11px", color: "#a65d00", lineHeight: 1.4 }}>
              ⚠️ <strong>Assessment not saved.</strong> Copy, download, or print the report before closing so it isn't lost.
            </div>
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => setShowLeaveWarning(false)}
                style={{ padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 500, cursor: "pointer", background: "rgba(166,93,0,0.1)", border: "1px solid rgba(166,93,0,0.4)", color: "#a65d00" }}
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
            {backLabel}
          </button>

          {step < activeSteps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 20px",
                background: canAdvance() ? "rgba(10,111,136,0.09)" : "transparent",
                border: `1px solid ${canAdvance() ? "rgba(10,111,136,0.4)" : "var(--border)"}`,
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
                background: exported ? "rgba(10,122,82,0.09)" : "rgba(166,93,0,0.07)",
                border: `1px solid ${exported ? "rgba(10,122,82,0.4)" : "rgba(166,93,0,0.4)"}`,
                borderRadius: "4px",
                color: exported ? "#0a7a52" : "#a65d00",
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
