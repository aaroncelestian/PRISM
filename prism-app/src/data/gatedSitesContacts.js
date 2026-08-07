/** Gated & conditional site contacts + outreach templates. Verify before trip planning. */

export const AGENCY_CONTACTS = [
  {
    id: "ccma",
    sites: "Clear Creek Management Area",
    match: ["Clear Creek Management Area"],
    office: "BLM Central Coast Field Office (formerly Hollister FO)",
    address: "940 2nd Ave, Marina, CA 93933",
    phone: "(831) 582-2200",
    email: "Use office contact form at blm.gov/office/central-coast-field-office",
    template: "A",
  },
  {
    id: "ccma_hotline",
    sites: "Clear Creek — 24 hr road/access hotline",
    match: ["Clear Creek Management Area"],
    office: "BLM CCMA Hotline",
    address: "—",
    phone: "(831) 630-5060",
    email: "—",
    template: null,
    secondary: true,
  },
  {
    id: "barstow",
    sites: "El Paso Mountains, Cady Mountains, Alvord Mountain, Afton Canyon, Opal Mountain, Calico Mountains, Trona onyx ground, Randsburg",
    match: ["El Paso Mountains", "Cady Mountains", "Alvord Mountain", "Afton Canyon", "Opal Mountain", "Calico Mountains", "Trona onyx", "Randsburg"],
    office: "BLM Barstow Field Office",
    address: "2601 Barstow Road, Barstow, CA 92311",
    phone: "(760) 252-6000",
    email: "BLM_CA_Web_BA@blm.gov",
    template: "A",
  },
  {
    id: "needles",
    sites: "Marble Mountains, Danby/Cadiz, Bristol Mountains, Amboy, Ludlow, Old Woman Mountains, Turtle Mountains",
    match: ["Marble Mountains", "Danby", "Cadiz", "Bristol Mountains", "Amboy", "Ludlow", "Old Woman Mountains", "Turtle Mountains"],
    office: "BLM Needles Field Office",
    address: "1303 S. Highway 95, Needles, CA 92363",
    phone: "(760) 326-7000",
    email: "BLM_CA_NFO@blm.gov",
    template: "A",
  },
  {
    id: "ridgecrest",
    sites: "Argus Range, Kramer Hills, Randsburg (Ridgecrest side)",
    match: ["Argus Range", "Kramer Hills"],
    office: "BLM Ridgecrest Field Office",
    address: "300 S. Richmond Rd, Ridgecrest, CA 93555",
    phone: "(760) 384-5400",
    email: "BLM_CA_RFO@blm.gov",
    template: "A",
  },
  {
    id: "palm_springs",
    sites: "Garnet Hill, Wiley Well/Hauser, Mule Mountains, Palo Verde Mountains",
    match: ["Garnet Hill", "Wiley Well", "Hauser", "Mule Mountains", "Palo Verde Mountains", "Black Hills"],
    office: "BLM Palm Springs–South Coast Field Office",
    address: "1201 Bird Center Drive, Palm Springs, CA 92262",
    phone: "(760) 833-7100",
    email: "BLM_CA_PS@blm.gov",
    template: "A",
  },
  {
    id: "angeles",
    sites: "Cascade Canyon (corundum), Soledad Canyon",
    match: ["Cascade Canyon", "Soledad Canyon"],
    office: "Angeles National Forest, Supervisor's Office",
    address: "701 N. Santa Anita Ave, Arcadia, CA 91006",
    phone: "(626) 574-1613",
    email: "fs.usda.gov/contactus/angeles (webform) — ask for the district covering Mt. Baldy/Cascade Canyon",
    template: "A",
  },
  {
    id: "sequoia",
    sites: "Piute Mountains pegmatites",
    match: ["Piute Mountains"],
    office: "Sequoia National Forest, Supervisor's Office",
    address: "Porterville, CA (confirm Ranger District for Piute Mtns before writing)",
    phone: "Via fs.usda.gov/contactus/sequoia",
    email: "—",
    template: "A",
  },
  {
    id: "bishop",
    sites: "Bodie Hills",
    match: ["Bodie Hills"],
    office: "BLM Bishop Field Office",
    address: "351 Pacu Lane, Bishop, CA 93514",
    phone: "(760) 872-5000",
    email: "Via blm.gov/office/bishop-field-office",
    template: "A",
  },
  {
    id: "cdfw",
    sites: "North Table Mountain Ecological Reserve",
    match: ["North Table Mountain"],
    office: "CDFW Region 2 (North Central Region)",
    address: "1701 Nimbus Road, Rancho Cordova, CA 95670",
    phone: "(916) 358-2900",
    email: "Via wildlife.ca.gov/Contact — request Ecological Reserve land manager for North Table Mountain",
    template: "B",
  },
  {
    id: "catalina",
    sites: "Catalina Island albite localities",
    match: ["Catalina Island"],
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
    match: ["Oceanview Mine", "Pala Chief Mine"],
    operator: "Oceanview Mines LLC (Jeff Swanger)",
    phone: "(760) 415-9143",
    web: "digforgems@gmail.com · digforgems.com",
    template: "D",
  },
  {
    id: "himalaya",
    site: "Himalaya Mine",
    match: ["Himalaya Mine"],
    operator: "Mesa Grande operator (schedule varies by season)",
    phone: "—",
    web: "Search current listing via digforgems.com or San Diego Mineral & Gem Society",
    template: "D",
  },
  {
    id: "little_three",
    site: "Little Three Mine",
    match: ["Little Three Mine"],
    operator: "San Diego Mineral & Gem Society",
    phone: "—",
    web: "sdmg.org — public digs announced through the society",
    template: "D",
  },
  {
    id: "benitoite",
    site: "Benitoite Gem Mine",
    match: ["Benitoite Gem Mine"],
    operator: "Private claim operator, scheduled digs only",
    phone: "—",
    web: "Search current-season listing before planning — schedule/operator change over years",
    template: "D",
  },
  {
    id: "julian",
    site: "Julian — Eagle & High Peak Mine",
    match: ["Eagle & High Peak", "Julian"],
    operator: "Eagle Mining Company",
    phone: "(760) 765-0036 (verify current number)",
    web: "eagleminingco.org",
    template: "D",
  },
];

