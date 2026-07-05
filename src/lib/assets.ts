import { catalog } from '../data/catalog';

// Resolve a public/ asset path against Vite's base URL so images load under the
// deployed sub-path as well as at root.
export const asset = (p: string): string => import.meta.env.BASE_URL + p;

// Cover art for a release, by title. Collection sub-tracks carry their parent
// album's title in `album`, so this resolves their artwork too.
export const coverFor = (title: string): string | undefined => {
  const r = catalog.find((c) => c.title === title);
  return r?.img ? asset(r.img) : undefined;
};
