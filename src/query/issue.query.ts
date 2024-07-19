import sqlite3 from "sqlite3";

import { JiraProjectDBData } from "@defines/JiraDb";
import { issueSearch } from "@defines/query/issue.type";
import { errorLogger } from "@util/error.util";

const dbFileName = "toonation_kpi.db";
let db: sqlite3.Database;

/**
 * 이슈 검색
 */
export const issueSelectBySrch = (srch: issueSearch, paging: any) => {
  let query = "SELECT * FROM JIRA_MAIN WHERE TRUE";

  if (srch.startDate) {
    query += `AND START_DATE = '${srch.startDate}'`;
  }

  query += `ORDER BY CREATED DESC LIMIT ${paging.limit ?? 10} OFFSET ${
    paging.offset ?? 0
  }`;

  return new Promise((resolve, reject) => {
    db.all(query, (err, results: JiraProjectDBData[]) => {
      if (err) {
        errorLogger("ErrorSelect");
        // reject({ parents: [], children: [] });
      } else {
        // resolve에서 parent 관련이 뭣임
      }
    });
  });
};
