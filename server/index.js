const axios = require('axios');
const express = require("express");
const fs = require("fs");
const path = require("path");
const webhookUrl = 'http://73.60.208.53:3001/data';
const webhookUrl_Startup = 'http://73.60.208.53:3001/startup';
//const webhookUrl = 'http://localhost:3001/data';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client"))); // Serves your frontend files

// Paths to data files
const dataFilePath = path.join(__dirname, "../data/data.json");
const summaryFilePath = path.join(__dirname, "../data/summary.json");

// Helper function to read/write raw data
function readData() {
  if (!fs.existsSync(dataFilePath)) return [];
  const file = fs.readFileSync(dataFilePath);
  return JSON.parse(file);
}

function writeData(newData) {
  fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
}




// =========================
// SUMMARY GENERATOR LOGIC
// =========================
function generateSummary() {
  const rawData = readData();

  const teams = {};

  for (const item of rawData) {
    const team = item.teamNumber;

    if (!teams[team]) {
      teams[team] = {
        teamNumber: team,
        scores: [],
        matches: [],
        notes: []
      };
    }

    teams[team].scores.push(Number(item.score));
    teams[team].matches.push(Number(item.matchNumber));

    if (item.notes && item.notes.trim() !== "") {
      teams[team].notes.push(item.notes.trim());
    }
  }

  const summary = Object.values(teams).map(team => ({
    teamNumber: team.teamNumber,
    averageScore: team.scores.reduce((a, b) => a + b, 0) / team.scores.length,
    matches: team.matches,
    notes: team.notes
  }));

  return summary;
}

function writeSummary(summaryData) {
  fs.writeFileSync(summaryFilePath, JSON.stringify(summaryData, null, 2));
}

// =========================
// API ROUTES
// =========================

// Handle raw submissions
app.post("/api/submit", (req, res) => {
  const data = req.body;

  if (!data.teamNumber || !data.matchNumber || !data.score) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const currentData = readData();
  currentData.push({
    ...data,
    timestamp: new Date().toISOString(),
  });

  writeData(currentData);

  const payload = {
    teamNumber: data.teamNumber,
    matchNumber: data.matchNumber,
    score: data.score,
    notes: data.notes,
    timestamp: new Date().toISOString()
};

axios.post(webhookUrl, payload, {
    headers: {
        'Content-Type': 'application/json'
    }
})
  console.log("✅ Data received:", data);
  res.json({ message: "Data successfully saved!" });
});

// Generate summary.json
app.get("/api/summary/generate", (req, res) => {
  const summary = generateSummary();
  writeSummary(summary);
  res.json({ message: "Summary generated", summary });
});

// Return summary.json contents
app.get("/api/summary", (req, res) => {
  if (!fs.existsSync(summaryFilePath)) {
    return res.status(404).json({ message: "summary.json not found. Generate it first." });
  }

  const summaryData = JSON.parse(fs.readFileSync(summaryFilePath));
  res.json(summaryData);
});

const payload = {
    username: "ProtoQR Scout",
    content: "Server Started!",
    // Add any other data your webhook expects
    data: {
        status: "success",
        timestamp: new Date().toISOString()
    }
};

axios.post(webhookUrl_Startup, payload, {
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => {
    console.log('Webhook sent successfully! Status:', response.status);
})
.catch(error => {
    console.error('Error sending webhook:', error.message);
});

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
