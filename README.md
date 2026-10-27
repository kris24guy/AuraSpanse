# AuraSpanse

AuraSpanse is an astrology-inspired emotional color and reflection project.

## Aura-Spectrum mechanism

The canonical birthdate entry at `/aura-scope-mechanism.html` routes to `/aura-spectrum`. The public mechanism is a cylindrical Fibonacci pattern, not a generic rainbow bar or a calculation named after the page.

### Shape and point rules

- The first hue is derived from the birthdate, days alive, total number of emotion-color points, bounded modular exponent, and zodiac index.
- Every emotion-color point is mapped onto one ascending path using the golden angle (approximately 137.507764°). The pattern begins at a bright central origin, opens into a fixed-radius cylinder, and gets progressively darker toward the top.
- The current placement is highlighted among the same points; its position advances according to the existing age/spectrum rule and current day-of-year.

### Birthstone as the second hue

- The original twelve-stone month mapping is retained.
- Each month stone has a literal, fixed hex swatch in `app/lib/birthstoneResonance.ts`. The hex—not the gemstone name—drives color blending.
- The original mechanism's geographic reference origin is preserved as Chico, California (39.76, -121.84).
- A great-circle distance to the representative source region is calculated in kilometres with the Haversine formula.
- Geographic opacity follows the first mechanism's rule: `clamp(100 - distanceKm / 150, 25, 100)`. That percentage blends the stone's literal swatch over the underlying emotion-color points. As the point sequence rises, its opacity and luminance are attenuated so the cylinder darkens upward.
- Deposit coordinates are regional reference points, not surveyed mine entrances. Natural gems vary in color; the canonical hex values are deterministic visual inputs for this model, not a claim that each real gemstone has one universally exact RGB value.

### Historical and conceptual boundaries

The birthstone and zodiac associations draw on cultural traditions. Birthstone lists vary, and many gemstones have multiple natural colors; the stable hex swatches are engineering constants selected for reproducible rendering. This color-placement model is custom AuraSpanse logic, not a scientific measurement of personality, emotion, or a physical gemstone influence.

### Implementation

- `app/lib/originSpectrumEngine.ts`: age, zodiac balancing, first hue/current placement and composite color.
- `app/lib/birthstoneResonance.ts`: literal gem swatches, representative regional coordinates, Haversine distance and opacity.
- `app/components/AuraSpectrumCylinder.tsx`: cylindrical Fibonacci rendering and progressive upward darkening.
- `app/aura-spectrum/page.tsx`: public Aura-Spectrum experience.
- `app/origin/page.tsx`: backwards-compatible redirect to `/aura-spectrum`.
- `scripts/test-origin-spectrum.mjs`: calculation, color, geographic opacity, route, and geometry-rule tests.

### Verification commands

```sh
npm run test:origin-spectrum
npm run test:aura-engine
npm run build
```

GitHub Actions runs the test suite before the production build. A repository commit is not considered released until CI passes and the deployed birthdate-to-`/aura-spectrum` journey is verified in a browser.

## References for source conventions

- Jewelers of America, birthstone list: https://www.jewelers.org/find-a-jeweler/buying-guides/birthstones/
- Gemological Institute of America, birthstones and natural color variation: https://www.gia.edu/gia-museum-exhibit-birthstones
- Geosciences LibreTexts, gemstone minerals and producing regions: https://geo.libretexts.org/Bookshelves/Geology/Mineralogy_(Perkins_et_al.)/09:_Ore_Deposits_and_Economic_Minerals/9.02:_Ore_Minerals/9.2.04:_Gems_and_Gem_Minerals

AuraSpanse is for entertainment and personal reflection.
