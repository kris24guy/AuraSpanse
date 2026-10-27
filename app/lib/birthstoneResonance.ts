export interface GeographicAnchor {
  name: string
  latitude: number
  longitude: number
}

export interface BirthstoneReference {
  month: number
  name: string
  /** Fixed canonical UI swatch used as the literal color input. Never generated from the name. */
  hex: string
  deposit: string
  depositLatitude: number
  depositLongitude: number
  sourceNote: string
}

export interface BirthstoneResonance extends BirthstoneReference {
  origin: GeographicAnchor
  distanceKm: number
  opacityPercent: number
  opacity: number
}

/**
 * The 12 primary month stones retained from the original Aura-Spectrum mechanism.
 *
 * The hex value is the actual source value used by the renderer; the gemstone name
 * is metadata only. Natural gemstones vary in color, so these are fixed canonical
 * display swatches for a reproducible model, not a claim that a physical stone has
 * one universal spectral RGB value.
 *
 * Deposit coordinates represent named producing regions, not surveyed mine entrances.
 * The geographic origin preserves the original mechanism's Chico, California anchor.
 */
export const AURASPECTRUM_GEOGRAPHIC_ORIGIN: GeographicAnchor = {
  name: 'Chico, California (Aura-Spectrum reference origin)',
  latitude: 39.76,
  longitude: -121.84,
}

export const BIRTHSTONE_REFERENCES: Record<number, BirthstoneReference> = {
  1: {
    month: 1, name: 'Garnet', hex: '#7B1E3A',
    deposit: 'Bohemian garnet region, Czechia',
    depositLatitude: 50.59, depositLongitude: 15.16,
    sourceNote: 'Representative center of the historic Bohemian garnet region.',
  },
  2: {
    month: 2, name: 'Amethyst', hex: '#9966CC',
    deposit: 'Four Peaks, Arizona, USA',
    depositLatitude: 33.73, depositLongitude: -111.51,
    sourceNote: 'Four Peaks amethyst mining district.',
  },
  3: {
    month: 3, name: 'Aquamarine', hex: '#7FCEDB',
    deposit: 'Minas Gerais, Brazil',
    depositLatitude: -18.00, depositLongitude: -44.00,
    sourceNote: 'Representative point for the Minas Gerais gem-producing region.',
  },
  4: {
    month: 4, name: 'Diamond', hex: '#EAF5FF',
    deposit: 'Kimberley, South Africa',
    depositLatitude: -28.73, depositLongitude: 24.76,
    sourceNote: 'Kimberley diamond-mining district.',
  },
  5: {
    month: 5, name: 'Emerald', hex: '#00835E',
    deposit: 'Muzo, Colombia',
    depositLatitude: 5.53, depositLongitude: -74.10,
    sourceNote: 'Muzo emerald district.',
  },
  6: {
    month: 6, name: 'Pearl', hex: '#F6F0E5',
    deposit: 'South Sea pearl region, near Broome, Australia',
    depositLatitude: -17.96, depositLongitude: 122.24,
    sourceNote: 'Regional reference for South Sea pearl production.',
  },
  7: {
    month: 7, name: 'Ruby', hex: '#C2183A',
    deposit: 'Mogok, Myanmar',
    depositLatitude: 22.91, depositLongitude: 96.50,
    sourceNote: 'Mogok ruby and sapphire-producing district.',
  },
  8: {
    month: 8, name: 'Peridot', hex: '#A5C639',
    deposit: 'Zabargad Island, Red Sea',
    depositLatitude: 23.60, depositLongitude: 36.13,
    sourceNote: 'Historic Red Sea peridot source.',
  },
  9: {
    month: 9, name: 'Sapphire', hex: '#0F52BA',
    deposit: 'Kashmir sapphire region',
    depositLatitude: 34.00, depositLongitude: 76.00,
    sourceNote: 'Regional reference for the Kashmir sapphire-bearing area.',
  },
  10: {
    month: 10, name: 'Opal', hex: '#C9D8D6',
    deposit: 'Coober Pedy, South Australia',
    depositLatitude: -29.00, depositLongitude: 134.75,
    sourceNote: 'Coober Pedy opal district; the base swatch represents opal body color, not every play-of-color flash.',
  },
  11: {
    month: 11, name: 'Topaz', hex: '#E3A341',
    deposit: 'Ouro Preto, Minas Gerais, Brazil',
    depositLatitude: -20.38, depositLongitude: -43.50,
    sourceNote: 'Ouro Preto topaz region.',
  },
  12: {
    month: 12, name: 'Turquoise', hex: '#40B5AD',
    deposit: 'Nishapur turquoise region, Iran',
    depositLatitude: 36.21, depositLongitude: 58.79,
    sourceNote: 'Nishapur turquoise-producing region.',
  },
}

const EARTH_RADIUS_KM = 6371

export function haversineDistanceKm(
  from: Pick<GeographicAnchor, 'latitude' | 'longitude'>,
  to: Pick<BirthstoneReference, 'depositLatitude' | 'depositLongitude'>,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const latitudeDelta = radians(to.depositLatitude - from.latitude)
  const longitudeDelta = radians(to.depositLongitude - from.longitude)
  const fromLatitude = radians(from.latitude)
  const toLatitude = radians(to.depositLatitude)

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
}

/**
 * Original mechanism proximity rule: opacity = clamp(100 - distanceKm / 150, 25, 100).
 * A small percentage step is intentional: proximity changes the birthstone overlay,
 * while the literal birthstone hex remains the source color and is never name-derived.
 */
export function getBirthstoneResonance(
  month: number,
  origin: GeographicAnchor = AURASPECTRUM_GEOGRAPHIC_ORIGIN,
): BirthstoneResonance {
  const reference = BIRTHSTONE_REFERENCES[month]
  if (!reference) throw new Error('Birth month must be an integer from 1 to 12')

  const distanceKm = haversineDistanceKm(origin, reference)
  const opacityPercent = Math.min(100, Math.max(25, 100 - distanceKm / 150))

  return {
    ...reference,
    origin,
    distanceKm,
    opacityPercent,
    opacity: opacityPercent / 100,
  }
}
