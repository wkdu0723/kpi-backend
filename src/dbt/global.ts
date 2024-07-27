export const queryCountWrapper = (query: string) => {
  return `select count(1) from (${query});`;
};
