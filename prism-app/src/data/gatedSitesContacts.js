/** Gated & conditional site contacts + outreach templates. Verify before trip planning. */

export const AGENCY_CONTACTS = [
  {
    id: "ccma",
    sites: "Clear Creek Management Area",
    office: "BLM Central Coast Field Office (formerly Hollister FO)",
    address: "940 2nd Ave, Marina, CA 93933",
    phone: "(831) 582-2200",
    email: "Use office contact form at blm.gov/office/central-coast-field-office",
    template: "A",
  },
  {
    id: "ccma_hotline",
    sites: "Clear Creek — 24 hr road/access hotline",
    office: "BLM CCMA Hotline",
    address: "—",
    phone: "(831) 630-5060",
    email: "—",
    template: null,
  },
  {
    id: "barstow",
    sites: "El Paso Mountains, Cady Mountains, Alvord Mountain, Afton Canyon, Opal Mountain, Calico Mountains, Trona onyx ground, Randsburg",
    office: "BLM Barstow Field Office",
    address: "2601 Barstow Road, Barstow, CA 92311",
    phone: "(760) 252-6000",
    email: "BLM_CA_Web_BA@blm.gov",
    template: "A",
  },
  {
    id: "needles",
    sites: "Marble Mountains, Danby/Cadiz, Bristol Mountains, Amboy, Ludlow, Old Woman Mountains, Turtle Mountains",
    office: "BLM Needles Field Office",
    address: "1303 S. Highway 95, Needles, CA 92363",
    phone: "(760) 326-7000",
    email: "BLM_CA_NFO@blm.gov",
    template: "A",
  },
  {
    id: "ridgecrest",
    sites: "Argus Range, Kramer Hills, Randsburg (Ridgecrest side)",
    office: "BLM Ridgecrest Field Office",
    address: "300 S. Richmond Rd, Ridgecrest, CA 93555",
    phone: "(760) 384-5400",
    email: "BLM_CA_RFO@blm.gov",
    template: "A",
  },
  {
    id: "palm_springs",
    sites: "Garnet Hill, Wiley Well/Hauser, Mule Mountains, Palo Verde Mountains",
    office: "BLM Palm Springs–South Coast Field Office",
    address: "1201 Bird Center Drive, Palm Springs, CA 92262",
    phone: "(760) 833-7100",
    email: "BLM_CA_PS@blm.gov",
    template: "A",
  },
  {
    id: "angeles",
    sites: "Cascade Canyon (corundum), Soledad Canyon",
    office: "Angeles National Forest, Supervisor's Office",
    address: "701 N. Santa Anita Ave, Arcadia, CA 91006",
    phone: "(626) 574-1613",
    email: "fs.usda.gov/contactus/angeles (webform) — ask for the district covering Mt. Baldy/Cascade Canyon",
    template: "A",
  },
  {
    id: "sequoia",
    sites: "Piute Mountains pegmatites",
    office: "Sequoia National Forest, Supervisor's Office",
    address: "Porterville, CA (confirm Ranger District for Piute Mtns before writing)",
    phone: "Via fs.usda.gov/contactus/sequoia",
    email: "—",
    template: "A",
  },
  {
    id: "bishop",
    sites: "Bodie Hills",
    office: "BLM Bishop Field Office",
    address: "351 Pacu Lane, Bishop, CA 93514",
    phone: "(760) 872-5000",
    email: "Via blm.gov/office/bishop-field-office",
    template: "A",
  },
  {
    id: "cdfw",
    sites: "North Table Mountain Ecological Reserve",
    office: "CDFW Region 2 (North Central Region)",
    address: "1701 Nimbus Road, Rancho Cordova, CA 95670",
    phone: "(916) 358-2900",
    email: "Via wildlife.ca.gov/Contact — request Ecological Reserve land manager for North Table Mountain",
    template: "B",
  },
  {
    id: "catalina",
    sites: "Catalina Island albite localities",
    office: "Catalina Island Conservancy",
    address: "PO Box 2739, Avalon, CA 90704",
    phone: "Via catalinaconservancy.org/contact-us",
    email: "Contact form only — no direct collecting-permission email published",
    template: "C",
  },
];

export const FEE_DIG_CONTACTS = [
  {
    id: "oceanview",
    site: "Oceanview Mine, Pala Chief Mine",
    operator: "Oceanview Mines LLC (Jeff Swanger)",
    phone: "(760) 415-9143",
    web: "digforgems@gmail.com · digforgems.com",
    template: "D",
  },
  {
    id: "himalaya",
    site: "Himalaya Mine",
    operator: "Mesa Grande operator (schedule varies by season)",
    phone: "—",
    web: "Search current listing via digforgems.com or San Diego Mineral & Gem Society",
    template: "D",
  },
  {
    id: "little_three",
    site: "Little Three Mine",
    operator: "San Diego Mineral & Gem Society",
    phone: "—",
    web: "sdmg.org — public digs announced through the society",
    template: "D",
  },
  {
    id: "benitoite",
    site: "Benitoite Gem Mine",
    operator: "Private claim operator, scheduled digs only",
    phone: "—",
    web: "Search current-season listing before planning — schedule/operator change over years",
    template: "D",
  },
  {
    id: "julian",
    site: "Julian — Eagle & High Peak Mine",
    operator: "Eagle Mining Company",
    phone: "(760) 765-0036 (verify current number)",
    web: "eagleminingco.org",
    template: "D",
  },
];

