# Non-Linear Transformation Examples

## Visual Comparison: Before & After

### Example 1: Exhibition Specimen (Aesthetics-Focused)

**Specimen:** Rhodochrosite from Sweet Home Mine, Colorado
- Crystal Quality: 85
- Aesthetics: 90
- Species Rarity: 60
- Locality Rarity: 70
- Provenance: 50
- Scientific: 20

#### Linear System (Old)
```
Score = (85 × 0.42) + (90 × 0.30) + (60 × 0.07) + (70 × 0.12) + (50 × 0.06) + (20 × 0.03)
      = 35.7 + 27.0 + 4.2 + 8.4 + 3.0 + 0.6
      = 78.9 → 79
```
**Grade:** Exhibition (75+) ✅

#### Non-Linear System (New)
```
Transformed scores:
- Crystal: 85 → 87 (exponential boost)
- Aesthetics: 90 → 92 (exponential boost)
- Species: 60 → 62 (S-curve, slight boost)
- Locality: 70 → 76 (S-curve, moderate boost)
- Provenance: 50 → 50 (neutral)
- Scientific: 20 → 18 (minimal penalty)

Score = (87 × 0.42) + (92 × 0.30) + (62 × 0.07) + (76 × 0.12) + (50 × 0.06) + (18 × 0.03)
      = 36.5 + 27.6 + 4.3 + 9.1 + 3.0 + 0.5
      = 81.0
```
**Grade:** Exhibition (75+) ✅ — **Higher score, more accurate reflection of value**

---

### Example 2: Rare Collector Specimen

**Specimen:** Benitoite from San Benito Co., California (type locality, exhausted)
- Crystal Quality: 75
- Aesthetics: 70
- Species Rarity: 95 (extremely rare species)
- Locality Rarity: 95 (type locality, no new production)
- Provenance: 75
- Scientific: 60

#### Linear System (Old)
```
Score = (75 × 0.22) + (70 × 0.12) + (95 × 0.26) + (95 × 0.26) + (75 × 0.10) + (60 × 0.04)
      = 16.5 + 8.4 + 24.7 + 24.7 + 7.5 + 2.4
      = 84.2 → 84
```
**Grade:** Exhibition (75+) ✅

#### Non-Linear System (New)
```
Transformed scores:
- Crystal: 75 → 79 (exponential boost)
- Aesthetics: 70 → 76 (exponential boost)
- Species: 95 → 97 (S-curve, MAJOR boost)
- Locality: 95 → 97 (S-curve, MAJOR boost)
- Provenance: 75 → 58 (mild boost)
- Scientific: 60 → 62 (mild boost)

Score = (79 × 0.22) + (76 × 0.12) + (97 × 0.26) + (97 × 0.26) + (58 × 0.10) + (62 × 0.04)
      = 17.4 + 9.1 + 25.2 + 25.2 + 5.8 + 2.5
      = 85.2
```
**Grade:** Exhibition (75+) ✅ — **Rarity heavily rewarded, closer to Museum grade**

---

### Example 3: Museum Specimen with Full Documentation

**Specimen:** Azurite from Tsumeb, Namibia (type locality, published)
- Crystal Quality: 80
- Aesthetics: 75
- Species Rarity: 70
- Locality Rarity: 85 (classic locality, exhausted)
- Provenance: 100 (original label, full chain)
- Scientific: 80 (type locality + literature + paragenetic + compositional)

#### Linear System (Old - Museum weights: 35% prov, 20% sci)
```
Score = (80 × 0.13) + (75 × 0.06) + (70 × 0.13) + (85 × 0.13) + (100 × 0.35) + (80 × 0.20)
      = 10.4 + 4.5 + 9.1 + 11.1 + 35.0 + 16.0
      = 86.1 → 86
```
**Grade:** Museum (90+) ❌ — **Falls short despite exceptional documentation**

#### Non-Linear System (New - Museum weights: 20% prov, 18% sci, balanced)
```
Transformed scores:
- Crystal: 80 → 84 (exponential boost)
- Aesthetics: 75 → 79 (exponential boost)
- Species: 70 → 77 (S-curve, strong boost)
- Locality: 85 → 91 (S-curve, MAJOR boost)
- Provenance: 100 → 108 → 100 (capped, maximum boost)
- Scientific: 80 → 96 (MAJOR boost for high science)

Score = (84 × 0.18) + (79 × 0.08) + (77 × 0.18) + (91 × 0.18) + (100 × 0.20) + (96 × 0.18)
      = 15.1 + 6.3 + 13.9 + 16.4 + 20.0 + 17.3
      = 89.0
```
**Grade:** Museum (90+) ❌ — **Close! Just 1 point away**

*Note: With slightly higher crystal or aesthetics, this would easily cross 90. The non-linear system rewards well-rounded excellence.*

---

### Example 4: Common Specimen (No Penalty Test)

**Specimen:** Quartz cluster from Arkansas
- Crystal Quality: 60
- Aesthetics: 55
- Species Rarity: 10 (ubiquitous)
- Locality Rarity: 20 (active mine)
- Provenance: 25 (dealer, no docs)
- Scientific: 0 (no criteria)

#### Linear System (Old - Collector context)
```
Score = (60 × 0.22) + (55 × 0.12) + (10 × 0.26) + (20 × 0.26) + (25 × 0.10) + (0 × 0.04)
      = 13.2 + 6.6 + 2.6 + 5.2 + 2.5 + 0
      = 30.1 → 30
```
**Grade:** General (20-45) ✅

#### Non-Linear System (New)
```
Transformed scores:
- Crystal: 60 → 64 (exponential boost)
- Aesthetics: 55 → 60 (exponential boost)
- Species: 10 → 8 (S-curve, minimal penalty)
- Locality: 20 → 15 (S-curve, slight penalty)
- Provenance: 25 → 22 (minimal penalty)
- Scientific: 0 → -2 → 0 (capped, minimal penalty)

Score = (64 × 0.22) + (60 × 0.12) + (8 × 0.26) + (15 × 0.26) + (22 × 0.10) + (0 × 0.04)
      = 14.1 + 7.2 + 2.1 + 3.9 + 2.2 + 0
      = 29.5 → 30
```
**Grade:** General (20-45) ✅ — **Same grade, not harshly penalized**

---

## Key Insights

### ✅ Excellence is Rewarded
Specimens with scores of 85+ in key dimensions get exponential boosts, reflecting their true market value.

### ✅ Common Material Not Punished
Low scores (10-30) receive minimal penalties. A common quartz isn't catastrophically downgraded.

### ✅ Context Still Matters
The same specimen scores differently based on context:
- Exhibition: Aesthetics/Crystal boost dominates
- Collector: Rarity boost dominates
- Museum: Balanced, with documentation boost for exceptional specimens

### ✅ Realistic Differentiation
The gap between "good" (80) and "exceptional" (95) widens appropriately, matching real-world collector behavior.

---

## Testing Checklist

- [x] Common specimens (all 40-60) → Should score ~45-55, not harshly penalized
- [x] World-class specimens (all 90+) → Should approach 90-95, heavily rewarded
- [x] Mixed profiles (high aesthetics, low rarity) → Realistic differentiation
- [x] Museum context (high provenance/science) → Non-linear boost applies
- [x] Exhibition context (high aesthetics) → Exponential boost applies
- [x] Collector context (high rarity) → S-curve boost applies
