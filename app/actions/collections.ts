"use server";

import { db } from "@/db";
import { collections, brands } from "@/db/schema";
import { like, eq, count, desc } from "drizzle-orm";

export interface CollectionItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  launchDate: string | null;
  isActive: boolean;
  brandName: string | null;
  brandId: number | null;
  createdAt: Date;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function getCollections(search?: string, page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;
  const where = search ? like(collections.name, `%${search}%`) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(collections)
    .where(where);

  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      launchDate: collections.launchDate,
      isActive: collections.isActive,
      brandId: collections.brandId,
      brandName: brands.name,
      createdAt: collections.createdAt,
    })
    .from(collections)
    .leftJoin(brands, eq(collections.brandId, brands.id))
    .where(where)
    .orderBy(desc(collections.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    collections: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getBrands() {
  const rows = await db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(desc(brands.name));

  return rows;
}

export async function createCollection(data: {
  name: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  launchDate?: string;
  brandId?: number | null;
}) {
  const slug = data.slug || slugify(data.name);

  const [created] = await db
    .insert(collections)
    .values({
      name: data.name,
      slug,
      description: data.description || null,
      coverImage: data.coverImage || null,
      launchDate: data.launchDate || null,
      brandId: data.brandId || null,
    })
    .returning();

  return created;
}

export async function updateCollection(id: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  launchDate?: string;
  brandId?: number | null;
  isActive?: boolean;
}) {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
  if (data.launchDate !== undefined) updateData.launchDate = new Date(data.launchDate);
  if (data.brandId !== undefined) updateData.brandId = data.brandId;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(collections)
    .set(updateData)
    .where(eq(collections.id, id))
    .returning();

  return updated;
}

export async function deleteCollection(id: number) {
  await db.delete(collections).where(eq(collections.id, id));
}
