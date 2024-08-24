const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const uniqid = require('uniqid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading notes:', err);
    res.status(500).json({ error: 'Failed to read notes data' });
  }
});

app.post('/api/notes', async (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and text are required' });
  }

  const newNote = { title, text, id: uniqid() };

  try {
    const data = await fs.readFile(path.join(__dirname, 'db.json'), 'utf8');
    const notes = JSON.parse(data);
    notes.push(newNote);
    await fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes, null, 2));
    res.json(newNote);
  } catch (err) {
    console.error('Error saving note:', err);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// Handle unknown routes gracefully
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start the server
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
