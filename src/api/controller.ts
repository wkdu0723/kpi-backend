import express from "express";
import { getUserIssuesHandler } from "../db/handler";
import { getSearchData } from "../db/jira";
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

/** 검색결과에 맞는 데이터를 가지고옵니다. */
const searchdData = async (req: any, res: any) => {
    try {
        const filter = req.query.filter || "";
        const keyword = req.query.keyword || "";
        const allIssues = await getSearchData(filter, keyword);
        res.json(allIssues ? allIssues : []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "데이터를 가지고 오는데 실패하였습니다." });
    }
}

router.get("/issues/all_issues", userAllIssues);
router.get("/issues/search", searchdData);

export default router;