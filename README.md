# PRISM
**Precision Rating Index of Specimen Minerals**

A comprehensive mineral specimen evaluation and market analysis tool designed to bring transparency and standardization to the mineral collecting market.

## Overview

PRISM addresses the fundamental information asymmetry problem in mineral specimen markets by making implicit expert heuristics explicit, auditable, and comparable across transactions. The application provides collectors, dealers, and institutions with objective scoring criteria and market data to make informed decisions about specimen quality and pricing.

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

PRISM evaluates specimens across six dimensions:

1. **Crystal Quality**: Symmetry expression, termination completeness, surface condition
2. **Species Rarity**: Relative scarcity of the mineral species
3. **Locality Rarity**: Significance and scarcity of the collection locality
4. **Provenance**: Documentation quality and collection history
5. **Aesthetics**: Visual appeal and display quality
6. **Scientific Value**: Research significance and educational value

Scores are **context-weighted** based on evaluation purpose:
- **Museum Grade**: Emphasizes provenance and scientific value
- **Exhibition Grade**: Prioritizes aesthetics and crystal quality
- **Collector Grade**: Balances all factors for personal collections

### Additional Tools

- **Pricing Tool**: Market analysis with comparable specimen data
- **Buyer's Guide**: Educational resources for collectors
- **Certificate Generator**: QR-coded verification certificates
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

Current version: **1.0.2**

## License

See repository for license information.

## Contributing

This project is designed to serve the mineral collecting community. Contributions that improve scoring accuracy, expand market data coverage, or enhance legal compliance features are welcome.
