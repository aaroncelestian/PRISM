// ── Notable Mineral Localities ────────────────────────────────────────────────
// Static curated reference — no external API needed. Expand freely.
//
// significance: "world_class" | "exceptional" | "notable"
// status:       "closed" | "active" | "limited"

export const SIGNIFICANCE = {
  world_class: { label: "World-Class",  color: "#e8b840", desc: "Top 20–30 localities globally. Material commands major premiums." },
  exceptional: { label: "Exceptional",  color: "#90c0f0", desc: "Well-known among serious collectors. Locality clearly adds value." },
  notable:     { label: "Notable",      color: "#00c880", desc: "Recognized locality with documented collector interest." },
};

export const STATUS_LOC = {
  closed:  { label: "Closed / Exhausted", color: "#e8b840", icon: "🔒" },
  limited: { label: "Limited Production", color: "#ffa028", icon: "⚠️" },
  active:  { label: "Active Mine",        color: "#00c880", icon: "⛏️" },
};

export const LOCALITIES = [

  // ── AFRICA ───────────────────────────────────────────────────────────────

  { id: "tsumeb", name: "Tsumeb Mine", location: "Otjikoto, Namibia", continent: "Africa",
    status: "closed", significance: "world_class",
    knownFor: ["azurite", "tennantite", "dioptase", "smithsonite", "galena"],
    localityRaritySuggested: 95,
    note: "260+ mineral species; 40+ first described here. Top five locality worldwide. Closed 1996. All material is old-stock — provenance documentation critical." },

  { id: "nchwaning", name: "N'Chwaning & Wessels Mines", location: "Kalahari Manganese Field, South Africa", continent: "Africa",
    status: "limited", significance: "world_class",
    knownFor: ["sugilite", "hausmannite", "olmiite", "sturmanite"],
    localityRaritySuggested: 90,
    note: "Only significant source of gem sugilite on Earth. 40+ type minerals at Wessels. High-grade material increasingly scarce." },

  { id: "langban", name: "Långban Mine", location: "Värmland, Sweden", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["hausmannite", "jacobsite", "svabite", "richterite"],
    localityRaritySuggested: 92,
    note: "300+ species — unparalleled for manganese silicates and arsenates. Production ended 19th century. All material is antique." },

  { id: "mibladen", name: "Mibladen / Touissit District", location: "Midelt & Oujda, Morocco", continent: "Africa",
    status: "limited", significance: "exceptional",
    knownFor: ["vanadinite", "mimetite", "baryte"],
    localityRaritySuggested: 72,
    note: "World's finest bright-red vanadinite on baryte matrix. Iconic collector piece. Still producing but top-quality pockets are rare." },

  { id: "erongo", name: "Erongo Mountains", location: "Erongo Region, Namibia", continent: "Africa",
    status: "limited", significance: "notable",
    knownFor: ["aquamarine", "fluorite", "tourmaline", "smoky quartz"],
    localityRaritySuggested: 60,
    note: "Gemmy blue-green aquamarine and deep-purple fluorite. Production ongoing but fine pieces are increasingly scarce." },

  // ── NORTH AMERICA ────────────────────────────────────────────────────────

  { id: "bisbee", name: "Bisbee (Copper Queen Mine)", location: "Cochise County, Arizona, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["azurite", "malachite", "cuprite", "wulfenite", "shattuckite"],
    localityRaritySuggested: 95,
    note: "World-record azurite nodules and crystals. Closed 1975. All material is old-stock. Bisbee provenance significantly raises value." },

  { id: "franklin", name: "Franklin & Sterling Hill", location: "Sussex County, New Jersey, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["franklinite", "willemite", "zincite", "esperite"],
    localityRaritySuggested: 93,
    note: "400+ mineral species. Dramatic fluorescent assemblages found nowhere else. Closed; all material is antique or museum-quality." },

  { id: "sweet_home", name: "Sweet Home Mine", location: "Park County, Colorado, USA", continent: "North America",
    status: "limited", significance: "exceptional",
    knownFor: ["rhodochrosite"],
    localityRaritySuggested: 88,
    note: "World's finest gem-quality rhodochrosite crystals. Intermittently worked. The 'Alma King' specimen from here is legendary." },

  { id: "ojuela", name: "Mina Ojuela", location: "Mapimí, Durango, Mexico", continent: "North America",
    status: "limited", significance: "exceptional",
    knownFor: ["legrandite", "adamite", "paradamite", "descloizite"],
    localityRaritySuggested: 85,
    note: "World's finest legrandite crystals. Rich in rare zinc arsenate minerals. Mapimí provenance significantly increases value." },

  { id: "red_cloud", name: "Red Cloud Mine", location: "La Paz County, Arizona, USA", continent: "North America",
    status: "closed", significance: "exceptional",
    knownFor: ["wulfenite"],
    localityRaritySuggested: 88,
    note: "World-class intense red-orange wulfenite. Closed. Red Cloud wulfenite is immediately recognizable to experienced collectors." },

  { id: "joplin", name: "Tri-State Mining District", location: "Missouri / Kansas / Oklahoma, USA", continent: "North America",
    status: "closed", significance: "exceptional",
    knownFor: ["galena", "sphalerite", "smithsonite", "calcite"],
    localityRaritySuggested: 78,
    note: "Historic zinc-lead district. Exceptional dog-tooth calcite and golden sphalerite. Exhausted. Classic American locality." },

  { id: "naica", name: "Naica Mine (Cave of Crystals)", location: "Chihuahua, Mexico", continent: "North America",
    status: "closed", significance: "exceptional",
    knownFor: ["gypsum (selenite)", "calcite"],
    localityRaritySuggested: 82,
    note: "Home to the giant selenite crystals. Now flooded. Naica gypsum is among the most visually dramatic minerals known." },

  { id: "san_francisco_sonora", name: "San Francisco Mine", location: "Cucurpe, Sonora, Mexico", continent: "North America",
    status: "closed", significance: "exceptional",
    knownFor: ["wulfenite", "mimetite", "descloizite"],
    localityRaritySuggested: 82,
    note: "Exceptional orange-red wulfenite on matrix. One of Mexico's finest mineral localities. Closed." },

  { id: "kelly_mine", name: "Kelly Mine", location: "Socorro County, New Mexico, USA", continent: "North America",
    status: "closed", significance: "notable",
    knownFor: ["smithsonite", "hemimorphite", "cerussite"],
    localityRaritySuggested: 70,
    note: "Exceptional multicolored smithsonite (blue, green, pink). Closed. Fine Kelly smithsonite increasingly hard to find." },

  // ── SOUTH AMERICA ────────────────────────────────────────────────────────

  { id: "cerro_rico", name: "Cerro Rico de Potosí", location: "Potosí, Bolivia", continent: "South America",
    status: "active", significance: "exceptional",
    knownFor: ["pyrargyrite", "andorite", "native silver", "cassiterite"],
    localityRaritySuggested: 80,
    note: "The 'rich mountain' that funded Spain's colonial empire. Still active. World-class silver minerals. Beware undocumented 'old-stock' claims." },

  { id: "uchucchacua", name: "Uchucchacua Mine", location: "Lima Region, Peru", continent: "South America",
    status: "active", significance: "exceptional",
    knownFor: ["rhodochrosite", "semseyite", "pyrargyrite"],
    localityRaritySuggested: 82,
    note: "Deep-red rhodochrosite crystals and rare silver sulfosalts. Still active. One of Peru's most important localities." },

  { id: "minas_gerais", name: "Minas Gerais (various mines)", location: "Minas Gerais, Brazil", continent: "South America",
    status: "active", significance: "exceptional",
    knownFor: ["topaz", "chrysoberyl", "tourmaline", "aquamarine", "phenakite"],
    localityRaritySuggested: 70,
    note: "'Minas Gerais' is a state, not a mine. Ask for the specific mine name. Quality and rarity vary enormously by source." },

  // ── EUROPE ───────────────────────────────────────────────────────────────

  { id: "lengenbach", name: "Lengenbach Quarry", location: "Binntal, Valais, Switzerland", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["dufrenoysite", "jordanite", "polyargyrite", "sartorite"],
    localityRaritySuggested: 95,
    note: "World's most important locality for rare thallium/lead/arsenic sulfosalts. 40+ type minerals. Season is just weeks per year. Material is extraordinarily rare and expensive." },

  { id: "trepca", name: "Trepča Mine", location: "Mitrovica, Kosovo", continent: "Europe",
    status: "active", significance: "exceptional",
    knownFor: ["galena", "sphalerite", "rhodonite", "pyrite"],
    localityRaritySuggested: 75,
    note: "Exceptional rhodonite and well-crystallized galena. Still active. Trepča rhodonite is among the finest known." },

  { id: "panasqueira", name: "Panasqueira Mine", location: "Castelo Branco, Portugal", continent: "Europe",
    status: "active", significance: "exceptional",
    knownFor: ["wolframite", "arsenopyrite", "fluorapatite (blue)", "cassiterite"],
    localityRaritySuggested: 78,
    note: "World's finest blue fluorapatite and exceptional wolframite. Still Europe's largest tungsten producer. Consistently top-quality specimens." },

  { id: "freiberg", name: "Freiberg Mining District", location: "Saxony, Germany", continent: "Europe",
    status: "closed", significance: "exceptional",
    knownFor: ["native silver", "argentite", "pyrargyrite", "proustite"],
    localityRaritySuggested: 85,
    note: "Germany's historic silver capital. Major production ended early 20th century. Exceptional silver minerals — all material is antique." },

  { id: "clara_mine", name: "Clara Mine", location: "Black Forest, Germany", continent: "Europe",
    status: "active", significance: "exceptional",
    knownFor: ["fluorite", "baryte", "pyrite", "galena"],
    localityRaritySuggested: 72,
    note: "Active mine, one of Europe's most prolific specimen producers. Deep-purple fluorite cubes and sharp baryte. Regular production." },

  { id: "dalnegorsk", name: "Dalnegorsk Skarn Deposits", location: "Primorsky Krai, Russia", continent: "Europe",
    status: "limited", significance: "exceptional",
    knownFor: ["hedenbergite", "danburite", "calcite", "scheelite"],
    localityRaritySuggested: 78,
    note: "World-class hedenbergite and exceptional danburite. Production significantly declined. Classic Russian locality." },

  // ── ASIA / PACIFIC ───────────────────────────────────────────────────────

  { id: "mogok", name: "Mogok Valley", location: "Mandalay Region, Myanmar", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["ruby", "sapphire", "spinel", "moonstone"],
    localityRaritySuggested: 90,
    note: "World's premier ruby locality. 'Pigeon's blood' ruby is the reference standard. Beware synthetic and heat-treated stone misrepresentation." },

  { id: "broken_hill", name: "Broken Hill", location: "New South Wales, Australia", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["cerussite", "rhodonite", "smithsonite", "calcite"],
    localityRaritySuggested: 88,
    note: "World's finest cerussite crystals — elaborate interlocking twins unmatched anywhere. Also exceptional rhodonite. Classic mine locality." },

  { id: "hunza", name: "Hunza Valley / Skardu District", location: "Gilgit-Baltistan, Pakistan", continent: "Asia / Pacific",
    status: "active", significance: "exceptional",
    knownFor: ["aquamarine", "tourmaline", "topaz", "garnet"],
    localityRaritySuggested: 75,
    note: "World's finest gem aquamarine and zoned tourmaline from high-altitude pegmatites. Hunza aquamarine commands significant premium; beware locality misattribution." },

];

