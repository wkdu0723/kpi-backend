import { Request, Response } from "express";
import { issueSearch } from "../defines/query/issue.type";

import { issueSelectBySrch } from "../db/jira";
// ASK:: db의 경우 그렇다면 jira.ts만 선언해야 하는 것 아닌가?
// import { issueSelectBySrch } from "../query/issue.query";

/**
 * 이슈들 조회
 *
 * startDate: 이슈 시작 날짜
 */
export const issueGetBySrch = async (req: Request, resp: Response) => {
  const { startDate } = req.query;

  const srch: issueSearch = {
    startDate: startDate ? startDate.toString() : "",
  };

  const page = {
    limit: 10,
    offset: 0,
  };

  try {
    const issues = await issueSelectBySrch(srch, page);
    return resp.json(issues);
  } catch (e) {
    console.error("error 발생", e); // 추후 에러메세지 logger util로 대체
  }
};
