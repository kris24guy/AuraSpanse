import { redirect } from 'next/navigation'

/**
 * The uploaded Aura-Scope Origin Protocol is the canonical homepage experience.
 * Keeping it in public/ preserves the self-contained HTML artifact byte-for-byte
 * except for its browser-tab title. Existing Next.js routes remain available.
 */
export default function Home() {
  redirect('/aura-scope-mechanism.html')
}
