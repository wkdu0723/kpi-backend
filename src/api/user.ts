import { Request, Response } from "express";

import { IssueSrch, UserIssueVO } from "@defines/db/issue";

import {
  dbSelectUserIssueAndWorkTimeCountBySrch,
  dbSelectUserIssueAndWorkTimeListBySrch,
} from "@db/user";

import { logError } from "@util/error";

export const selectUserIssueAndWorkTimeBySrch = async (
  req: Request,
  resp: Response
) => {
  const { startDate, userId, userName, limit, offset } = req.query;

  const srch: IssueSrch = {
    startDate: startDate ? startDate.toString() : "",
    userId: userId ? userId.toString() : "",

    /** 필수 */
    userName: userName ? userName.toString() : "",
    limit: Number(limit) ?? 10,
    offset: Number(offset) ?? 0,
  };

  try {
    const userIssueAndWorkTimeList =
      await dbSelectUserIssueAndWorkTimeListBySrch(srch);
    const userIssueAndWorkTimeCount =
      await dbSelectUserIssueAndWorkTimeCountBySrch(srch);

    const customPage: CustomPage<UserIssueVO> = {
      list: userIssueAndWorkTimeList,
      pageInfo: {
        totalCount: userIssueAndWorkTimeCount.get("totalCount") ?? 0,
        limit: Number(req.query.limit) ?? 0,
        offset: Number(req.query.offset) ?? 0,
      },
    };
    return resp.json(customPage);
  } catch (err) {
    logError(err);
  }
};
