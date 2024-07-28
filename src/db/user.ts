import { db } from "./jira";

import { User } from "@defines/db/user";
import { IssueSrch, UserIssueVO } from "@defines/db/issue";

import { logError } from "@util/error";
import { toCountWrapper } from "./global";

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

/**
 *
 * @param srch
 */
const queryBySelectUserIssueAndWorkTimeListBySrchWithoutPaging = (
  srch: IssueSrch
) => {
  let query = `WITH ISSUES AS (
    SELECT 
        jm.*, 
        IFNULL(uws.TOTAL_WORK_SECONDS, 0) AS work_seconds
    FROM 
        JIRA_MAIN jm
    LEFT OUTER JOIN 
        user_tot_work uws 
        ON jm.id = uws.issue_id
    WHERE 
        jm.ASSIGNEE_DISPLAY_NAME = '${srch.userName}'
    GROUP BY
        jm.id
    UNION
    SELECT 
        jm.*, 
        IFNULL(uws.total_work_seconds, 0) AS work_seconds
    FROM 
        user_tot_work uws 
    LEFT OUTER JOIN 
        JIRA_MAIN jm 
        ON jm.id = uws.issue_id 
    WHERE 
        uws.user_name = '${srch.userName}'
    GROUP BY
        jm.id
    )
    SELECT * FROM ISSUES 
    WHERE TRUE
    `;

  if (srch.issueName) {
    query += ` AND PROJECT_NAME LIKE '%' || '${srch.issueName}' || '%'`;
  }

  if (srch.startDate) {
    query += ` AND START_DATE = '${srch.startDate}'`;
  }

  query += ` GROUP BY ID`;
  return query;
};

export const dbSelectUserIssueAndWorkTimeListBySrch = (srch: IssueSrch) => {
  let query = queryBySelectUserIssueAndWorkTimeListBySrchWithoutPaging(srch);

  query += ` ORDER BY CREATED ${srch.sort ?? "DESC"}
      LIMIT ${srch.limit} OFFSET ${srch.offset};`;

  return new Promise<UserIssueVO[]>((resolve, reject) => {
    db.all(query, (err, results: UserIssueVO[]) => {
      if (err) {
        logError(err);
        reject([]);
      } else {
        resolve(results);
      }
    });
  });
};

export const dbSelectUserIssueAndWorkTimeCountBySrch = (
  srch: IssueSrch
): Promise<Map<string, number>> => {
  return new Promise<Map<string, number>>((resolve, reject) => {
    db.get(
      toCountWrapper(
        queryBySelectUserIssueAndWorkTimeListBySrchWithoutPaging(srch)
      ),
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
