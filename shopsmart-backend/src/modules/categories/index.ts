/**
 * Categories Module — public interface.
 * Responsibility: hierarchical product taxonomy (up to 3 levels).
 * Dependencies: none.
 */
export { categoriesRoutes } from './categories.routes';

interface CategoryNode {
  id: string;
  parentId: string | null;
  [key: string]: unknown;
}

export async function getCategoryTree() {
  const { categoriesRepository } = await import('./categories.repository');
  const all = (await categoriesRepository.findAll()) as unknown as CategoryNode[];

  const byParent = new Map<string | null, CategoryNode[]>();
  for (const cat of all) {
    const key = cat.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(cat);
  }

  function build(parentId: string | null): Array<CategoryNode & { children: unknown[] }> {
    return (byParent.get(parentId) ?? []).map((cat) => ({
      ...cat,
      children: build(cat.id),
    }));
  }

  return build(null);
}
