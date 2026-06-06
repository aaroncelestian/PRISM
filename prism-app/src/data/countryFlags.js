// ─────────────────────────────────────────────────────────────────────────────
// PRISM Country Flags — Geopolitical & Ethical Mineral Trade Concerns
// ─────────────────────────────────────────────────────────────────────────────
// PURPOSE: Educational. Helps collectors understand legal and ethical context
// around specimens from regions with trade restrictions or conflict-mineral
// concerns. Not intended to punish — intended to inform.
//
// HOW TO UPDATE:
//   1. Add/edit entries in FLAGGED_COUNTRIES below.
//   2. Update the `reviewed` field at the bottom of this file.
//   3. Sources: OFAC (ofac.treas.gov), US State Dept, Kimberley Process,
//               Global Witness, IPIS Research, USGS Mineral Resources.
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS = {
  WATCH:      "watch",       // Monitor; extra documentation recommended
  CONCERN:    "concern",     // Significant conflict-mineral or ethical concerns
  RESTRICTED: "restricted",  // Active US trade sanctions / OFAC restrictions
};

// Color palette for status levels
export const STATUS_COLORS = {
  watch:      "#f0c040",
  concern:    "#e07820",
  restricted: "#e03030",
};

export const STATUS_LABELS = {
  watch:      "Watch — Extra documentation recommended",
  concern:    "Concern — Conflict-mineral or ethical risk",
  restricted: "Restricted — US trade sanctions apply",
};

// ─────────────────────────────────────────────────────────────────────────────
// FLAGGED COUNTRIES
// Each entry: { name, aliases, status, heading, detail, minerals, action, sources }
// ─────────────────────────────────────────────────────────────────────────────

