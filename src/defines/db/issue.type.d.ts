import { JiraProjectDBData } from "@defines/JiraDb";
/**
 * 이슈 검색 조건
 */
export interface IssueSearch {
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
}

/**
 * 이슈 vo
 */
export interface IssueSrchVO extends JiraProjectDBData {
  childs?: IssueSrchVO[];
}
