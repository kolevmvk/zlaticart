# Graph Report - .  (2026-08-30)

## Corpus Check
- 15 files · ~286,542 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 418 nodes · 819 edges · 25 communities (13 shown, 12 thin omitted)
- Extraction: 90% EXTRACTED · 9% INFERRED · 1% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.84)
- Token cost: 140,878 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Content API & Sitemap|Content API & Sitemap]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_About  Contact Pages|About / Contact Pages]]
- [[_COMMUNITY_Rebirth Agent Roster|Rebirth Agent Roster]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Sanity Studio Social Guide|Sanity Studio Social Guide]]
- [[_COMMUNITY_Artwork & Journal Content Model|Artwork & Journal Content Model]]
- [[_COMMUNITY_Exhibitions Page|Exhibitions Page]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Site Settings & Social Feed|Site Settings & Social Feed]]
- [[_COMMUNITY_Living Canvas (Legacy Hero, Dead Code)|Living Canvas (Legacy Hero, Dead Code)]]
- [[_COMMUNITY_Page Transition & Smooth Scroll Providers|Page Transition & Smooth Scroll Providers]]
- [[_COMMUNITY_Marquee Ticker Component|Marquee Ticker Component]]
- [[_COMMUNITY_Sanity Artist Profile Schema|Sanity Artist Profile Schema]]
- [[_COMMUNITY_Sanity Education Item Schema|Sanity Education Item Schema]]
- [[_COMMUNITY_Sanity Exhibition Schema|Sanity Exhibition Schema]]
- [[_COMMUNITY_Sanity Journal Post Schema|Sanity Journal Post Schema]]
- [[_COMMUNITY_Sanity Medium Schema|Sanity Medium Schema]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Studio Photo (Tunnel Portrait)|Studio Photo (Tunnel Portrait)]]
- [[_COMMUNITY_i18n Translations Type|i18n Translations Type]]
- [[_COMMUNITY_Mobile Nav Containing-Block Bug|Mobile Nav Containing-Block Bug]]
- [[_COMMUNITY_Admin Page|Admin Page]]

