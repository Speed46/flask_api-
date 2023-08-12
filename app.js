const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database('user.db');

// Create the user table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      age INTEGER,
      gender TEXT,
      email TEXT,
      phone TEXT,
      birth_date TEXT
    )
  `);
});

// Endpoint to search for users by first_name
app.get('/api/users', (req, res) => {
  const { first_name } = req.query;
  if (!first_name) {
    res.status(400).json({ error: 'Missing required query parameter: first_name' });
    return;
  }

  db.all(`SELECT * FROM users WHERE first_name LIKE ?`, [`%${first_name}%`], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'An error occurred while searching for users.' });
      return;
    }

    if (rows.length > 0) {
      res.json(rows);
    } else {
      // If no users found in the database, call the external API
      // In this example, we'll simulate calling the external API and returning dummy data
      const dummyApiResponse = [
        // Dummy user data
      ];

      // Save the dummy data to the user table
      const placeholders = dummyApiResponse.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = dummyApiResponse.flatMap(user => Object.values(user));
      const stmt = db.prepare(`INSERT INTO users (first_name, last_name, age, gender, email, phone, birth_date) VALUES ${placeholders}`);
      stmt.run(flatValues, (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'An error occurred while saving users to the database.' });
          return;
        }

        res.json(dummyApiResponse);
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
