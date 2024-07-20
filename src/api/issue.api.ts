import { Request, Response } from "express";
import { IssueSearch, IssueSrchVO } from "../defines/query/issue.type";

import { issueSelectBySrch } from "../query/issue.query";
import { JiraProjectDBData } from "@defines/JiraDb";

/**
 * 이슈들 조회
 *
 * startDate: 이슈 시작 날짜
 */
export const issueGetBySrch = async (req: Request, resp: Response) => {
  const { startDate } = req.query;

  const srch: IssueSearch = {
    startDate: startDate ? startDate.toString() : "",
  };

  const page = {
    limit: 10,
    offset: 0,
  };

  /**
   * 자식을 부모 이슈의 child[]에 추가
   * @param issues
   */
  const mapngPrntWithChild = (issues: IssueSrchVO[]): IssueSrchVO[] => {
    const store = new Map<string, IssueSrchVO>();

    // 모든 issue를 store에 저장하고 children 배열을 추가함
    issues.forEach((item: IssueSrchVO) => {
      store.set(item.id, item);
    });

    // 각 issue를 순회하며 부모-자식 관계를 설정함
    issues.forEach((item: IssueSrchVO) => {
      if (item.parent_id) {
        const parent = store.get(item.parent_id);
        if (parent) {
          if (!parent.childs) {
            parent.childs = []; // 없으면 초기화하고 push
          }
          parent.childs.push(item);
        }
      }
    });

    const rootIssueVOs: IssueSrchVO[] = [];

    issues.forEach((item: IssueSrchVO) => {
      if (!item.parent_id) {
        rootIssueVOs.push(item);
      }
    });

    return rootIssueVOs;
  };

  try {
    const issues = await issueSelectBySrch(srch, page);
    return resp.json(mapngPrntWithChild(issues));
  } catch (e) {
    console.error("error 발생", e); // 추후 에러메세지 logger util로 대체
  }
};
