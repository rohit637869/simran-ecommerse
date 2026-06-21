"use server";

import { db } from "@/db";
import { brands } from "@/db/schema";
import { like, eq, count, desc } from "drizzle-orm";

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function getBrandsList(search?: string) {
  const where = search ? like(brands.name, `%${search}%`) : undefined;
  const rows = await db
    .select()
    .from(brands)
    .where(where)
    .orderBy(desc(brands.createdAt))
    .limit(100);

  return rows;
}

export async function createBrand(data: { name: string; slug?: string; description?: string; logoUrl?: string }) {
  const slug = data.slug || slugify(data.name);

  const [existing] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.slug, slug))
    .limit(1);

  if (existing) throw new Error("A brand with this slug already exists");

  const [created] = await db
    .insert(brands)
    .values({ name: data.name, slug, description: data.description || null, logoUrl: data.logoUrl || null })
    .returning();

  return created;
}

export async function updateBrand(id: number, data: { name?: string; slug?: string; description?: string; logoUrl?: string; isActive?: boolean }) {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  updateData.updatedAt = new Date();

  const [updated] = await db.update(brands).set(updateData).where(eq(brands.id, id)).returning();
  return updated;
}

export async function deleteBrand(id: number) {
  await db.delete(brands).where(eq(brands.id, id));
}
