// Import potřebných modulů
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * Funkce pro vytvoření databáze a všech potřebných tabulek
 * Vytvoří adresář data/ pokud neexistuje a inicializuje SQLite databázi
 */
function createDatabase() {
    // Vytvoření adresáře pro databázi, pokud neexistuje
    const dbDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }

    // Připojení k SQLite databázi
    const db = new Database(path.join(dbDir, 'sports.db'));

    // Povolení cizích klíčů pro referenční integritu
    db.pragma('foreign_keys = ON');

    // Vytvoření tabulky týmů
    db.exec(`
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            short_name TEXT,
            country TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Vytvoření tabulky hráčů
    db.exec(`
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            team_id INTEGER,
            name TEXT NOT NULL,
            position TEXT,
            number INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(team_id) REFERENCES teams(id)
        )
    `);

    // Vytvoření tabulky zápasů
    db.exec(`
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            home_team_id INTEGER,
            away_team_id INTEGER,
            match_date TIMESTAMP,
            stadium TEXT,
            status TEXT,
            score_home INTEGER,
            score_away INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (home_team_id) REFERENCES teams (id),
            FOREIGN KEY (away_team_id) REFERENCES teams (id)
        )
    `);

    // Vytvoření tabulky událostí
    db.exec(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER,
            team_id INTEGER,
            player_id INTEGER,
            event_type TEXT CHECK(event_type IN ('goal', 'yellow_card', 'red_card')),
            minute INTEGER CHECK(minute BETWEEN 1 AND 90),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (match_id) REFERENCES matches (id),
            FOREIGN KEY (team_id) REFERENCES teams (id),
            FOREIGN KEY (player_id) REFERENCES players (id)
        )
    `);

    // Uzavření spojení s databází
    db.close();
}

// Spuštění vytvoření databáze
createDatabase();
console.log('Databáze a tabulky byly úspěšně vytvořeny!'); 