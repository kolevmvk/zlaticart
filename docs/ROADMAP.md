# Roadmap — Multi-Author Blog, Comments, Social Insights

Status: **proposed, not started**. This is a planning document, not an implementation commitment. Each feature below is independent and can be built (or skipped) on its own.

Context: raised after the CMS/admin panel work in `docs/STATUS.md`. Three separate asks:

1. Can the Journal have multiple contributors with role-based permissions?
2. Can visitors leave comments?
3. Can the site show Instagram/Facebook metrics and DMs?

---

## 1. Multi-author Journal with roles

### What already exists
Sanity Studio (the CMS) ships with project-level membership and roles (Administrator / Editor / Viewer, plus custom roles on paid plans), managed at `sanity.io/manage` — **no code required**. `docs/ADMIN_GUIDE_SR.md` already documents inviting Zlatica as a member. Inviting a second or third person today, with a lower-privilege role, already works.

### What's missing
- `journalPost` has no `author` field — every post is implicitly "by Zlatica." Multiple contributors would all look the same on the front end.
- No concept of "pending review" — anyone with Editor access can publish directly. A newsroom-style flow (contributor drafts → Zlatica approves → publishes) isn't modeled.
- No per-author page (`/journal/author/[slug]`) or byline.

### Plan
| Phase | Work | Effort |
|---|---|---|
| A | Add `author` reference field to `journalPost` schema (`sanity/schemas/journalPost.ts`) pointing at a new lightweight `contributor` document type (name, avatar, short bio, role label). Backfill existing posts to Zlatica. | Small (~1–2 hrs) |
| B | Render byline on `/journal` and `/journal/[slug]` (avatar + name), extend `translations.ts` for the "by ___" label in both languages. | Small |
| C | Editorial workflow: use Sanity's built-in document **Actions** to restrict "Publish" to Administrator/Editor roles, leaving Contributor-role members able to save drafts only. This is a Studio config change (`sanity.config.ts` — custom `document.actions`), not a new system. | Medium (~half day, needs testing with a real second account) |
| D (optional) | Author archive page + RSS-per-author. | Small, only if there's real multi-author volume |

### Recommendation
Start with Phase A + B only. Phase C (approval gating) only matters once there's an actual second contributor who isn't fully trusted with direct publish — don't build it speculatively.

### Risks / trade-offs
- Sanity's role granularity is coarser on the free plan; fine-grained "this person can only edit their own posts" may require a paid plan tier or a custom access-control layer (more engineering).
- None of this touches visitor-facing accounts — it's entirely about who can log into `/admin`, not site visitors.

---

## 2. Visitor comments on Journal posts

### What already exists
Nothing. No comments schema, no comment UI, no moderation surface. `src/lib/supabase/` (client/server/middleware) and two Supabase migrations exist in-progress for the contact form (`supabase/migrations/*_contact_submissions.sql`) — that's the natural foundation to extend, since a comments table is structurally identical to a submissions table (public write, admin-only read/moderate).

### Plan
| Phase | Work | Effort |
|---|---|---|
| A | New Supabase table `comments` (post_slug, author_name, author_email [not shown publicly], body, status: pending/approved/rejected, created_at). Migration file alongside the existing contact ones. | Small |
| B | Public comment form on `/journal/[slug]` (Server Action, same pattern as `contact/actions.ts`) — inserts as `pending`. Add basic spam resistance: honeypot field (already used in `ContactForm.tsx` — reuse it) + a rate limit per IP/email. | Medium |
| C | Render only `approved` comments under each post. | Small |
| D | Moderation view: simplest option is a Sanity Studio **custom tool** (a React page inside `/admin`) that lists pending comments from Supabase with Approve/Reject buttons — keeps Zlatica in one single admin surface instead of two logins. Alternative: use Supabase's own dashboard for moderation (zero extra code, but a second login for Zlatica to learn). | Medium–Large depending on which option |

### Recommendation
Build A–C first (comments work, default hidden until approved). For D, default to **Supabase's own dashboard** for moderation initially — it's free and already there — and only build a custom in-Studio moderation tool later if Zlatica finds switching tools annoying in practice.

### Risks / trade-offs
- Any public write endpoint is a spam/abuse target. Honeypot + rate limit is a minimum, not a guarantee — expect to add CAPTCHA (e.g. Cloudflare Turnstile) if spam becomes a real problem post-launch.
- Comments are moderate-before-publish by design (never auto-public) given this is a professional artist site, not a forum.

---

## 3. Instagram / Facebook metrics and DMs

### What already exists
A provider abstraction (`src/lib/social/provider.ts`) that shows a small, manually curated or CMS-managed feed of posts — links and images only, no metrics, no messaging. Today's admin work added a guided Instagram/Facebook **connection status** field in Sanity (`sanity/schemas/siteSettings.ts`) so Zlatica can track her own progress toward getting a Professional/Business account, but it does not talk to Meta's API yet.

### What this would actually require
Real metrics (reach, likes, saves, engagement) and DM access are **not** an extension of the current feed feature — they're a materially larger, separate system:

- A registered **Meta Developer App**, business-verified, requesting `instagram_manage_insights`, `pages_read_engagement`, and (for DMs) `pages_messaging` — each of these is a restricted permission requiring **Meta App Review**, which can take days to weeks and can be rejected or revoked at Meta's discretion.
- Server-side OAuth token exchange + **refresh handling** (long-lived tokens expire and must be rotated; this needs a scheduled job, not a one-time setup).
- For DMs specifically: a **webhook endpoint** that receives messages in real time (Meta pushes, doesn't let you poll), persistent storage for conversation state, and — because it's a real inbox — a UI to read/reply, which starts to look like a small support-desk product in its own right.
- Ongoing maintenance burden: Meta changes these APIs and review requirements periodically; a small site with no dedicated engineer is exposed to breakage with no warning.

### Recommendation — do not build this
For a solo artist's portfolio site, the realistic, lower-risk path is: **use Instagram/Facebook's own Business Suite app** (free, official, already has analytics + a unified DM inbox) for anything Zlatica needs to monitor or respond to. Duplicating that inside the website adds significant engineering and compliance surface for something Meta already gives away.

If read-only **display** metrics (e.g. "12.4k followers" shown on `/studio`) are wanted purely for visual credibility, that's a much smaller ask — a single `instagram_basic` + `instagram_manage_insights` scope, no messaging, no webhook, refreshed on a daily cron. That's a small, scoped addendum, separable from everything else in this section — flag if that specific slice is actually wanted.

---

## Suggested sequencing

1. Journal author field + byline (Phase A/B of §1) — cheap, immediately visible, no new infrastructure.
2. Comments A–C (§2) — moderate effort, uses infrastructure (Supabase) already being introduced for the contact form.
3. Everything else (§1 Phase C/D, §2 Phase D, all of §3) — revisit only if there's a concrete need once the site has real traffic and a real second contributor, rather than building ahead of demand.
