# Evidencer Fotbalových Zápasů a API

Tento projekt představuje jednoduchý systém pro evidenci fotbalových zápasů, včetně možnosti simulace průběhu zápasu a REST API pro správu dat. Je vytvořen jako součást úlohy pro Central Data Storage.

## Klíčové Funkce a Komponenty

Systém se skládá z několika klíčových skriptů a komponent:

*   **`database.js`**: Tento skript je zodpovědný za inicializaci databáze. Vytvoří potřebnou adresářovou strukturu (`data/`) a definuje schéma databáze SQLite, včetně tabulek pro týmy, hráče, zápasy a události.
*   **`seedData.js`**: Po vytvoření struktury databáze tento skript naplní tabulky základními testovacími daty (několik týmů a jejich hráčů). To usnadňuje okamžité testování a používání API a simulátoru.
*   **`matchSimulator.js`**: Skript, který demonstruje simulaci fotbalového zápasu. Náhodně vybere dva týmy, vytvoří mezi nimi zápas a vygeneruje několik herních událostí (góly, karty) s náhodným časováním. Výsledek a události jsou ukládány do databáze.
*   **`api.js`**: Srdce bonusové části projektu. Jedná se o RESTful API postavené pomocí Express.js, které poskytuje CRUD (Create, Read, Update, Delete) operace pro všechny hlavní entity v databázi: týmy, hráče, zápasy a události.

## Použité Technologie

*   **Node.js**: Jako běhové prostředí pro JavaScript na serveru.
*   **Express.js**: Minimalistický a flexibilní Node.js webový aplikační framework, použitý pro tvorbu API.
*   **better-sqlite3**: Rychlá a jednoduchá knihovna pro práci s SQLite databází v Node.js.
*   **SQLite**: Souborová databáze, která nevyžaduje samostatný serverový proces.

## Předpoklady pro Spuštění

Než začnete, ujistěte se, že máte na svém systému nainstalováno:

*   Node.js (doporučená verze 18.x nebo vyšší)
*   npm (Node Package Manager, obvykle se instaluje společně s Node.js)

## Instalace a Příprava

1.  **Naklonujte repozitář:**
    ```bash
    git clone <URL_VASEHO_REPOZITARE> # Nahraďte URL skutečnou adresou
    cd <NAZEV_SLOZKY_REPOZITARE>
    ```
2.  **Nainstalujte projektové závislosti:**
    ```bash
    npm install
    ```
    Tento příkaz stáhne a nainstaluje všechny potřebné knihovny definované v `package.json` (jako Express a better-sqlite3).

## Spuštění Jednotlivých Částí Projektu

Projekt nemá jeden centrální "startovací" příkaz pro vše. Jednotlivé komponenty spouštějte podle potřeby:

1.  **Vytvoření databázové struktury:**
    *   Spusťte pouze jednou na začátku, nebo pokud chcete databázi kompletně resetovat (po smazání souboru `data/sports.db`).
    ```bash
    node database.js
    ```
    *   Tento skript vytvoří soubor `data/sports.db` a v něm potřebné tabulky.

2.  **Naplnění databáze testovacími daty:**
    *   Spusťte po `database.js`, pokud chcete mít v databázi nějaká data pro testování.
    ```bash
    node seedData.js
    ```

3.  **Simulace zápasu:**
    *   Spustí simulaci jednoho zápasu a uloží jeho výsledek a události do databáze.
    ```bash
    node matchSimulator.js
    ```

4.  **Spuštění REST API serveru:**
    *   Server zpřístupní CRUD operace přes HTTP.
    ```bash
    node api.js
    ```
    *   Server standardně poběží na adrese `http://localhost:3000`. Jeho běh v terminálu ukončíte pomocí `Ctrl+C`.

## Struktura Databáze

Databáze se skládá z následujících tabulek:

### `teams`
Uchovává informace o týmech.
*   `id` INTEGER PRIMARY KEY AUTOINCREMENT - Unikátní identifikátor týmu.
*   `name` TEXT NOT NULL - Celý název týmu.
*   `short_name` TEXT - Zkrácený název týmu (např. třípísmenná zkratka).
*   `country` TEXT - Země původu týmu.
*   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Časové razítko vytvoření záznamu.

