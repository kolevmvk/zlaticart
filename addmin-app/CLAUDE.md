## Admin aplikacija — obavezni plan za nastavak

Pri svakom nastavku rada na Android/admin aplikaciji, uključujući povezane serverske rute, prvo pročitaj `addmin-app/docs/11-LIVE_PLAN.md`, zatim najnovije zapise u `addmin-app/STATUS.md` i dokumentaciju aktivnog zadatka. Putanje su od korena repozitorijuma.

`11-LIVE_PLAN.md` je zajednički živi plan za Codex i Claude: posle svakog smislenog koraka ažuriraj status (TODO / U TOKU / REALIZOVANO / IZMENJENO / ODBAČENO / BLOKIRANO), dokaz provere, dnevnik odluka i tačan sledeći korak. Ne briši odbačene stavke. U STATUS.md upiši hronološki rezultat. Ovaj protokol i aktuelni redosled isporuke imaju prednost nad starim pravilima da se čita samo STATUS.md ili strogo prati prvobitni roadmap. Važi samo za admin aplikaciju; ostala pravila projekta ostaju na snazi.

## Skillovi za mobilni dizajn i paralelan rad

Za dizajn, implementaciju ili pregled admin UI-ja učitaj `.agents/skills/zlaticart-mobile-design/SKILL.md`. Za smislen paralelan rad učitaj `.agents/skills/zlaticart-parallel-delivery/SKILL.md`. Claude ulazi u iste skillove kroz `.claude/skills/` simboličke veze; kanonski sadržaj je u `.agents/skills/`. Putanje su od korena repozitorijuma. Ako alat ne otkriva skillove automatski, pročitaj odgovarajući SKILL.md direktno.

Za Android provere koristi `addmin-app/skills/verification-checklist.md`. Ovaj protokol zamenjuje staro ograničenje „jedan korak = nova sesija“ i zabranu nezavisnog paralelnog rada u CODEX.md/playbook-u: više proverenih koraka i nezavisni agenti su dozvoljeni unutar odobrenog obima. Zavisne etape i dalje čekaju svoje kriterijume prihvatanja. Jedan koordinator ažurira plan i STATUS.md; radnici vraćaju rezultate i dokaze. Ne pokreći agente za trivijalne zadatke. Dodavanje skillova nije odobrenje za deploy niti za proširenje funkcionalnog obima.
