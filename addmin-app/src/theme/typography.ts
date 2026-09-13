// EB Garamond za editorijalne naslove, DM Sans za UI. Cormorant Garamond iz
// @expo-google-fonts pogrešno crta kvačice (š, č, ž) — ne koristiti za srpski.
// Nazivi fontova dolaze iz @expo-google-fonts/*; učitavaju se u app/_layout.tsx.
export const fonts = {
  serif: 'EBGaramond_400Regular',
  serifItalic: 'EBGaramond_400Regular_Italic',
  serifMedium: 'EBGaramond_500Medium',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
}

export const textStyles = {
  display: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42 },
  screenTitle: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40 },
  heading: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 30 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 23 },
  writing: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 31 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16, letterSpacing: 1.6 },
}
