const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const port = 3000;

// Připojení k databázi
const db = new Database(path.join(__dirname, 'data', 'sports.db'));
db.pragma('foreign_keys = ON');

// Middleware pro parsování JSON
app.use(express.json());

// GET /teams - Získat všechny týmy
app.get('/teams', (req, res) => {
    const teams = db.prepare('SELECT * FROM teams').all();
    res.json(teams);
});

// GET /teams/:id - Získat tým podle ID
app.get('/teams/:id', (req, res) => {
    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id);
    if (team) {
        res.json(team);
    } else {
        res.status(404).send('Tým nebyl nalezen');
    }
});

// POST /teams - Vytvořit nový tým
app.post('/teams', (req, res) => {
    const { name, short_name, country } = req.body;
    const result = db.prepare('INSERT INTO teams (name, short_name, country) VALUES (?, ?, ?)').run(name, short_name, country);
    res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /teams/:id - Aktualizovat tým
app.put('/teams/:id', (req, res) => {
    const { name, short_name, country } = req.body;
    const result = db.prepare('UPDATE teams SET name = ?, short_name = ?, country = ? WHERE id = ?').run(name, short_name, country, req.params.id);
    if (result.changes > 0) {
        res.send('Tým byl aktualizován');
    } else {
        res.status(404).send('Tým nebyl nalezen');
    }
});

// DELETE /teams/:id - Smazat tým
app.delete('/teams/:id', (req, res) => {
    // Kontrola, které záznamy odkazují na tým
    const players = db.prepare('SELECT * FROM players WHERE team_id = ?').all(req.params.id);
    const matches = db.prepare('SELECT * FROM matches WHERE home_team_id = ? OR away_team_id = ?').all(req.params.id, req.params.id);

    // Odstranění záznamů, které odkazují na tým
    if (players.length > 0) {
        db.prepare('DELETE FROM players WHERE team_id = ?').run(req.params.id);
    }
    if (matches.length > 0) {
        db.prepare('DELETE FROM matches WHERE home_team_id = ? OR away_team_id = ?').run(req.params.id, req.params.id);
    }

    // Nyní smažeme samotný tým
    const result = db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
    if (result.changes > 0) {
        res.send('Tým byl smazán');
    } else {
        res.status(404).send('Tým nebyl nalezen');
    }
});

// CRUD operace pro Hráče (Players)

// GET /players - Získat všechny hráče
app.get('/players', (req, res) => {
    try {
        const players = db.prepare('SELECT * FROM players').all();
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /players/:id - Získat hráče podle ID
app.get('/players/:id', (req, res) => {
    try {
        const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
        if (player) {
            res.json(player);
        } else {
            res.status(404).send('Hráč nebyl nalezen');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /players - Vytvořit nového hráče
app.post('/players', (req, res) => {
    const { team_id, name, position, number } = req.body;
    if (!team_id || !name) {
        return res.status(400).json({ error: 'Team ID and name are required' });
    }
    try {
        // Ověření existence týmu
        const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(team_id);
        if (!team) {
            return res.status(404).json({ error: 'Tým s daným team_id nebyl nalezen' });
        }

        const result = db.prepare(`
            INSERT INTO players (team_id, name, position, number)
            VALUES (?, ?, ?, ?)
        `).run(team_id, name, position, number);
        res.status(201).json({ id: result.lastInsertRowid, team_id, name, position, number });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /players/:id - Aktualizovat hráče
app.put('/players/:id', (req, res) => {
    const { team_id, name, position, number } = req.body;
    if (!team_id || !name) {
        return res.status(400).json({ error: 'Team ID and name are required' });
    }
    try {
        // Ověření existence týmu, pokud je team_id poslán
        if (team_id) {
            const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(team_id);
            if (!team) {
                return res.status(404).json({ error: 'Tým s daným team_id nebyl nalezen' });
            }
        }

        const result = db.prepare(`
            UPDATE players 
            SET team_id = ?, name = ?, position = ?, number = ? 
            WHERE id = ?
        `).run(team_id, name, position, number, req.params.id);
        
        if (result.changes > 0) {
            res.json({ message: 'Hráč byl aktualizován', id: req.params.id });
        } else {
            res.status(404).send('Hráč nebyl nalezen pro aktualizaci');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /players/:id - Smazat hráče
app.delete('/players/:id', (req, res) => {
    try {
        // Nejprve smazat všechny události spojené s tímto hráčem
        db.prepare('DELETE FROM events WHERE player_id = ?').run(req.params.id);

        // Poté smazat hráče
        const result = db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
        if (result.changes > 0) {
            res.send('Hráč a jeho události byly smazány');
        } else {
            res.status(404).send('Hráč nebyl nalezen');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD operace pro Zápasy (Matches)

// GET /matches - Získat všechny zápasy
app.get('/matches', (req, res) => {
    try {
        const matches = db.prepare('SELECT * FROM matches').all();
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /matches/:id - Získat zápas podle ID
app.get('/matches/:id', (req, res) => {
    try {
        const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
        if (match) {
            res.json(match);
        } else {
            res.status(404).send('Zápas nebyl nalezen');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /matches - Vytvořit nový zápas
app.post('/matches', (req, res) => {
    const { home_team_id, away_team_id, match_date, stadium } = req.body;
    if (!home_team_id || !away_team_id || !match_date) {
        return res.status(400).json({ error: 'Home team ID, away team ID, and match date are required' });
    }
    if (home_team_id === away_team_id) {
        return res.status(400).json({ error: 'Home team and away team cannot be the same' });
    }
    try {
        // Ověření existence týmů
        const homeTeam = db.prepare('SELECT id FROM teams WHERE id = ?').get(home_team_id);
        const awayTeam = db.prepare('SELECT id FROM teams WHERE id = ?').get(away_team_id);
        if (!homeTeam) {
            return res.status(404).json({ error: 'Domácí tým nebyl nalezen' });
        }
        if (!awayTeam) {
            return res.status(404).json({ error: 'Hostující tým nebyl nalezen' });
        }

        const result = db.prepare(`
            INSERT INTO matches (home_team_id, away_team_id, match_date, stadium, status, score_home, score_away)
            VALUES (?, ?, ?, ?, 'scheduled', 0, 0)
        `).run(home_team_id, away_team_id, match_date, stadium || 'Neznámý stadion');
        res.status(201).json({ id: result.lastInsertRowid, home_team_id, away_team_id, match_date, stadium: stadium || 'Neznámý stadion', status: 'scheduled', score_home: 0, score_away: 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /matches/:id - Aktualizovat zápas
app.put('/matches/:id', (req, res) => {
    const { match_date, stadium, status, score_home, score_away } = req.body;
    // Zde bychom mohli přidat validaci pro status, score_home, score_away
    try {
        // Nejprve načteme stávající zápas, abychom mohli použít původní hodnoty, pokud nejsou v requestu
        const existingMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
        if (!existingMatch) {
            return res.status(404).send('Zápas nebyl nalezen pro aktualizaci');
        }

        const updatedMatchData = {
            match_date: match_date !== undefined ? match_date : existingMatch.match_date,
            stadium: stadium !== undefined ? stadium : existingMatch.stadium,
            status: status !== undefined ? status : existingMatch.status,
            score_home: score_home !== undefined ? score_home : existingMatch.score_home,
            score_away: score_away !== undefined ? score_away : existingMatch.score_away
        };

        const result = db.prepare(`
            UPDATE matches 
            SET match_date = ?, stadium = ?, status = ?, score_home = ?, score_away = ?
            WHERE id = ?
        `).run(updatedMatchData.match_date, updatedMatchData.stadium, updatedMatchData.status, updatedMatchData.score_home, updatedMatchData.score_away, req.params.id);
        
        if (result.changes > 0) {
            res.json({ message: 'Zápas byl aktualizován', id: req.params.id });
        } else {
            // Toto by nemělo nastat, pokud jsme ověřili existenci zápasu výše
            res.status(404).send('Zápas nebyl nalezen pro aktualizaci (po ověření)');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /matches/:id - Smazat zápas
app.delete('/matches/:id', (req, res) => {
    try {
        // Nejprve smazat všechny události spojené s tímto zápasem
        db.prepare('DELETE FROM events WHERE match_id = ?').run(req.params.id);

        // Poté smazat zápas
        const result = db.prepare('DELETE FROM matches WHERE id = ?').run(req.params.id);
        if (result.changes > 0) {
            res.send('Zápas a jeho události byly smazány');
        } else {
            res.status(404).send('Zápas nebyl nalezen');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD operace pro Události (Events)

// GET /events - Získat všechny události
app.get('/events', (req, res) => {
    try {
        const events = db.prepare('SELECT * FROM events').all();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /events/:id - Získat událost podle ID
app.get('/events/:id', (req, res) => {
    try {
        const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
        if (event) {
            res.json(event);
        } else {
            res.status(404).send('Událost nebyla nalezena');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /events - Vytvořit novou událost
app.post('/events', (req, res) => {
    const { match_id, team_id, player_id, event_type, minute, description } = req.body;
    if (!match_id || !team_id || !player_id || !event_type || minute === undefined) {
        return res.status(400).json({ error: 'Match ID, team ID, player ID, event type, and minute are required' });
    }
    if (!['goal', 'yellow_card', 'red_card'].includes(event_type)) {
        return res.status(400).json({ error: 'Invalid event type. Must be goal, yellow_card, or red_card.' });
    }
    if (minute < 1 || minute > 120) { // Umožňuji i prodloužení
        return res.status(400).json({ error: 'Minute must be between 1 and 120.' });
    }

    try {
        // Ověření existence zápasu, týmu a hráče
        const match = db.prepare('SELECT id, home_team_id, away_team_id FROM matches WHERE id = ?').get(match_id);
        if (!match) return res.status(404).json({ error: 'Zápas nebyl nalezen' });
        
        const team = db.prepare('SELECT id FROM teams WHERE id = ?').get(team_id);
        if (!team) return res.status(404).json({ error: 'Tým nebyl nalezen' });
        
        const player = db.prepare('SELECT id, team_id FROM players WHERE id = ?').get(player_id);
        if (!player) return res.status(404).json({ error: 'Hráč nebyl nalezen' });

        // Ověření, zda hráč patří do týmu, který je uveden v události
        if (player.team_id !== team_id) {
            return res.status(400).json({ error: 'Hráč nepatří do uvedeného týmu.'});
        }
        // Ověření, zda tým v události hraje v daném zápase
        if (match.home_team_id !== team_id && match.away_team_id !== team_id) {
            return res.status(400).json({ error: 'Uvedený tým nehraje v tomto zápase.'});
        }

        const stmt = db.transaction(() => {
            const result = db.prepare(`
                INSERT INTO events (match_id, team_id, player_id, event_type, minute, description)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(match_id, team_id, player_id, event_type, minute, description || null);
            const eventId = result.lastInsertRowid;

            if (event_type === 'goal') {
                if (team_id === match.home_team_id) {
                    db.prepare('UPDATE matches SET score_home = score_home + 1 WHERE id = ?').run(match_id);
                } else if (team_id === match.away_team_id) {
                    db.prepare('UPDATE matches SET score_away = score_away + 1 WHERE id = ?').run(match_id);
                }
            }
            res.status(201).json({ id: eventId, match_id, team_id, player_id, event_type, minute, description });
        });
        stmt();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /events/:id - Aktualizovat událost (pouze minuta a popis)
app.put('/events/:id', (req, res) => {
    const { minute, description } = req.body;
    if (minute === undefined && description === undefined) {
        return res.status(400).json({ error: 'Alespoň minuta nebo popis musí být uveden pro aktualizaci.'});
    }
    if (minute !== undefined && (minute < 1 || minute > 120)) {
        return res.status(400).json({ error: 'Minuta musí být mezi 1 a 120.' });
    }

    try {
        const existingEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
        if (!existingEvent) {
            return res.status(404).send('Událost nebyla nalezena pro aktualizaci');
        }

        const updatedMinute = minute !== undefined ? minute : existingEvent.minute;
        const updatedDescription = description !== undefined ? description : existingEvent.description;

        // Pro jednoduchost nepovolujeme měnit typ události, team_id nebo player_id, což by komplikovalo logiku skóre
        const result = db.prepare(`
            UPDATE events 
            SET minute = ?, description = ? 
            WHERE id = ?
        `).run(updatedMinute, updatedDescription, req.params.id);
        
        if (result.changes > 0) {
            res.json({ message: 'Událost byla aktualizována', id: req.params.id });
        } else {
            res.status(404).send('Událost nebyla nalezena pro aktualizaci (po ověření)');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /events/:id - Smazat událost
app.delete('/events/:id', (req, res) => {
    try {
        const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
        if (!event) {
            return res.status(404).send('Událost nebyla nalezena');
        }

        const stmt = db.transaction(() => {
            const result = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);

            if (result.changes > 0 && event.event_type === 'goal') {
                const match = db.prepare('SELECT home_team_id, away_team_id FROM matches WHERE id = ?').get(event.match_id);
                if (match) { // Může se stát, že zápas byl mezitím smazán, i když by neměl kvůli FK
                    if (event.team_id === match.home_team_id) {
                        db.prepare('UPDATE matches SET score_home = score_home - 1 WHERE id = ? AND score_home > 0').run(event.match_id);
                    } else if (event.team_id === match.away_team_id) {
                        db.prepare('UPDATE matches SET score_away = score_away - 1 WHERE id = ? AND score_away > 0').run(event.match_id);
                    }
                }
            }
            if (result.changes > 0) {
                 res.send('Událost byla smazána' + (event.event_type === 'goal' ? ' a skóre bylo upraveno' : ''));
            } else {
                 res.status(404).send('Událost nebyla nalezena (během mazání)'); // Mělo by být ošetřeno výše
            }
        });
        stmt();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
}); 