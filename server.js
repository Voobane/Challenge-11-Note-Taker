const express = require('express');
const path = require('path');
const fs = require('fs');
const uniqid = require("uniqid");

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

// API Routes

// GET /api/notes should read the db.json file and return all saved notes as JSON.
app.get('/api/notes', (req, res) => {
  const dbPath = path.join(__dirname, 'public', 'db', 'db.json');
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read notes data:', err);
      return res.status(500).json({ error: 'Failed to read notes data' });
    }

    try {
      const notes = JSON.parse(data); // Parse the JSON data
      res.json(notes); // Return the parsed data
    } catch (parseErr) {
      console.error('Failed to parse notes data:', parseErr);
      return res.status(500).json({ error: 'Failed to parse notes data' });
    }
  });
});

// POST /api/notes should receive a new note, add it to the db.json file, and return the new note to the client.
app.post('/api/notes', (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Note title and text are required' });
  }

  const newNote = {
    title,
    text,
    id: uniqid(), // Generate a unique id for the note
  };

  const dbPath = path.join(__dirname, 'public', 'db', 'db.json');
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read notes data:', err);
      return res.status(500).json({ error: 'Failed to read notes data' });
    }

    let notes;
    try {
      notes = JSON.parse(data); // Parse the existing notes
    } catch (parseErr) {
      console.error('Failed to parse notes data:', parseErr);
      return res.status(500).json({ error: 'Failed to parse notes data' });
    }

    notes.push(newNote); // Add the new note

    fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error('Failed to save note:', err);
        return res.status(500).json({ error: 'Failed to save note' });
      }

      res.json(newNote); // Return the newly added note
    });
  });
});

// GET * should return the index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
