# PRISM v1.1.0
**Precision Rating Index of Specimen Minerals**

A 6-dimensional, non-linear specimen scoring system that evaluates mineral specimens across 5 weighted evaluation contexts to produce a compound classification — visualized as a spectrum of simultaneously scored qualities.

## Overview

PRISM addresses the fundamental information asymmetry problem in mineral specimen markets by making implicit expert heuristics explicit, auditable, and comparable across transactions. Unlike simple rating systems, PRISM applies dimension-specific non-linear transforms across 6 independent inputs and evaluates them simultaneously through 5 distinct context lenses — producing a compound classification (e.g. "Institutional Masterpiece") that reflects a specimen's true multi-dimensional identity rather than a single collapsed number.

### Core Purpose

- **Consumer Protection**: Enable new collectors to understand what they're buying and whether pricing is fair
- **Market Transparency**: Provide price-per-quality benchmarking against comparable specimens
- **Institutional Support**: Generate documentation for museum donations (IRS Form 8283 compliance)
- **Legal Compliance**: Track collection legality and provenance through GIS integration

## Features

### Evaluation Modes

- **Wizard Mode**: Guided step-by-step evaluation for beginners
- **Expert Mode**: Advanced interface for experienced collectors
- **Research Mode**: Comparative market analysis and pricing research

### Scoring System

#### 6 Input Dimensions

Each specimen is scored independently across six qualities:

| # | Dimension | What it measures |
|---|-----------|------------------|
| 1 | **Crystal Quality** | Symmetry, termination completeness, surface condition |
| 2 | **Species / Variety Rarity** | Relative scarcity of the mineral species or variety |
| 3 | **Locality Rarity** | Mine status, pocket frequency, auction appearance |
| 4 | **Provenance** | Documentation quality and chain of custody (T1–T5 tiers) |
| 5 | **Aesthetics** | Visual impact and display quality |
| 6 | **Scientific Value** | Research significance, type locality, emerging science |

#### Non-Linear Transforms

Raw dimension scores are passed through **dimension-specific non-linear functions** before weighting — reflecting real-world value curves where the top end is disproportionately rare:

| Dimension | Transform | Effect |
|-----------|-----------|--------|
| Aesthetics, Crystal | Power function (x^0.7) | High performers boosted; diminishing penalty at low end |
| Species Rarity, Locality Rarity | Sigmoid curve (k=3.5) | Sharp S-curve — truly exceptional rarity scores much higher than merely uncommon |
| Provenance | Asymmetric sigmoid boost | Excellent provenance earns a bonus; poor provenance is not catastrophically penalized |
| Scientific Value | One-sided sigmoid boost | Presence amplifies; absence is neutral |

#### 5 Evaluation Contexts

The same 6 transformed scores are then weighted differently across 5 independent evaluation contexts. Each context answers a distinct question about the specimen:

| Context | Primary weights | Purpose |
|---------|----------------|---------|
| **Museum Specimen** | Locality rarity 25%, Provenance 25%, Species rarity 20% | Irreplaceability and documentation |
| **Display / Show** | Crystal quality 42%, Aesthetics 30% | Visual impact for exhibition |
| **Collector's Piece** | Species rarity 26%, Locality rarity 26%, Crystal 22% | Rarity-driven collector appeal |
| **Scientific Study** | Scientific value 42%, Provenance 26% | Research and educational use |
| **General Market** | Crystal quality 38%, Aesthetics 15%, Species/locality rarity ~31% | Broad retail appeal |

#### Compound Classification

When multiple contexts simultaneously pass the quality threshold (70/100), a **compound grade** emerges that describes the specimen's identity across all dimensions:

- **Institutional Masterpiece** — all 5 contexts qualify simultaneously *(once in a generation)*
- **World-Class Specimen** — museum + exhibition + collector qualify
- **Museum Display** — museum + exhibition qualify
- **Collector Display** — exhibition + collector qualify
- *(and more)*

The compound classification is the primary output of PRISM — a single number cannot capture a 6-dimensional, 5-context analysis. The spectrum bar visualization shows all 5 context results simultaneously as colored bands, one per context, glowing when that context's threshold is met.

