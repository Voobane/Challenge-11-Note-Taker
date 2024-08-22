const express = require("express");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");

// Port
const PORT = process.env.PORT || 3001;

// Creates new app with express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// GET /notes should return the notes.html file.
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// GET * should return the index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get route -> which reads the db.json file and sends back the parsed JSON data
app.get("/api/notes", function (req, res) {
  fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
    var jsonData = JSON.parse(data);
    console.log(jsonData);
    res.json(jsonData);
  });
});

// Reads the newly added notes from the request body and then adds them to the db.json file
const readThenAppendToJson = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeNewNoteToJson(file, parsedData);
    }
  });
};

// Writes data to db.json -> utilized within the readThenAppendToJson function
const writeNewNoteToJson = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

// Post route -> receives a new note, saves it to request body, adds it to the db.json file, and then returns the new note to the client
app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;
  if (title && text) {
    const newNote = {
      title: title,
      text: text,
      id: uniqid(),
    };

    readThenAppendToJson(newNote, "Develop/db/db.json");

    const response = {
      status: "success",
      body: newNote,
    };

    res.json(response);
  } else {
    res.json("Error in posting new note");
  }
});

// Delete route -> reads the db.json file, uses the json objects uniqids to match the object to be deleted, removes that object from the db.json file, then re-writes the db.json file
app.delete("/api/notes/:id", (req, res) => {
  let id = req.params.id;
  let parsedData;
  fs.readFile("Develop/db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      parsedData = JSON.parse(data);
      const filterData = parsedData.filter((note) => note.id !== id);
      writeNewNoteToJson("Develop/db/db.json", filterData);
    }
  });
  res.send(`Deleted note with ${req.params.id}`);
});

// Start the server
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));