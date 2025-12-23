export function getPaginationParams(
  page: number | string | undefined,
  pageSize: number | string | undefined
) {
  const p = typeof page === "string" ? parseInt(page, 10) : page || 1;
  const ps =
    typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize || 50;
  return {
    page: Math.max(1, p),
    pageSize: Math.min(200, Math.max(1, ps)),
  };
}

export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

