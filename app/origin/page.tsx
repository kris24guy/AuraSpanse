import { redirect } from 'next/navigation'

/** Backwards-compatible alias; the public mechanism is Aura-Spectrum. */
export default function OriginAliasPage() {
  redirect('/aura-spectrum')
}