### `players`
Uchovává informace o hráčích, každý hráč je přiřazen k jednomu týmu.
*   `id` INTEGER PRIMARY KEY AUTOINCREMENT - Unikátní identifikátor hráče.
*   `team_id` INTEGER - Cizí klíč odkazující na `id` v tabulce `teams`.
*   `name` TEXT NOT NULL - Celé jméno hráče.
*   `position` TEXT - Pozice hráče (např. Útočník, Obránce).
*   `number` INTEGER - Číslo dresu hráče.
*   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Časové razítko vytvoření záznamu.

### `matches`
Uchovává informace o jednotlivých zápasech.
*   `id` INTEGER PRIMARY KEY AUTOINCREMENT - Unikátní identifikátor zápasu.
*   `home_team_id` INTEGER - Cizí klíč odkazující na `id` domácího týmu v tabulce `teams`.
*   `away_team_id` INTEGER - Cizí klíč odkazující na `id` hostujícího týmu v tabulce `teams`.
*   `match_date` TIMESTAMP - Datum a čas konání zápasu.
*   `stadium` TEXT - Název stadionu, kde se zápas konal/koná.
*   `status` TEXT - Status zápasu (např. 'scheduled', 'in_progress', 'finished').
*   `score_home` INTEGER - Počet gólů domácího týmu.
*   `score_away` INTEGER - Počet gólů hostujícího týmu.
*   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Časové razítko vytvoření záznamu.

### `events`
Uchovává jednotlivé události, které se staly během zápasu.
*   `id` INTEGER PRIMARY KEY AUTOINCREMENT - Unikátní identifikátor události.
*   `match_id` INTEGER - Cizí klíč odkazující na `id` v tabulce `matches`.
*   `team_id` INTEGER - Cizí klíč odkazující na `id` týmu, kterého se událost týká, v tabulce `teams`.
*   `player_id` INTEGER - Cizí klíč odkazující na `id` hráče, který událost způsobil, v tabulce `players`.
*   `event_type` TEXT CHECK(event_type IN ('goal', 'yellow_card', 'red_card')) - Typ události.
*   `minute` INTEGER CHECK(minute BETWEEN 1 AND 120) - Minuta zápasu, kdy k události došlo.
*   `description` TEXT - Doplňující textový popis události.
*   `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Časové razítko vytvoření záznamu.

## Přehled API Endpointů

API poskytuje následující endpointy pro správu dat:

### Týmy (`/teams`)
*   `GET /teams`: Získá seznam všech týmů.
*   `GET /teams/:id`: Získá detail týmu podle jeho ID.
*   `POST /teams`: Vytvoří nový tým. Data posílejte v JSON formátu v těle požadavku (očekává `name`, `short_name`, `country`).
*   `PUT /teams/:id`: Aktualizuje existující tým podle ID. Data v JSON v těle.
*   `DELETE /teams/:id`: Smaže tým podle ID (včetně navázaných hráčů a zápasů daného týmu).

### Hráči (`/players`)
*   `GET /players`: Získá seznam všech hráčů.
*   `GET /players/:id`: Získá detail hráče podle jeho ID.
*   `POST /players`: Vytvoří nového hráče. Data v JSON (očekává `team_id`, `name`, `position`, `number`).
*   `PUT /players/:id`: Aktualizuje existujícího hráče podle ID. Data v JSON.
*   `DELETE /players/:id`: Smaže hráče podle ID (včetně jeho událostí v zápasech).

### Zápasy (`/matches`)
*   `GET /matches`: Získá seznam všech zápasů.
*   `GET /matches/:id`: Získá detail zápasu podle jeho ID.
*   `POST /matches`: Vytvoří nový zápas. Data v JSON (očekává `home_team_id`, `away_team_id`, `match_date`, volitelně `stadium`).
*   `PUT /matches/:id`: Aktualizuje existující zápas podle ID. Data v JSON (lze měnit `match_date`, `stadium`, `status`, `score_home`, `score_away`).
*   `DELETE /matches/:id`: Smaže zápas podle ID (včetně všech jeho událostí).

### Události (`/events`)
*   `GET /events`: Získá seznam všech událostí.
*   `GET /events/:id`: Získá detail události podle jejího ID.
*   `POST /events`: Vytvoří novou událost. Data v JSON (očekává `match_id`, `team_id`, `player_id`, `event_type`, `minute`, volitelně `description`). Při vytvoření gólu automaticky aktualizuje skóre zápasu.
*   `PUT /events/:id`: Aktualizuje existující událost podle ID. Data v JSON (lze měnit pouze `minute`, `description`).
*   `DELETE /events/:id`: Smaže událost podle ID. Při smazání gólu automaticky upraví skóre zápasu.

---

Doufám, že toto README je srozumitelné a užitečné! 