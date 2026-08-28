# ZlaticArt — Product Specification

## Product identity
ZlaticArt is the digital home of Zlatica's artistic practice: painter, abstract artist, and art-school educator.

The site is not a brochure. It is a living exhibition, archive, journal, and bridge to her active social presence.

## Primary audiences
1. Art colleagues, teachers, curators, students, friends, and local cultural circles.
2. Visitors arriving from Instagram.
3. People discovering a specific artwork through social sharing or search.
4. Future exhibition/contact opportunities.

## Core product goals
- Immediate emotional impact on first open.
- Present artworks with dignity and visual authority.
- Make Zlatica's role as an educator visible without turning the site into a school website.
- Give her an editable Journal/Blog.
- Make Instagram feel integrated into the site, not bolted on.
- Work beautifully on iPhone/mobile and desktop.
- Remain maintainable after the birthday launch.

## Information architecture
### Home `/`
Order should be art-directed, not mechanically templated:
1. Living Canvas hero
2. Selected Works
3. Practice / media transitions
4. Artist statement / About preview
5. Art & Education preview
6. Journal highlights
7. Exhibitions / current activity
8. From the Studio / Instagram
9. Contact / minimal footer

### Works `/works`
Editorial collection view. Not a generic thumbnail grid.
Support filters/categories:
- Oil on canvas
- Watercolor
- Graphics / print
- Mosaic
- Other/future media

### Artwork `/works/[slug]`
Large artwork presentation with:
- title
- year
- medium
- dimensions
- collection/category
- description/story when available
- detail images when available
- related Journal story
- Instagram post link when available
- previous/next artwork navigation

### Journal `/journal`
This is the site's blog, but public-facing language should prefer **Journal** or **Studio Notes**.
Categories:
- Atelier
- Thoughts
- Teaching
- Exhibitions
- Works

### Journal article `/journal/[slug]`
Editorial long-form layout. Artwork and article media should feel like exhibition material, not a news template.

### About `/about`
Artist portrait, biography, statement, selected practice summary.
Never fabricate credentials.

### Art & Education `/education`
Teaching philosophy, student/workshop/project material, art-school practice.
Keep it elegant and artist-led.

### Exhibitions `/exhibitions`
Chronological but visually designed timeline/cards. Support past/current/upcoming.

### Studio `/studio`
Primary home for Instagram-connected content and current activity.
Use CMS fallback when live API data is unavailable.

### Contact `/contact`
Minimal, professional. Social first, email/contact form second if configured.

## Visual language
### Base
- Near-black ink: `#0A0A09`
- Warm paper/canvas: approximately `#F0EDE6`
- Artwork supplies the dominant color on each screen.

Do not establish a competing decorative palette.

### Typography
Use a serious editorial serif paired with a restrained modern sans-serif.
Do not use script/cursive fonts for the brand.
Typography should resemble a contemporary European gallery catalogue more than a fashion landing page.

### Composition
- generous negative space
- asymmetric editorial layouts
- large artwork crops only when intentional
- avoid boxed-card UI where possible
- metadata is quiet and precise
- navigation is minimal and confident

## Motion language
Motion is part of the artistic medium:
- oil: brush/pigment mask reveal
- watercolor: wet diffusion / soft bleed-inspired reveal, subtle and performant
- graphics: line/ink-driven transition
- mosaic: restrained fragment/tile transition

Do not turn every section into an effect demo.

## Social / Instagram strategy
Instagram is the primary active social channel.

Architecture must support:
- verified profile link
- artwork -> Instagram post association
- Journal -> Instagram post association
- selected current posts on `/studio` and Home
- manual/CMS fallback if Meta API credentials or permissions are absent
- provider adapter so real Meta integration can be added without rewriting UI

Facebook is secondary and should appear in social/contact areas and can later support events.

## CMS editing requirements
Zlatica should be able to manage:
- artworks
- artwork media
- collections/media
- Journal posts
- exhibitions
- About/artist profile
- education items/projects
- social links
- homepage featured content

No code editing should be required for normal content work.

## SEO / sharing
Every artwork and Journal post requires:
- canonical URL
- title/description metadata
- social preview image
- Open Graph data
- structured, indexable HTML content

## Accessibility
- keyboard navigation
- semantic HTML
- visible focus states
- alt text fields in CMS
- `prefers-reduced-motion`
- animations must not block content access
- color contrast must remain acceptable despite artwork-led backgrounds

## Performance intent
Premium does not mean heavy.
Prioritize perceived quality and first-load speed.
- load hero asset deliberately
- defer secondary galleries
- avoid shipping WebGL if a device cannot handle it well
- lazy load below-the-fold media
- use optimized responsive image sizes
- avoid long main-thread animation work

## Definition of success
A visitor should remember the artwork and the artist, not the framework or effects used to build the site.
