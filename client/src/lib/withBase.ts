/** Prefix public asset paths with the Vite base URL (for subpath deployment on sitekeep.studio). */
export function withBase(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${normalized}`;
}
