import { buildLegacyTheme } from 'sanity'

// Reskins Sanity Studio (including the login screen, which renders inside
// the same themed shell) to match the site's ink/canvas editorial palette
// instead of Sanity's default blue. Colors mirror src/app/globals.css.
const INK = '#0A0A09'
const INK_MUTED = '#3A3A38'
const CANVAS = '#F0EDE6'

export const zlaticartStudioTheme = buildLegacyTheme({
  '--black': INK,
  '--white': '#FFFFFF',
  '--gray': INK_MUTED,
  '--gray-base': INK_MUTED,

  '--component-bg': '#FFFFFF',
  '--component-text-color': INK,

  '--brand-primary': INK,

  '--default-button-color': INK,
  '--default-button-primary-color': INK,
  '--default-button-success-color': '#3A6B4C',
  '--default-button-warning-color': '#8A6A2E',
  '--default-button-danger-color': '#8A3A2E',

  '--state-info-color': INK,
  '--state-success-color': '#3A6B4C',
  '--state-warning-color': '#8A6A2E',
  '--state-danger-color': '#8A3A2E',

  '--main-navigation-color': INK,
  '--main-navigation-color--inverted': CANVAS,

  '--focus-color': INK,
})
