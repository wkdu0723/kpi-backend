import { User } from "../defines/db/user";

import { db } from "./jira";

import { logError } from "../util/error.util";
import { IssueSearch } from "@defines/db/issue";

/**
 * 사용자 리스트 조회
 */
export const dbUserList = (): Promise<User[]> => {
  const query = "SELECT * FROM JIRA_USERS";

  return new Promise<User[]>((resolve, reject) => {
    db.all(query, (err, results: User[]) => {
      if (err) {
        logError(err);
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};

export const dbUserIssueAndWorkTimeListBySrch = (
  srch: IssueSearch,
  page: any
) => {
  let query = `
    WITH ISSUES AS (
        SELECT * 
        FROM JIRA_MAIN 
        WHERE ASSIGNEE_DISPLAY_NAME = '${srch.userName}'
    ),
    WORKLOGS AS (
        SELECT * 
        FROM JIRA_WORKLOG 
        WHERE USER_NAME = '${srch.userName}'
    ),
    COMBINED AS (
        SELECT ISU.*
        , IFNULL(SUM(JW.TIME_SPENT_SECONDS), 0) AS TOTAL_WORK_SECONDS
        FROM ISSUES ISU
        LEFT OUTER JOIN WORKLOGS JW 
            ON ISU.ID = JW.ISSUE_ID
        GROUP BY ISU.ID
        UNION
        SELECT JM.*
            ,IFNULL(SUM(JW.TIME_SPENT_SECONDS), 0) AS TOTAL_WORK_SECONDS
        FROM JIRA_MAIN JM
        LEFT OUTER JOIN WORKLOGS JW 
            ON JM.ID = JW.ISSUE_ID
        GROUP BY JM.ID
    )
    SELECT *
    FROM COMBINED
    WHERE TRUE`;

  if (srch.issueName) {
    query += ` AND PROJECT_NAME LIKE '%' || '${srch.issueName}' || '%'`;
  }

  if (srch.startDate) {
    query += ` AND START_DATE = '${srch.startDate}'`;
  }

  query += ` GROUP BY ID
      ORDER BY CREATED ${srch.sort ?? "DESC"}
      LIMIT ${page.limit} OFFSET ${page.offset};`;

  return new Promise<any[]>((resolve, reject) => {
    db.all(query, (err, results: any[]) => {
      if (err) {
        logError(err);
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};
