const Database = require('better-sqlite3');
const path = require('path');

// Připojení k databázi
const db = new Database(path.join(__dirname, 'data', 'sports.db'));
db.pragma('foreign_keys = ON');

// Testovací data pro týmy
const teams = [
    { name: 'Sparta Praha', short_name: 'SPA', country: 'ČR' },
    { name: 'Slavia Praha', short_name: 'SLA', country: 'ČR' },
    { name: 'Baník Ostrava', short_name: 'OST', country: 'ČR' },
    { name: 'Viktoria Plzeň', short_name: 'PLZ', country: 'ČR' }
];

// Testovací data pro hráče
const players = [
    // Sparta Praha
    { team_id: 1, name: 'Jan Kuchta', position: 'Útočník', number: 9 },
    { team_id: 1, name: 'Ladislav Krejčí', position: 'Záložník', number: 8 },
    { team_id: 1, name: 'Martin Vitík', position: 'Obránce', number: 4 },
    
    // Slavia Praha
    { team_id: 2, name: 'Mojmír Chytil', position: 'Útočník', number: 11 },
    { team_id: 2, name: 'Lukáš Masopust', position: 'Záložník', number: 7 },
    { team_id: 2, name: 'Ondřej Kúdela', position: 'Obránce', number: 5 },
    
    // Baník Ostrava
    { team_id: 3, name: 'Václav Jurečka', position: 'Útočník', number: 10 },
    { team_id: 3, name: 'Lukáš Budínský', position: 'Záložník', number: 6 },
    { team_id: 3, name: 'Michal Frydrych', position: 'Obránce', number: 3 },
    
    // Viktoria Plzeň
    { team_id: 4, name: 'Tomáš Chorý', position: 'Útočník', number: 15 },
    { team_id: 4, name: 'Jan Kopic', position: 'Záložník', number: 20 },
    { team_id: 4, name: 'Luděk Pernica', position: 'Obránce', number: 2 }
];

// Vložení týmů
console.log('Vkládám týmy...');
const insertTeam = db.prepare('INSERT INTO teams (name, short_name, country) VALUES (?, ?, ?)');
teams.forEach(team => {
    insertTeam.run(team.name, team.short_name, team.country);
});

// Vložení hráčů
console.log('Vkládám hráče...');
const insertPlayer = db.prepare('INSERT INTO players (team_id, name, position, number) VALUES (?, ?, ?, ?)');
players.forEach(player => {
    insertPlayer.run(player.team_id, player.name, player.position, player.number);
});

console.log('Testovací data byla úspěšně vložena do databáze!');

// Uzavření spojení s databází
db.close(); 