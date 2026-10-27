# AuraSpanse

AuraSpanse is an astrology-inspired emotional color and reflection project.

## Origin Engine (new independent implementation)

The **Origin Engine** is a distinct birthdate-to-spectrum experience at `/origin`. It does not call the legacy `generateAura()` calculation in `app/lib/auraEngine.ts`. It reuses that project’s emotion-color database and zodiac reference map as input data, while calculating its own first hue, current placement, and composite.

### Calculation

- Calculate calendar days lived, `D`, from the birthdate through the current UTC date.
- Use the exact length of `emotionColors` as the spectrum point count, `N`.
- Calculate `D / N`, its integer quotient (completed cycles), and remainder.
- Derive a bounded exponent residue, `N^D mod 1,000,003`, with modular exponentiation.
- Compute the first hue from the exponent residue, age remainder, and fixed zodiac index.
- Advance the current placement from that first hue using completed cycles and the current day-of-year.
- Balance positive, neutral, and shadow zodiac channels at one-third each.
- Blend the three zodiac trait colors, first hue, and current placement at 20% each to produce a new composite color and definition.

The unbounded integer `N^D` is not constructed. The selected modulus is an explicit AuraSpanse algorithm choice, not a traditional astrology rule.

### Entry and routes

The canonical static birthdate entry at `/aura-scope-mechanism.html` stores the valid date and routes to `/origin`. The older `/reveal` remains available as the classic implementation.

### Tests

Run:

```sh
npm run test:origin-spectrum
npm run test:aura-engine
npm run build
```

The GitHub Actions production-build workflow runs the tests before the production build. A commit is not considered released until CI passes and the deployed route is verified in a browser.

AuraSpanse is for entertainment and personal reflection, not a scientific measurement or guaranteed prediction.
