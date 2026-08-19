export const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (r.status === 401) throw new Error("UNAUTHORIZED");
    return r.json();
  });
