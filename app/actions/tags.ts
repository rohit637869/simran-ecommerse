"use server";

import { db } from "@/db";
import { productTags } from "@/db/schema";
import { like, eq, count, desc } from "drizzle-orm";

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function getTags(search?: string, page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;
  const where = search ? like(productTags.name, `%${search}%`) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(productTags)
    .where(where);

  const rows = await db
    .select()
    .from(productTags)
    .where(where)
    .orderBy(desc(productTags.name))
    .limit(pageSize)
    .offset(offset);

  return { tags: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createTag(name: string) {
  const slug = slugify(name);

  const [existing] = await db
    .select({ id: productTags.id })
    .from(productTags)
    .where(eq(productTags.slug, slug))
    .limit(1);

  if (existing) throw new Error("A tag with this name already exists");

  const [created] = await db
    .insert(productTags)
    .values({ name, slug })
    .returning();

  return created;
}

export async function updateTag(id: number, data: { name?: string; slug?: string }) {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;

  const [updated] = await db
    .update(productTags)
    .set(updateData)
    .where(eq(productTags.id, id))
    .returning();

  return updated;
}

export async function deleteTag(id: number) {
  await db.delete(productTags).where(eq(productTags.id, id));
}
