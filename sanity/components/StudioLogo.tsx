// Replaces the default "sanity" wordmark in the Studio nav bar with a small
// serif ZLATICART mark, echoing the site's brand typography (globals.css
// .text-brand: serif, wide tracking, uppercase).
export function StudioLogo() {
  return (
    <span
      style={{
        fontFamily: 'Georgia, "Cormorant Garamond", serif',
        fontWeight: 400,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontSize: 13,
        color: '#0A0A09',
      }}
    >
      ZlaticArt
    </span>
  )
}
