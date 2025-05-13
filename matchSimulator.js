const Database = require('better-sqlite3');
const path = require('path');

// Připojení k databázi
const db = new Database(path.join(__dirname, 'data', 'sports.db'));
db.pragma('foreign_keys = ON');

// Funkce pro získání náhodného týmu
function getRandomTeam() {
    const teams = db.prepare('SELECT id FROM teams').all();
    if (teams.length === 0) {
        throw new Error('Nejsou k dispozici žádné týmy v databázi');
    }
    return teams[Math.floor(Math.random() * teams.length)].id;
}

// Funkce pro vytvoření nového zápasu
function createMatch() {
    const homeTeamId = getRandomTeam();
    let awayTeamId;
    do {
        awayTeamId = getRandomTeam();
    } while (awayTeamId === homeTeamId);

    const matchDate = new Date().toISOString();
    const stadium = 'Hlavní stadion';
    const status = 'in_progress';

    const result = db.prepare(`
        INSERT INTO matches (home_team_id, away_team_id, match_date, stadium, status)
        VALUES (?, ?, ?, ?, ?)
    `).run(homeTeamId, awayTeamId, matchDate, stadium, status);

    return {
        matchId: result.lastInsertRowid,
        homeTeamId,
        awayTeamId
    };
}

// Funkce pro přidání události do zápasu
function addEvent(matchId, teamId, eventType, minute) {
    // Získáme náhodného hráče z týmu
    const players = db.prepare('SELECT id FROM players WHERE team_id = ?').all(teamId);
    if (players.length === 0) {
        throw new Error('Tým nemá žádné hráče');
    }
    const playerId = players[Math.floor(Math.random() * players.length)].id;

    const description = `${eventType === 'goal' ? 'Gól' : eventType === 'yellow_card' ? 'Žlutá karta' : 'Červená karta'}`;

    db.prepare(`
        INSERT INTO events (match_id, team_id, player_id, event_type, minute, description)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(matchId, teamId, playerId, eventType, minute, description);

    // Aktualizujeme skóre pokud je to gól
    if (eventType === 'goal') {
        const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
        if (match.home_team_id === teamId) {
            db.prepare('UPDATE matches SET score_home = score_home + 1 WHERE id = ?').run(matchId);
        } else {
            db.prepare('UPDATE matches SET score_away = score_away + 1 WHERE id = ?').run(matchId);
        }
    }
}

// Funkce pro generování náhodné minuty
function getRandomMinute() {
    return Math.floor(Math.random() * 90) + 1;
}

// Hlavní funkce pro simulaci zápasu
function simulateMatch() {
    try {
        // Vytvoříme nový zápas
        const { matchId, homeTeamId, awayTeamId } = createMatch();
        console.log('Nový zápas byl vytvořen s ID:', matchId);

        // Generujeme minimálně 3 góly
        for (let i = 0; i < 3; i++) {
            const teamId = Math.random() < 0.5 ? homeTeamId : awayTeamId;
            addEvent(matchId, teamId, 'goal', getRandomMinute());
        }

        // Přidáme žlutou kartu
        const yellowCardTeamId = Math.random() < 0.5 ? homeTeamId : awayTeamId;
        addEvent(matchId, yellowCardTeamId, 'yellow_card', getRandomMinute());

        // Přidáme červenou kartu
        const redCardTeamId = Math.random() < 0.5 ? homeTeamId : awayTeamId;
        addEvent(matchId, redCardTeamId, 'red_card', getRandomMinute());

        // Získáme finální skóre
        const finalScore = db.prepare('SELECT score_home, score_away FROM matches WHERE id = ?').get(matchId);
        console.log('Zápas byl úspěšně simulován!');
        console.log('Finální skóre:', finalScore.score_home, ':', finalScore.score_away);

    } catch (error) {
        console.error('Chyba při simulaci zápasu:', error.message);
    }
}

// Spuštění simulace
simulateMatch();

// Uzavření spojení s databází
db.close(); 