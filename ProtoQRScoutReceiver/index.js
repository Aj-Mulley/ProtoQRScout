const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data/data.json');
function writeData(newData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
}
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const file = fs.readFileSync(DATA_FILE);
  return JSON.parse(file);
}
function writeData(newData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
}
// Middleware to parse JSON bodies
app.use(express.json());

app.post('/data', (req, res) => {
    console.log(req.body); // Contains the parsed JSON object
    data = req.body
    
    res.status(200).json({
        message: 'Data received!',
        resData: req.body
    });
    const currentData = readData();
       currentData.push({
       ...data,
       timestamp: new Date().toISOString(),
    });

    writeData(currentData);
    
});
app.post('/startup', (req, res) => {
    console.log(req.body); // Contains the parsed JSON object
    data = req.body
    res.status(200).json({
        message: 'Startup Received',
        resData: req.body
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
