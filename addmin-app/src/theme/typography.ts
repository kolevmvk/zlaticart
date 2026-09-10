// Cormorant Garamond for editorial/display text, DM Sans for UI — same
// pairing as the main site (src/app/layout.tsx). Font family names come
// from @expo-google-fonts/*; loaded once in app/_layout.tsx via useFonts.
export const fonts = {
  serif: 'CormorantGaramond_400Regular',
  serifItalic: 'CormorantGaramond_400Regular_Italic',
  serifMedium: 'CormorantGaramond_500Medium',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
}

export const textStyles = {
  display: { fontFamily: fonts.serifMedium, fontSize: 38, lineHeight: 44 },
  heading: { fontFamily: fonts.serifMedium, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.serifMedium, fontSize: 24, lineHeight: 30 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.sansBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20 },
}
