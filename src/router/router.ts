import express from "express";
import { issueGetBySrch, selectTopissueList } from "../api/issue";
import { getSearchUserProjectData } from "../db/jira";
import { userIssueAndWorkTimeBySrch, userList } from "../api/user";

const router = express.Router();

/** 유저의 이슈 데이터를 가지고옵니다. */
const userAllIssues = async (req: any, res: any) => {
  try {
    const filter = req.query.filter || "";
    const keyword = req.query.keyword || "";
    const rowsPerPage = parseInt(req.query.rowsPerPage) || 10;
    const allIssues = await getSearchUserProjectData(
      filter,
      keyword,
      rowsPerPage
    );
    res.json(allIssues ? allIssues : []);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "이슈를 가지고 오는데 실패하였습니다.",
    });
  }
};

/** 검색결과에 맞는 데이터를 가지고옵니다. */
// const searchdData = async (req: any, res: any) => {
//   try {
//     const filter = req.query.filter || "";
//     const keyword = req.query.keyword || "";
//     const rowsPerPage = parseInt(req.query.rowsPerPage) || 10;
//     const allIssues = await getSearchData(filter, keyword, rowsPerPage);
//     if (!allIssues) res.json([]);

//     // 모든 이슈 ID에 대해 작업 로그 데이터를 가져옵니다.
//     const worklogDataPromises = allIssues.map(issue => getWorkTimeGroupByUser(issue.id));
//     const worklogData = await Promise.all(worklogDataPromises);
//     const floatWorklog = worklogData.flat() as JiraWorkLogFrontData[];

//     const issuesWithWorklogs = allIssues.map(issue => {
//         return { ...issue, worklogs: floatWorklog.filter((log) => log.issue_id === issue.id) };
//     });

//     const sortIssue = issuesWithWorklogs.sort((a, b) => {
//         return new Date(b.created).getTime() - new Date(a.created).getTime();
//     });

//     const

//     res.json(allIssues);

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "데이터를 가지고 오는데 실패하였습니다.",
//     });
//   }
// };

router.get("/issues/user", userAllIssues);

/**
 * 신규 추가
 */
// 검색, 부모-자식 매핑 X
router.get("/issues/search", issueGetBySrch);
// 검색, 부모-자식 매핑 O
// router.get("/issues/search/mapng", issueGetBySrchAndMapng);

// 전체 사용자 리스트 조회
router.get("/users", userList);
router.get("/user/issues", userIssueAndWorkTimeBySrch);

// renewal

router.get("/issues/top", selectTopissueList);

export default router;
