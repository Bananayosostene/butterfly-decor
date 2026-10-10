/** Address of the vendors page for a set of filters (page 1 and empty filters are left out). */
export const vendorsHref = (q: string, category: string, page = 1) => {
  const params = new URLSearchParams({ ...(q && { q }), ...(category && { category }), ...(page > 1 && { page: String(page) }) });
  const query = params.toString();
  return query ? `/account/vendors?${query}` : "/account/vendors";
};