## God Nodes (most connected - your core abstractions)
1. `useLanguage()` - 43 edges
2. `Artwork` - 25 edges
3. `getSiteSettings()` - 24 edges
4. `compilerOptions` - 16 edges
5. `CLAUDE.md (Mission Control)` - 16 edges
6. `JournalPost` - 14 edges
7. `ArtistProfile` - 14 edges
8. `IMPLEMENTATION_PLAN.md (referenced)` - 14 edges
9. `loadSanityQueries()` - 13 edges
10. `RevealHeading()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `StudioLogo()` --semantically_similar_to--> `Ink/Canvas Visual Language`  [INFERRED] [semantically similar]
  sanity/components/StudioLogo.tsx → docs/PRODUCT_SPEC.md
- `zlaticartStudioTheme` --semantically_similar_to--> `Ink/Canvas Visual Language`  [INFERRED] [semantically similar]
  sanity/theme.ts → docs/PRODUCT_SPEC.md
- `@supabase/supabase-js dependency` --conceptually_related_to--> `CLAUDE.md (Mission Control)`  [AMBIGUOUS]
  package.json → CLAUDE.md
- `zlaticart.contact_submissions table` --semantically_similar_to--> `SiteSettings`  [INFERRED] [semantically similar]
  supabase/migrations/20260829000002_contact_submissions.sql → src/lib/content/types.ts
- `Legacy index.html` --semantically_similar_to--> `Artist Archive Spec`  [AMBIGUOUS] [semantically similar]
  _legacy/index.html → docs/ARTIST_ARCHIVE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SEO/technical baseline (Phase 0/1) shipped together** — app_robots_robots, app_sitemap_sitemap, app_layout_rootlayout, site_page_homepage [INFERRED 0.85]
- **Wet-oil glass scroll-driven hero effect implementation** — hero_herogl_herogl, gl_brushshader_frag, hero_herogl_glassenvelope [EXTRACTED 1.00]
- **Independently-duplicated prefers-reduced-motion guard pattern** — hero_herogl_herogl, sections_studiopreview_studiopreview, reduced_motion_coverage [INFERRED 0.75]

## Communities (25 total, 12 thin omitted)

### Community 0 - "Content API & Sitemap"
Cohesion: 0.06
Nodes (59): AboutPageContentProps, getAllArtworks(), getAllEducationItems(), getAllExhibitions(), getAllJournalPosts(), getArtistProfile(), getArtworkBySlug(), getArtworksByMedium() (+51 more)

### Community 1 - "Root Layout & Fonts"
Cohesion: 0.07
Nodes (42): cormorant, dmSans, metadata, RootLayout(), viewport, robots(), sitemap(), Operations Playbook (+34 more)

### Community 2 - "About / Contact Pages"
Cohesion: 0.08
Nodes (29): AboutPageContent(), AboutPage(), metadata, ContactForm(), initialState, ContactFormState, submitContactForm(), ContactPageContent() (+21 more)

### Community 3 - "Rebirth Agent Roster"
Cohesion: 0.10
Nodes (37): Art Director Agent, Content & CMS Engineer Agent, Motion Engineer Agent, QA & Performance Engineer Agent, Social Integrations Engineer Agent, CLAUDE.md (Mission Control), Legacy Boundary Absolute Rule, Execute ZlaticArt Rebirth Command (+29 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.05
Nodes (36): dependencies, gsap, lenis, next, next-sanity, react, react-dom, sanity (+28 more)

### Community 5 - "Sanity Studio Social Guide"
Cohesion: 0.07
Nodes (18): GuideBlock(), noteBoxStyle, SocialConnectionGuide(), steps, StudioLogo(), Ink/Canvas Visual Language, artwork content type, siteSettings content type (+10 more)

### Community 6 - "Artwork & Journal Content Model"
Cohesion: 0.11
Nodes (22): ARTWORKS, JOURNAL_POSTS, Artwork, FocalPoint, JournalPost, MediumSlug, SocialConnectionStatus, CATEGORY_VALUES (+14 more)

### Community 7 - "Exhibitions Page"
Cohesion: 0.11
Nodes (19): EXHIBITIONS, Exhibition, ExhibitionList(), ExhibitionsPageContent(), ExhibitionsPageContentProps, ExhibitionsPage(), metadata, formatDate() (+11 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "Site Settings & Social Feed"
Cohesion: 0.27
Nodes (11): SITE_SETTINGS, CMS_FALLBACK_POSTS, getCMSFeed(), getSocialFeed(), NormalizedSocialPost, SocialFeedResult, SocialPlatform, metadata (+3 more)

### Community 10 - "Living Canvas (Legacy Hero, Dead Code)"
Cohesion: 0.21
Nodes (10): createBrushStamp(), cubicBezier(), drawPaper(), HeroPhase, LivingCanvasProps, makePrng(), Point, quadBezier() (+2 more)

### Community 11 - "Page Transition & Smooth Scroll Providers"
Cohesion: 0.31
Nodes (5): LanguageProvider(), GrainPauser(), PageTransition(), SmoothScroll(), CustomCursor()

## Ambiguous Edges - Review These
- `JournalHighlights()` → `ParallaxImage()`  [AMBIGUOUS]
  src/components/journal/JournalHighlights.tsx · relation: semantically_similar_to
- `MediaTransitions()` → `ParallaxImage()`  [AMBIGUOUS]
  src/components/sections/MediaTransitions.tsx · relation: semantically_similar_to
- `TheArtist()` → `ParallaxImage()`  [AMBIGUOUS]
  src/components/sections/TheArtist.tsx · relation: semantically_similar_to
- `SITE_SETTINGS` → `getSocialFeed()`  [AMBIGUOUS]
  src/lib/social/provider.ts · relation: shares_data_with
- `CLAUDE.md (Mission Control)` → `@supabase/supabase-js dependency`  [AMBIGUOUS]
  package.json · relation: conceptually_related_to
- `Legacy index.html` → `Artist Archive Spec`  [AMBIGUOUS]
  _legacy/index.html · relation: semantically_similar_to

## Knowledge Gaps
- **124 isolated node(s):** `extends`, `nextConfig`, `name`, `version`, `private` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `JournalHighlights()` and `ParallaxImage()`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `MediaTransitions()` and `ParallaxImage()`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `TheArtist()` and `ParallaxImage()`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `SITE_SETTINGS` and `getSocialFeed()`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `CLAUDE.md (Mission Control)` and `@supabase/supabase-js dependency`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Legacy index.html` and `Artist Archive Spec`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `useLanguage()` connect `About / Contact Pages` to `Content API & Sitemap`, `Root Layout & Fonts`, `Artwork & Journal Content Model`, `Exhibitions Page`, `Site Settings & Social Feed`, `Page Transition & Smooth Scroll Providers`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._