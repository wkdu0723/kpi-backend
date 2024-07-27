import { Request, Response } from "express";
import { IssueSrch, IssueVO } from "../defines/db/issue";

import {
  dbSelectIssueListBySrch,
  dbSelectIssueListBySrchCount,
  dbSelectTopIssueCount,
  dbSelectTopIssueList,
  dbSelectTopIssueListByTopIssueId,
  dbSelectUserIssueListBySrch,
  dbSelectUserIssueListBySrchCount,
  dbSelectUserWorkLogByIssueId,
  // issueSelectBySrch,
} from "@db/issue";

import { logError } from "../util/error";

/**
 * 자식을 부모 이슈의 child[]에 추가
 * @param issues 이슈 리스트
 * @returns rootIssueVOs 부모와 자식을 매핑한 이슈 리스트
 */
// const mapngPrntWithChild = (issues: IssueSrchVO[]): IssueSrchVO[] => {
//   const store = new Map<string, IssueSrchVO>();

//   // 모든 issue를 store에 저장하고 children 배열을 추가함
//   issues.forEach((item: IssueSrchVO) => {
//     store.set(item.id, item);
//   });

//   issues.forEach((item: IssueSrchVO) => {
//     if (item.parent_id) {
//       const parent = store.get(item.parent_id);
//       if (parent) {
//         if (!parent.childs) {
//           parent.childs = []; // 없으면 초기화하고 push
//         }
//         parent.childs.push(item);
//       }
//     }
//   });

//   const rootIssueVOs: IssueSrchVO[] = [];

//   issues.forEach((item: IssueSrchVO) => {
//     if (!item.parent_id) {
//       rootIssueVOs.push(item);
//     }
//   });

//   return rootIssueVOs;
// };

// /**
//  * 이슈 리스트 검색 조회 공통 구현
//  * @param req 리퀘스트 객체
//  * @returns issues 이슈 리스트
//  */
// const issueGetBySrchCommon = async (req: Request) => {
//   const { startDate, userId, userName, limit, offset } = req.query;

//   const srch: IssueSearch = {
//     startDate: startDate ? startDate.toString() : "",
//     userId: userId ? userId.toString() : "",
//     userName: userName ? userName.toString() : "",
//   };

//   const page = {
//     limit: limit ?? 10,
//     offset: offset ?? 0,
//   };

//   try {
//     const issues = await issueSelectBySrch(srch, page);
//     return issues;
//   } catch (e) {
//     logError(e);
//     return [];
//   }
// };

// /**
//  * 매핑 없는 이슈 검색 요청에 따른 응답 처리
//  * @param req 요쳥
//  * @param resp 응답
//  * @returns Response<any, Record<string, any>>
//  */
// export const issueGetBySrch = async (req: Request, resp: Response) => {
//   try {
//     return resp.json(await issueGetBySrchCommon(req));
//   } catch (e) {
//     logError(e);
//     return [];
//   }
// };

// /**
//  * 매핑 있는 이슈 검색 요청에 따른 응답 처리
//  * @param req 요청
//  * @param resp 응답
//  * @returns Response<any, Record<string, any>>
//  */
// // export const issueGetBySrchAndMapng = async (req: Request, resp: Response) => {
// //   try {
// //     const issues = await issueGetBySrchCommon(req);
// //     return resp.json(mapngPrntWithChild(issues));
// //   } catch (e) {
// //     logError(e);
// //     return [];
// //   }
// // };

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

export const selectUserIssueAndWorklogListBySrch = async (
  req: Request,
  resp: Response
) => {
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
    const userIssueList = await dbSelectUserIssueListBySrch(srch);
    const userIssueListCount = await dbSelectUserIssueListBySrchCount(srch);

    const worklogPromises = userIssueList.map(async (issue) => {
      const userWorklogsByIssue = await dbSelectUserWorkLogByIssueId(issue.id);
      issue.worklogs = userWorklogsByIssue;
      return issue;
    });
    await Promise.all(worklogPromises);

    const customPage: CustomPage<IssueVO> = {
      list: userIssueList,
      pageInfo: {
        totalCount: userIssueListCount.get("totalCount") ?? 0,
        limit: Number(req.query.limit) ?? 0,
        offset: Number(req.query.offset) ?? 0,
      },
    };
    return resp.json(customPage);
  } catch (err) {
    logError(err);
  }
};
