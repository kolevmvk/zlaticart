# 10 — Instagram objavljivanje i metrike (odloženo, posle MVP-a)

Ovaj dokument opisuje **buduću, odloženu** fazu — ne deo trenutnog MVP roadmap-a (Faze 0-9 u [`07-ROADMAP.md`](07-ROADMAP.md)). Dokumentovano unapred da se priprema (šema, provider boundary) ne mora naknadno prepravljati, ali implementacija ne počinje dok MVP nije gotov i dok spoljni preduslov ispod nije zadovoljen.

## Zašto je ovo odvojeno od ostatka plana

Za razliku od svega ostalog u ovom planu (Sanity CRUD, Supabase čitanje, preview) — koje zavisi samo od našeg razvoja — objavljivanje na Instagram i čitanje njegovih metrika zavisi od **Meta App Review-a**: spoljnog, vremenski nepredvidivog procesa (obično nedelje, ponekad meseci) koji Claude/Codex ne mogu ubrzati niti zaobići. Mešanje ove faze sa ostatkom roadmap-a bi značilo da ceo projekat čeka na tuđe odobrenje — zato ide posebno, kao "spreman kad bude spreman" dodatak.

## Preduslov (mora postojati PRE nego što se ijedna linija ovog dela piše)

1. Instagram nalog prebačen na Professional/Business (već ima vođeni checklist u Sanity Studio → Podešavanja → Instagram i Facebook, `sanity/components/SocialConnectionGuide.tsx`).
2. Facebook Page povezana sa tim Instagram nalogom.
3. Meta Developer App kreiran, App Review prošao za tražene permisije:
   - `instagram_content_publish` — za objavljivanje slika.
   - `instagram_manage_insights` — za metrike (impressions, reach, engagement).
4. Dugotrajan (long-lived) access token izdat i bezbedno čuvan **isključivo server-side** (isti princip kao Sanity token i Supabase `service_role` ključ — nikad u mobilnom bundle-u).

Bez ovih 1-4, ništa ispod se ne implementira — samo se dokumentuje kao ciljna arhitektura.

## Šta app radi kada preduslov bude zadovoljen

### Objavljivanje na Instagram
- Iz forme za rad/dnevnik objavu (postojeći ekrani iz [`06-SCREENS.md`](06-SCREENS.md)), dodatna opcija "Objavi i na Instagram" — koristi već upload-ovanu fotografiju, predlaže caption iz `shortDescription`/`excerpt`, Zlatica pregleda i potvrđuje pre slanja.
- Ide kroz isti `admin-api` proxy — proxy poziva Meta Graph API sa server-side tokenom, app nikad direktno ne komunicira sa Meta API-jem.
- Uspešna objava kreira/ažurira odgovarajući `socialItem` dokument u Sanity-ju (postojeća šema, već pokrivena u [`03-CONTENT_MODEL_MAPPING.md`](03-CONTENT_MODEL_MAPPING.md)) — tako da ručni fallback i automatska objava pune isti sadržajni model, ne dva paralelna sistema.

### Metrike
- Nova sekcija "Metrike" na dashboard-u: broj pratilaca, engagement po objavi (poslednjih N objava), osnovni trend (raste/opada), povučeno iz `instagram_manage_insights`.
- Keširano na proxy strani (Meta API ima rate limitove) — app ne poziva Meta API direktno na svaki otvaranje ekrana.
- Metrike sajta (posete, itd.) su **odvojeno pitanje** — sajt trenutno nema analytics/tracking uopšte (vidi `/pravne-informacije` na glavnom sajtu — eksplicitno "nema kolačića za praćenje"). Dodavanje bilo kog analytics alata (Vercel Analytics, Plausible, ili sličan) je odluka koja utiče na privatnost/pravnu stranicu sajta i mora ići kroz vlasnika projekta pre nego što uđe u bilo koji plan, ne samo ovaj.

## Šta se PRIPREMA sada, u MVP fazama, da se ovo kasnije ne prepravlja

- `siteSettings.instagramConnectionStatus` / `facebookConnectionStatus` polja (već postoje u šemi, već pokrivena u Fazi 8 Podešavanja) — kad pređu u `connected`, to je signal da je preduslov korak 1-2 gotov.
- `socialItem` CRUD (Faza 7) — isti sadržajni model koji će buduća automatska objava puniti, znači nema redizajna šeme kad automatika stigne.

**Zašto ovaj dokument postoji sada, a ne kad preduslov bude gotov:** da se MVP faze (posebno Faza 7/8 gore) projektuju sa ovim krajnjim ciljem na umu — isti `socialItem` model, ista `admin-api` proxy granica — umesto da se kasnije otkrije da treba redizajn.
