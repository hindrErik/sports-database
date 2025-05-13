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
    const result = db.prepare('DELETE FROM teams WHERE id = ?').run(req.params.id);
    if (result.changes > 0) {
        res.send('Tým byl smazán');
    } else {
        res.status(404).send('Tým nebyl nalezen');
    }
});

// Spuštění serveru
app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
}); 