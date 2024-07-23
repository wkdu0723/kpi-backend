import { Request, Response } from "express";
import { IssueSearch, IssueSrchVO } from "../defines/db/issue.type";

import { issueSelectBySrch } from "../db/issue.db";

import { logError } from "../util/error.util";

/**
 * 자식을 부모 이슈의 child[]에 추가
 * @param issues 이슈 리스트
 * @returns rootIssueVOs 부모와 자식을 매핑한 이슈 리스트
 */
const mapngPrntWithChild = (issues: IssueSrchVO[]): IssueSrchVO[] => {
  const store = new Map<string, IssueSrchVO>();

  // 모든 issue를 store에 저장하고 children 배열을 추가함
  issues.forEach((item: IssueSrchVO) => {
    store.set(item.id, item);
  });

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

/**
 * 이슈 리스트 검색 조회 공통 구현
 * @param req 리퀘스트 객체
 * @returns issues 이슈 리스트
 */
const issueGetBySrchCommon = async (req: Request) => {
  const { startDate, assigneeId, assigneeName } = req.query;

  const srch: IssueSearch = {
    startDate: startDate ? startDate.toString() : "",
    assigneeId: assigneeId ? assigneeId.toString() : "",
    assigneeName: assigneeName ? assigneeName.toString() : "",
  };

  const page = {
    limit: 10,
    offset: 0,
  };

  try {
    const issues = await issueSelectBySrch(srch, page);
    return issues;
  } catch (e) {
    logError(e);
    return [];
  }
};

/**
 * 매핑 없는 이슈 검색 요청에 따른 응답 처리
 * @param req 요쳥
 * @param resp 응답
 * @returns Response<any, Record<string, any>>
 */
export const issueGetBySrch = async (req: Request, resp: Response) => {
  try {
    return resp.json(await issueGetBySrchCommon(req));
  } catch (e) {
    logError(e);
    return [];
  }
};

/**
 * 매핑 있는 이슈 검색 요청에 따른 응답 처리
 * @param req 요청
 * @param resp 응답
 * @returns Response<any, Record<string, any>>
 */
export const issueGetBySrchAndMapng = async (req: Request, resp: Response) => {
  try {
    const issues = await issueGetBySrchCommon(req);
    return resp.json(mapngPrntWithChild(issues));
  } catch (e) {
    logError(e);
    return [];
  }
};