### Additional Tools

- **Pricing Tool**: Market analysis with comparable specimen data
- **Buyer's Guide**: Educational resources for collectors
- **Evaluation Record Generator**: QR-coded, HMAC-signed evaluation records
- **Donation Evaluator**: IRS Form 8283 compliance documentation
- **Meteorite Identification**: Specialized tool for meteorite specimens
- **Collection History**: Track and manage specimen provenance

## Technical Architecture

### Frontend Stack

- **React 19.2.6**: Modern UI framework
- **Vite 8.0.12**: Fast build tool and dev server
- **Recharts**: Data visualization for market analysis
- **React Leaflet**: GIS mapping for locality and legal compliance
- **Lucide React**: Icon system
- **QRCode**: Certificate generation

### Data Structure

Specimens are evaluated using a standardized JSON schema:

```json
{
  "species": "Wulfenite",
  "locality": "Red Cloud Mine, La Paz Co., Arizona, USA",
  "sizeClass": "cabinet",
  "condition": "pristine",
  "scores": {
    "crystal": 88,
    "speciesRarity": 72,
    "localityRarity": 85,
    "provenance": 65,
    "aesthetics": 90,
    "scientific": 45
  },
  "prismScore": 83,
  "grade": "Exhibition"
}
```

### Key Design Principles

- **Species-Specific Benchmarks**: Scoring parameters are calibrated per mineral species to ensure meaningful comparisons
- **Context-Aware Weighting**: Different evaluation contexts (museum, exhibition, collector) apply different weight distributions
- **Provenance Tracking**: Date-of-collection cross-referenced with regulatory enactment dates for legal compliance
- **Market Data Integration**: Price-per-PRISM-score-unit analysis for anomaly detection

## Installation

```bash
cd prism-app
npm install
```

## Development

```bash
npm run dev
```

Starts the development server with hot module replacement.

## Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory.

## Project Structure

```
PRISM/
├── prism-app/           # React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   │   ├── PRISM.jsx           # Main application component
│   │   │   ├── WizardMode.jsx      # Guided evaluation
│   │   │   ├── ExpertMode.jsx      # Advanced interface
│   │   │   ├── ResearchMode.jsx    # Market analysis
│   │   │   ├── PricingTool.jsx     # Price benchmarking
│   │   │   ├── CertGenerator.jsx   # Certificate creation
│   │   │   ├── DonationEval.jsx    # Museum donation tool
│   │   │   └── ...
│   │   └── App.jsx
│   └── package.json
├── info/                # Documentation and reference data
│   ├── principles       # Design principles and architecture
│   └── world_class_mineral_localities.json
└── sample-research-data.json  # Example market data
```

## Data Sources

- **Mindat API** (`api.mindat.org`): Species and locality data
- **PADUS**: Protected Areas Database (US legal compliance)
- **WDPA**: World Database on Protected Areas (international)
- **Market Data**: Heritage Auctions, Bonhams, dealer sales

## Legal Compliance Features

PRISM tracks collection legality across multiple regulatory frameworks:

- **BLM Casual Use Doctrine** (FLPMA): Personal vs. commercial collection permits
- **ARPA** (16 U.S.C. §470aa): Archaeological Resources Protection Act
- **Country-Specific Export Controls**: Afghanistan, Brazil, DRC, etc.
- **Protected Area Status**: National parks, wilderness areas, cultural sites

## Use Cases

1. **Collectors**: Evaluate specimens before purchase, verify fair pricing
2. **Dealers**: Generate professional certificates, justify pricing
3. **Museums**: Screen donations, generate appraisal documentation
4. **Researchers**: Analyze market trends, study pricing patterns
5. **Educators**: Teach mineral evaluation and market dynamics

## Version

Current version: **1.1.0**

## License

See repository for license information.

## Contributing

This project is designed to serve the mineral collecting community. Contributions that improve scoring accuracy, expand market data coverage, or enhance legal compliance features are welcome.
