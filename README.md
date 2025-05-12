# Sportovní Databáze

Jednoduchá SQLite databáze pro správu sportovních týmů, zápasů a událostí.

## Popis projektu

Tento projekt implementuje databázové řešení pro správu sportovních událostí. Databáze obsahuje tři hlavní tabulky:
- Týmy (teams)
- Zápasy (matches)
- Události (events)

## Technologie

- Node.js
- SQLite3 (better-sqlite3)
- JavaScript

## Instalace

1. Ujistěte se, že máte nainstalovaný Node.js
2. Naklonujte tento repozitář
3. Nainstalujte závislosti:
```bash
npm install
```

## Spuštění

Pro vytvoření databáze a tabulek spusťte:
```bash
npm start
```

## Struktura databáze

### Tabulka teams
- id (primární klíč)
- name (název týmu)
- city (město)
- country (země)
- created_at (časové razítko vytvoření)

### Tabulka matches
- id (primární klíč)
- home_team_id (id domácího týmu)
- away_team_id (id hostujícího týmu)
- match_date (datum zápasu)
- venue (místo konání)
- status (stav zápasu)
- score_home (skóre domácích)
- score_away (skóre hostů)
- created_at (časové razítko vytvoření)

### Tabulka events
- id (primární klíč)
- match_id (id zápasu)
- event_type (typ události)
- event_time (čas události)
- description (popis)
- player_name (jméno hráče)
- team_id (id týmu)
- created_at (časové razítko vytvoření) 