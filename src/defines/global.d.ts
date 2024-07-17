export {};

declare global {
  /**
   * 페이징 처리
   */
  interface Pagination {
    limit: number;
    offset: number;
  }
}
