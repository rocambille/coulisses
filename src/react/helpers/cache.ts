/*
  Purpose:
  Provide a minimal cache layer compatible with React `use`.

  Design notes:
  - Promises must be cached, not resolved values.
  - React `use` relies on Promise identity to suspend correctly.
*/

/* ************************************************************************ */
/* Cache                                                                    */
/* ************************************************************************ */

/*
  In-memory cache used by React `use`.
*/
const cacheData = new Map<string, ReturnType<typeof Response.prototype.json>>();

/*
  cache(url):
  - Returns a cached Promise for the given URL
  - Fetch is triggered only once per URL
  - Subsequent calls reuse the same Promise
*/
export const cache = (url: string) => {
  if (!cacheData.has(url)) {
    cacheData.set(
      url,
      fetch(url).then((response) => {
        if (!response.ok) {
          return null;
        }
        return response.json();
      }),
    );
  }

  // biome-ignore lint/style/noNonNullAssertion: cacheData is set before get
  return cacheData.get(url)!;
};

/*
  invalidateCache(basePath):
  - Removes all cached entries matching a path prefix
  - Used after mutations to force refetch on next render
*/
export const invalidateCache = (basePath: string) => {
  if (basePath === "*") {
    cacheData.clear();
    return;
  }

  cacheData.forEach((_value, key) => {
    if (key.startsWith(basePath)) {
      cacheData.delete(key);
    }
  });
};
