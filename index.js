const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/data', (req, res) => {
    console.log(req.body); // Contains the parsed JSON object
    res.status(200).json({
        message: 'Data received!',
        data: req.body
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
