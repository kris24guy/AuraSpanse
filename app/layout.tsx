export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: 'sans-serif',
          background: 'black',
        }}
      >
        {children}
        <footer
          style={{
            background: '#05030a',
            color: 'rgba(255,255,255,0.58)',
            padding: '28px 20px 36px',
            textAlign: 'center',
            fontSize: '0.82rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p style={{ margin: '0 0 12px' }}>AuraSpanse and Auracle are for entertainment and personal reflection only.</p>
          <nav style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a href="/privacy" style={{ color: 'rgba(255,255,255,0.72)' }}>Privacy</a>
            <a href="/terms" style={{ color: 'rgba(255,255,255,0.72)' }}>Terms</a>
            <a href="/disclaimer" style={{ color: 'rgba(255,255,255,0.72)' }}>Disclaimer</a>
            <a href="/cookies" style={{ color: 'rgba(255,255,255,0.72)' }}>Cookies</a>
          </nav>
        </footer>
      </body>
    </html>
  )
}
