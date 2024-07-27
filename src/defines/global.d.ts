export {};

declare global {
  interface PageInfo {
    totalCount: number;
    limit: number;
    offset: number;
  }

  interface CustomPage<T> {
    list: Array<T>;
    pageInfo: PageInfo;
  }
}
