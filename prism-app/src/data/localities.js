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


  // ── AFRICA (additional) ──────────────────────────────────────────────────────────────

  { id: "namibia_kombat", name: "Kombat Mine", location: "Otavi Mountainland, Namibia", continent: "Africa",
    status: "closed", significance: "exceptional",
    knownFor: ["cuprite","malachite","azurite","chalcocite","native copper"],
    localityRaritySuggested: 82,
    note: "Stratiform Cu-Pb-Fe skarn deposit that produced excellent secondary copper mineral specimens through the 2000s before final closure. Cuprite octahedra on matrix are the most collected pieces; supply has tightened appreciably. Less commonly encountered than Tsumeb material but undervalued relative to quality." },

  { id: "namibia_brandberg", name: "Brandberg Massif", location: "Erongo Region, Namibia", continent: "Africa",
    status: "limited", significance: "exceptional",
    knownFor: ["amethyst scepters","smoky quartz","calcite"],
    localityRaritySuggested: 62,
    note: "Rhyolitic amygdules produce distinctive amethyst scepters with characteristic enhydro inclusions; quality is highly variable. Active but unregulated mining means continuity of supply is unpredictable. Best scepter specimens command strong retail premiums; matrix pieces with multiple scepters are the top tier." },

  { id: "south_africa_palabora", name: "Palabora (Phalaborwa) Mine", location: "Limpopo Province, South Africa", continent: "Africa",
    status: "active", significance: "exceptional",
    knownFor: ["baddeleyite","phlogopite","apatite","vermiculite","magnetite","valleriite"],
    localityRaritySuggested: 72,
    note: "Carbonatite pipe with phoscorite core; the world-standard locality for baddeleyite (ZrO₂), with large, well-formed crystals rarely available commercially given industrial extraction focus. Phlogopite books of gem quality are the most collector-accessible product; apatite and magnetite crystals are incidental recoveries. Specimens require documentation of provenance from the mine's geological staff era." },

  { id: "south_africa_kimberley", name: "Kimberley Diamond Mines (Big Hole & surrounds)", location: "Northern Cape, South Africa", continent: "Africa",
    status: "closed", significance: "world_class",
    knownFor: ["diamond","ilmenite","pyrope","chromite"],
    localityRaritySuggested: 88,
    note: "Type occurrence and namesake of kimberlite; the Big Hole (De Beers Mine) closed in 1914. Crystallized diamond-in-kimberlite matrix specimens are among the rarest and most historically significant mineralogical objects; the majority reside in institutional collections. Expect high scrutiny of any purported Kimberley matrix diamond specimens entering the market." },

  { id: "south_africa_cullinan", name: "Cullinan (Premier) Diamond Mine", location: "Tshwane District, Gauteng, South Africa", continent: "Africa",
    status: "active", significance: "world_class",
    knownFor: ["diamond","pyrope","ilmenite"],
    localityRaritySuggested: 78,
    note: "Source of the 3,106-carat Cullinan diamond (1905) and ongoing producer of large Type IIa and rare blue diamonds. Active under Petra Diamonds; matrix specimens are industrial recoveries and almost never reach the collector market. The locality label alone carries enormous historical prestige and any properly documented rough crystal is immediately collectible." },

  { id: "south_africa_messina", name: "Messina (Musina) Mine", location: "Limpopo Province, South Africa", continent: "Africa",
    status: "closed", significance: "world_class",
    knownFor: ["cuprite","malachite","azurite","native copper","chalcocite"],
    localityRaritySuggested: 87,
    note: "Closed volcanogenic Cu sulfide mine that produced some of the finest cuprite octahedra and cube-octahedra in southern African mineralogy; large (>3 cm) bright red crystals on quartz matrix are museum-grade rarities. Market supply is entirely from old collections. Confusion with Namibian (Kombat/Tsumeb) cuprite labels is common—Messina cuprite tends to be more equant and on lighter-colored gangue." },

  { id: "drc_kipushi", name: "Kipushi Mine", location: "Haut-Katanga Province, DRC", continent: "Africa",
    status: "limited", significance: "world_class",
    knownFor: ["germanite","renierite","briartite","tennantite","smithsonite","willemite","dioptase"],
    localityRaritySuggested: 88,
    note: "Zn-Cu-Pb-Ge carbonate-hosted vein deposit and the world's foremost locality for Ge-bearing sulfosalts (germanite, renierite, briartite), making it irreplaceable for the study of critical-element mineralogy. Closed 1993–2023; recently reopened for Zn mining but specimen recovery is not systematic. Pre-closure material dominates the market; dioptase and willemite specimens are the most commercially available highlights." },

  { id: "drc_shinkolobwe", name: "Shinkolobwe Mine", location: "Haut-Katanga Province, DRC", continent: "Africa",
    status: "closed", significance: "world_class",
    knownFor: ["uraninite","carnotite","soddyite","sklodowskite","becquerelite","billietite"],
    localityRaritySuggested: 96,
    note: "Officially closed U-Cu-Co vein deposit and the world's most significant single source of secondary uranium mineral diversity; provided Manhattan Project ore and yielded type specimens for numerous uranyl sheet silicate and phosphate phases. Specimens are radioactive, export-controlled, and subject to strict import regulations in most countries. Legitimate pre-1990 specimens in institutional or documented private collections are essentially irreplaceable." },

  { id: "zambia_kabwe", name: "Broken Hill Mine (Kabwe)", location: "Central Province, Zambia", continent: "Africa",
    status: "closed", significance: "world_class",
    knownFor: ["mimetite","descloizite","smithsonite","cerussite","vanadinite","rosasite"],
    localityRaritySuggested: 90,
    note: "Pb-Zn-V stratiform karst deposit closed in 1994 and a primary reference locality for the pyromorphite group, particularly mimetite of gem barrel-crystal habit. Descloizite specimens of crusted botryoidal form on matrix are sought for completeness. All material is secondary-market; misattribution to Mibladen (Morocco) mimetite is common in bulk lots—compare crystal habit and matrix character." },

  { id: "morocco_bou_azzer", name: "Bou Azzer District", location: "Drâa-Tafilalet, Anti-Atlas, Morocco", continent: "Africa",
    status: "active", significance: "world_class",
    knownFor: ["erythrite","skutterudite","safflorite","cobaltite","nickeline","native silver"],
    localityRaritySuggested: 72,
    note: "Co-Ni-As hydrothermal district in Proterozoic serpentinite/carbonate and the world's premier erythrite locality; brilliant violet-pink bladed erythrite crystals on arsenide matrix are the defining Bou Azzer specimen. Active Co mining continues to generate new pockets. Matrix integrity is critical—erythrite is fragile and dehydrates; examine carefully and store away from light and heat." },

  { id: "morocco_mibladen_vanadinite", name: "Jbel Saghro (Saghro Mine area)", location: "Drâa-Tafilalet, Morocco", continent: "Africa",
    status: "active", significance: "exceptional",
    knownFor: ["vanadinite","mimetite"],
    localityRaritySuggested: 60,
    note: "Secondary Pb-V vein occurrence producing ruby-red hexagonal vanadinite prisms; quality fluctuates by pocket. Less well-characterized than Mibladen material but occasionally yields sharp aesthetic miniatures at competitive prices. Locality labels are frequently interchanged with Mibladen in the market." },

  { id: "tanzania_merelani", name: "Merelani Hills", location: "Arusha Region, Tanzania", continent: "Africa",
    status: "active", significance: "world_class",
    knownFor: ["tanzanite","tsavorite","diopside","graphite","green grossular"],
    localityRaritySuggested: 72,
    note: "Graphitic calc-silicate schist deposit and the world's only commercial source of tanzanite (gem blue-violet zoisite); also produces gem tsavorite (grossular garnet). Tanzanite-in-matrix specimens showing natural crystal form are disproportionately rare given that >95% of rough is immediately cut. The government-mandated small-miner zones (A/B/C/D blocks) create uneven quality; Block D material dominates gem rough trade." },

  { id: "madagascar_anjanabonoina", name: "Anjanabonoina", location: "Betafo District, Vakinankaratra, Madagascar", continent: "Africa",
    status: "limited", significance: "world_class",
    knownFor: ["brazilianite","tourmaline","herderite","beryllonite","fluorapatite","morganite"],
    localityRaritySuggested: 82,
    note: "Granitic pegmatite producing some of the world's finest brazilianite (NaAl₃(PO₄)₂(OH)₄) crystals—the rarest gem phosphate—alongside gem tourmaline, herderite, and beryllonite. Production is sporadic and dependent on artisanal mining access; large gem brazilianite crystals with good transparency essentially never appear fresh to market. Material that surfaces at EFMLS-level shows warrants immediate consideration." },

  { id: "madagascar_sahatany", name: "Sahatany Valley", location: "Vakinankaratra, Madagascar", continent: "Africa",
    status: "active", significance: "world_class",
    knownFor: ["rubellite","indicolite","watermelon tourmaline","liddicoatite"],
    localityRaritySuggested: 70,
    note: "Granitic pegmatite district producing outstanding polychrome and gem-quality tourmaline including liddicoatite (Ca-analog of elbaite with triangular sector zoning visible in cross-section). Liddicoatite slices are a uniquely Madagascar product with strong collector demand. Production quality is variable; the best material from the 1990s–2010s era is held in major private collections." },

  { id: "zambia_kagem", name: "Kagem Mine", location: "Copperbelt Province, Zambia", continent: "Africa",
    status: "active", significance: "world_class",
    knownFor: ["emerald","biotite schist"],
    localityRaritySuggested: 62,
    note: "Phlogopite-schist-hosted hydrothermal emerald deposit (Gemfields-operated since 2008) and now the world's largest emerald mine by volume output; produces ~25–30% of global emerald supply. Zambian emeralds are characteristically more bluish-green (V-dominant chromophore with lower Cr/V) and cleaner (fewer inclusions) than Colombian material. Matrix specimens are a growing market segment; laboratory origin testing (Gübelin, GIA) now readily differentiates Zambia from Colombia and Brazil." },

  { id: "mozambique_montepuez", name: "Montepuez Ruby Deposit", location: "Cabo Delgado Province, Mozambique", continent: "Africa",
    status: "active", significance: "world_class",
    knownFor: ["ruby","sapphire","pink sapphire"],
    localityRaritySuggested: 65,
    note: "Marble-hosted ruby deposit (Gemfields-operated since 2012) and now the world's largest ruby source by volume; Mozambique ruby characteristics include deep red color with strong fluorescence comparable to Mogok material. Rapidly developing provenance and origin documentation infrastructure. Montepuez ruby has entered major international auction houses and commands prices close to Mogok equivalents for top grades; laboratory origin confirmation is standard practice." },

  // ── NORTH AMERICA (additional) ───────────────────────────────────────────────────────

  { id: "usa_paterson_zeolites", name: "Paterson / Prospect Park Trap Rock Quarries", location: "Passaic County, New Jersey, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["stilbite","analcime","prehnite","natrolite","apophyllite-(KF)","heulandite","chabazite","pectolite","datolite"],
    localityRaritySuggested: 88,
    note: "Triassic amygdaloidal basalt quarries (Watchung Mountains) and the world's defining zeolite locality for aesthetics—peach-pink stilbite bows, apple-green apophyllite, and brilliant white natrolite sprays define the 'classic American mineral' aesthetic. Quarries closed long-term; material circulates almost entirely from 19th–early 20th century collection periods. New Jersey zeolite specimens remain among the most actively traded classic American minerals." },

  { id: "usa_mammoth_tiger", name: "Mammoth-St. Anthony Mine (Tiger Mine)", location: "Tiger, Pinal County, Arizona, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["wulfenite","mimetite","cerussite","malachite"],
    localityRaritySuggested: 92,
    note: "Pb-Cu-V oxidized vein producing the world-benchmark combination specimen—vermillion wulfenite tablets with yellow-green mimetite botryoids on a single matrix piece—a pairing unmatched aesthetically by any other locality globally. Closed long-term; all material is secondary-market. 'Tiger' wulfenite specimens have appreciated dramatically since the 1980s; condition is paramount—mimetite is fragile and specimens often show damage under magnification." },

  { id: "usa_rowley_mine", name: "Rowley Mine", location: "Maricopa County, Arizona, USA", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["wulfenite","mimetite","willemite","chlorargyrite"],
    localityRaritySuggested: 90,
    note: "Pb-Zn-Cu oxidized vein producing the world's thinnest and most perfectly formed orange wulfenite tablets—wafer crystals to 3 cm with transparency and color unmatched by any other wulfenite locality globally. Co-type or type locality for multiple IMA-approved mineral species. Production is intermittent and access tightly controlled; fresh Rowley wulfenite enters the market only occasionally in concentrated bursts. Among the most actively appreciated Arizona mineral localities in current collector market." },

  { id: "usa_79_mine", name: "79 Mine (Azurite Mine)", location: "Gila County, Arizona, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["azurite","malachite"],
    localityRaritySuggested: 90,
    note: "Supergene Cu vein in Paleozoic limestone producing the world-unique 'book-form' or 'bluebird' azurite—tightly intergrown tabular azurite crystals mimicking the crystal structure of shale, forming flat blue books in dark mudstone matrix. This morphology is found nowhere else. Closed long-term; supply is tight and shrinking. Pristine book azurite with minimal matrix staining on fresh matrix is the top-tier form." },

  { id: "usa_cave_in_rock", name: "Cave-in-Rock / Denton Mine District", location: "Hardin County, Illinois, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["fluorite","calcite","sphalerite","galena","barite"],
    localityRaritySuggested: 88,
    note: "MVT fluorite-barite deposit in Mississippian carbonate and the world's pre-eminent US fluorite locality; multi-zoned purple, yellow, and blue cubic and octahedral fluorite crystals to >10 cm are defining specimens for the species in North America. Multiple mines (Cave-in-Rock, Denton, Annabel Lee, Minerva No. 1, Bethel) with subtly different parageneses are now closed. The zoned 'Illinois' fluorite aesthetic remains a major driver of fluorite collector demand globally." },

  { id: "usa_elmwood_mine", name: "Elmwood Mine", location: "Smith County, Tennessee, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["sphalerite","smithsonite","calcite","barite","fluorite"],
    localityRaritySuggested: 90,
    note: "MVT Pb-Zn-Ba-F deposit in Ordovician carbonate and arguably the world's finest American sphalerite locality—gem-quality 'cleiophane' (pale yellow-green transparent) and red sphalerite crystals to >8 cm, and what many regard as the finest cockscomb barite specimens. Closed following flooding; supply is tight and specimen quality has defined the collector market for both species. Elmwood calcite (dogtooth scalenohedral) on sphalerite matrix is the definitive combination form." },

  { id: "usa_lake_george", name: "Lake George / Pikes Peak Batholith", location: "Park / Teller County, Colorado, USA", continent: "North America",
    status: "active", significance: "world_class",
    knownFor: ["amazonite","smoky quartz","phenakite","fluorapatite","topaz"],
    localityRaritySuggested: 75,
    note: "Miarolitic cavities in Pikes Peak granite (1.08 Ga) producing the world's most coveted amazonite—deep teal-blue-green crystals with sharp natural faces, commonly intergrown with smoky quartz—and gem-quality phenakite (Be₂SiO₄). Licensed fee-dig operations still produce material but premium miarolite pockets are increasingly rare. Phenakite of optical clarity >2 cm is substantially undervalued in the North American market relative to Brazilian and Russian equivalent material." },

  { id: "usa_comstock_lode", name: "Comstock Lode (Virginia City / Gold Hill)", location: "Storey County, Nevada, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["acanthite","native silver","stephanite","polybasite","electrum","native gold"],
    localityRaritySuggested: 88,
    note: "Low-sulfidation epithermal Ag-Au bonanza vein and the mineralogical and economic center of the 1859 Nevada silver rush; ~$400M historical production (1860s $). Fine silver sulfosalt specimens from the Ophir, Consolidated Virginia, and California Mines are in major North American institutional collections. Market availability of authentic provenanced specimens is minimal; Nevada historical dealer labels significantly enhance value." },

  { id: "usa_yogo_gulch", name: "Yogo Gulch", location: "Judith Basin County, Montana, USA", continent: "North America",
    status: "active", significance: "world_class",
    knownFor: ["sapphire"],
    localityRaritySuggested: 90,
    note: "Lamprophyre (kamafugite) dike-hosted corundum and the world's only known in-situ dike sapphire deposit outside Asia; Yogo sapphire (cornflower blue) is the finest North American sapphire and the only American corundum that does not require heat treatment for commercial quality. Production is controlled by a single operator and extremely limited; supply constraints create significant price premiums. Heat treatment is not possible for Yogo due to iron content—this is a distinguishing characteristic." },

  { id: "usa_coeur_dalene", name: "Coeur d'Alene / Silver Valley", location: "Shoshone County, Idaho, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["acanthite","galena","sphalerite","tetrahedrite","pyrargyrite","native silver"],
    localityRaritySuggested: 82,
    note: "Mesothermal Ag-Pb-Zn-Cu district (Bunker Hill, Lucky Friday, Galena mines) producing >1 billion troy ounces of silver historically—the single most productive Ag district in US history. Fine silver sulfosalt specimens on white quartz matrix are the most collected category; supply from the major mines (now closed or in limited production) is secondary-market. Coeur d'Alene acanthite to 5+ cm in sharp wedge form is the defining North American silver mineral specimen." },

  { id: "usa_black_hills", name: "Black Hills Pegmatite District (Etta Mine / Peerless Mine)", location: "Pennington / Custer County, South Dakota, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["spodumene","tourmaline","lepidolite","beryl","columbite","cassiterite"],
    localityRaritySuggested: 85,
    note: "Proterozoic granitic pegmatite district and home of the Etta Mine, source of the world's largest documented spodumene crystals (to 13.7 m length × >1 m width); currently preserved as a geological landmark. Tourmaline and lepidolite from the Peerless Mine are the most commercially available collector products. Any authentic Etta spodumene fragment with documentation is a significant historical mineralogical object." },

  { id: "usa_hiddenite_nc", name: "Hiddenite / Tiffany Mine", location: "Alexander County, North Carolina, USA", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["hiddenite","emerald","sapphire","spodumene"],
    localityRaritySuggested: 88,
    note: "Mica schist-hosted pegmatite zone and the type locality for hiddenite (gem-green spodumene colored by Cr³⁺, named for A.E. Hidden, 1879); the only locality in the world where gem-quality green spodumene was originally documented. Occasional finds still occur; a 1970s pocket produced material comparable to the 1880s original discovery. Authentic hiddenite with strong chromium-green color is one of the rarest gem species in the US collector market." },

  { id: "usa_mount_mica", name: "Mount Mica", location: "Paris, Oxford County, Maine, USA", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["elbaite","tourmaline","beryl","spessartine"],
    localityRaritySuggested: 82,
    note: "Granitic pegmatite and the first US gem tourmaline locality (1820 discovery by Hamlin and Allen); the original discovery pocket produced gem rubellite and polychrome elbaite that established North American tourmaline collecting. Active but sporadic mining continues; the Maine Mineral and Gem Museum holds reference specimens. Mount Mica elbaite carries strong historical provenance premium in the US collector market." },

  { id: "usa_dunton_quarry", name: "Dunton Quarry", location: "Newry, Oxford County, Maine, USA", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["rubellite","tourmaline","beryl","lepidolite","morganite"],
    localityRaritySuggested: 82,
    note: "Granitic pegmatite producing the finest rubellite tourmaline in New England; the 1972 'Jolly Roger' pocket yielded world-class rubellite crystals that remain benchmarks for North American tourmaline. Intermittent licensed digging continues. Dunton is the defining North American rubellite locality; gem-quality deep pink to red crystals from here are rarer on the market than Brazilian equivalents and command locality premiums among US collectors." },

  { id: "usa_morefield_mine", name: "Morefield Mine", location: "Amelia County, Virginia, USA", continent: "North America",
    status: "active", significance: "exceptional",
    knownFor: ["amazonite","topaz","spessartine","columbite-(Fe)","tourmaline"],
    localityRaritySuggested: 72,
    note: "Granitic pegmatite with miarolitic cavities producing distinctive blue-green amazonite and well-formed spessartine crystals; one of the few US localities with active fee-dig collector access. Topaz crystals of colorless to pale blue occur in vugs; columbite-(Fe) is a specialty product for REE mineral collectors. Quality has declined from peak 1970s–1980s production but occasional fresh vugs still reward systematic searching." },

  { id: "usa_ouray_silverton", name: "Ouray / Silverton District", location: "Ouray / San Juan County, Colorado, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["rhodochrosite","native silver","acanthite","sphalerite","galena","tetrahedrite"],
    localityRaritySuggested: 82,
    note: "Epithermal Ag-Au-Pb-Zn-Te district producing important rhodochrosite (scalenohedral pink to red crystals) and silver sulfosalt specimens; the Yankee Girl and Smuggler Mines produced some of the finest Colorado silver minerals. Closed for specimen mining; most material comes from early 20th century collection periods. Ouray rhodochrosite is underpriced relative to Sweet Home but can rival it for color saturation." },

  { id: "mexico_santa_eulalia", name: "Santa Eulalia District", location: "Chihuahua, Mexico", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["cerussite","galena","sphalerite","calcite","aragonite","smithsonite","wulfenite"],
    localityRaritySuggested: 80,
    note: "MVT Pb-Zn-Ag carbonate-replacement deposit in Cretaceous limestone and the world's most celebrated Mexican mineral district for specimen quality; cerussite twins and masses from Santa Eulalia are world-reference specimens for the species. The San Antonio and Potosí Mines continue intermittent operation; fresh specimen recovery occurs episodically. Calcite scalenohedral crystals to >30 cm and smithsonite stalactites are the undervalued highlights of this district." },

  { id: "mexico_batopilas", name: "Batopilas", location: "Chihuahua, Mexico", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["native silver","acanthite","chlorargyrite"],
    localityRaritySuggested: 90,
    note: "Low-sulfidation epithermal veins producing extraordinary wire and sheet native silver masses; Alexander Shepherd's late 19th-century mining recovered some of the largest wire silver specimens ever documented from the Americas. Closed long-term; the finest pieces are in Mexican and US institutional collections. Authentic Batopilas native silver with documented provenance is among the most historically significant American mineral specimens." },

  { id: "mexico_guanajuato", name: "Guanajuato Silver District", location: "Guanajuato, Mexico", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["acanthite","polybasite","native silver","pyrargyrite","stephanite"],
    localityRaritySuggested: 82,
    note: "Epithermal Ag-Au bonanza vein system (La Valenciana, Veta Madre) and the second most historically productive silver district in the Americas after Potosí; production of ~30,000 tonnes Ag through 18th–19th centuries. Intermittent artisanal mining continues; fine silver sulfosalt specimens still emerge occasionally. Guanajuato acanthite in compact massive form with distinctive vein texture is the primary market offering." },

  { id: "canada_cobalt_ontario", name: "Cobalt Silver District", location: "Timiskaming District, Ontario, Canada", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["native silver","acanthite","erythrite","cobaltite","nickeline","arsenopyrite","smaltite"],
    localityRaritySuggested: 95,
    note: "Five-element (Ag-Co-Ni-As-Bi) hydrothermal vein system and arguably the world's finest native silver locality alongside Kongsberg—wire, plate, and massive native silver of extraordinary purity and form were recovered from the Beaver, La Rose, McKinley-Darragh and other mines (1903–1960s). Canadian national collections hold the finest pieces; market material comes from early 20th century collection periods. 'Half-breed' ore (acanthite-silver intergrowth) is underpriced relative to pure silver masses." },

  { id: "canada_mont_saint_hilaire", name: "Mont Saint-Hilaire", location: "Rouville County, Quebec, Canada", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["serandite","eudialyte","natrolite","analcime","leucophanite","polylithionite","catapleiite","neptunite"],
    localityRaritySuggested: 82,
    note: "Alkaline gabbro/syenite intrusion (Monteregian Hills) with >400 confirmed mineral species and type locality for serandite, polylithionite, and numerous rare Na-Mn-Li silicates; the most mineralogically diverse locality in Canada. Quarry access is licensed by the Bourque family; occasional controlled collecting trips produce material for the specialty mineral market. Serandite (pink Mn-Na pectolite), gem natrolite, and eudialyte var. are the primary market highlights." },

  { id: "canada_bancroft", name: "Bancroft District", location: "Hastings County, Ontario, Canada", continent: "North America",
    status: "limited", significance: "world_class",
    knownFor: ["titanite","apatite","calcite","uraninite","phlogopite","allanite"],
    localityRaritySuggested: 75,
    note: "Grenvillian metacarbonate and pegmatite district producing world-class titanite (sphene) crystals—wedge-form honey-yellow to brown with gem transparency—and gem-quality apatite (blue-green). Uranium minerals (uraninite) require radiation safety compliance; phlogopite books are the most accessible collector product. Titanite from Bancroft remains undervalued in the Asian collector market relative to its European and North American appreciation." },

  { id: "canada_sullivan_mine", name: "Sullivan Mine", location: "Kimberley, East Kootenay, British Columbia, Canada", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["galena","sphalerite","siderite","pyrrhotite","pyrite"],
    localityRaritySuggested: 85,
    note: "Proterozoic SEDEX Pb-Zn-Ag deposit—the world's largest SEDEX deposit by total metal—closed in 2001. Galena specimens from Sullivan show unusual elongate crystal habit reflecting the Proterozoic stratiform ore texture; pyrrhotite on matrix is an accessible byproduct. Scientific significance is paramount—Sullivan defined the SEDEX deposit model. Collector-quality material is primarily from the pre-2001 mining era held in British Columbian and Alberta collections." },

  { id: "canada_sudbury_basin", name: "Sudbury Basin", location: "Greater Sudbury, Ontario, Canada", continent: "North America",
    status: "active", significance: "exceptional",
    knownFor: ["pentlandite","chalcopyrite","pyrrhotite","millerite","cubanite","sperrylite"],
    localityRaritySuggested: 65,
    note: "Ni-Cu-PGE deposit in meteorite impact-modified Archean crust (Sudbury Igneous Complex); the impact-triggered magmatic event is unique globally. Sperrylite (PtAs₂)—type locality in the Worthington Mine—is the most mineralogically significant collector product; millerite hairlike crystals on chalcopyrite matrix are the most aesthetically distinctive. Active Vale and Glencore mining; specimens are incidental recoveries." },

  { id: "usa_butte_montana", name: "Butte (Anaconda Copper) Mine", location: "Silver Bow County, Montana, USA", continent: "North America",
    status: "closed", significance: "world_class",
    knownFor: ["bornite","chalcocite","enargite","covellite","tetrahedrite","pyrite"],
    localityRaritySuggested: 82,
    note: "Porphyry Cu supergene deposit with epithermal overprint; the world's largest historic Cu district (the 'richest hill on Earth') and notable for iridescent 'peacock' bornite, blue covellite crystals, and a complete Cu mineral paragenetic sequence. Closed for specimen mining; the Berkeley Pit (Superfund site) dominates the landscape. Pre-1970s material from the underground mines is the benchmark; Butte covellite hexagonal plates with strong blue luster are the defining North American Cu mineral." },

  { id: "usa_leadville_colorado", name: "Leadville", location: "Lake County, Colorado, USA", continent: "North America",
    status: "closed", significance: "exceptional",
    knownFor: ["cerussite","galena","anglesite","sphalerite","malachite","hemimorphite"],
    localityRaritySuggested: 78,
    note: "MVT-proximal Pb-Zn-Ag replacement deposit in Paleozoic carbonate; historically one of the US's most productive Ag-Pb districts. Cerussite of various habits (tabular, acicular) and galena crystals with complex faces are the primary collector targets. Good Leadville galena and cerussite specimens are undervalued relative to European equivalents and represent an underappreciated category of US classic minerals." },

  // ── SOUTH AMERICA (additional) ───────────────────────────────────────────────────────

  { id: "brazil_ouro_preto", name: "Ouro Preto Imperial Topaz Mines (Capão Mine / Boa Vista)", location: "Minas Gerais, Brazil", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["imperial topaz","chrysoberyl","alexandrite"],
    localityRaritySuggested: 80,
    note: "Metasomatic topaz-phlogopite deposit in Neoproterozoic quartzite and the world's only significant source of 'Imperial' topaz—golden to pink-orange crystals colored by Cr substitution, uniquely distinct from colorless or blue topaz. The Capão Mine produces the defining gem material; sherry to cognac colors are the most commercial, deep orange-pink ('precious' Imperial) commands the highest premiums. Natural-color Imperial topaz is easily irradiated to mimic the rarest pink hues—origin GIA/AGL certification is recommended." },

  { id: "brazil_cruzeiro", name: "Cruzeiro Mine", location: "São José da Safira, Minas Gerais, Brazil", continent: "South America",
    status: "limited", significance: "world_class",
    knownFor: ["elbaite","rubellite","indicolite","polychrome tourmaline","beryl"],
    localityRaritySuggested: 82,
    note: "Granitic pegmatite with historic production of world-class polychrome and rubellite elbaite; large saturated-red rubellite crystals with minimal iron-induced darkening from Cruzeiro are benchmark specimens. Production has been intermittent since the 1990s; finest material from the 1960s–1980s extraction is primarily in Brazilian and North American private collections. Current market supply is largely from estate dispersal." },

  { id: "brazil_jonas_mine", name: "Jonas Mine (Mina Jonas)", location: "Galiléia / Conselheiro Pena, Minas Gerais, Brazil", continent: "South America",
    status: "limited", significance: "world_class",
    knownFor: ["morganite","aquamarine","beryl","tourmaline"],
    localityRaritySuggested: 85,
    note: "Granitic pegmatite and source of the world's largest documented gem-quality morganite crystal (the 'Rose of Maine' analog at ~300 kg; now in the Royal Ontario Museum). Morganite of caliber and size unmatched by any other locality. Active access is controlled by private owners; significant pieces enter the market only via major auction houses. Top gem-pink morganite from Jonas is distinguished by natural unheated color—treatment by gamma irradiation is common in the trade." },

  { id: "brazil_fazenda_morrinhos", name: "Fazenda Morrinhos / Passa Três", location: "Nova Era / Ferros, Minas Gerais, Brazil", continent: "South America",
    status: "limited", significance: "world_class",
    knownFor: ["alexandrite","chrysoberyl","cat's eye chrysoberyl"],
    localityRaritySuggested: 82,
    note: "Biotite schist-hosted chrysoberyl deposit producing the world's finest alexandrite (Cr³⁺-bearing chrysoberyl with color-change from green in daylight to red in incandescent light); large crystals with strong color change are the premier alexandrite in the gem trade. Heat treatment is uncommon for alexandrite but synthetic and lab-grown equivalents (Czochralski) dominate the commercial market—natural Brazilian alexandrite >1 ct with strong change requires laboratory documentation." },

  { id: "brazil_araucai", name: "Araçuaí District (Itinga, Virgem da Lapa, Coronel Murta)", location: "Jequitinhonha Valley, Minas Gerais, Brazil", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["elbaite","kunzite","spodumene","morganite","beryl","lepidolite","columbite"],
    localityRaritySuggested: 68,
    note: "Li-pegmatite district in Neoproterozoic basement producing the largest gem kunzite crystals commercially available; the 'Lavra da Ilha' and associated named pockets periodically yield extraordinary polychrome tourmaline. Kunzite from Araçuaí is typically large and heavily included; gem-clean facetable material is proportionally scarce. Spodumene fades irreversibly under UV—light exposure history is critical for value assessment." },

  { id: "brazil_diamantina", name: "Diamantina", location: "Minas Gerais, Brazil", continent: "South America",
    status: "active", significance: "exceptional",
    knownFor: ["diamond","topaz","tourmaline","mica"],
    localityRaritySuggested: 68,
    note: "Alluvial and Proterozoic conglomeratic diamond district that supplied the world's diamond market from 1720 until Kimberley's 1871 discovery. Historically significant for producing naturally colored fancy diamonds (canary yellow, brown, green). Current artisanal production is modest; colorless diamond crystal specimens in matrix are available but the primary collector interest is provenance and historical documentation." },

  { id: "brazil_ametista_do_sul", name: "Ametista do Sul / Iraí District", location: "Rio Grande do Sul, Brazil", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["amethyst","smoky quartz","agate"],
    localityRaritySuggested: 55,
    note: "Triassic Serra Geral basalt amygdule system and the world's single largest amethyst exporter by volume; Brazil produces >95% of global gem amethyst. Quality across the district is highly variable; the deepest 'Vera Cruz' and 'Rose of France' color saturations are a small fraction of output. Massive geode production means locality labeling is reliable but price discrimination for quality is essential—color grade far outweighs locality in value determination here." },

  { id: "brazil_carnaiba", name: "Carnaíba / Socotó / Anagé Emerald District", location: "Bahia, Brazil", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["emerald","alexandrite","biotite schist"],
    localityRaritySuggested: 75,
    note: "Phlogopite/biotite schist-hosted hydrothermal emerald with Cr-V chromophore; Brazilian emerald is typically more included than Colombian but Carnaíba produces the most commercially significant Brazilian stones. Carnaíba matrix specimens with multiple crystals on phlogopite are the top collector form. Cedar oil filling and resin fracture-filling are ubiquitous in the trade—request clarity enhancement disclosure." },

  { id: "colombia_muzo", name: "Muzo Mine", location: "Boyacá Department, Colombia", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["emerald","calcite","albite","pyrite"],
    localityRaritySuggested: 82,
    note: "Hydrothermal vein in organic-rich carbonaceous shale ('black shale' albite-calcite-pyrite) and the world benchmark for emerald quality—'Muzo green' (deep blue-green, high saturation) is the standard by which all emerald is judged. The finest Muzo stones contain three-phase inclusions ('jardin') that facilitate origin identification. Armed conflict history and cartel involvement require careful supply-chain due diligence; GIA/Gübelin origin reports are standard practice for >1 ct stones." },

  { id: "colombia_chivor", name: "Chivor (Somondoco) Mine", location: "Boyacá Department, Colombia", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["emerald","pyrite","calcite"],
    localityRaritySuggested: 82,
    note: "Hydrothermal vein system producing the original 'Somondoco' emerald of the Aztec/Inca trade; Chivor stones typically show slightly bluer hue than Muzo with characteristic pyrite cubes in matrix. The defining 'trapiche' emerald specimen type—sector-zoned with carbonaceous spokes—occurs with highest frequency at Chivor. Origin-certified Chivor emeralds in matrix are important scientific and collector objects." },

  { id: "bolivia_llallagua", name: "Llallagua (Catavi) Mine", location: "Potosí Department, Bolivia", continent: "South America",
    status: "closed", significance: "world_class",
    knownFor: ["cassiterite","hübnerite","sphalerite","stannite"],
    localityRaritySuggested: 85,
    note: "Hydrothermal Sn vein in Miocene porphyry and the world-standard locality for cassiterite crystal perfection—brilliant red-brown bipyramidal and prismatic crystals to 10+ cm. Closed for major mining; intermittent artisanal access. The finest cassiterite from Llallagua surpasses all other localities in crystal size and clarity; demand significantly exceeds available supply. Huanuni Mine material is occasionally mislabeled as Llallagua." },

  { id: "peru_huancavelica", name: "Huancavelica Mine", location: "Huancavelica Region, Peru", continent: "South America",
    status: "closed", significance: "world_class",
    knownFor: ["cinnabar","native mercury","metacinnabar"],
    localityRaritySuggested: 82,
    note: "Historic Hg mine operating since pre-Columbian era (Inca use for cinnabar pigment) and one of the world's foremost cinnabar localities; large gem-red prismatic crystals on calcite matrix are definitive reference specimens. Closed for commercial production; all market material is secondary. Mercury minerals require careful handling (no bare skin contact) and documentation for shipping under hazmat regulations." },

  { id: "chile_chuquicamata", name: "Chuquicamata", location: "Antofagasta Region, Chile", continent: "South America",
    status: "active", significance: "world_class",
    knownFor: ["antlerite","brochantite","atacamite","krohnkite","linarite","blödite","chalcanthite"],
    localityRaritySuggested: 72,
    note: "World's largest open-pit mine (by excavated volume) and porphyry Cu-Mo deposit with the most extensive supergene Cu mineral suite on Earth; type locality for antlerite and reference for krohnkite, blödite, and atacamite. The hyperarid Atacama creates unique Cl-sulfate secondary mineral stability fields not found elsewhere. Active CODELCO mining; incidental specimen recovery occurs in blasting programs." },

  { id: "chile_torrecillas", name: "Torrecillas Mine", location: "Iquique Province, Tarapacá, Chile", continent: "South America",
    status: "closed", significance: "world_class",
    knownFor: ["olivenite","cornwallite","clinoclase","libethenite"],
    localityRaritySuggested: 88,
    note: "Oxidized Cu vein in hyperarid environment and IMA type/co-type locality for multiple Cu arsenate and phosphate species; one of the most mineralogically important small mines in South America. Closed; specimens are from limited historical collection periods. Mineralogically significant primarily for systematists studying Cu secondary mineral diversity in a hyperarid geochemical setting—rarity of locality label is very high." },

  { id: "chile_chanarcillo", name: "Chanarcillo District", location: "Atacama Region, Chile", continent: "South America",
    status: "closed", significance: "world_class",
    knownFor: ["native silver","acanthite","polybasite","chlorargyrite"],
    localityRaritySuggested: 92,
    note: "Epithermal Ag-rich veins and one of the Americas' premier 19th-century silver localities; wire silver and acanthite specimens rivaled Kongsberg in mass, though fewer large crystals were documented. Closed long-term; all material predates 1900. Chilean silver from Chanarcillo is underrepresented in North American and Asian collections relative to its historical importance—a gap presenting acquisition opportunity." },

  { id: "chile_la_farola", name: "La Farola Mine", location: "Tierra Amarilla, Atacama Region, Chile", continent: "South America",
    status: "closed", significance: "world_class",
    knownFor: ["linarite","caledonite","brochantite"],
    localityRaritySuggested: 90,
    note: "Cu-Pb oxidized vein producing the world benchmark for linarite crystal quality—deep cobalt-blue monoclinic prismatic crystals with extraordinary color saturation on white matrix. Linarite from all other localities is compared to La Farola material. Closed; specimens enter the market exclusively through estate sales and Chilean dealer dispersal. Any linarite matrix specimen >5 cm crystal with undamaged terminations from this locality is a significant acquisition." },

  // ── EUROPE (additional) ──────────────────────────────────────────────────────────────

  { id: "sweden_ytterby", name: "Ytterby Mine", location: "Resarö Island, Stockholm Archipelago, Sweden", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["gadolinite-(Y)","tantalite-(Fe)","yttrotantalite","euxenite-(Y)","yttrialite"],
    localityRaritySuggested: 96,
    note: "Granitic pegmatite and the single most element-discovery-dense locality in mineralogical history: Y, Yb, Er, Tb, Ho, Tm, Dy, Sc, Nb, and Ta were all first identified in minerals from this quarry. Closed and now a Swedish heritage landmark. Authentic Ytterby gadolinite or tantalite specimens are essentially museum-only items; any appearing at auction should be treated with extreme skepticism without institutional provenance." },

  { id: "norway_kongsberg", name: "Kongsberg Silver Mines", location: "Numedal, Viken, Norway", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["native silver","acanthite","calcite","dyscrasite"],
    localityRaritySuggested: 97,
    note: "Epithermal Ag veins in Proterozoic gneiss that produced the world's most extraordinary native silver specimens—arborescent and wire masses to tens of kilograms with unrivaled crystallographic perfection. Closed as a mine in 1958; the finest pieces are in Norwegian state collections and European royalty holdings. Market appearance of any significant Kongsberg native silver warrants extensive due diligence; forgeries and incorrect locality attributions exist." },

  { id: "russia_khibiny", name: "Khibiny Massif", location: "Kola Peninsula, Murmansk Oblast, Russia", continent: "Europe",
    status: "active", significance: "world_class",
    knownFor: ["eudialyte","titanite","apatite","loparite-(Ce)","lamprophyllite","rinkite","nepheline"],
    localityRaritySuggested: 72,
    note: "Agpaitic nepheline syenite intrusion with >500 confirmed mineral species—the world's most mineralogically diverse single igneous body. Industrial apatite and nepheline mining continues, incidentally producing exceptional titanite (lovchorrite var.) and eudialyte specimens. Russian export controls fluctuate; supply to western markets has been constrained since 2022. Gem-quality apatite crystals (deep blue-green) are the most coveted collector items." },

  { id: "russia_lovozero", name: "Lovozero Massif", location: "Kola Peninsula, Murmansk Oblast, Russia", continent: "Europe",
    status: "active", significance: "world_class",
    knownFor: ["lorenzenite","murmanite","ussingite","steenstrupine","natrolite","arfvedsonite"],
    localityRaritySuggested: 78,
    note: "Stratified agpaitic layered complex with ~300 species, including numerous rare Na-Zr-Ti silicates available nowhere else. Karnasurt Mine exploitation provides periodic market material but access is highly restricted. Lorenzenite, murmanite, and ussingite are essentially Lovozero-exclusive and any quality specimens are significant additions to a systematic collection." },

  { id: "russia_malkhan", name: "Malkhan Pegmatite Field", location: "Zabaykalsky Krai, Russia", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["elbaite","rubellite","indicolite","polychrome tourmaline","spessartine","lepidolite"],
    localityRaritySuggested: 80,
    note: "Granitic pegmatite field producing some of the finest gem-quality rubellite and polychrome elbaite in the world; the hot-pink rubellite from Malkhan rivals Brazilian material and commands comparable prices. Production has been irregular and often absorbed into Russian gem trade before reaching international collectors. Best pieces emerged in the 1990s–2000s; post-2022 market access has diminished." },

  { id: "russia_nizhny_tagil", name: "Nizhny Tagil District", location: "Sverdlovsk Oblast, Ural, Russia", continent: "Europe",
    status: "active", significance: "world_class",
    knownFor: ["uvarovite","chromite","native platinum","isoferroplatinum"],
    localityRaritySuggested: 80,
    note: "Cr-bearing dunite and peridotite producing world-standard uvarovite (finest chrome-green garnet microcrystalline druzy on chromite) and historically the source of the finest large native platinum nuggets and isoferroplatinum crystals. Platinum group metal specimens of Ural provenance are strictly regulated under Russian law; any significant PGM nugget offered outside Russian institutional channels requires careful legal vetting." },

  { id: "russia_ilmen_mountains", name: "Ilmen Mountains Nature Reserve", location: "Chelyabinsk Oblast, Southern Ural, Russia", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["amazonite","columbite-(Fe)","zircon","fluorapatite","scapolite","phlogopite"],
    localityRaritySuggested: 85,
    note: "Alkaline pegmatite complex with >100 species now protected as a Federal Nature Reserve; all collecting is prohibited. Pre-reserve specimens (pre-1935 designation) in European museum collections represent the available universe. Amazonite of vivid blue-green and naturally terminated columbite-(Fe) prisms are the most sought; deep blue to violet scapolite crystals are undervalued." },

  { id: "russia_slyudyanka", name: "Slyudyanka", location: "Irkutsk Oblast, Lake Baikal, Russia", continent: "Europe",
    status: "active", significance: "world_class",
    knownFor: ["lazurite","phlogopite","diopside","spinel","scapolite","calcite"],
    localityRaritySuggested: 72,
    note: "Calcite-phlogopite marble contact zone producing the highest-metamorphic-grade lapis lazuli (lazurite in calcite), distinctly different in matrix character from Afghan material. Gem-quality phlogopite books and pale blue spinel crystals are accessible market items. Lazurite-in-calcite matrix specimens are underpriced relative to Afghan sar-e-sang material in western markets." },

  { id: "greenland_ilimaussaq", name: "Ilimaussaq Complex", location: "Kujalleq, Greenland", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["tugtupite","eudialyte","sorensenite","steenstrupine","ussingite","kvanefjeldite"],
    localityRaritySuggested: 88,
    note: "Agpaitic nepheline syenite intrusion and type locality for tugtupite (intensely fluorescent red-pink), eudialyte var., and ~250 species. Access is restricted and the proposed Kvanefjeld uranium mining project remains highly contested. Tugtupite of gem clarity and deep color is one of the rarest and most distinctive collector minerals; specimens from the 1960s–1990s Danish geological survey era are the most reliable." },

  { id: "czech_jachymov", name: "Jáchymov (Joachimsthal)", location: "Karlovy Vary Region, Erzgebirge, Czech Republic", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["uraninite","erythrite","nickeline","bismuth","acanthite","native silver"],
    localityRaritySuggested: 95,
    note: "Ag-U-Co-Ni-Bi hydrothermal vein district and the source of Marie Curie's pitchblende; the definitive historic locality for radioactive mineral species and 5-element vein assemblages. All material is radioactive; legal ownership and transport requires compliance with national radiation safety regulations. Pre-WWII museum specimens are the highest-quality items and are essentially unavailable commercially." },

  { id: "germany_schneeberg", name: "Schneeberg", location: "Erzgebirge, Saxony, Germany", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["erythrite","cobaltite","skutterudite","native silver","bismuth","proustite","acanthite"],
    localityRaritySuggested: 95,
    note: "Historic Ag-Co-Ni-Bi-U hydrothermal district and the world's type reference for erythrite ('cobalt bloom'), with specimens in European institutions dating to the 16th century. Closed long-term; virtually all circulating specimens originate from 19th–early 20th century collection periods. Fine erythrite on arsenide matrix with brilliant violet color is among the most valued classic European mineral specimens." },

  { id: "germany_st_andreasberg", name: "St. Andreasberg", location: "Harz, Lower Saxony, Germany", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["pyrargyrite","proustite","acanthite","native silver","calcite"],
    localityRaritySuggested: 93,
    note: "Epithermal Ag-Pb vein deposit producing what are considered the world's finest pyrargyrite crystals—deep-red scalenohedral forms to 3+ cm on calcite matrix are the ideal specimen. Proustite crystals of comparable quality are extremely rare on the open market. All material predates 20th century; provenanced St. Andreasberg specimens frequently carry historical German mineral dealer labels which are themselves collectible." },

  { id: "austria_zillertal", name: "Zillertal", location: "Tyrol, Austria", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["adularia","smoky quartz","chlorite","albite","epidote","byssolite","magnetite"],
    localityRaritySuggested: 75,
    note: "Alpine cleft system in micaschist and phyllite yielding the paradigmatic alpine mineral assemblage; 'Zillertal-type' adularia and chlorite-jacketed smoky quartz specimens defined 19th-century collector aesthetics. Licensed Strahler (alpine crystal hunter) activity continues; material periodically enters the Austrian and German show circuit. Chlorite-included smoky quartz 'phantom' crystals are increasingly desirable." },

  { id: "austria_knappenwand", name: "Knappenwand", location: "Untersulzbachtal, Salzburg, Austria", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["epidote","titanite","quartz","albite"],
    localityRaritySuggested: 85,
    note: "Alpine cleft in calc-silicate schist and the world type reference for gem epidote ('pistacite' var.); exceptional bottle-green prismatic crystals on white matrix define the species aesthetically. Now protected within a national park; collecting prohibited. Pre-protection specimens are in Austrian institutional collections; any authentic Knappenwand epidote on the market is immediately significant." },

  { id: "austria_habachtal", name: "Habachtal", location: "Oberpinzgau, Salzburg, Austria", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["emerald","alexandrite","phlogopite","biotite schist"],
    localityRaritySuggested: 85,
    note: "The only significant European emerald deposit; biotite-schist-hosted Cr-bearing beryl with characteristic inclusions ('jardin') allowing origin identification. Legally accessible under permit for small-scale seasonal collecting; production is extremely limited. Habachtal emerald-in-schist matrix specimens are highly regarded by European collectors and command strong premiums over loose stones of comparable quality." },

  { id: "austria_bleiberg", name: "Bleiberg Mine", location: "Carinthia, Austria", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["cerussite","hemimorphite","sphalerite","galena","pyromorphite"],
    localityRaritySuggested: 88,
    note: "MVT Pb-Zn carbonate deposit in Triassic dolomite and the world-reference locality for cerussite crystal form diversity—twinned, reticulated, and tabular habits from this mine anchor systematic cerussite collections globally. Closed in 2004; all material is secondary. Excellent tabular cerussite on matrix from Bleiberg remains the benchmark against which other cerussite localities are judged." },

  { id: "italy_elba", name: "Elba Island (San Piero in Campo / Campiglia)", location: "Tuscan Archipelago, Tuscany, Italy", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["elbaite","pyrite","hematite","topaz","beryl","orthoclase"],
    localityRaritySuggested: 80,
    note: "Granite pegmatite and contact aureole producing the type locality for elbaite (tourmaline group species named for the island), perfect pyrite cubes, and iron-rose hematite; a foundational locality in European mineralogy. Intermittent artisanal access; production is unpredictable. Elbaite matrix specimens are rare relative to the species' worldwide occurrence; pyrite cubes to 10 cm remain commercially accessible through Italian dealers." },

  { id: "italy_vesuvius", name: "Vesuvius / Monte Somma", location: "Campania, Italy", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["leucite","vesuvianite","gehlenite","wollastonite","sanidine","native sulfur","humite"],
    localityRaritySuggested: 88,
    note: "Volcanic fumarolic and thermally metamorphosed limestone xenolith environment; type or definitive locality for >20 species including vesuvianite (named for the volcano) and leucite. Last major eruptive fumarolic activity 1944; no new specimens produced. Pre-WWII Italian and German institutional specimens define the benchmark; fumarolic sulfur and sanidine sanidine specimens from the 1860–1920 period are most coveted." },

  { id: "greece_laurion", name: "Laurion (Lavrio) District", location: "Attica, Greece", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["anglesite","cerussite","laurionite","penfieldite","mimetite","diaboleite","phosgenite","caledonite"],
    localityRaritySuggested: 92,
    note: "Ancient Pb-Ag-Zn mining district (active since ~3000 BCE) in marble and skarn, and the world's foremost locality for rare Pb-oxychloride and Pb-oxysulfate species—>50 type minerals in total. Closed for commercial mining; the oxidized zone dumps have been collected since the 19th century. Laurionite, penfieldite, and phosgenite of good crystal quality are still encountered in European mineral markets, often from old French and German collections." },

  { id: "romania_baia_mare", name: "Baia Mare District (Cavnic, Baia Sprie, Herja)", location: "Maramureș County, Romania", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["rhodochrosite","stibnite","galena","sphalerite","jamesonite","pyrargyrite"],
    localityRaritySuggested: 80,
    note: "Epithermal Au-Ag-Pb-Zn volcanic-hosted district producing stalactitic rhodochrosite that is second only to Peru's Uchucchacua in color saturation; Cavnic rhodochrosite is especially prized for bright cherry-red crystal-lined stalactites. Mining has largely ceased; Romania's EU integration has constrained informal specimen extraction. Supply has tightened since 2010 and prices have risen proportionally." },

  { id: "romania_sacaramb", name: "Săcărâmb (Nagyág)", location: "Hunedoara County, Romania", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["nagyágite","sylvanite","petzite","tellurobismuthite","native gold","calaverite"],
    localityRaritySuggested: 92,
    note: "Type and world-definitive locality for nagyágite (Pb-Au-Te layered sulfosalt), the first recognized gold telluride mineral; virtually the entire authenticated nagyágite specimen pool originated here. Closed long-term; specimens in Romanian, Austrian, and Hungarian national collections are the benchmark. Any nagyágite or authenticated Săcărâmb telluride specimen on the market commands strong specialist premiums." },

  { id: "rogerley_mine_uk", name: "Rogerley Mine", location: "Weardale, County Durham, England, UK", continent: "Europe",
    status: "limited", significance: "world_class",
    knownFor: ["fluorite","calcite","baryte"],
    localityRaritySuggested: 82,
    note: "MVT fluorite vein in Carboniferous limestone; Rogerley fluorite is unique for its strongly daylight-fluorescent green color (fluorescence visible under ambient daylight, not just UV) and deep purple-green cubic crystals. Controlled access by a private owner with occasional permitted collecting; material enters the market through the British mineral show circuit. Rogerley fluorite has become one of the most actively appreciated fluorite localities globally since 2005 with corresponding price escalation." },

  { id: "chessy_les_mines_france", name: "Chessy-les-Mines", location: "Rhône, Auvergne-Rhône-Alpes, France", continent: "Europe",
    status: "closed", significance: "world_class",
    knownFor: ["azurite","cuprite","malachite","native copper"],
    localityRaritySuggested: 95,
    note: "Historic Cu vein deposit and eponymous type locality for 'chessylite' (azurite), the species' original mineralogical name; produced azurite and cuprite specimens of exceptional quality through the 19th century. Closed long-term; all material is from the pre-1880 extraction period. Authentic Chessy azurite specimens bearing French mineralogical society or 19th-century dealer labels are historical objects as much as mineral specimens and command corresponding premiums." },

  { id: "france_chessy_analog_la_croix", name: "Langesundsfjord", location: "Telemark / Vestfold, Norway", continent: "Europe",
    status: "closed", significance: "exceptional",
    knownFor: ["eudialyte","catapleiite","pectolite","apatite","thorite","fluorite"],
    localityRaritySuggested: 80,
    note: "Nepheline syenite pegmatite in the Larvik plutonic complex; type locality for catapleiite and historically important for eudialyte and gem apatite specimens. Closed quarry; specimens are from 19th–early 20th century Norwegian geological survey collection periods. Catapleiite (Zr-phyllosilicate) specimens of good crystal form are a specialty item essentially exclusive to this and the Kola/Greenland alkaline systems." },

  // ── ASIA / PACIFIC (additional) ──────────────────────────────────────────────────────

  { id: "pakistan_swat_emerald", name: "Swat / Mingora Emerald District", location: "Khyber Pakhtunkhwa, Pakistan", continent: "Asia / Pacific",
    status: "limited", significance: "world_class",
    knownFor: ["emerald","tourmaline","aquamarine","spodumene"],
    localityRaritySuggested: 72,
    note: "Biotite-schist-hosted hydrothermal emerald deposit producing deeply colored crystals on dark mica matrix; Swat emeralds have lower inclusion density than Panjshir material and are highly regarded by European collectors. Production interrupted periodically by regional security conditions. Matrix specimens with >2 cm crystals on fresh mica are the market benchmark; treated stones are common—UV fluorescence and spectroscopic testing recommended." },

  { id: "afghanistan_sare_sang", name: "Sar-e-Sang", location: "Badakhshan Province, Afghanistan", continent: "Asia / Pacific",
    status: "limited", significance: "world_class",
    knownFor: ["lazurite","lapis lazuli","pyrite","calcite","diopside","forsterite"],
    localityRaritySuggested: 80,
    note: "The world's oldest continuously mined mineral locality (>6,000 years; documented Sumerian/Egyptian imports from ~3000 BCE), and still the dominant source for the highest-quality lapis lazuli. Contact metamorphic lazurite in white calcite matrix with pyrite is the type specimen form. Political instability under Taliban governance has disrupted regulated export; verify CITES/country-of-origin documentation to avoid conflict-mineral issues." },

  { id: "afghanistan_nuristan_tourmaline", name: "Nuristan Province Pegmatite Belt", location: "Nuristan Province, Afghanistan", continent: "Asia / Pacific",
    status: "limited", significance: "world_class",
    knownFor: ["elbaite","rubellite","kunzite","morganite","aquamarine","hiddenite"],
    localityRaritySuggested: 85,
    note: "Granitic pegmatite belt producing some of the world's finest gem-quality tourmaline (intense rubellite, chrome-green 'Afghan' color) and large kunzite crystals; material surfaced in western markets primarily during the 1980s mujahideen era and again sporadically post-2001. Supply is geopolitically constrained and irregular. Afghan rubellite and kunzite from documented pre-conflict collections command strong premiums; recent material requires careful ethical sourcing review." },

  { id: "afghanistan_panjshir_emerald", name: "Panjshir Valley Emerald Deposits", location: "Panjshir Province, Afghanistan", continent: "Asia / Pacific",
    status: "limited", significance: "world_class",
    knownFor: ["emerald","calcite","phengite"],
    localityRaritySuggested: 82,
    note: "Hydrothermal emerald in carbonate-mica schist producing intensely saturated Cr-V chromophore crystals often with minimal jardin relative to Colombian material. Production has been conflict-interrupted for decades; most western-market material entered trade in 1980s–1990s. Panjshir emerald in matrix (carbonate or mica) is a specialty item; gemological origin testing is essential to confirm versus Colombian or Zambian material." },

  { id: "myanmar_hpakant", name: "Hpakant (Hpakan)", location: "Kachin State, Myanmar", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["jadeite","chloromelanite"],
    localityRaritySuggested: 85,
    note: "Serpentinized ultramafic sequence producing the world's only commercial-scale source of gem 'Imperial' jadeite (translucent emerald-green); material accounts for the vast majority of the global jade-carving industry centered in Yunnan and Hong Kong. Under OFAC sanctions for US importers; the 2021 Myanmar coup has intensified ethical sourcing scrutiny. Collector specimens of rough jadeite boulders with natural skin and green nucleus are a distinct collecting niche." },

  { id: "sri_lanka_ratnapura", name: "Ratnapura Gem Gravels", location: "Ratnapura District, Sabaragamuwa, Sri Lanka", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["sapphire","padparadscha sapphire","ruby","alexandrite","cat's eye chrysoberyl","spessartine","zircon","moonstone"],
    localityRaritySuggested: 65,
    note: "Quaternary gem-bearing eluvial and alluvial gravels (illam) derived from Precambrian metamorphic basement; virtually every major gemstone species is represented. Padparadscha sapphire (unique pink-orange corundum) and cat's eye chrysoberyl of top chatoyancy are Sri Lanka's most distinctive trade contributions. Color treatment of sapphire (beryllium diffusion, heat) is endemic in the trade—laboratory testing by recognized authority is essential." },

  { id: "india_golconda", name: "Golconda Region (historic alluvials)", location: "Andhra Pradesh / Telangana, India", continent: "Asia / Pacific",
    status: "closed", significance: "world_class",
    knownFor: ["diamond"],
    localityRaritySuggested: 99,
    note: "Historic alluvial and fluvial diamond gravels in the Krishna-Godavari basin; the source of the Koh-i-Noor, Hope Diamond, Regent Diamond, and Orlov Diamond—effectively the entire pre-18th-century world diamond supply. No commercial production since the 18th century. 'Golconda' as a diamond trade descriptor today refers to Type IIa colorless or blue historical Indian diamonds of extraordinary transparency—the term is frequently misapplied and requires strict gemological confirmation." },

  { id: "india_zawar", name: "Zawar Mines", location: "Udaipur District, Rajasthan, India", continent: "Asia / Pacific",
    status: "active", significance: "notable",
    knownFor: ["sphalerite","galena","smithsonite","calcite"],
    localityRaritySuggested: 70,
    note: "World's oldest documented zinc smelting complex (dating to ~9th century CE) in MVT carbonate-hosted Pb-Zn; mineralogically significant primarily for its archaeomineralogical context rather than specimen quality. Active industrial Zn mining continues; collector specimens are a minor byproduct. Of interest to collectors focused on historic mineral extraction and archival context." },

  { id: "kashmir_sapphire", name: "Sumjam / Kudi Mine", location: "Zanskar Range, Jammu & Kashmir, India", continent: "Asia / Pacific",
    status: "closed", significance: "world_class",
    knownFor: ["sapphire"],
    localityRaritySuggested: 99,
    note: "The world's most coveted sapphire origin: cornflower-blue corundum in metamorphic marble matrix with the characteristic 'velvety' light diffusion caused by oriented rutile micro-exsolution. Peak production 1881–1887; no commercial extraction since the early 20th century. Kashmir sapphire commands a 40–60% premium over equivalent Burma material at auction; GIA/Gübelin origin certification is mandatory for any transaction. Forgeries and origin misattribution are rampant." },

  { id: "china_xikuangshan", name: "Xikuangshan Mine", location: "Lengshuijiang, Hunan, China", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["stibnite","berthierite","kermesite","valentinite"],
    localityRaritySuggested: 65,
    note: "World's largest Sb deposit and the definitive locality for stibnite crystal perfection—striated orthorhombic prisms to >60 cm are the global benchmark. Active mining continues; the challenge is that most large crystals are now trimmed, repaired, or composite. Scrutinize terminations and edge integrity closely; unrepaired cabinet specimens >20 cm with natural matrix are substantially more valuable and increasingly rare." },

  { id: "china_shimen", name: "Shimen County", location: "Changde, Hunan, China", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["realgar","orpiment","pararealgar"],
    localityRaritySuggested: 62,
    note: "Hydrothermal As vein district producing the world-finest realgar (brilliant red short prismatic crystals) and gold-foliate orpiment specimens currently on market. Both minerals are inherently unstable in light: realgar converts to pararealgar (orange-yellow powder) and orpiment bleaches under UV. Store specimens in UV-blocking containers in darkness; do not display under halogen or LED spotlights." },

  { id: "china_bayan_obo", name: "Bayan Obo Mine", location: "Inner Mongolia Autonomous Region, China", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["bastnäsite-(Ce)","monazite-(Ce)","aeschynite","ancylite","samarskite"],
    localityRaritySuggested: 55,
    note: "World's largest REE deposit by reserve, hosted in Proterozoic carbonatite-dolomite-dominated ore body; a critical resource for understanding REE mineral paragenesis. Industrial extraction dominates; collector specimens of well-crystallized bastnäsite-(Ce) and ancylite are available but underrepresented in western collections. Scientifically among the most important mineral localities of the 20th–21st centuries." },

  { id: "australia_lightning_ridge", name: "Lightning Ridge", location: "New South Wales, Australia", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["black opal"],
    localityRaritySuggested: 78,
    note: "Cretaceous-aged opaline silica-in-mudstone and the world's only reliable source for black opal (precious opal on dark potch); top-quality 'n1' black body color with full spectral play-of-color are among the highest per-carat gemstones. The Lightning Ridge opal field operates under a licensing system; production is artisanal. 'Doublet' and 'triplet' opal composites are ubiquitous in the market—confirm natural solid status before purchase." },

  { id: "australia_coober_pedy", name: "Coober Pedy", location: "South Australia, Australia", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["white opal","crystal opal"],
    localityRaritySuggested: 68,
    note: "World's dominant white and crystal opal source; Cretaceous Bulldog Shale hosted precious silica with lighter body color than Lightning Ridge. Crystal opal (transparent body) with broad spectral play-of-color from Coober Pedy represents the category optimum for this type. The market is saturated with lower grades; top crystal and white opal with 'rolling flash' pattern commands significant premiums." },

  { id: "australia_argyle", name: "Argyle Mine (AK1 Lamproite Pipe)", location: "East Kimberley, Western Australia, Australia", continent: "Asia / Pacific",
    status: "closed", significance: "world_class",
    knownFor: ["pink diamond","red diamond","brown diamond","olivine lamproite"],
    localityRaritySuggested: 92,
    note: "Olivine lamproite pipe (not kimberlite—mineralogically distinct) and the world's dominant source of pink and red diamonds; closed October 2020. Argyle pink diamonds (5pp+/- to 9P on the Argyle scale) have appreciated >300% post-closure; red Argyle diamonds are arguable the world's most valuable per-carat gem material. Rio Tinto's certificate of authenticity and provenance chain are essential—forgeries are now appearing." },

  { id: "australia_kalgoorlie", name: "Kalgoorlie Golden Mile", location: "Goldfields-Esperance, Western Australia, Australia", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["calaverite","krennerite","native gold","sylvanite","petzite"],
    localityRaritySuggested: 72,
    note: "Archaean mesothermal lode gold deposit within the Yilgarn Craton; historically the world's richest Au district per combined grade and tonnage. Gold telluride species (calaverite, sylvanite, krennerite) from the Golden Mile are the premier collector targets—well-crystallized calaverite on quartz from the older underground workings is museum-quality. Active open-pit operation (Super Pit); new specimen recovery is minimal compared to historical underground era." },

  { id: "tajikistan_kuh_i_lal", name: "Kuh-i-Lal (Kukhi-Lal)", location: "Gorno-Badakhshan, Tajikistan", continent: "Asia / Pacific",
    status: "limited", significance: "world_class",
    knownFor: ["spinel","gem spinel"],
    localityRaritySuggested: 85,
    note: "Marble-hosted spinel deposit in the Pamir Mountains and the historical source of 'Balas rubies'—spinel mistaken for ruby for millennia, including the Black Prince's Ruby (British Crown Jewels). Production is sporadic under difficult access conditions; gem red spinel of Tajik origin has surged in value since 2010 as spinel gained wider appreciation in the gem trade. Matrix spinel specimens are essentially unavailable commercially." },

  { id: "china_huanggang", name: "Huanggang Mine", location: "Inner Mongolia Autonomous Region, China", continent: "Asia / Pacific",
    status: "active", significance: "world_class",
    knownFor: ["fluorite","cassiterite","scheelite","wolframite","magnetite","rhodonite"],
    localityRaritySuggested: 65,
    note: "Polymetallic skarn deposit that has emerged since 2010 as a world-class fluorite locality—producing octahedral to cubic fluorite of exceptional clarity and unusual coloration (colorless, purple, green), often on scheelite matrix. Among the most actively collected new localities of the past decade. Scheelite-fluorite combinations from Huanggang have set new aesthetic standards for those species; quality control on matrix integrity is important as trimming is common." },

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