// ── Helper functions ──────────────────────────────────────────────────────────

export function searchLocalities(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase();
  return LOCALITIES.filter(loc =>
    loc.name.toLowerCase().includes(q) ||
    loc.location.toLowerCase().includes(q) ||
    loc.knownFor.some(m => m.toLowerCase().includes(q)) ||
    loc.continent.toLowerCase().includes(q)
  );
}

export function getLocalityBySpecies(species) {
  if (!species) return [];
  const s = species.toLowerCase();
  return LOCALITIES.filter(loc =>
    loc.knownFor.some(m => m.toLowerCase().includes(s))
  );
}

// Common mineral species that should score LOW on rarity (10–30)
export const COMMON_SPECIES = [
  { name: "Quartz", forms: "rock crystal, smoky, amethyst, citrine, rose", rarityRange: "10–25", note: "Ubiquitous. Thousands of localities worldwide. Only exceptional specimens from notable localities warrant higher rarity scores." },
  { name: "Calcite", forms: "dog-tooth, nail-head, rhombohedral, scalenohedral", rarityRange: "10–20", note: "One of the most abundant minerals on Earth. Common in thousands of deposits." },
  { name: "Pyrite", forms: "cubes, pyritohedra, striped faces", rarityRange: "10–25", note: "Extremely common. Fine crystal form (sharp cubes) raises the crystal quality score, NOT species rarity." },
  { name: "Fluorite", forms: "cubes, octahedra, penetration twins", rarityRange: "15–30", note: "Very common worldwide. Color and crystal perfection drive value, not species rarity." },
  { name: "Galena", forms: "cubes, octahedra, combinations", rarityRange: "10–20", note: "Most common lead mineral. Found in every mining district." },
  { name: "Sphalerite", forms: "tetrahedra, massive, cleavage fragments", rarityRange: "10–25", note: "Very common zinc ore mineral globally." },
  { name: "Malachite", forms: "botryoidal, stalactitic, pseudomorphs, crystals", rarityRange: "15–30", note: "Common copper mineral. Fine crystals and botryoidal habit are the value driver." },
  { name: "Azurite", forms: "tabular crystals, nodules, pseudomorphs", rarityRange: "25–40", note: "Less common than malachite but still widespread in copper deposits. Fine crystal form is key." },
  { name: "Tourmaline (common)", forms: "prismatic crystals, various colors", rarityRange: "15–35", note: "Common tourmaline (schorl) is very abundant. Gem elbaite from notable localities is different." },
  { name: "Feldspar (orthoclase/albite)", forms: "tabular, Baveno twins", rarityRange: "10–20", note: "Extremely common rock-forming mineral." },
  { name: "Mica (muscovite/lepidolite)", forms: "books, pseudohexagonal plates", rarityRange: "10–20", note: "Very common in pegmatites worldwide." },
  { name: "Garnet (almandine)", forms: "dodecahedra, trapezohedra", rarityRange: "10–25", note: "Common almandine garnet is widespread. Rare garnets (demantoid, tsavorite) are a different story." },
  { name: "Barite", forms: "tabular 'roses', bladed crystals", rarityRange: "10–25", note: "Very common gangue mineral in ore deposits worldwide." },
  { name: "Apatite (common)", forms: "hexagonal prisms, massive", rarityRange: "15–30", note: "Common in many rock types. Blue fluorapatite from Panasqueira is notable, but apatite in general is not rare." },
  { name: "Magnetite", forms: "octahedra, dodecahedra, massive", rarityRange: "10–20", note: "Extremely common iron mineral." },
];
