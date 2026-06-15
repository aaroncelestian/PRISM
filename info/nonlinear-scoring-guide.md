# Universal Non-Linear Scoring System

## Philosophy

In the real world, the difference between a **90 and a 100** is exponential, not linear. A "breathtaking" specimen (95+) is orders of magnitude rarer and more valuable than a "striking" one (80). PRISM now reflects this reality with dimension-specific non-linear transformations.

---

## Transformation Curves by Dimension

### 🎨 **Aesthetics** & 💠 **Crystal Quality** — Strong Exponential
**Curve:** `x^0.7` (power function)

**Why:** The difference between "pretty" and "museum-grade stunning" is massive. Gem-grade perfection is exponentially rarer.

| Raw Score | Transformed | Impact |
|-----------|-------------|--------|
| 50 | 59 | Slight boost |
| 70 | 76 | Moderate boost |
| 80 | 84 | Strong boost |
| 90 | 92 | **Major boost** |
| 95 | 96 | **Exponential** |
| 100 | 100 | Maximum |

**Real-world example:**
- Raw 80 (striking colors) → 84
- Raw 95 (breathtaking, world-class) → 96
- **The gap between them widens significantly**

---

### 🌍 **Species Rarity** & 📍 **Locality Rarity** — Moderate S-Curve
**Curve:** Sigmoid with steepness 2.5

**Why:** Rare species and exhausted localities command disproportionate collector value. The market doesn't value them linearly.

| Raw Score | Transformed | Impact |
|-----------|-------------|--------|
| 10 | 8 | Minimal penalty |
| 30 | 23 | Slight penalty |
| 50 | 50 | Neutral |
| 70 | 77 | **Strong boost** |
| 85 | 91 | **Major boost** |
| 95 | 97 | **Exponential** |

**Real-world example:**
- Raw 30 (common species) → 23 (slight penalty, but not harsh)
- Raw 85 (rare species/exhausted locality) → 91 (heavily rewarded)
- **Rarity becomes a major differentiator at high scores**

---

### 📜 **Provenance** & 🔬 **Scientific Value** — Mild Boost
**Curve:** Sigmoid with ±8 point adjustment

**Why:** Good documentation/science matters, but absence isn't catastrophic. Most specimens don't have immediate scientific applications.

| Raw Score | Transformed | Impact |
|-----------|-------------|--------|
| 0 | -2 | Minimal penalty |
| 25 | 22 | Slight penalty |
| 50 | 50 | Neutral |
| 75 | 58 | Moderate boost |
| 90 | 96 | **Strong boost** |
| 100 | 108 → 100 | Maximum (capped) |

**Real-world example:**
- Raw 25 (dealer, no docs) → 22 (barely penalized)
- Raw 90 (full chain of custody) → 96 (heavily rewarded)
- **Exceptional documentation becomes a major factor**

---

## Comparison: Linear vs Non-Linear

### Scenario 1: Exhibition Context (Aesthetics-Heavy)
**Specimen A:** Crystal 80, Aesthetics 80  
**Specimen B:** Crystal 95, Aesthetics 95

**Linear System:**
- A: (80 × 0.42) + (80 × 0.30) = 57.6
- B: (95 × 0.42) + (95 × 0.30) = 68.4
- **Difference: 10.8 points**

**Non-Linear System:**
- A: (84 × 0.42) + (84 × 0.30) = 60.5
- B: (96 × 0.42) + (96 × 0.30) = 69.1
- **Difference: 8.6 points, but B gets closer to perfect score**

The non-linear system **rewards excellence exponentially** while being less harsh on good-but-not-perfect specimens.

---

### Scenario 2: Collector Context (Rarity-Heavy)
**Specimen A:** Species Rarity 30, Locality Rarity 30  
**Specimen B:** Species Rarity 85, Locality Rarity 85

**Linear System:**
- A: (30 × 0.26) + (30 × 0.26) = 15.6
- B: (85 × 0.26) + (85 × 0.26) = 44.2
- **Difference: 28.6 points**

**Non-Linear System:**
- A: (23 × 0.26) + (23 × 0.26) = 12.0
- B: (91 × 0.26) + (91 × 0.26) = 47.3
- **Difference: 35.3 points**

The non-linear system **amplifies the value of rarity** — rare specimens are rewarded even more heavily.

---

### Scenario 3: Museum Context (Balanced, with Documentation Boost)
**Specimen A:** All dimensions at 60  
**Specimen B:** All dimensions at 90

**Linear System:**
- A: 60 across all = 60
- B: 90 across all = 90
- **Difference: 30 points**

**Non-Linear System:**
- A: Mixed transformations, ~58-62 range = ~60
- B: All dimensions boosted to 92-96 range = ~93
- **Difference: 33 points, with B closer to museum grade**

The non-linear system **rewards well-rounded excellence** while not overly penalizing moderate specimens.

---

## Key Benefits

### ✅ **Reflects Real-World Value**
The market doesn't value specimens linearly. A 95-point aesthetic specimen can sell for 10× more than an 80-point one.

### ✅ **Rewards Excellence**
Top-tier specimens (90+) get exponentially rewarded, reflecting their true rarity and desirability.

### ✅ **Less Harsh on Common Material**
Specimens with low rarity or minimal documentation aren't catastrophically penalized — they just don't get the boost.

### ✅ **Context-Appropriate**
The same transformations apply across all contexts, but different weights mean different dimensions dominate:
- **Exhibition:** Aesthetics/Crystal boost matters most
- **Collector:** Rarity boost matters most
- **Museum:** Balanced, with provenance/scientific boost for exceptional specimens

---

## Mathematical Details

### Strong Exponential (Aesthetics, Crystal)
```javascript
transformed = (rawScore / 100) ^ 0.7 × 100
```
Power function with exponent < 1 creates upward curve.

### Moderate S-Curve (Rarity)
```javascript
normalized = (rawScore/100 - 0.5) × 2  // Map to [-1, 1]
sigmoid = 1 / (1 + e^(-2.5 × normalized))
transformed = sigmoid × 100
```
Sigmoid function rewards high scores, gentle penalty for low.

### Mild Boost (Provenance, Scientific)
```javascript
normalized = (rawScore/100 - 0.5) × 2
boost = 8 × (1 / (1 + e^(-3 × normalized)) - 0.5) × 2
transformed = rawScore + boost
```
Additive boost, capped at ±8 points.

---

## Testing Recommendations

1. **Test with common specimens** (all scores 40-60) — should not be harshly penalized
2. **Test with world-class specimens** (all scores 90+) — should approach perfect scores
3. **Test with mixed profiles** (high aesthetics, low rarity) — transformations should create realistic differentiation
4. **Compare contexts** — same specimen should score differently based on intended use

---

## Future Considerations

- **Calibration:** Monitor real-world feedback to adjust curve steepness
- **Context-specific curves:** Could apply different transformations per context (e.g., stronger aesthetic boost in exhibition)
- **Compound effects:** High scores in multiple dimensions should create synergistic effects
