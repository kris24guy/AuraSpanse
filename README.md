# AuraSpanse

AuraSpanse is an astrology-inspired emotional-color and personal-reflection project.

## Canonical experience

1. The birthdate form at `/aura-scope-mechanism.html` validates the date, saves it locally, and routes to `/aura-spectrum`.
2. The Aura-Spectrum engine uses the 374-entry emotion glossary, the birthdate/day-count rule, zodiac context, and the birthstone's natural color swatch to resolve two primaries.
3. The first primary is an age-derived emotion point. The second primary is the literal monthly birthstone color, with the original geographic-distance opacity metadata.
4. The transparent can is the visual explorer only. It receives the same 374 names, definitions, base colors, and ordered palette positions from the reveal page. The can contains only entries from the emotional glossary.
5. The two primary colors stay separate before signup. Only after the server confirms a Resend mailing-list subscription does it calculate and return the equal-weight RGB average of Primary Hue 1 and Primary Hue 2. Zodiac traits and today's context marker are not additional blend ingredients.

## Can presentation

The can displays 374 individually selectable emotion points around an evenly spaced cylindrical wall. The inner black-and-white center uses a regular tapered helix; the wall uses equal cylindrical columns and rows. This is a visual treatment, not an input into the birthdate reveal formula. The parent page passes Primary Hue 2's natural stone color and the model-computed geological proximity strength to the can. Each displayed point layers that color over its base swatch and darkens with height, while the inspector preserves the original color, displayed color, and source definition. The UI can search labels and show definitions; the birthdate-based model owns the actual primary selections.

The emotion glossary retains the 374 supplied definitions verbatim. Exact normalized palette-name matches inherit an existing emotion-color swatch. Other labels get a deterministic palette position inferred from the name and definition and the closest existing palette color. Inferred assignments are software heuristics, not scientifically established emotion measurements.

## Reveal calculation

`app/lib/originSpectrumEngine.ts` owns the age/spectrum placement, first primary, current context marker, zodiac channels, and geographic birthstone resonance. The public pre-subscription page calls it with `includeComposite: false`, so it does not precompute a combined color. The subscription endpoint repeats the same primary selection server-side and computes the two-color blend only after the Resend contact is confirmed.

The birthstone overlay uses consistent natural-stone color swatches. Geographic opacity is based on the distance from a fixed Chico, California reference to representative gemstone-producing regions:

`clamp(100 - distanceKm / 150, 25, 100)`

These deposit coordinates are regional reference centers, not surveyed mine entrances. Natural gemstones vary in color; the hex values are consistent software swatches, not universal spectrometer measurements. The geographic relationship is a symbolic design convention, not a demonstrated physical influence.

## Environment setup for subscription reveal

Configure these environment variables in Render or the production environment:

- `RESEND_API_KEY` — Resend API key.
- `RESEND_AUDIENCE_ID` — the mailing-list audience used to confirm the subscription.
- `EMAIL_FROM` — sender address verified for your Resend account.
- `AURASCOPE_AI_API_KEY` — server-side key for an OpenAI-compatible chat-completions endpoint. `OPENAI_API_KEY` is also accepted.
- `AURASCOPE_AI_MODEL` — a model available to that endpoint and supporting JSON-schema response format.
- `AURASCOPE_AI_BASE_URL` — optional API base URL; defaults to `https://api.openai.com/v1`.

Keep AI and Resend keys in the production server's secret environment, never in client code. The personalized reading service receives only five emotion labels, their glossary definitions, and color swatches—not the user's email or birthdate. The user-initiated email includes the one blended definition, the five source colors, the generated AuraScope colors, and the snapshot date. It does not send a generic horoscope. If the AI engine is not configured or fails, the reading email is not sent as a generic fallback.

Without the three Resend settings, the subscription route returns a configuration error and the combined color stays locked. A successful Resend contact operation is the subscription checkpoint; email delivery is reported separately so a mail-send failure is not misrepresented as a failed list subscription. A server-signed, HttpOnly ticket bound to the birthdate lets an already confirmed subscriber restore the blend after refresh; a browser-stored flag alone cannot unlock it.

## Main implementation files

- `public/aura-scope-mechanism.html` — birthdate entry and route handoff.
- `app/lib/emotionGlossary.ts` — 374 source labels and definitions and their deterministic color assignments.
- `app/lib/auraSpectrumCycloneData.ts` — the same point data for the visual can.
- `public/aura-spectrum-cyclone.html` — visual-only transparent can with a color-ordered emotion wall, searchable inspector, and continuous hue-reactive tapered vortex.
- `app/components/AuraSky.tsx` — decorative static-glow background and starfield; does not affect model calculations.
- `app/lib/originSpectrumEngine.ts` — existing birthdate-based reveal model.
- `app/lib/birthstoneResonance.ts` — monthly stone colors, reference regions, distance, and opacity.
- `app/aura-spectrum/page.tsx` — primary-color reveal screen and subscription gate.
- `app/api/subscribe-aura-spectrum/route.ts` — mailing-list confirmation, then two-primary blend calculation and reading email.
- `app/lib/personalizedEmotionReading.ts` — resolves five generated color emotions to glossary definitions and requests one integrated personal reading.
- `app/api/subscribe/route.ts` — full AuraScope email with the exact generation snapshot and synthesized definition.
- `scripts/test-origin-spectrum.mjs` — engine, glossary, can UI, and subscription-gate checks.

## Verification

Run:

```sh
npm run test:origin-spectrum
npm run test:aura-engine
npm run test:personalized-reading
npm run build
```

The GitHub Actions workflow runs the tests before the production build. A repository commit is not considered released until CI succeeds and the live birthdate-to-subscription-to-reveal journey is verified in a browser.

AuraSpanse is for entertainment and personal reflection. It is not a scientifically validated measure of personality, emotion, destiny, or gemstone influence.
