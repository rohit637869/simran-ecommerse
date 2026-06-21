"use server";

import { db } from "@/db";
import { products, brands, categories, collections, productVariants, productImages, productTagMappings } from "@/db/schema";
import { like, eq, or, inArray, and, count, desc, asc } from "drizzle-orm";

export interface ProductListItem {
  id: number;
  sku: string;
  name: string;
  slug: string;
  basePrice: string;
  costPrice: string | null;
  isActive: boolean;
  isCustomizable: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  brandName: string | null;
  categoryName: string | null;
  primaryImage: string | null;
  totalStock: number;
  variantCount: number;
}

export interface ProductsResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProducts(
  search?: string,
  status?: "active" | "inactive" | "all",
  page: number = 1,
  pageSize: number = 20
): Promise<ProductsResponse> {
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(products.name, `%${search}%`),
        like(products.sku, `%${search}%`),
      )
    );
  }

  if (status === "active") {
    conditions.push(eq(products.isActive, true));
  } else if (status === "inactive") {
    conditions.push(eq(products.isActive, false));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(where);

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      costPrice: products.costPrice,
      isActive: products.isActive,
      isCustomizable: products.isCustomizable,
      publishedAt: products.publishedAt,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      brandName: brands.name,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(pageSize)
    .offset(offset);

  const productIds = rows.map((r) => r.id);

  const imageRows = productIds.length > 0
    ? await db
        .select({
          productId: productImages.productId,
          imageUrl: productImages.imageUrl,
          isPrimary: productImages.isPrimary,
          sortOrder: productImages.sortOrder,
        })
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
    : [];

  const variantRows = productIds.length > 0
    ? await db
        .select({
          productId: productVariants.productId,
          stockQuantity: productVariants.stockQuantity,
          variantId: productVariants.id,
        })
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds))
    : [];

  const imageMap = new Map<number, string>();
  for (const img of imageRows) {
    const pid = img.productId;
    if (!imageMap.has(pid) || img.isPrimary) {
      imageMap.set(pid, img.imageUrl);
    }
  }

  const stockMap = new Map<number, { totalStock: number; variantCount: number }>();
  for (const v of variantRows) {
    const pid = v.productId;
    if (!stockMap.has(pid)) {
      stockMap.set(pid, { totalStock: 0, variantCount: 0 });
    }
    const entry = stockMap.get(pid)!;
    entry.totalStock += v.stockQuantity;
    entry.variantCount += 1;
  }

  const productList: ProductListItem[] = rows.map((r) => {
    const stockInfo = stockMap.get(r.id) ?? { totalStock: 0, variantCount: 0 };
    return {
      id: r.id,
      sku: r.sku,
      name: r.name,
      slug: r.slug,
      basePrice: r.basePrice,
      costPrice: r.costPrice,
      isActive: r.isActive ?? true,
      isCustomizable: r.isCustomizable ?? false,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      brandName: r.brandName ?? null,
      categoryName: r.categoryName ?? null,
      primaryImage: imageMap.get(r.id) ?? null,
      totalStock: stockInfo.totalStock,
      variantCount: stockInfo.variantCount,
    };
  });

  return {
    products: productList,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function toggleProductStatus(productId: number) {
  const [product] = await db
    .select({ isActive: products.isActive })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) throw new Error("Product not found");

  await db
    .update(products)
    .set({ isActive: !product.isActive, updatedAt: new Date() })
    .where(eq(products.id, productId));

  return { isActive: !product.isActive };
}

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export interface ProductFormData {
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  designStory?: string;
  materials?: string;
  brandId?: number | null;
  categoryId?: number | null;
  collectionId?: number | null;
  basePrice: string;
  costPrice?: string;
  weightKg?: string;
  isActive?: boolean;
  isCustomizable?: boolean;
  isDigital?: boolean;
}

export async function createProduct(data: ProductFormData) {
  const slug = slugify(data.slug || data.name);

  const [created] = await db
    .insert(products)
    .values({
      sku: data.sku,
      name: data.name,
      slug,
      description: data.description || null,
      designStory: data.designStory || null,
      materials: data.materials || null,
      brandId: data.brandId || null,
      categoryId: data.categoryId || null,
      collectionId: data.collectionId || null,
      basePrice: data.basePrice,
      costPrice: data.costPrice || null,
      weightKg: data.weightKg || null,
      isActive: data.isActive ?? true,
      isCustomizable: data.isCustomizable ?? false,
      isDigital: data.isDigital ?? false,
    })
    .returning();

  return created;
}

