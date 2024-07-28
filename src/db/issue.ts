import { logError } from "@util/error";

import { toCountWrapper } from "@db/global";

import { JiraProjectDBData } from "@defines/JiraDb";
import { IssueSrch, IssueVO } from "@defines/db/issue";
import { WorklogDBData } from "@defines/db/worklog";

import { db } from "./jira";

/**
 * 최상위 이슈 조회 공통 쿼리
 */
const queryBySelectTopIssues = `SELECT * FROM JIRA_MAIN WHERE PARENT_ID IS NULL ORDER BY CREATED DESC`;
/**
 * 최상위 이슈만을 조회
 * @returns
 */
export const dbSelectTopIssueList = (limit: number, offset: number) => {
  const query = `${queryBySelectTopIssues} LIMIT ${limit} OFFSET ${offset};`;

  return new Promise<JiraProjectDBData[]>((resolve, reject) => {
    db.all(query, (err, results: JiraProjectDBData[]) => {
      if (err) {
        logError(err);
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};

/**
 * 최상위 이슈의 전체 count를 조회
 * @returns Map<string, nubmer> { totalCount: 2 }
 */
export const dbSelectTopIssueCount = (): Promise<Map<string, number>> => {
  return new Promise<Map<string, number>>((resolve, reject) => {
    db.get(
      toCountWrapper(queryBySelectTopIssues),
      (err: Error, result: { totalCount: number }) => {
        if (err) {
          logError(err);
          reject(new Map<string, number>([["totalCount", 0]]));
        } else {
          const countMap = new Map<string, number>([
            ["totalCount", result.totalCount],
          ]);
          resolve(countMap);
        }
      }
    );
  });
};

/**
 * 최상위 이슈 id로 하위 issueList를 조회
 * @param topIssueId 최상위 이슈 id
 * @returns JiraProjectDBData[]
 */
export const dbSelectTopIssueListByTopIssueId = (topIssueId: string) => {
  const query = `SELECT * FROM JIRA_MAIN WHERE PARENT_ID = '${topIssueId}'`;

  return new Promise<JiraProjectDBData[]>((resolve, reject) => {
    db.all(query, (err, results: JiraProjectDBData[]) => {
      if (err) {
        logError(err);
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};

/**
 * 매개변수 쿼리에 srch 조건에 따른 검색 쿼리를 더해서 반환한다.
 * @param query
 * @param srch
 * @returns query 조합된 전체 쿼리
 */
const addSrchToIssueQuery = (query: string, srch: IssueSrch) => {
  if (srch.userId) {
    query += ` AND ASSIGNEE_ACCOUNT_ID = '${srch.userId}'`;
  }

  if (srch.userName) {
    query += ` AND ASSIGNEE_DISPLAY_NAME = '${decodeURIComponent(
      srch.userName
    )}'`;
  }

  if (srch.startDate) {
    query += ` AND START_DATE = '${srch.startDate}'`;
  }

  query += ` ORDER BY CREATED DESC LIMIT ${srch.limit ?? 10} OFFSET ${
    srch.offset ?? 0
  }`;
  return query;
};

/**
 * 이슈 검색 조건에 따른 조회 쿼리 반환
 * @param srch
 * @returns query 전체 쿼리
 */
const queryBySelectIssueListBySrch = (srch: IssueSrch) => {
  let query = "SELECT * FROM JIRA_MAIN WHERE TRUE";
  query = addSrchToIssueQuery(query, srch);
  return query;
};

export const dbSelectIssueListBySrch = (srch: IssueSrch) => {
  return new Promise<JiraProjectDBData[]>((resolve, reject) => {
    db.all(
      queryBySelectIssueListBySrch(srch),
      (err, results: JiraProjectDBData[]) => {
        if (err) {
          logError(err);
          reject([]);
        } else {
          resolve(results);
        }
      }
    );
  });
};

/**
 * 이슈 리스트 검색 결과 count 조회
 * @param srch
 * @returns
 */
export const dbSelectIssueListBySrchCount = (
  srch: IssueSrch
): Promise<Map<string, number>> => {
  return new Promise<Map<string, number>>((resolve, reject) => {
    db.get(
      toCountWrapper(queryBySelectIssueListBySrch(srch)),
      (err: Error, result: { totalCount: number }) => {
        if (err) {
          logError(err);
          reject(new Map<string, number>([["totalCount", 0]]));
        } else {
          const countMap = new Map<string, number>([
            ["totalCount", result.totalCount],
          ]);
          resolve(countMap);
        }
      }
    );
  });
};
