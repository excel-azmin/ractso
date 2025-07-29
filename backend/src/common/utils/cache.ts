export const buildCacheKey = (prefix: string, obj: Record<string, string>) => {
  return `${prefix}:${Object.entries(obj)
    .filter(([_, value]) => !!value)
    .map(([key, value]) => `${key}:${value}`)
    .join(':')}`;
};
