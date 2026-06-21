"use server";

import { db } from "@/db";
import {
  products,
  categories,
  brands,
  collections,
  productVariants,
  productImages,
  customers,
  orders,
  orderItems,
  customerAddresses,
  payments,
} from "@/db/schema";
import {
  like,
  eq,
  and,
  desc,
  asc,
  count,
  inArray,
  sql,
} from "drizzle-orm";

export async function getFeaturedProducts(limit = 8) {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .where(
      and(
        eq(products.isActive, true),
        sql`(${products.collectionId} is null or ${collections.launchDate} is null or ${collections.launchDate} <= ${today})`
      )
    )
    .orderBy(desc(products.createdAt))
    .limit(limit);

  const productIds = rows.map((r) => r.id);
  const imageRows =
    productIds.length > 0
      ? await db
          .select({
            productId: productImages.productId,
            imageUrl: productImages.imageUrl,
            isPrimary: productImages.isPrimary,
          })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
      : [];

  const imageMap = new Map<number, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId) || img.isPrimary) {
      imageMap.set(img.productId, img.imageUrl);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    basePrice: r.basePrice,
    categoryName: r.categoryName,
    primaryImage: imageMap.get(r.id) ?? null,
  }));
}

export async function getStoreProducts(
  search?: string,
  category?: string,
  collection?: string,
  brand?: string,
  page = 1,
  pageSize = 12
) {
  const today = new Date().toISOString().split("T")[0];
  const conditions: any[] = [
    eq(products.isActive, true),
    sql`(${products.collectionId} is null or ${collections.launchDate} is null or ${collections.launchDate} <= ${today})`,
  ];

  if (search) {
    conditions.push(like(products.name, `%${search}%`));
  }

  if (category && category !== "all") {
    conditions.push(eq(categories.slug, category));
  }

  if (collection && collection !== "all") {
    conditions.push(eq(collections.slug, collection));
  }

  if (brand && brand !== "all") {
    conditions.push(eq(brands.slug, brand));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * pageSize;

  const [totalResult] = await db
    .select({ count: count() })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(where);

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      slug: products.slug,
      description: products.description,
      basePrice: products.basePrice,
      categoryName: categories.name,
      categorySlug: categories.slug,
      brandName: brands.name,
      collectionName: collections.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(pageSize)
    .offset(offset);

  const productIds = rows.map((r) => r.id);
  const imageRows =
    productIds.length > 0
      ? await db
          .select({
            productId: productImages.productId,
            imageUrl: productImages.imageUrl,
            isPrimary: productImages.isPrimary,
          })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
      : [];

  const imageMap = new Map<number, string>();
  for (const img of imageRows) {
    const pid = img.productId;
    if (!imageMap.has(pid) || img.isPrimary) {
      imageMap.set(pid, img.imageUrl);
    }
  }

  const productsList = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    basePrice: r.basePrice,
    categoryName: r.categoryName,
    primaryImage: imageMap.get(r.id) ?? null,
  }));

  return {
    products: productsList,
    total: totalResult.count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult.count / pageSize),
  };
}

export async function getProductBySlug(slug: string) {
  const today = new Date().toISOString().split("T")[0];
  const cleanSlug = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const conditions = [
    eq(products.isActive, true),
    sql`(${products.collectionId} is null or ${collections.launchDate} is null or ${collections.launchDate} <= ${today})`,
  ];

  let [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      designStory: products.designStory,
      materials: products.materials,
      basePrice: products.basePrice,
      sku: products.sku,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .where(and(eq(products.slug, slug), ...conditions))
    .limit(1);

  if (!product) {
    [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        designStory: products.designStory,
        materials: products.materials,
        basePrice: products.basePrice,
        sku: products.sku,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(collections, eq(products.collectionId, collections.id))
      .where(and(eq(sql`lower(replace(${products.slug}, ' ', '-'))`, cleanSlug), ...conditions))
      .limit(1);
  }

  if (!product) return null;

  const images = await db
    .select({ imageUrl: productImages.imageUrl, altText: productImages.altText })
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.sortOrder));

  const variants = await db
    .select({
      id: productVariants.id,
      size: productVariants.size,
      colorName: productVariants.colorName,
      colorHex: productVariants.colorHex,
      additionalPrice: productVariants.additionalPrice,
      stockQuantity: productVariants.stockQuantity,
      imageUrl: productVariants.imageUrl,
    })
    .from(productVariants)
    .where(
      and(
        eq(productVariants.productId, product.id),
        eq(productVariants.isActive, true)
      )
    );

  return { ...product, images, variants };
}

export async function getCategoriesList() {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.name));

  return rows;
}

export async function registerCustomer(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "An account with this email already exists" };
  }

  const [customer] = await db
    .insert(customers)
    .values({
      email: data.email,
      firstName: data.name.split(" ")[0] || data.name,
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      passwordHash: "better-auth-managed",
    })
    .returning();

  return { customer };
}

export async function getCustomerOrders(userId: string) {
  const customerRecord = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, userId))
    .limit(1);

  if (customerRecord.length === 0) return [];

  const customerId = customerRecord[0].id;

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      grandTotal: orders.grandTotal,
      placedAt: orders.placedAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.placedAt));

  return rows;
}

