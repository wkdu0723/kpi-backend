import express from "express";
import bodyParser from "body-parser";
import ngrok from "@ngrok/ngrok";
import { jiraProjectDataMigration } from "./db/migrations";
import { JiraWebhookData } from "./defines/JiraWebhook";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/jira/webhook", (req, res) => {
    const eventData = req.body as JiraWebhookData;
    console.log("Received Jira Webhook Event:", eventData);

    jiraProjectDataMigration(eventData);

    res.status(200).send("Webhook Received");
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

ngrok.connect({
    addr: 3000,
    authtoken: "2f8M6urnhQZiyRiGtWm4xjb4FHX_7X6bWYGTdYGXPFmQ45aoT",
}).then(listener => {
    console.log(`Ingress established at: ${listener.url()}`);
});