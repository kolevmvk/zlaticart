# Artist Archive — Personal Photographs

These personal photographs are part of Zlatica's visual identity and should be treated as an artist archive, not as generic About-page portraits.

## Creative direction

- Do **not** use these portraits in the Living Canvas hero. The hero remains artwork-first: canvas -> brush -> pigment -> artwork -> ZLATICA.
- Use the archive as the second emotional layer of the site, primarily in `/about`, the home `THE ARTIST` section, selected Journal stories, and optionally a dedicated archive strip.
- The first, second and fourth supplied photographs are monochrome/near-monochrome and should carry most of the editorial weight.
- The third supplied photograph is color and should be used sparingly as a deliberate temporal/color contrast, never as the dominant visual language.
- Preserve faces and authentic photographic character. Do not AI-restyle, beautify, alter facial features, or generate replacement portraits.
- Cropping is allowed only for responsive composition; never crop eyes, mouth, or the characteristic silhouette of the hair unless the composition clearly calls for an intentional detail crop.
- No rounded SaaS cards, decorative frames, polaroid effects, masonry-template clichés, or Instagram-like grids.

## Preferred compositions

### Home — THE ARTIST
Use one strong monochrome portrait at large editorial scale with generous negative space. Pair with a very short biography and the line of identity: painter / educator / artist. On scroll, a second portrait may pass behind or beside the text with restrained parallax.

### About — ARCHIVE
Create a museum-catalogue/editorial sequence. Images should feel like pages from an artist monograph. Vary scale: one nearly full-bleed image, one narrow portrait, one close crop, one color interruption. Typography stays quiet.

### Journal
Archive photographs may be attached to posts about biography, teaching, studio memories, exhibitions, and personal artistic history.

## Motion rules

Allowed: slow mask reveals, gentle vertical parallax, scale 1.00 -> 1.025, subtle image-to-image editorial transitions, scroll clipping.

Forbidden: Ken Burns slideshow, aggressive zooms, 3D spinning cards, particle overlays, glitch effects, photo filters, fake film scratches, excessive blur.

## Asset destination

Canonical app path after Next.js scaffold:

`public/assets/artist-archive/`

Recommended names:

- `zlatica-archive-01.webp`
- `zlatica-archive-02.webp`
- `zlatica-archive-03-color.webp`
- `zlatica-archive-04.webp`

Keep source originals outside the runtime bundle if higher-resolution masters become available; generate responsive WebP/AVIF derivatives for production.

## Visual hierarchy

Artwork remains the product and must dominate the site. Portraits reveal the human being behind the work. The result should feel like a contemporary European artist monograph brought to the web — never a personal-photo gallery.
