import { issueSearch } from "@defines/query/issue.type";
import { issueSelectBySrch } from "@query/issue.query";

/**
 * 프로젝트를 기간별로 조회
 */
export const issueGetBySrch = async (req: any, resp: any) => {
  // const filter = req.query.filter || "";
  // const keyword = req.query.keyword || ""; // req 타입 알아오기

  const srch: issueSearch = {
    startDate: "2024-07-08",
  };
  // const page: Pagination = {
  const page = {
    offset: 0,
    limit: 10,
  };
  const issues = await issueSelectBySrch(srch, page);
  return resp.json(issues); // 응답을 보내는 부분을 추가
};