export const EMAIL_TEMPLATES = [
  {
    id: "A",
    title: "BLM/USFS — Is hobby collecting still open here?",
    useFor: "Cady Mountains, Marble Mountains, Danby/Cadiz, Bristol Mountains, Amboy, Ludlow, Turtle Mountains, Garnet Hill, Kramer Hills, Randsburg, Argus Range, Bodie Hills, Soledad Canyon, Cascade Canyon, and similar conditional public-land sites",
    subject: "Quick question — is rock collecting still allowed at [Site Name]?",
    body: `Hello,

I'm a hobby rockhound planning a trip to [site name] in [county], and I want to make sure collecting is still allowed before I drive out.

Could you please tell me:
1. Is casual/hobby collecting with hand tools currently open at this spot, or is there a closure, permit requirement, or seasonal restriction?
2. Are there any nearby wilderness, monument, private, or claim boundaries I should watch for on the ground?
3. Do you have any local quantity limits that differ from the usual 25 lb/day, 250 lb/year guidance?

Thanks very much for your help,
[first and last name, (optional club name too)]`,
    talkingPoints: [
      "Say the site name and “mineral collecting status” up front — front desks get a lot of OHV/camping calls and will route you faster.",
      "Ask for the recreation planner or resource specialist if the first answer sounds like a guess.",
      "If they don't know offhand, ask who would know and whether email follow-up is better — they often need to check a management plan.",
    ],
  },
  {
    id: "B",
    title: "CDFW — Ecological Reserve status",
    useFor: "North Table Mountain",
    subject: "Collecting question — North Table Mountain Ecological Reserve",
    body: `Hello,

I'm a hobby rockhound interested in the zeolite minerals reported at North Table Mountain (Butte County). I understand this mesa is a CDFW Ecological Reserve, and I don't want to collect anywhere that isn't allowed.

Could you confirm whether any rock or mineral collecting is permitted inside the reserve boundary, or whether habitat protection rules (vernal pools / wildflowers) mean collecting is not allowed? If there's a reserve manager I should ask instead, a redirect would be appreciated.

Thank you,
[first and last name, (optional club name too)]`,
    talkingPoints: [],
  },
  {
    id: "C",
    title: "Conservancy / private land-trust access",
    useFor: "Catalina Island Conservancy",
    subject: "Hobby collecting access question — Catalina Island Conservancy lands",
    body: `Hello,

I'm a hobby rockhound hoping to visit documented albite localities on Catalina. I know much of the island is Conservancy-managed, and I want to follow your rules rather than assume public-land collecting norms apply.

Is any hobby mineral collecting allowed on Conservancy land? If so, do you have a permit process, a case-by-case request, or is collecting not something you allow outside research partnerships?

Thanks for your time,
[first and last name, (optional club name too)]`,
    talkingPoints: [],
  },
  {
    id: "D",
    title: "Fee-dig operator — schedule and reservations",
    useFor: "Himalaya Mine, Benitoite Gem Mine, Oceanview/Pala Chief, Little Three, Julian, or any fee-dig whose schedule you can't confirm from the website alone",
    subject: "Public dig schedule / reservation question — [mine name]",
    body: `Hi,

I'd like to confirm your current public-dig schedule for [mine name] — whether you're operating this season, typical dates/hours, per-person fees, and whether reservations are required.

I'm just planning a personal hobby trip and want current info before I book travel.

Thanks,
[first and last name, (optional club name too)]`,
    talkingPoints: [],
  },
];

