const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/jira/webhook', (req, res) => {
    const eventData = req.body;
    console.log('Received Jira Webhook Event:', eventData);

    res.status(200).send('Webhook Received');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});