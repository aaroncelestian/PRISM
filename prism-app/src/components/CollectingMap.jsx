import { useEffect, useMemo, useState } from "react";
import { X, Copy, Check, MapPin, Phone, Mail, Home } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const CA_HOME = { center: [37.0, -119.0], zoom: 6 };
import {
  CA_COLLECTING_SITES,
  CA_MAP_META,
  STATUS_META,
  STATUS_FILTERS,
  MANAGER_FILTERS,
  MATERIAL_FILTERS,
  managerKey,
} from "../data/caCollectingSites.js";
import {
  AGENCY_CONTACTS,
  FEE_DIG_CONTACTS,
  EMAIL_TEMPLATES,
  OUTREACH_NOTES,
  getSiteOutreach,
  fillTemplateForSite,
} from "../data/gatedSitesContacts.js";
import { useBreakpoint } from "../hooks/useWindowSize.js";

const TABS = [
  { key: "map", label: "Map" },
  { key: "contacts", label: "Contacts" },
  { key: "templates", label: "Templates" },
];

function MapInvalidateSize({ active }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
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
  }, [map, active]);
  return null;
}

function FlyToSite({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 10, { animate: true, duration: 0.6 });
  }, [target, map]);
  return null;
}

function FlyHome({ requestId }) {
  const map = useMap();
  useEffect(() => {
    if (!requestId) return;
    map.closePopup();
    map.flyTo(CA_HOME.center, CA_HOME.zoom, { animate: true, duration: 0.7 });
  }, [requestId, map]);
  return null;
}

function ChipRow({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "10px",
              padding: "4px 9px",
              borderRadius: "3px",
              cursor: "pointer",
              letterSpacing: "0.04em",
              background: active ? "rgba(var(--accent-rgb), 0.12)" : "var(--bg-card)",
              border: `1px solid ${active ? "rgba(var(--accent-rgb), 0.45)" : "var(--border)"}`,
              color: active ? "var(--cyan)" : "var(--text-muted)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function CopyButton({ text, label = "Copy" }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch { /* ignore */ }
      }}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "4px 10px", borderRadius: "4px", fontSize: "10px",
        cursor: "pointer", letterSpacing: "0.06em",
        background: ok ? "rgba(10,122,82,0.1)" : "rgba(var(--accent-rgb), 0.08)",
        border: `1px solid ${ok ? "rgba(10,122,82,0.35)" : "rgba(var(--accent-rgb), 0.35)"}`,
        color: ok ? "var(--success)" : "var(--cyan)",
      }}
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
      {ok ? "Copied" : label}
    </button>
  );
}