export const OUTREACH_NOTES = [
  "Be polite and specific: name the locality first. “Is hobby rock collecting still open at Cady Mountains?” gets routed faster than a vague access question.",
  "BLM/USFS offices often can't give a fast yes/no by email for monument or wilderness edges — expect a callback or a pointer to a management plan.",
  "Don't over-ask. Two or three clear questions get better answers than a long list.",
  "Almaden Quicksilver County Park is deliberately excluded from outreach — collecting isn't allowed there, and it shouldn't be.",
];

function siteMatches(siteName, matchList) {
  const name = (siteName || "").toLowerCase();
  return (matchList || []).some((m) => name.includes(m.toLowerCase()));
}

/** Contacts + template for a map site (agency and/or fee-dig). */
export function getSiteOutreach(site) {
  if (!site) return { contacts: [], feeDig: null, template: null };

  const contacts = AGENCY_CONTACTS.filter((c) => siteMatches(site.name, c.match));
  const feeDig = FEE_DIG_CONTACTS.find((c) => siteMatches(site.name, c.match)) || null;

  const templateId = feeDig?.template || contacts.find((c) => c.template)?.template || null;
  const template = templateId ? EMAIL_TEMPLATES.find((t) => t.id === templateId) || null : null;

  return { contacts, feeDig, template };
}

/** Fill placeholders for a rockhound email about this site. */
export function fillTemplateForSite(template, site) {
  if (!template) return { subject: "", body: "", full: "" };
  const agency =
    site.managerFull ||
    (site.manager === "BLM" ? "BLM" : site.manager === "USFS" ? "U.S. Forest Service" : "the land manager");
  const county = site.county || "California";
  const siteName = site.name || "[Site Name]";
  const mineName = site.name || "[mine name]";

  const replaceAll = (text) =>
    text
      .replaceAll("[Site Name]", siteName)
      .replaceAll("[site name, county]", `${siteName}, ${county}`)
      .replaceAll("[site name]", siteName)
      .replaceAll("[county]", county)
      .replaceAll("[agency]", agency)
      .replaceAll("[mine name]", mineName);

  const subject = replaceAll(template.subject);
  const body = replaceAll(template.body);
  return { subject, body, full: `Subject: ${subject}\n\n${body}` };
}