export async function getProduct(id: number) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) return null;

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id));

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.sortOrder));

  return { ...product, variants, images };
}

export async function updateProduct(id: number, data: Partial<ProductFormData>) {
  const updateData: Record<string, any> = {};
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.name !== undefined) updateData.name = data.name;
  if (data.slug !== undefined) updateData.slug = slugify(data.slug);
  else if (data.name !== undefined) updateData.slug = slugify(data.name);
  if (data.description !== undefined) updateData.description = data.description;
  if (data.designStory !== undefined) updateData.designStory = data.designStory;
  if (data.materials !== undefined) updateData.materials = data.materials;
  if (data.brandId !== undefined) updateData.brandId = data.brandId;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.collectionId !== undefined) updateData.collectionId = data.collectionId;
  if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
  if (data.costPrice !== undefined) updateData.costPrice = data.costPrice;
  if (data.weightKg !== undefined) updateData.weightKg = data.weightKg;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.isCustomizable !== undefined) updateData.isCustomizable = data.isCustomizable;
  if (data.isDigital !== undefined) updateData.isDigital = data.isDigital;
  updateData.updatedAt = new Date();

  const [updated] = await db
    .update(products)
    .set(updateData)
    .where(eq(products.id, id))
    .returning();

  return updated;
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export async function getProductVariants(productId: number) {
  return await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
}

export async function createProductVariant(data: {
  productId: number;
  size?: string;
  colorName?: string;
  colorHex?: string;
  fit?: string;
  materialCode?: string;
  additionalPrice?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  imageUrl?: string;
}) {
  const [created] = await db
    .insert(productVariants)
    .values({
      productId: data.productId,
      size: data.size || null,
      colorName: data.colorName || null,
      colorHex: data.colorHex || null,
      fit: data.fit || null,
      materialCode: data.materialCode || null,
      additionalPrice: data.additionalPrice || "0",
      stockQuantity: data.stockQuantity ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 5,
      imageUrl: data.imageUrl || null,
    })
    .returning();

  return created;
}

export async function updateProductVariant(id: number, data: Partial<{
  size: string;
  colorName: string;
  colorHex: string;
  fit: string;
  materialCode: string;
  additionalPrice: string;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  isActive: boolean;
}>) {
  const updateData: Record<string, any> = {};
  if (data.size !== undefined) updateData.size = data.size;
  if (data.colorName !== undefined) updateData.colorName = data.colorName;
  if (data.colorHex !== undefined) updateData.colorHex = data.colorHex;
  if (data.fit !== undefined) updateData.fit = data.fit;
  if (data.materialCode !== undefined) updateData.materialCode = data.materialCode;
  if (data.additionalPrice !== undefined) updateData.additionalPrice = data.additionalPrice;
  if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
  if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = data.lowStockThreshold;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const [updated] = await db
    .update(productVariants)
    .set(updateData)
    .where(eq(productVariants.id, id))
    .returning();

  return updated;
}

export async function deleteProductVariant(id: number) {
  await db.delete(productVariants).where(eq(productVariants.id, id));
}

export async function getFormOptions() {
  const [brandRows, categoryRows, collectionRows] = await Promise.all([
    db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.isActive, true)).orderBy(asc(brands.name)),
    db.select({ id: categories.id, name: categories.name }).from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.name)),
    db.select({ id: collections.id, name: collections.name }).from(collections).where(eq(collections.isActive, true)).orderBy(asc(collections.name)),
  ]);

  return { brands: brandRows, categories: categoryRows, collections: collectionRows };
}

export async function saveProductImages(productId: number, imageUrls: string[]) {
  await db.delete(productImages).where(eq(productImages.productId, productId));

  if (imageUrls.length === 0) return;

  await db.insert(productImages).values(
    imageUrls.map((url, i) => ({
      productId,
      imageUrl: url,
      isPrimary: i === 0,
      sortOrder: i,
    }))
  );
}

export async function tagProduct(productId: number, tagIds: number[]) {
  await db.delete(productTagMappings).where(eq(productTagMappings.productId, productId));

  if (tagIds.length === 0) return;

  await db.insert(productTagMappings).values(
    tagIds.map((tagId) => ({ productId, tagId }))
  );
}
