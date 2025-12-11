const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 8000;
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  password TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL
)`);

async function insertRandomUsers() {
  try {
    const urls = [1, 2, 3].map(() => axios.get('https://randomuser.me/api/'));
    const results = await Promise.all(urls);
    const users = results.map(r => r.data.results[0]);

    users.forEach(u => {
        const fullName = `${u.name.first} ${u.name.last}`;
        const password = u.login.password;

        db.run(
        `INSERT INTO users (name, password) VALUES (?, ?)`,
        [fullName, password],
        (err) => {
            if (err) console.error(err.message);
        }
        );
    });
    console.log('Inserted 3 users into database.');
  } catch (err) {
    console.error('Error inserting users:', err.message);
  }
}

app.get('/populate', async (req, res) => {
  await insertRandomUsers();
  res.send('Inserted 3 users into database.');
});



app.get('/users', (req, res) => {
  db.all('SELECT id, name FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({error: 'Database error'});
    res.json(rows);
  });
});

app.get('/user/:id', (req, res) => {
    const userId = req.params.id;

    // Validation : On s'assure que c'est bien un nombre
    if (isNaN(userId)) {
        return res.status(400).json({ error: "L'ID doit être un nombre" });
    }
    
    // Requête paramétrée : Impossible d'injecter du SQL ici
    db.all(
        "SELECT id, name, password FROM users WHERE id = ?",
        [userId], 
        (err, rows) => {
            if (err) {
                console.error('SQL Error:', err.message);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            res.json(rows);
        }
    );
});

app.post('/comment', (req, res) => {
  // On attend un JSON { "content": "mon commentaire" }
  const { content } = req.body; 
  
  if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: "Contenu invalide" });
  }
  
db.run(
    `INSERT INTO comments (content) VALUES (?)`,
    [content],
    function(err) { // Utilisation de function() pour avoir accès à this.lastID
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get('/comments', (req, res) => {
  db.all('SELECT * FROM comments ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Secure App listening on port ${port}`);
});
