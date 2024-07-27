import { Request, Response } from "express";
import { dbUserIssueAndWorkTimeListBySrch, dbUserList } from "../dbt/user";

import { logError } from "../util/error.util";
import { IssueSearch } from "@defines/db/issue";

export const userList = async (req: Request, resp: Response) => {
  try {
    return resp.json(await dbUserList());
  } catch (err) {
    logError(err);
  }
};

export const userIssueAndWorkTimeBySrch = async (
  req: Request,
  resp: Response
) => {
  const { startDate, userId, userName, limit, offset } = req.query;

  const srch: IssueSearch = {
    startDate: startDate ? startDate.toString() : "",
    userId: userId ? userId.toString() : "",
    /** 필수 */
    userName: userName ? userName.toString() : "",
  };

  const page = {
    limit: limit ?? 10,
    offset: offset ?? 0,
  };

  try {
    return resp.json(await dbUserIssueAndWorkTimeListBySrch(srch, page));
  } catch (err) {
    logError(err);
  }
};
