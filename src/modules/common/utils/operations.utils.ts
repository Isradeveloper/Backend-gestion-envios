export const LimitOffset = (size: number = 10, page: number = 1) => {
  const limit = size;
  const offset = (page - 1) * limit;
  return { limit, offset };
};
