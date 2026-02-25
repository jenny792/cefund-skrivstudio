# Cefund Skrivstudio

## Status — senast uppdaterad 2026-02-25

### Vad som fungerar
- **Källbibliotek** — lägg till källor (text, URL med auto-scrape), sparas permanent i Supabase
- **Generera stories** — välj story-typ (7 st), välj källor + tonläge, genererar via Claude API
- **Generera LinkedIn-inlägg** — välj LinkedIn-typ (8 st), genererar längre inlägg med copy-paste-flöde
- **LinkedIn copy-paste** — "Kopiera för LinkedIn"-knapp på varje inlägg, kopierar ren text i rätt fältordning
- **Spara inlägg** — genererade inlägg sparas automatiskt i Supabase, överlever sidladdning
- **Inläggssidan** (`/inlagg`) — visar alla sparade inlägg med filter (typ, status, sök)
- **Inline-redigering** — klicka pennan på valfritt inlägg, redigera, sparas persistent i databasen
- **CSV-export** — bocka i inlägg → "Exportera CSV" (Canva bulk create-format), loggas i `exports`-tabellen
- **Dashboard** — visar 5 senaste inlägg
- **Deploy** — live på https://cefund-skrivstudio.vercel.app

### Borttaget
- **LinkedIn OAuth** — publicera/schemalägg via OAuth togs bort, ersatt med copy-paste-flöde. Filer (`api/linkedin/*`, `src/lib/linkedin.js`) finns kvar men används inte.

### Kända begränsningar
- Prompten instruerar Claude att enbart använda källmaterialet, men korta/tunna källor ger generella svar
- Ingen auth — alla som har URL:en kan använda appen

## Stack
- React + Vite + Tailwind CSS
- Supabase (PostgreSQL) — tabeller: `sources`, `posts`, `exports`
- Vercel serverless functions (Claude API proxy + URL scrape)
- GitHub: jenny792/cefund-skrivstudio

## Env-variabler (Vercel)
- `ANTHROPIC_API_KEY` — Claude API
- `VITE_SUPABASE_URL` — Supabase projekt-URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key

## Design
- Cefund-palett: accent `#d35619`, bakgrund `#ffffff`, subtil `#f2f5f7`
- Typsnitt: Plus Jakarta Sans (rubriker), Manrope (brödtext)
- Ljust, luftigt, luxury minimalism

## Konventioner
- Svenska i UI, kommentarer och felmeddelanden
- Commit-meddelanden på engelska, imperativ form
