# Läxportalen

Läxspel på franska med Penny, Theo och Emma. Ren HTML/JS utan byggsteg, publiceras med GitHub Pages.

- PIN-koden står i `config.js`.
- Allt sparas lokalt i webbläsaren (`localStorage`, nyckel `laxportal.v1`).
- En läxa = en rad i `laxor/index.js` + en datafil `laxor/<id>.js` som anropar `LP.registreraLaxa({...})`.
- Spellägen: `lar`, `lyssna`, `valj`, `memory`, `bygg`, `skriv`, `ballong`, `tala`, plus `ordning`/`sekvens` (tal) och `peka` (kroppsdelar på Penny).
- Provet (`prov`) är klart först när alla svar är rätt.
