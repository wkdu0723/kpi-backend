import express from "express";

import {
    selectIssueListBySrch,
    selectIssueListByTopIssueId,
    selectTopIssueList,
} from "@api/issue";
import { selectUserIssueAndWorkTimeBySrch } from "@api/user";
import { getJiraIssue } from "@db/jira";

const router = express.Router();

/** ISSUE */
// 최상위 이슈들 조회
router.get("/issues", selectTopIssueList);
// 최상위 이슈 id로 하위 리스트 조회
router.get("/issues/:topIssueId/sub", selectIssueListByTopIssueId);
// 이슈 검색
router.get("/issues/search", selectIssueListBySrch);

// 사용자별 이슈 리스트 + 총 작업시간 조회
router.get("/user/issues", selectUserIssueAndWorkTimeBySrch);

router.get("/all_issues", async (req, res) => {
    try {
        const issues = await getJiraIssue();
        res.status(200).json(issues); // 성공적으로 데이터를 반환
    } catch (err) {
        console.error("Error fetching Jira issues:", err);
        res.status(500).json({ message: "서버 오류" }); 
    }
});

export default router;
