import { JiraProjectDBData } from "@defines/JiraDb";
/**
 * 이슈 검색 조건
 */
export interface IssueSrch {
  /** 이슈 시작 날짜 (yyyy-MM-dd) */
  startDate?: string;

  /** 이슈 종료 날짜 (yyyy-MM-dd) */
  endDate?: string;

  /** 사용자ID */
  userId?: string;

  /** 사용자명  */
  userName?: string;

  /** 이슈명 */
  issueName?: string;

  /** 정렬순서 (desc/asc) */
  sort?: string;

  /** 페이지당 보여줄 데이터 개수 */
  limit: number;

  /** 페이지당 보여주기 시작할 번호 */
  offset: number;
}

/**
 * 이슈 vo
 */
export interface IssueVO extends JiraProjectDBData {
  /** 하위(서브) 이슈 리스트  */
  subIssues?: IssueSrchVO[];

  /** 이슈별 작업기록 리스트 */
  worklogs?: WorklogDBData[];
}
