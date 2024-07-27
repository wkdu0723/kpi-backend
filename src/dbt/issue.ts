import { logError } from "@util/error.util";
import { JiraProjectDBData } from "../defines/JiraDb";
import { IssueSearch } from "../defines/db/issue";
import { db } from "./jira";

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
const queryBySelectTopIssues = `select * from jira_main where parent_id is null`;
/**
 * 최상위 이슈만을 조회
 * @returns
 */
export const dbSelectTopIssueList = (limit: number, offset: number) => {
  const query = queryBySelectTopIssues + ` limit ${limit} offset ${offset}`;

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

export const dbSelectTopIssueCount = () => {
  return new Promise<JiraProjectDBData[]>((resolve, reject) => {
    db.all(
      queryCountWrapper(queryBySelectTopIssues),
      (err, results: JiraProjectDBData[]) => {
        if (err) {
          logError(err);
          reject(0);
        } else {
          resolve(results);
        }
      }
    );
  });
};
