import { JiraProjectDBData } from "@defines/JiraDb";
/**
 * 이슈 검색 조건
 */
export interface IssueSearch {
  /** 이슈 시작 날짜 (yyyy-MM-dd) */
  startDate?: string;
  /** 할당받은 사용자 id */
  assigneeId?: string;
  /** 할당받은 사용자명 */
  assigneeName?: string;
}

/**
 * 이슈 vo
 */
export interface IssueSrchVO extends JiraProjectDBData {
  childs?: IssueSrchVO[];
}
