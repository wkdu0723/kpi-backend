import { JiraProjectDBData } from "@defines/JiraDb";
/**
 * 이슈 검색 조건
 */
export interface IssueSearch {
  /** 이슈 시작 날짜 (yyyy-MM-dd) */
  startDate?: string;
}

/**
 * 이슈 vo
 */
export interface IssueSrchVO extends JiraProjectDBData {
  childs?: IssueSrchVO[];
}
