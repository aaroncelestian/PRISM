# PRISM v1.1.0
**Precision Rating Index of Specimen Minerals**

A multi-dimensional specimen evaluation system that scores mineral specimens across several quality dimensions and evaluation contexts, then produces a compound classification — visualized as a spectrum of simultaneously scored qualities.

## Overview

PRISM addresses the fundamental information asymmetry problem in mineral specimen markets by making expert judgment structured, auditable, and comparable across transactions. Rather than collapsing everything into one opaque number, it evaluates specimens across independent quality dimensions and several purpose-specific contexts — producing a compound classification (e.g. "Full Spectrum") that reflects what the specimen is good for.

**Size is a pricing variable, not a quality variable. PRISM scores quality.** Physical size class is recorded for market comparison only and never enters the score. A perfect 2 mm specimen and a perfect 4 cm specimen of the same material can earn identical PRISM scores; the larger one is typically worth more money — that is a pricing question for market analysis, not a quality question for scoring.

### Core Purpose

- **Consumer Protection**: Enable new collectors to understand what they're buying and whether pricing is fair
- **Market Transparency**: Provide price-per-quality benchmarking against comparable specimens
- **Institutional Support**: Generate documentation for museum donations (IRS Form 8283 compliance)
- **Legal Compliance**: Track collection legality and provenance through GIS integration

## Features

### Evaluation Modes

- **Expert Mode**: Advanced interface for experienced collectors
- **Research Mode**: Comparative market analysis and pricing research

### Scoring System

#### Input Dimensions

Each specimen is scored independently across several qualities, including:

| Dimension | What it measures |
|-----------|------------------|
| **Crystal Quality** | Symmetry, termination completeness, surface condition |
| **Species / Variety Rarity** | Relative scarcity of the mineral species or variety |
| **Locality Rarity** | Mine status, pocket frequency, auction appearance |
| **Provenance** | Documentation quality and chain of custody |
| **Aesthetics** | Visual impact and display quality |
| **Scientific Value** | Research significance, type locality, emerging science |

#### Evaluation Contexts

The same dimension scores are evaluated through several independent contexts. Each context answers a different question about the specimen — for example museum suitability, display impact, collector appeal, scientific use, or general market quality. Contexts emphasize different qualities depending on purpose.

#### Compound Classification

When a specimen qualifies in more than one context, a **compound grade** names that profile — which purposes it meets — without implying prestige or price. Examples include Full Spectrum, Institutional Display, and Display Collection.

The compound classification is the primary output of PRISM — a single number cannot capture a multi-dimensional, multi-context analysis. The spectrum bar visualization shows all context results simultaneously.

Scoring internals (exact weights, transforms, and thresholds) are proprietary and not documented here.

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
- **QRCode**: PRISM Record generation

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

- **Species-Specific Benchmarks**: Evaluation is calibrated so comparisons stay meaningful within a species
- **Context-Aware Evaluation**: Museum, exhibition, collector, science, and market contexts ask different questions of the same specimen
- **Provenance Tracking**: Collection history and documentation feed both quality scoring and legal-compliance tools
- **Market Data Integration**: Quality scores support price comparison and anomaly detection without treating size as a quality input

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
│   │   │   ├── ExpertMode.jsx      # Advanced interface
│   │   │   ├── ResearchMode.jsx    # Market analysis
│   │   │   ├── PricingTool.jsx     # Price benchmarking
│   │   │   ├── CertGenerator.jsx   # PRISM Record creation
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
2. **Dealers**: Generate professional PRISM Records, justify pricing
3. **Museums**: Screen donations, generate appraisal documentation
4. **Researchers**: Analyze market trends, study pricing patterns
5. **Educators**: Teach mineral evaluation and market dynamics

## Version

Current version: **1.1.0**

## License

See repository for license information.

## Contributing

This project is designed to serve the mineral collecting community. Contributions that expand market data coverage, improve documentation tools, or enhance legal compliance features are welcome. Scoring-engine changes are maintained privately.