function SitePopup({ site, onOpenTemplate }) {
  const meta = STATUS_META[site.status] || STATUS_META.casual;
  const { contacts, feeDig, template } = getSiteOutreach(site);
  const filled = fillTemplateForSite(template, site);
  const primaryContacts = contacts.filter((c) => !c.secondary);
  const hotlines = contacts.filter((c) => c.secondary);

  return (
    <div style={{ minWidth: 240, maxWidth: 320, fontFamily: "var(--sans)" }}>
      <span style={{
        display: "inline-block", fontFamily: "var(--mono)", fontSize: "9px", fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "3px",
        marginBottom: "6px", color: "#fff", background: meta.color,
      }}>
        {meta.label}
      </span>
      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)", marginBottom: "8px", lineHeight: 1.25 }}>
        {site.name}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "62px 1fr", gap: "4px 8px", fontSize: "11px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>Manager</span>
        <span style={{ color: "var(--text-dim)", lineHeight: 1.35 }}>{site.managerFull}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>Material</span>
        <span style={{ color: "var(--text-dim)", lineHeight: 1.35 }}>{site.materialLabel}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>Limit</span>
        <span style={{ color: "var(--text-dim)", lineHeight: 1.35 }}>{site.limit}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>Tools</span>
        <span style={{ color: "var(--text-dim)", lineHeight: 1.35 }}>{site.tools}</span>
      </div>
      <div style={{
        marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border-dim)",
        fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.45,
      }}>
        {site.note}
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", marginTop: "6px" }}>
        {site.lat.toFixed(4)}, {site.lng.toFixed(4)} — {site.coordNote}
      </div>

      {(primaryContacts.length > 0 || feeDig) && (
        <div style={{
          marginTop: "10px", paddingTop: "9px", borderTop: "1px solid var(--border-dim)",
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--cyan)", marginBottom: "6px", fontWeight: 600,
          }}>
            Who to call / email
          </div>
          {primaryContacts.map((c) => (
            <div key={c.id} style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{c.office}</div>
              {c.phone && c.phone !== "—" && (
                <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "3px", fontSize: "11px", color: "var(--text-dim)" }}>
                  <Phone size={11} style={{ color: "var(--cyan)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--mono)" }}>{c.phone}</span>
                </div>
              )}
              {c.email && c.email !== "—" && (
                <div style={{ display: "flex", gap: "5px", alignItems: "flex-start", marginTop: "2px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  <Mail size={11} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: 1 }} />
                  <span>{c.email}</span>
                </div>
              )}
            </div>
          ))}
          {hotlines.map((c) => (
            <div key={c.id} style={{ marginBottom: "8px", fontSize: "11px", color: "var(--text-dim)" }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{c.office}:</span>{" "}
              <span style={{ fontFamily: "var(--mono)" }}>{c.phone}</span>
            </div>
          ))}
          {feeDig && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{feeDig.operator}</div>
              {feeDig.phone && feeDig.phone !== "—" && (
                <div style={{ display: "flex", gap: "5px", alignItems: "center", marginTop: "3px", fontSize: "11px", color: "var(--text-dim)" }}>
                  <Phone size={11} style={{ color: "var(--cyan)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--mono)" }}>{feeDig.phone}</span>
                </div>
              )}
              {feeDig.web && (
                <div style={{ display: "flex", gap: "5px", alignItems: "flex-start", marginTop: "2px", fontSize: "10px", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  <Mail size={11} style={{ color: "var(--cyan)", flexShrink: 0, marginTop: 1 }} />
                  <span>{feeDig.web}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {template && (
        <div style={{
          marginTop: "4px", padding: "8px 10px", borderRadius: "5px",
          background: "rgba(var(--accent-rgb), 0.06)", border: "1px solid rgba(var(--accent-rgb), 0.22)",
        }}>
          <div style={{
            fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--cyan)", marginBottom: "5px", fontWeight: 600,
          }}>
            Email draft (hobby collector)
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.4, marginBottom: "8px" }}>
            {filled.subject}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            <CopyButton text={filled.full} label="Copy email" />
            {onOpenTemplate && (
              <button
                type="button"
                onClick={() => onOpenTemplate(template.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "4px 10px", borderRadius: "4px", fontSize: "10px",
                  cursor: "pointer", letterSpacing: "0.06em",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                Full template {template.id}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MapTab({ status, setStatus, manager, setManager, material, setMaterial, onOpenTemplate }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [homeRequestId, setHomeRequestId] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [query, setQuery] = useState("");
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const goHome = () => {
    setSelectedIdx(null);
    setHomeRequestId((n) => n + 1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CA_COLLECTING_SITES.map((s, i) => ({ s, i })).filter(({ s }) => {
      const matchManager = manager === "all" || managerKey(s.manager) === manager;
      const matchStatus = status === "all" || s.status === status;
      const matchMaterial = material === "all" || s.material === material;
      const matchQ = !q
        || s.name.toLowerCase().includes(q)
        || s.county.toLowerCase().includes(q)
        || s.materialLabel.toLowerCase().includes(q)
        || s.managerFull.toLowerCase().includes(q);
      return matchManager && matchStatus && matchMaterial && matchQ;
    });
  }, [status, manager, material, query]);

  const flyTarget = selectedIdx != null ? CA_COLLECTING_SITES[selectedIdx] : null;
  const visibleIdx = new Set(filtered.map((f) => f.i));

  const mapPane = (
      <div style={{ position: "relative", minHeight: isMobile ? 220 : 0, height: isMobile ? "38vh" : "100%", flex: isMobile ? "0 0 auto" : 1, background: "var(--bg)" }}>
        {mapReady ? (
          <MapContainer
            center={CA_HOME.center}
            zoom={CA_HOME.zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
              opacity={0.92}
            />
            <MapInvalidateSize active />
            <FlyToSite target={flyTarget} />
            <FlyHome requestId={homeRequestId} />
            {CA_COLLECTING_SITES.map((s, i) => {
              if (!visibleIdx.has(i)) return null;
              const meta = STATUS_META[s.status] || STATUS_META.casual;
              return (
                <CircleMarker
                  key={i}
                  center={[s.lat, s.lng]}
                  radius={selectedIdx === i ? 9 : 7}
                  pathOptions={{
                    fillColor: meta.color,
                    color: "#1a2530",
                    weight: selectedIdx === i ? 2 : 1.2,
                    fillOpacity: 0.9,
                  }}
                  eventHandlers={{ click: () => setSelectedIdx(i) }}
                >
                  <Popup maxWidth={340} minWidth={260}>
                    <SitePopup site={s} onOpenTemplate={onOpenTemplate} />
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "var(--text-muted)" }}>
            Loading map…
          </div>
        )}
        <button
          type="button"
          onClick={goHome}
          title="Zoom out to California"
          aria-label="Zoom out to California"
          style={{
            position: "absolute", top: 76, left: 12, zIndex: 500,
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "6px 10px", borderRadius: "5px", cursor: "pointer",
            background: "var(--bg-panel)", border: "1px solid var(--border)",
            color: "var(--cyan)", fontFamily: "var(--mono)", fontSize: "10px",
            letterSpacing: "0.06em", boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }}
        >
          <Home size={13} /> CA
        </button>
        <div style={{
          position: "absolute", bottom: 12, right: 12, zIndex: 500,
          maxWidth: 280, padding: "6px 10px", borderRadius: "4px",
          background: "var(--bg-panel)", border: "1px solid var(--border)",
          fontFamily: "var(--mono)", fontSize: "9px", color: "var(--text-muted)", lineHeight: 1.4,
        }}>
          Updated {CA_MAP_META.lastUpdated}. Confirm status before collecting.
        </div>
      </div>
  );

  return (
    <div style={{
      display: isMobile ? "flex" : "grid",
      flexDirection: isMobile ? "column" : undefined,
      gridTemplateColumns: isMobile ? undefined : "minmax(260px, 320px) 1fr",
      gap: 0, height: "100%", minHeight: 0,
    }}>
      {isMobile && mapPane}
      {/* Sidebar */}
      <div style={{
        display: "flex", flexDirection: "column", minHeight: 0, flex: isMobile ? 1 : undefined,
        borderRight: isMobile ? "none" : "1px solid var(--border)",
        borderTop: isMobile ? "1px solid var(--border)" : "none",
        background: "var(--bg-card)",
      }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: 1.5 }}>
            {CA_MAP_META.disclaimer}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sites…"
            style={{
              width: "100%", padding: "8px 10px", borderRadius: "5px", marginBottom: "10px",
              border: "1px solid var(--border-input)", background: "var(--bg-input)",
              color: "var(--text)", fontSize: "12px",
            }}
          />
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Access</div>
            <ChipRow options={STATUS_FILTERS} value={status} onChange={setStatus} />
          </div>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Manager</div>
            <ChipRow options={MANAGER_FILTERS} value={manager} onChange={setManager} />
          </div>
          <div>
            <div style={{ fontSize: "9px", fontFamily: "var(--mono)", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>Material</div>
            <ChipRow options={MATERIAL_FILTERS} value={material} onChange={setMaterial} />
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", marginTop: "10px" }}>
            <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{filtered.length}</span> / {CA_COLLECTING_SITES.length} shown
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {filtered.map(({ s, i }) => {
            const meta = STATUS_META[s.status] || STATUS_META.casual;
            const sel = selectedIdx === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIdx(i)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "11px 14px", cursor: "pointer",
                  background: sel ? "rgba(var(--accent-rgb), 0.08)" : "transparent",
                  border: "none", borderBottom: "1px solid var(--border-dim)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: sel ? "var(--cyan)" : "var(--text)", lineHeight: 1.3 }}>
                    {s.name}
                  </span>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>
                  {s.county} · {s.manager}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", fontStyle: "italic", marginTop: "2px" }}>
                  {s.materialLabel}
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "20px 14px", fontSize: "12px", color: "var(--text-muted)" }}>
              No sites match these filters.
            </div>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-dim)", flexShrink: 0 }}>
          <div style={{ fontSize: "9px", fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
            Legend
          </div>
          {Object.entries(STATUS_META).map(([k, m]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "10px", color: "var(--text-dim)", marginBottom: "3px", fontFamily: "var(--mono)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {!isMobile && mapPane}
    </div>
  );
}

function ContactCard({ title, subtitle, phone, email, address, templateId, onOpenTemplate }) {
  return (
    <div style={{
      padding: "12px 14px", marginBottom: "8px", borderRadius: "6px",
      background: "var(--bg-card)", border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginBottom: "3px" }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.45, marginBottom: "8px" }}>{subtitle}</div>
      )}
      <div style={{ display: "grid", gap: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
        {address && address !== "—" && (
          <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
            <MapPin size={12} style={{ flexShrink: 0, marginTop: 2, color: "var(--cyan)" }} />
            <span>{address}</span>
          </div>
        )}
        {phone && phone !== "—" && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <Phone size={12} style={{ color: "var(--cyan)" }} />
            <span style={{ fontFamily: "var(--mono)" }}>{phone}</span>
          </div>
        )}
        {email && email !== "—" && (
          <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
            <Mail size={12} style={{ flexShrink: 0, marginTop: 2, color: "var(--cyan)" }} />
            <span>{email}</span>
          </div>
        )}
      </div>
      {templateId && onOpenTemplate && (
        <button
          type="button"
          onClick={() => onOpenTemplate(templateId)}
          style={{
            marginTop: "10px", padding: "4px 10px", borderRadius: "4px", fontSize: "10px",
            cursor: "pointer", letterSpacing: "0.06em",
            background: "rgba(var(--accent-rgb), 0.08)",
            border: "1px solid rgba(var(--accent-rgb), 0.35)",
            color: "var(--cyan)",
          }}
        >
          Open Template {templateId}
        </button>
      )}
    </div>
  );
}

function ContactsTab({ onOpenTemplate }) {
  return (
    <div style={{ padding: "18px 20px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, marginBottom: "16px" }}>
        Contacts for gated and conditional sites. Phone numbers and office names change with BLM/USFS reorganizations — verify before relying on them for trip planning.
      </div>

      <div style={{
        fontSize: "11px", fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: "8px", paddingBottom: "5px",
        borderBottom: "1px solid var(--border-dim)",
      }}>
        Federal & state agencies
      </div>
      {AGENCY_CONTACTS.map((c) => (
        <ContactCard
          key={c.id}
          title={c.office}
          subtitle={c.sites}
          address={c.address}
          phone={c.phone}
          email={c.email}
          templateId={c.template}
          onOpenTemplate={onOpenTemplate}
        />
      ))}

      <div style={{
        fontSize: "11px", fontWeight: 700, color: "var(--cyan)", letterSpacing: "0.12em",
        textTransform: "uppercase", margin: "18px 0 8px", paddingBottom: "5px",
        borderBottom: "1px solid var(--border-dim)",
      }}>
        Fee-dig / private operators
      </div>
      {FEE_DIG_CONTACTS.map((c) => (
        <ContactCard
          key={c.id}
          title={c.site}
          subtitle={c.operator}
          phone={c.phone}
          email={c.web}
          templateId={c.template}
          onOpenTemplate={onOpenTemplate}
        />
      ))}

      <div style={{
        marginTop: "14px", padding: "12px 14px", borderRadius: "6px",
        background: "rgba(var(--accent-rgb), 0.06)", border: "1px solid rgba(var(--accent-rgb), 0.22)",
      }}>
        <div style={{ fontSize: "11px", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
          Outreach tips
        </div>
        <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
          {OUTREACH_NOTES.map((n, i) => (
            <li key={i} style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "4px" }}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TemplatesTab({ focusId }) {
  const [openId, setOpenId] = useState(focusId || "A");

  useEffect(() => {
    if (focusId) setOpenId(focusId);
  }, [focusId]);

  return (
    <div style={{ padding: "18px 20px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1.55, marginBottom: "14px" }}>
        Plain-English email drafts written as a hobby rockhound. Sign with [first and last name, (optional club name too)] before sending. On the map, popups pre-fill the site name for you.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
        {EMAIL_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOpenId(t.id)}
            style={{
              padding: "5px 10px", borderRadius: "4px", fontSize: "10px", cursor: "pointer",
              fontFamily: "var(--mono)", letterSpacing: "0.04em",
              background: openId === t.id ? "rgba(var(--accent-rgb), 0.12)" : "var(--bg-card)",
              border: `1px solid ${openId === t.id ? "rgba(var(--accent-rgb), 0.45)" : "var(--border)"}`,
              color: openId === t.id ? "var(--cyan)" : "var(--text-muted)",
            }}
          >
            {t.id}: {t.title.split("—")[0].trim()}
          </button>
        ))}
      </div>

      {EMAIL_TEMPLATES.filter((t) => t.id === openId).map((t) => (
        <div key={t.id}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
            Template {t.id} — {t.title}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: 1.5 }}>
            Use for: {t.useFor}
          </div>

          <div style={{
            padding: "12px 14px", borderRadius: "6px", marginBottom: "12px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Subject
              </div>
              <CopyButton text={t.subject} label="Copy subject" />
            </div>
            <div style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>{t.subject}</div>
          </div>

          <div style={{
            padding: "12px 14px", borderRadius: "6px", marginBottom: "12px",
            background: "var(--bg-card)", border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Body
              </div>
              <CopyButton text={`Subject: ${t.subject}\n\n${t.body}`} label="Copy email" />
            </div>
            <pre style={{
              margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--sans)",
              fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.6,
            }}>
              {t.body}
            </pre>
          </div>

          {t.talkingPoints.length > 0 && (
            <div style={{
              padding: "12px 14px", borderRadius: "6px",
              background: "rgba(var(--accent-rgb), 0.06)", border: "1px solid rgba(var(--accent-rgb), 0.22)",
            }}>
              <div style={{ fontSize: "10px", fontFamily: "var(--mono)", color: "var(--cyan)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                Talking points (if you call)
              </div>
              <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
                {t.talkingPoints.map((p, i) => (
                  <li key={i} style={{ fontSize: "12px", color: "var(--text-dim)", lineHeight: 1.6, marginBottom: "5px" }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CollectingMap({ onClose }) {
  const [tab, setTab] = useState("map");
  const [status, setStatus] = useState("all");
  const [manager, setManager] = useState("all");
  const [material, setMaterial] = useState("all");
  const [templateFocus, setTemplateFocus] = useState(null);

  const openTemplate = (id) => {
    setTemplateFocus(id);
    setTab("templates");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "12px",
    }}>
      <div style={{
        width: "100%", maxWidth: "1100px", height: "92vh", maxHeight: "920px",
        background: "var(--bg-panel)", border: "1px solid var(--border)",
        borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px", borderBottom: "1px solid var(--border)", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: "14px", fontFamily: "var(--mono)", color: "var(--cyan)", fontWeight: 700, letterSpacing: "0.1em" }}>
              COLLECTING PLACES
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              {CA_MAP_META.subtitle}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div style={{
          display: "flex", gap: "2px", padding: "0 14px",
          borderBottom: "1px solid var(--border-dim)", background: "var(--bg-card)", flexShrink: 0,
        }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 14px", background: "none", border: "none",
                borderBottom: tab === t.key ? "2px solid var(--cyan)" : "2px solid transparent",
                color: tab === t.key ? "var(--cyan)" : "var(--text-muted)",
                fontSize: "11px", fontWeight: tab === t.key ? 600 : 400,
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {tab === "map" && (
            <MapTab
              status={status} setStatus={setStatus}
              manager={manager} setManager={setManager}
              material={material} setMaterial={setMaterial}
              onOpenTemplate={openTemplate}
            />
          )}
          {tab === "contacts" && <ContactsTab onOpenTemplate={openTemplate} />}
          {tab === "templates" && <TemplatesTab focusId={templateFocus} />}
        </div>
      </div>
    </div>
  );
}