export const EMAIL_TEMPLATES = [
  {
    id: "A",
    title: "BLM/USFS — Is casual collecting currently open here?",
    useFor: "Cady Mountains, Marble Mountains, Danby/Cadiz, Bristol Mountains, Amboy, Ludlow, Turtle Mountains, Garnet Hill, Kramer Hills, Randsburg, Argus Range, Bodie Hills, Soledad Canyon, Cascade Canyon",
    subject: "Casual mineral-collecting status inquiry — [Site Name]",
    body: `Hello,

My name is Aaron Celestian, Curator and Department Head of Mineral Sciences at the Natural History Museum of Los Angeles County. I'm compiling a reference for the public on where casual, non-commercial mineral collecting is currently permitted on [agency] land, specifically at [site name, county].

Could you confirm:
1. Whether casual collecting under standard hand-tool/personal-use rules is currently open at this locality, or whether any withdrawal, permit requirement, or seasonal closure applies.
2. Whether the boundary between open collecting ground and any adjacent restricted area (wilderness, monument, private inholding, or claim) is mapped anywhere I could reference or link to.
3. Any quantity limits specific to this office that differ from the general 25 lb/day, 250 lb/yr BLM guidance.

This is for a public-facing reference, so I want to be precise rather than repeat outdated information. Happy to share the draft with your office before it's published if that's useful.

Thank you for your time,
Aaron Celestian, Ph.D.
Curator, Mineral Sciences, Natural History Museum of Los Angeles County`,
    talkingPoints: [
      "State your name/title once, then the specific site by name — front-desk staff field a lot of OHV/camping calls and will route you faster if \"mineral collecting status\" is the first thing they hear.",
      "Ask for the resource specialist or recreation planner, not just the front desk, if the first answer sounds like a guess.",
      "If they don't know offhand, ask who would know and whether it's better to follow up by email — field offices often need to check a resource management plan rather than answer live.",
    ],
  },
  {
    id: "B",
    title: "CDFW — Ecological Reserve status",
    useFor: "North Table Mountain",
    subject: "Collecting-status inquiry — North Table Mountain Ecological Reserve",
    body: `Hello,

I'm Aaron Celestian, Curator of Mineral Sciences at the Natural History Museum of Los Angeles County, compiling a public reference on legal mineral-collecting locations in California. North Table Mountain (Butte County) has a documented history of zeolite mineralization in the basalt, and I want to represent its current status accurately rather than assume.

Could you confirm whether any rock or mineral collecting is permitted within the Ecological Reserve boundary, or whether the reserve's habitat-protection mandate (vernal pools / wildflower fields) precludes it entirely? If there's a specific reserve manager I should direct this to, I'd appreciate a redirect.

Thank you,
Aaron Celestian, Ph.D.`,
    talkingPoints: [],
  },
  {
    id: "C",
    title: "Private land trust / conservancy access",
    useFor: "Catalina Island Conservancy",
    subject: "Mineral-collecting access inquiry — Catalina Island Conservancy lands",
    body: `Hello,

I'm Aaron Celestian, Curator of Mineral Sciences at the Natural History Museum of Los Angeles County. I'm researching whether any of the documented albite localities on Catalina fall within Conservancy-managed land, and if so, what your process is for requesting access for mineral observation/collection — whether that's a standing permit, a case-by-case request, or something the Conservancy doesn't accommodate at all outside of research partnerships.

If a formal research/collecting-permit process exists, I'd be glad to provide institutional affiliation and purpose in whatever format you require.

Thank you for your time,
Aaron Celestian, Ph.D.
Natural History Museum of Los Angeles County`,
    talkingPoints: [],
  },
  {
    id: "D",
    title: "Fee-dig operator — scheduling / current status",
    useFor: "Himalaya Mine, Benitoite Gem Mine, or any fee-dig whose schedule you can't confirm from the website alone",
    subject: "Current dig schedule and group-visit inquiry",
    body: `Hi,

I'd like to confirm your current public-dig schedule for [mine name] — specifically whether you're operating this season, typical dates/hours, per-person fees, and whether reservations are required. I'm compiling an up-to-date public reference on California fee-dig sites and want to avoid pointing people at outdated information.

If it's useful, I'm also happy to note any group-rate or advance-notice requirements for larger parties.

Thanks,
Aaron Celestian`,
    talkingPoints: [],
  },
];

export const OUTREACH_NOTES = [
  "Lead with institutional affiliation, not the PRISM app — a museum curator asking \"is this legal\" reads as a professional inquiry; once rapport is established, mentioning PRISM as the public-facing use case is reasonable.",
  "BLM/USFS field offices often can't give a fast yes/no over email for monument proclamations or wilderness boundaries — expect a follow-up call or a redirect to a resource management plan.",
  "Don't over-ask in one email. Each template asks 2–3 specific questions. A longer list tends to get a shorter, less useful reply.",
  "Almaden Quicksilver County Park is deliberately excluded from outreach — the answer will be no, and it should be.",
];
