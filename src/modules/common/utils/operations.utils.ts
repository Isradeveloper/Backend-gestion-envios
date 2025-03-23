export const LimitOffset = (size: number = 10, page: number = 1) => {
  const limit = size;
  const offset = (page - 1) * limit;
  return { limit, offset };
};

export const createRandomUnicCode = (length: number = 6): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const timestamp = Date.now().toString(36).slice(-3);
  const randomPart = Array.from({ length: length - timestamp.length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join('');

  return (randomPart + timestamp).toUpperCase();
};
