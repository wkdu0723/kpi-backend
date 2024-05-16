import express from "express";
import { getUserIssuesHandler } from "../db/handler";
const router = express.Router();

/** 유저의 모든 이슈 데이터를 가지고옵니다. */
const userAllIssues = async (req: any, res: any) => {
    try {
        const accountId = req.query.accountId || "";
        const allIssues = await getUserIssuesHandler(accountId);
        res.json(allIssues ? allIssues : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "이슈를 가지고 오는데 실패하였습니다." });
    }
};

router.get("/all_issues", userAllIssues);

export default router;