import express from "express";
import { getUserIssuesHandler } from "../db/handler";
import {
  getWorkTimeGroupByUser,
  getSearchData,
  getSearchUserProjectData,
} from "../db/jira";
import { JiraProjectDBData, JiraWorkLogFrontData } from "../defines/JiraDb";
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
const searchdData = async (req: any, res: any) => {
  try {
    const filter = req.query.filter || "";
    const keyword = req.query.keyword || "";
    const rowsPerPage = parseInt(req.query.rowsPerPage) || 10;
    const allIssues = await getSearchData(filter, keyword, rowsPerPage);
    if (!allIssues) res.json([]);

    // 모든 이슈 ID에 대해 작업 로그 데이터를 가져옵니다.
    // const worklogDataPromises = allIssues.map(issue => getWorkTimeGroupByUser(issue.id));
    // const worklogData = await Promise.all(worklogDataPromises);
    // const floatWorklog = worklogData.flat() as JiraWorkLogFrontData[];

    // const issuesWithWorklogs = allIssues.map(issue => {
    //     return { ...issue, worklogs: floatWorklog.filter((log) => log.issue_id === issue.id) };
    // });

    // const sortIssue = issuesWithWorklogs.sort((a, b) => {
    //     return new Date(b.created).getTime() - new Date(a.created).getTime();
    // });

    res.json(allIssues);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "데이터를 가지고 오는데 실패하였습니다.",
    });
  }
};

// router.get("/issues/user", userAllIssues);

export default router;
