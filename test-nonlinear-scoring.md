# Non-Linear Museum Scoring Test

## Overview
The museum context now uses a **non-linear transformation** for provenance and scientific value that:
- **Minimal penalty** for low scores (0-40): ~0-5 point reduction
- **Gradual increase** for medium scores (40-70)
- **Exponential boost** for high scores (70-100): up to +15 point boost

## Example Scenarios

### Scenario 1: Common Specimen with No Scientific Value
**Input Scores:**
- Crystal Quality: 70
- Species Rarity: 30 (common quartz)
- Locality Rarity: 30 (active mine)
- Provenance: 25 (dealer, no documentation)
- Aesthetics: 60
- Scientific Value: 0 (no criteria met)

**Old System (strict):**
- Provenance: 25 × 0.35 = 8.75
- Scientific: 0 × 0.20 = 0
- Total contribution: 8.75 (heavily penalized)

**New System (non-linear):**
- Provenance: 25 → ~22 (minimal penalty) × 0.20 = 4.4
- Scientific: 0 → ~0 (minimal penalty) × 0.18 = 0
- Other dimensions get higher weights (18% each vs 13%)
- **Result: Less harsh on common specimens**

### Scenario 2: Type Locality Specimen with Full Documentation
**Input Scores:**
- Crystal Quality: 65
- Species Rarity: 55
- Locality Rarity: 75 (type locality)
- Provenance: 100 (full chain of custody)
- Aesthetics: 50
- Scientific Value: 80 (type locality + literature + paragenetic)

**Old System:**
- Provenance: 100 × 0.35 = 35
- Scientific: 80 × 0.20 = 16
- Total contribution: 51

**New System (non-linear):**
- Provenance: 100 → ~115 (capped at 100, but gets boost) × 0.20 = 20
- Scientific: 80 → ~95 (exponential boost) × 0.18 = 17.1
- **Result: Specimens with high scientific value get HEAVILY rewarded**

### Scenario 3: Beautiful Specimen, Moderate Documentation
**Input Scores:**
- Crystal Quality: 90
- Species Rarity: 70
- Locality Rarity: 65
- Provenance: 50 (known locality, dealer attribution)
- Aesthetics: 85
- Scientific Value: 40 (paragenetic complexity + literature)

**Old System:**
- Provenance: 50 × 0.35 = 17.5
- Scientific: 40 × 0.20 = 8
- Total contribution: 25.5

**New System (non-linear):**
- Provenance: 50 → ~50 (neutral, no boost or penalty) × 0.20 = 10
- Scientific: 40 → ~38 (slight penalty) × 0.18 = 6.84
- Other strong dimensions (crystal 90, aesthetics 85) carry more weight
- **Result: Balanced - not penalized for moderate scores**

## Key Benefits

1. **Less Strict**: Specimens without immediate scientific applications aren't heavily penalized
2. **Rewards Excellence**: When provenance/scientific value IS high, it becomes a major differentiator
3. **Balanced Weights**: All six dimensions now have similar base weights (18-20%)
4. **Museum-Appropriate**: Reflects real museum priorities - strong across all dimensions, with exceptional documentation/research pushing to top tier

## Mathematical Details

The sigmoid transformation:
```javascript
const normalized = (rawScore - 50) / 50; // Map to [-1, 1]
const boost = 15 * (1 / (1 + Math.exp(-3 * normalized)) - 0.5) * 2;
adjustedScore = rawScore + boost;
```

This creates an S-curve where:
- Score 0 → ~-5 (minimal penalty)
- Score 25 → ~-3
- Score 50 → 0 (neutral)
- Score 75 → +8
- Score 90 → +13
- Score 100 → +15 (maximum boost)
