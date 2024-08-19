const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));



// HTML Routes

// GET /notes should return the notes.html file.
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// GET * should return the index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// API Routes

// GET /api/notes should read the db.json file and return all saved notes as JSON.
app.get('/api/notes', (req, res) => {
  fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes data' });
    }
    res.json(JSON.parse(data));
  });
});

// POST /api/notes should receive a new note, add it to the db.json file, and return the new note to the client.
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  const newNote = {
    id: uuidv4(),
    title,
    text,
  };

  fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read notes data' });
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save note' });
      }

      res.json(newNote);
    });
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
