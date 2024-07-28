import { Request, Response } from "express";

import { IssueSrch, IssueVO } from "@defines/db/issue";

import {
  dbSelectIssueListBySrch,
  dbSelectIssueListBySrchCount,
  dbSelectTopIssueCount,
  dbSelectTopIssueList,
  dbSelectTopIssueListByTopIssueId,
} from "@db/issue";

import { logError } from "@util/error";

/**
 * renewal
 */
export const selectTopIssueList = async (req: Request, resp: Response) => {
  const { offset, limit } = req.query;
  try {
    const topIssueList = await dbSelectTopIssueList(
      Number(limit) ?? 10,
      Number(offset) ?? 0
    );

    const topissueCount = await dbSelectTopIssueCount();

    const customPage: CustomPage<IssueVO> = {
      list: topIssueList,
      pageInfo: {
        totalCount: topissueCount.get("totalCount") ?? 0,
        limit: Number(limit) ?? 10,
        offset: Number(offset) ?? 0,
      },
    };

    return resp.json(customPage);
  } catch (err) {
    logError(err);
  }
};

export const selectIssueListByTopIssueId = async (
  req: Request,
  resp: Response
) => {
  const { topIssueId } = req.params;
  try {
    const issueList = await dbSelectTopIssueListByTopIssueId(
      topIssueId?.toString() ?? ""
    );
    return resp.json(issueList);
  } catch (err) {
    logError(err);
  }
};

export const selectIssueListBySrch = async (req: Request, resp: Response) => {
  const {
    startDate,
    endDate,
    userId,
    userName,
    issueName,
    sort,
    limit,
    offset,
  } = req.query;

  let srch: IssueSrch = {
    startDate: startDate?.toString() ?? "",
    endDate: endDate?.toString() ?? "",
    userId: userId?.toString() ?? "",
    userName: userName?.toString() ?? "",
    issueName: issueName?.toString() ?? "",
    sort: sort?.toString() ?? "",
    limit: limit ? Number(limit) : 10,
    offset: offset ? Number(offset) : 0,
  };

  try {
    const issueList = await dbSelectIssueListBySrch(srch);
    const issueCount = await dbSelectIssueListBySrchCount(srch);

    const customPage: CustomPage<IssueVO> = {
      list: issueList,
      pageInfo: {
        totalCount: issueCount.get("totalCount") ?? 0,
        limit: Number(req.query.limit) ?? 0,
        offset: Number(req.query.offset) ?? 0,
      },
    };
    return resp.json(customPage);
  } catch (err) {
    logError(err);
  }
};
