export const toCountWrapper = (query: string) => {
  return `select count(1) as totalCount from (${query});`;
};
