"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { like, eq, count, desc } from "drizzle-orm";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  parentId: number | null;
  productCount: number;
  createdAt: Date;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function getCategories(search?: string, page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;
  const where = search ? like(categories.name, `%${search}%`) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(categories)
    .where(where);

  const rows = await db
    .select()
    .from(categories)
    .where(where)
    .orderBy(desc(categories.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    categories: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
}) {
  const slug = data.slug || slugify(data.name);
  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (existing) throw new Error("A category with this slug already exists");

  const [created] = await db
    .insert(categories)
    .values({
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId || null,
    })
    .returning();

  return created;
}

export async function updateCategory(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
  isActive?: boolean;
}) {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(categories)
    .set(updateData)
    .where(eq(categories.id, id))
    .returning();

  return updated;
}

export async function deleteCategory(id: number) {
  await db.delete(categories).where(eq(categories.id, id));
}