export async function getCustomerOrderDetail(
  userId: string,
  orderId: number
) {
  const customerRecord = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, userId))
    .limit(1);

  if (customerRecord.length === 0) return null;

  const customerId = customerRecord[0].id;

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.customerId, customerId)))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const paymentRecords = await db
    .select({
      id: payments.id,
      transactionId: payments.transactionId,
      paymentGateway: payments.paymentGateway,
      amount: payments.amount,
      status: payments.status,
      paymentMethod: payments.paymentMethod,
      cardLast4: payments.cardLast4,
      capturedAt: payments.capturedAt,
    })
    .from(payments)
    .where(eq(payments.orderId, orderId));

  const [shippingAddr] = order.shippingAddressId
    ? await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.id, order.shippingAddressId))
        .limit(1)
    : [null];

  const [billingAddr] = order.billingAddressId
    ? await db
        .select()
        .from(customerAddresses)
        .where(eq(customerAddresses.id, order.billingAddressId))
        .limit(1)
    : [null];

  return {
    ...order,
    items,
    payments: paymentRecords,
    shippingAddress: shippingAddr,
    billingAddress: billingAddr,
  };
}

export async function createOrder(data: {
  userId: string;
  items: Array<{
    variantId: number;
    productName: string;
    variantLabel?: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode: string;
    countryCode: string;
  };
  paymentMethod: string;
  subtotal: number;
  taxTotal?: number;
  shippingTotal?: number;
  grandTotal: number;
}) {
  const customerRecord = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, data.userId))
    .limit(1);

  let customerId: number;

  if (customerRecord.length === 0) {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        email: data.userId,
        firstName: data.userId.split("@")[0] || "Customer",
        lastName: "",
        passwordHash: "better-auth-managed",
      })
      .returning();
    customerId = newCustomer.id;
  } else {
    customerId = customerRecord[0].id;
  }

  const [shippingAddr] = await db
    .insert(customerAddresses)
    .values({
      customerId,
      addressLine1: data.shippingAddress.addressLine1,
      addressLine2: data.shippingAddress.addressLine2 || null,
      city: data.shippingAddress.city,
      stateProvince: data.shippingAddress.stateProvince || null,
      postalCode: data.shippingAddress.postalCode,
      countryCode: data.shippingAddress.countryCode,
      isDefault: true,
      isShipping: true,
      isBilling: true,
    })
    .returning();

  const orderNumber = `VEL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerId,
      billingAddressId: shippingAddr.id,
      shippingAddressId: shippingAddr.id,
      status: "pending",
      paymentStatus: data.paymentMethod === "cod" ? "pending" : "pending",
      fulfillmentStatus: "unfulfilled",
      subtotal: String(data.subtotal),
      taxTotal: String(data.taxTotal || 0),
      shippingTotal: String(data.shippingTotal || 0),
      grandTotal: String(data.grandTotal),
      placedAt: new Date(),
    })
    .returning();

  for (const item of data.items) {
    await db.insert(orderItems).values({
      orderId: order.id,
      variantId: item.variantId,
      productName: item.productName,
      variantLabel: item.variantLabel || null,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      totalPrice: String(item.totalPrice),
    });
  }

  await db.insert(payments).values({
    orderId: order.id,
    paymentGateway:
      data.paymentMethod === "cod" ? "cash_on_delivery" : "pending",
    amount: String(data.grandTotal),
    status: "pending",
    paymentMethod:
      data.paymentMethod === "cod" ? "Cash on Delivery" : "Pending",
  });

  return { order, orderNumber };
}

export async function getAllCollections() {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      launchDate: collections.launchDate,
      brandId: collections.brandId,
      brandName: brands.name,
      productCount: sql<number>`(select count(*) from ${products} where ${products.collectionId} = ${collections.id})`,
    })
    .from(collections)
    .leftJoin(brands, eq(collections.brandId, brands.id))
    .where(
      and(
        eq(collections.isActive, true),
        sql`(${collections.launchDate} is null or ${collections.launchDate} <= ${today})`
      )
    )
    .orderBy(desc(collections.createdAt));

  return rows;
}

export async function getUpcomingCollections() {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      launchDate: collections.launchDate,
      brandName: brands.name,
    })
    .from(collections)
    .leftJoin(brands, eq(collections.brandId, brands.id))
    .where(
      and(
        eq(collections.isActive, true),
        sql`${collections.launchDate} > ${today}`
      )
    )
    .orderBy(asc(collections.launchDate));

  return rows;
}

export async function getAllBrands() {
  const rows = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      logoUrl: brands.logoUrl,
      productCount: sql<number>`(select count(*) from ${products} where ${products.brandId} = ${brands.id})`,
    })
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(asc(brands.name));

  return rows;
}

export async function getNewProducts(limit = 20) {
  const today = new Date().toISOString().split("T")[0];
  const conditions: any[] = [
    eq(products.isActive, true),
    sql`(${products.collectionId} is null or ${collections.launchDate} is null or ${collections.launchDate} <= ${today})`,
  ];

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      categoryName: categories.name,
      brandName: brands.name,
      collectionName: collections.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .limit(limit);

  const productIds = rows.map((r) => r.id);
  const imageRows =
    productIds.length > 0
      ? await db
          .select({
            productId: productImages.productId,
            imageUrl: productImages.imageUrl,
            isPrimary: productImages.isPrimary,
          })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
      : [];

  const imageMap = new Map<number, string>();
  for (const img of imageRows) {
    if (!imageMap.has(img.productId) || img.isPrimary) {
      imageMap.set(img.productId, img.imageUrl);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    basePrice: r.basePrice,
    categoryName: r.categoryName,
    brandName: r.brandName,
    collectionName: r.collectionName,
    primaryImage: imageMap.get(r.id) ?? null,
    createdAt: r.createdAt,
  }));
}

export async function getCollectionBySlug(slug: string) {
  const [collection] = await db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      launchDate: collections.launchDate,
      brandName: brands.name,
    })
    .from(collections)
    .leftJoin(brands, eq(collections.brandId, brands.id))
    .where(and(eq(collections.slug, slug), eq(collections.isActive, true)))
    .limit(1);

  return collection || null;
}