export const FLAGGED_COUNTRIES = [

  // ── OFAC Comprehensive Sanctions ──────────────────────────────────────────

  {
    name: "Iran",
    aliases: ["islamic republic of iran", "persia"],
    status: STATUS.RESTRICTED,
    heading: "Comprehensive US trade sanctions (OFAC)",
    detail:
      "The US has maintained comprehensive sanctions against Iran since 1979/1995 " +
      "(Executive Orders 12957, 13059, and others). Virtually all import/export " +
      "transactions by US persons are prohibited without an OFAC license. " +
      "This includes minerals and geological specimens. Iranian turquoise and " +
      "other minerals circulate widely in older collections predating sanctions.",
    minerals: ["Turquoise", "Chrysocolla", "Epidote", "Selenite", "Fluorite"],
    action:
      "Pre-sanctions (pre-1979) specimens with documented collection dates are " +
      "generally permissible. Any post-1979 specimen requires an OFAC specific " +
      "license to import. Consult legal counsel before donation.",
    sources: ["OFAC Iran Sanctions Program", "31 CFR Part 560"],
  },
  {
    name: "North Korea",
    aliases: ["dprk", "democratic people's republic of korea"],
    status: STATUS.RESTRICTED,
    heading: "Comprehensive US trade sanctions (OFAC)",
    detail:
      "Comprehensive OFAC sanctions prohibit virtually all trade between US " +
      "persons and North Korea. North Korean mineral exports (gold, magnesite, " +
      "coal) have been documented as major hard-currency sources for the regime. " +
      "Collector-grade mineral specimens from DPRK are rare but do circulate.",
    minerals: ["Gold", "Magnesite", "Fluorite", "Calcite", "Pyrite"],
    action:
      "Any specimen originating from North Korea requires an OFAC specific license. " +
      "Document collection dates carefully — pre-Korean War specimens may have " +
      "different legal standing.",
    sources: ["OFAC North Korea Sanctions", "31 CFR Part 510", "UN Panel of Experts Reports"],
  },
  {
    name: "Cuba",
    aliases: ["republic of cuba"],
    status: STATUS.RESTRICTED,
    heading: "US trade embargo (OFAC / CACR)",
    detail:
      "The US embargo on Cuba (Cuban Assets Control Regulations, 31 CFR Part 515) " +
      "restricts most trade. Mineral specimens and natural history objects are " +
      "included in these restrictions. Exceptions exist for certain informational " +
      "and educational materials, but consult OFAC guidance for specimens.",
    minerals: ["Nickel ore", "Chromite", "Cobalt", "Serpentine", "Copper minerals"],
    action:
      "Document collection dates. Pre-embargo specimens (pre-1963) have more " +
      "straightforward status. Current policy allows some educational exchanges — " +
      "consult OFAC for up-to-date guidance.",
    sources: ["OFAC Cuba Sanctions", "31 CFR Part 515"],
  },
  {
    name: "Syria",
    aliases: ["syrian arab republic"],
    status: STATUS.RESTRICTED,
    heading: "Comprehensive US trade sanctions (OFAC)",
    detail:
      "OFAC comprehensive sanctions on Syria prohibit most trade by US persons. " +
      "Syria's mineral wealth is modest but specimens do circulate. Syrian " +
      "cultural property has also been of significant concern due to looting " +
      "during the civil war, though this primarily affects archaeological items.",
    minerals: ["Gypsum", "Phosphate minerals", "Barite", "Salt minerals"],
    action:
      "Document locality and collection date. Pre-sanctions specimens require " +
      "careful documentation. Flag for legal review before any institutional donation.",
    sources: ["OFAC Syria Sanctions", "E.O. 13582"],
  },
  {
    name: "Russia",
    aliases: ["russian federation"],
    status: STATUS.RESTRICTED,
    heading: "Significant OFAC sanctions (post-2022)",
    detail:
      "Following Russia's invasion of Ukraine (February 2022), the US imposed " +
      "sweeping OFAC sanctions on Russian entities, sectors, and individuals. " +
      "While not all Russian trade is prohibited, transactions with many Russian " +
      "entities and sectors (including mining) are restricted. Russia is one of " +
      "the world's premier mineral localities — Ural Mountains specimens, " +
      "Kola Peninsula minerals, Siberian gems, and Dalnegorsk specimens are " +
      "highly prized and widely collected.",
    minerals: [
      "Alexandrite", "Demantoid Garnet", "Phenakite", "Charoite",
      "Alexandrite", "Uvarovite", "Malachite (Ural)", "Rhodonite",
      "Lazurite", "Calcite (Dalnegorsk)", "Wulfenite",
    ],
    action:
      "Pre-2022 specimens with documented collection dates and clear provenance " +
      "are generally unaffected. New purchases from Russian entities since 2022 " +
      "require careful legal review. Named Russian dealers may be OFAC-designated — " +
      "verify against current SDN list at ofac.treas.gov.",
    sources: ["OFAC Russia Sanctions", "E.O. 14024", "OFAC SDN List"],
  },
  {
    name: "Belarus",
    aliases: ["republic of belarus"],
    status: STATUS.RESTRICTED,
    heading: "US sanctions (post-2020 crackdown)",
    detail:
      "OFAC sanctions were imposed on Belarus following the 2020 disputed election " +
      "and subsequent crackdown on civil society, and expanded following Belarus's " +
      "support for Russia's invasion of Ukraine. Many Belarusian entities and " +
      "individuals are OFAC-designated.",
    minerals: ["Potash", "Halite", "Amber (Baltic)"],
    action:
      "Verify any Belarusian entity against the OFAC SDN list before transacting. " +
      "Baltic amber is often sold without clear national attribution — request " +
      "specific mine/locality data.",
    sources: ["OFAC Belarus Sanctions", "E.O. 13405", "E.O. 14038"],
  },
  {
    name: "Myanmar",
    aliases: ["burma", "republic of the union of myanmar"],
    status: STATUS.RESTRICTED,
    heading: "OFAC sanctions / Burmese Jade Act",
    detail:
      "The Tom Lantos Block Burmese JADE Act (2008) and subsequent executive orders " +
      "prohibit import of Burmese jadeite, rubies, and certain other gems into the US. " +
      "Following the February 2021 military coup, OFAC expanded sanctions on " +
      "the Myanmar military (Tatmadaw) and related entities including major mining " +
      "operations. Myanmar produces some of the world's finest rubies (Mogok), " +
      "jadeite, spinel, tourmaline, and other gems.",
    minerals: [
      "Ruby (Mogok)", "Jadeite", "Spinel", "Blue Sapphire",
      "Tourmaline", "Peridot", "Amber (Burmese)", "Painite",
    ],
    action:
      "Ruby and jadeite import is specifically prohibited by the JADE Act regardless " +
      "of sanctions status. Pre-2008 specimens with documentation may be assessed " +
      "case by case. Consult legal counsel for high-value Burmese specimens.",
    sources: ["Tom Lantos Block Burmese JADE Act (P.L. 110-286)", "OFAC Burma Sanctions", "E.O. 14014"],
  },

  // ── Conflict Mineral / Ethical Concerns ───────────────────────────────────

  {
    name: "Afghanistan",
    aliases: ["islamic emirate of afghanistan"],
    status: STATUS.CONCERN,
    heading: "Taliban-controlled mining / conflict minerals",
    detail:
      "Following the Taliban's return to power in August 2021, Afghanistan's " +
      "mineral sector — one of the world's richest, with deposits estimated at " +
      "over $1 trillion — came under Taliban control. Lapis lazuli from the " +
      "Sar-e-Sang mine (Badakhshan Province) has been documented by Global Witness " +
      "and other organizations as a funding source for armed groups. Emeralds, " +
      "rubies, tourmaline, kunzite, aquamarine, and other gems are mined under " +
      "conditions that raise serious human rights and conflict-funding concerns.",
    minerals: [
      "Lapis Lazuli", "Emerald", "Ruby", "Tourmaline",
      "Kunzite / Spodumene", "Aquamarine", "Morganite", "Hiddenite",
    ],
    action:
      "Request specific collection date and chain of custody. Pre-2021 specimens " +
      "with dealer documentation are generally more straightforward. Lapis from " +
      "Sar-e-Sang specifically has been a concern since at least 2016 (pre-Taliban). " +
      "Look for Afghani dealer invoices with dates and named sources.",
    sources: [
      "Global Witness — 'Lapis Lazuli: The Smuggling Route' (2016)",
      "UN Panel of Experts Reports on Afghanistan",
      "USGS Afghanistan Mineral Resources",
    ],
  },
  {
    name: "DR Congo",
    aliases: ["democratic republic of the congo", "drc", "congo (kinshasa)", "zaire"],
    status: STATUS.CONCERN,
    heading: "Conflict minerals (3TG) / armed group funding",
    detail:
      "Eastern DRC has been the site of ongoing armed conflict since the 1990s. " +
      "Artisanal mining of tin (cassiterite), tantalum (coltan), tungsten (wolframite), " +
      "and gold (3TG) has been documented to fund armed groups. The US Dodd-Frank Act " +
      "Section 1502 requires public companies to disclose use of DRC conflict minerals. " +
      "For mineral collectors, malachite, azurite, dioptase, and gem tourmalines " +
      "from DRC are common. Western DRC (Kasai, Katanga/Lualaba) is generally less " +
      "affected by conflict than eastern provinces.",
    minerals: [
      "Malachite", "Azurite", "Dioptase", "Chrysocolla",
      "Tourmaline", "Cassiterite", "Coltan (Columbite-Tantalite)", "Wolframite",
      "Cuprite", "Pseudomalachite", "Heterogenite",
    ],
    action:
      "Ask dealers to specify the province of origin — Katanga/Lualaba Province " +
      "(Kolwezi area) copper/cobalt specimens are from the western Copperbelt and " +
      "less directly linked to eastern conflict zones. Demand province-level " +
      "provenance, not just 'Congo'.",
    sources: [
      "Dodd-Frank Act Section 1502",
      "IPIS Research — Congo mineral maps",
      "OECD Due Diligence Guidance for Responsible Mineral Supply Chains",
    ],
  },
  {
    name: "Sudan",
    aliases: ["republic of the sudan"],
    status: STATUS.CONCERN,
    heading: "OFAC sanctions / ongoing conflict",
    detail:
      "Sudan has been under various US sanctions. An armed conflict erupted in " +
      "April 2023 between the Sudanese Armed Forces and the Rapid Support Forces, " +
      "causing a major humanitarian crisis. Artisanal gold mining has been a " +
      "significant funding source for armed groups.",
    minerals: ["Gold", "Chromite", "Asbestos minerals", "Gem minerals (limited)"],
    action:
      "Request collection date and detailed locality. Pre-conflict specimens " +
      "with clear documentation are more straightforward. Verify current OFAC " +
      "sanctions status at ofac.treas.gov.",
    sources: ["OFAC Sudan Sanctions", "US State Dept. Sudan conflict reporting"],
  },
  {
    name: "Venezuela",
    aliases: ["bolivarian republic of venezuela"],
    status: STATUS.CONCERN,
    heading: "OFAC designations / illegal mining concerns",
    detail:
      "The US has imposed OFAC sanctions on many Venezuelan government entities " +
      "and officials (though not a comprehensive ban on all Venezuelan trade). " +
      "Venezuela's Orinoco Mining Arc contains significant gold, diamond, and " +
      "coltan deposits. Illegal mining operations have been linked to human rights " +
      "abuses, environmental destruction, and involvement of armed criminal groups " +
      "including ELN and FARC dissidents.",
    minerals: ["Gold", "Diamond", "Coltan", "Quartz varieties"],
    action:
      "Verify the specific entity against the OFAC SDN list. Document locality " +
      "and acquisition chain carefully. Specimens from the Orinoco Mining Arc " +
      "warrant extra scrutiny.",
    sources: ["OFAC Venezuela Sanctions", "E.O. 13850", "Global Witness Venezuela reports"],
  },

  // ── Watch ─────────────────────────────────────────────────────────────────

  {
    name: "Zimbabwe",
    aliases: ["republic of zimbabwe"],
    status: STATUS.WATCH,
    heading: "Watch — historical sanctions, political concerns",
    detail:
      "US sanctions on Zimbabwe have been eased in recent years after previously " +
      "targeting ZANU-PF officials. Zimbabwe is a significant producer of gem " +
      "tourmaline, aquamarine, topaz, and amethyst. Concerns center on governance " +
      "of the mining sector and treatment of artisanal miners, rather than " +
      "comprehensive trade restrictions.",
    minerals: ["Tourmaline", "Aquamarine", "Topaz", "Amethyst", "Emerald (Sandawana)"],
    action:
      "Document dealer and locality. Sandawana emeralds are a well-known, " +
      "legitimate product. Check current OFAC SDN list for any designated entities.",
    sources: ["OFAC Zimbabwe Sanctions (current status)", "US State Dept. reporting"],
  },
  {
    name: "Pakistan",
    aliases: ["islamic republic of pakistan"],
    status: STATUS.WATCH,
    heading: "Watch — tribal area provenance concerns",
    detail:
      "Pakistan produces outstanding gem minerals — tourmaline, aquamarine, " +
      "ruby, emerald, topaz, and many others from Khyber Pakhtunkhwa, Gilgit-Baltistan, " +
      "and FATA (tribal areas). No broad US sanctions apply. However, some tribal " +
      "areas have governance gaps that can make provenance documentation difficult " +
      "to obtain. Material from conflict-affected border regions merits extra " +
      "documentation scrutiny.",
    minerals: [
      "Tourmaline (Kunar, Nuristan)", "Aquamarine (Shigar)", "Ruby (Hunza)",
      "Emerald (Swat)", "Topaz (Katlang)", "Fluorapatite", "Spessartine",
    ],
    action:
      "Request specific mine or valley name — not just 'Pakistan'. Named localities " +
      "(Shigar, Hunza, Katlang, Swat) are well-documented and legitimate. Ask for " +
      "the dealer's own acquisition chain from local miners or importers.",
    sources: ["USGS Pakistan Mineral Resources", "Mindat locality database"],
  },
  {
    name: "China",
    aliases: ["people's republic of china", "prc"],
    status: STATUS.WATCH,
    heading: "Watch — trade tensions / critical minerals",
    detail:
      "No OFAC sanctions apply to Chinese mineral trade broadly. However, ongoing " +
      "US-China trade tensions, including tariffs and export controls on critical " +
      "minerals, are relevant context. Some Chinese rare earth and critical mineral " +
      "companies are under US Department of Commerce Entity List restrictions. " +
      "China produces extraordinary mineral specimens — fluorite, calcite, stibnite, " +
      "pyrite, barite, and many others.",
    minerals: [
      "Fluorite", "Calcite", "Stibnite", "Pyrite", "Wulfenite",
      "Rhodochrosite", "Realgar / Orpiment", "Quartz varieties",
    ],
    action:
      "Standard documentation is sufficient for most collector specimens. " +
      "Be aware of the broader trade context; check if any specific entity " +
      "is on the Commerce Department Entity List for commercial transactions.",
    sources: ["US Commerce Dept. Entity List", "OFAC (no comprehensive China sanctions)"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: look up a country name against the flags list
// Returns the matching entry or null
// ─────────────────────────────────────────────────────────────────────────────
export function lookupCountryFlag(inputStr) {
  if (!inputStr || inputStr.trim().length < 2) return null;
  const normalized = inputStr.trim().toLowerCase();
  return FLAGGED_COUNTRIES.find(c =>
    c.name.toLowerCase() === normalized ||
    c.aliases.some(a => normalized.includes(a) || a.includes(normalized))
  ) || null;
}

// Last reviewed: June 2026
// Primary sources: OFAC (ofac.treas.gov), US State Dept., Global Witness,
//                  IPIS Research, Dodd-Frank Act, USGS Mineral Resources Program
