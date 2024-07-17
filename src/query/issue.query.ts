import sqlite3 from "sqlite3";

import { JiraProjectDBData } from "@defines/JiraDb";
import { issueSearch } from "@defines/query/issue.type";
import { errorLogger } from "@util/error.util";

const dbFileName = "toonation_kpi.db";
let dbConnect: sqlite3.Database;

/**
 * 이슈 검색
 */
export const issueSelectBySrch = (srch: issueSearch, paging: Pagination) => {
  const query = ""; // 검색 결과 조회 쿼리
  return new Promise((resolve, reject) => {
    dbConnect.all(query, (err, results: JiraProjectDBData[]) => {
      if (err) {
        errorLogger("ErrorSelect");
        // reject({ parents: [], children: [] });
      } else {
        // resolve에서 parent 관련이 뭣임
      }
    });
  });
};
