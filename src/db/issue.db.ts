import { JiraProjectDBData } from "../defines/JiraDb";
import { IssueSearch } from "../defines/db/issue.type";
import { db } from "./jira";

/**
 * 이슈 검색 쿼리
 */
export const issueSelectBySrch = (srch: IssueSearch, paging: any) => {
  let query = "SELECT * FROM JIRA_MAIN WHERE TRUE";

  if (srch.assigneeId) {
    query += ` AND ASSIGNEE_ACCOUNT_ID = '${srch.assigneeId}'`;
  }

  if (srch.assigneeName) {
    query += ` AND ASSIGNEE_DISPLAY_NAME = '${decodeURIComponent(
      srch.assigneeName
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
