import Fuse from 'fuse.js';

export const search = <T>(list: T[], query: string, keys: string[] = ['name']): T[] => {
  if (!query) return list;

  const fuse = new Fuse(list, {
    keys,
    threshold: 0.4, // Adjust for sensitivity
  });

  return fuse.search(query).map((result) => result.item);
};
