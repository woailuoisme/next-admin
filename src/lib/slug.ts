/** 标题 / 名称 → URL slug（小写、非字母数字转连字符、去首尾连字符） */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
