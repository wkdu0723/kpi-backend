import { JiraProjectDBData } from "../defines/JiraDb";
import { IssueSearch } from "../defines/query/issue.type";
import { db } from "../db/jira";

/**
 * 이슈 검색
 */
export const issueSelectBySrch = (srch: IssueSearch, paging: any) => {
  let query = "SELECT * FROM JIRA_MAIN WHERE TRUE";

  if (srch.startDate) {
    query += ` AND START_DATE = '${srch.startDate}'`;
  }

  query += ` ORDER BY CREATED DESC LIMIT ${paging.limit ?? 10} OFFSET ${
    paging.offset ?? 0
  }`;

  return new Promise<JiraProjectDBData[]>((resolve, reject) => {
    db.all(query, (err, results: JiraProjectDBData[]) => {
      if (err) {
        // errorLogger("ErrorSelect");
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};
