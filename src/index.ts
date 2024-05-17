import express from "express";
import bodyParser from "body-parser";
import ngrok from "@ngrok/ngrok";
import { jiraDataMigration, setAccountProjectHandler, setJiraAccountHandler } from "./db/handler";
import { JiraWebhookData } from "./defines/JiraWebhook";
import controller from "./api/controller";
import cors from "cors";
import { openDataBase } from "./db/jira";

const app = express();
app.use(cors());
const port = 3000;

app.use(bodyParser.json());
app.use("/api", controller);

app.post("/jira/webhook", (req, res) => {
    const eventData = req.body as JiraWebhookData;

    jiraDataMigration(eventData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

openDataBase();

// ngrok.connect({
//     addr: 3000,
//     authtoken: "2f8M6urnhQZiyRiGtWm4xjb4FHX_7X6bWYGTdYGXPFmQ45aoT",
// }).then(listener => {
//     console.log(`Ingress established at: ${listener.url()}`);
// });

// setAccountProjectHandler(
//     "6423c871b05b4e3e7daba91f",
//     "wkdu0723@gmail.com",
//     "ATATT3xFfGF0l-sWRAJqNsP9PH6YnL0f0tY8-L-dnCzkcixC1VtxRmkClaQ6gNPw2Ob5l2JLwnptCIdl618E8XM6PgTB0dR557R0bFY7yB8qc9FiAhbUx833eSuZ0G7qV7V3Sq62W7wUnMRQJJXAvf4eNESeFLa5QE3NlqjdXnDYcHi0CYRRJCo=2CC61106"
// );

// setJiraAccountHandler("6423c871b05b4e3e7daba91f", "최영완", "wkdu0723@gmail.com", "ATATT3xFfGF0l-sWRAJqNsP9PH6YnL0f0tY8-L-dnCzkcixC1VtxRmkClaQ6gNPw2Ob5l2JLwnptCIdl618E8XM6PgTB0dR557R0bFY7yB8qc9FiAhbUx833eSuZ0G7qV7V3Sq62W7wUnMRQJJXAvf4eNESeFLa5QE3NlqjdXnDYcHi0CYRRJCo=2CC61106");