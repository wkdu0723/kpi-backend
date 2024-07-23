import { User } from "../defines/db/user.type";

import { db } from "../db/jira";

import { logError } from "../util/error.util";

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
