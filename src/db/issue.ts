import { logError } from "@util/error";
import { JiraProjectDBData } from "../defines/JiraDb";
import { IssueSearch } from "../defines/db/issue";
import { db } from "./jira";
import { toCountWrapper } from "@db/global";

/**
 * 이슈 검색 쿼리
 */
export const issueSelectBySrch = (srch: IssueSearch, paging: any) => {
  let query = "SELECT * FROM JIRA_MAIN WHERE TRUE";

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

  query += ` ORDER BY CREATED DESC LIMIT ${paging.limit ?? 10} OFFSET ${
    paging.offset ?? 0
  }`;

  return new Promise<JiraProjectDBData[]>((resolve, reject) => {
    db.all(query, (err, results: JiraProjectDBData[]) => {
      if (err) {
        // errorLogger("ErrorSelect"); // TODO:: error util 추가
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};

/**
 *
 * @param limit
 * @param offset
 * @returns
 */

// renewal
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