// schema.ts - Complete Drizzle ORM Schema for Fashion E-Commerce

import { 
  pgTable, 
  pgEnum,
  bigint, 
  varchar, 
  text, 
  boolean, 
  timestamp, 
  date,
  decimal, 
  integer, 
  jsonb, 
  char, 
  unique,
  primaryKey,
  index,
  AnyPgColumn
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// ENUMS
// ============================================

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid", 
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded"
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "unfulfilled",
  "partial",
  "fulfilled"
]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "percentage",
  "fixed",
  "free_shipping"
]);

export const staffRoleEnum = pgEnum("staff_role", [
  "admin",
  "designer",
  "support",
  "warehouse"
]);

export const sampleStatusEnum = pgEnum("sample_status", [
  "draft",
  "sample_ready",
  "approved"
]);

// ============================================
// BRANDS
// ============================================

export const brands = pgTable("brands", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logo_url"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// COLLECTIONS
// ============================================

export const collections = pgTable("collections", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  brandId: bigint("brand_id", { mode: "number" }).references(() => brands.id),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  coverImage: text("cover_image"),
  launchDate: date("launch_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// CATEGORIES
// ============================================

export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  parentId: bigint("parent_id", { mode: "number" }).references((): AnyPgColumn => categories.id),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// PRODUCTS
// ============================================

export const products = pgTable("products", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  brandId: bigint("brand_id", { mode: "number" }).references(() => brands.id),
  collectionId: bigint("collection_id", { mode: "number" }).references(() => collections.id),
  categoryId: bigint("category_id", { mode: "number" }).references(() => categories.id),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  designStory: text("design_story"),
  materials: text("materials"),
  isCustomizable: boolean("is_customizable").default(false),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  weightKg: decimal("weight_kg", { precision: 6, scale: 3 }),
  dimensionsCm: jsonb("dimensions_cm"),
  isActive: boolean("is_active").default(true),
  isDigital: boolean("is_digital").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: jsonb("metadata"),
}, (table) => ({
  slugIdx: index("products_slug_idx").on(table.slug),
  categoryIdx: index("products_category_idx").on(table.categoryId),
  activeIdx: index("products_active_idx").on(table.isActive),
}));

// ============================================
// PRODUCT VARIANTS
// ============================================

export const productVariants = pgTable("product_variants", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 20 }),
  colorName: varchar("color_name", { length: 50 }),
  colorHex: char("color_hex", { length: 7 }),
  fit: varchar("fit", { length: 30 }),
  materialCode: varchar("material_code", { length: 30 }),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0"),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  reservedStock: integer("reserved_stock").default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productVariantUnique: unique("product_variant_unique").on(
    table.productId, table.size, table.colorName
  ),
  productIdx: index("variants_product_idx").on(table.productId),
  stockIdx: index("variants_stock_idx").on(table.stockQuantity),
}));

// ============================================
// PRODUCT IMAGES
// ============================================

export const productImages = pgTable("product_images", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: bigint("variant_id", { mode: "number" })
    .references(() => productVariants.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  isPrimary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("images_product_idx").on(table.productId),
}));

// ============================================
// PRODUCT TAGS
// ============================================

export const productTags = pgTable("product_tags", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
});

export const productTagMappings = pgTable("product_tag_mappings", {
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  tagId: bigint("tag_id", { mode: "number" })
    .notNull()
    .references(() => productTags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.tagId] }),
  productIdx: index("mapping_product_idx").on(table.productId),
  tagIdx: index("mapping_tag_idx").on(table.tagId),
}));

// ============================================
// CUSTOMERS
// ============================================

export const customers = pgTable("customers", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  isVerified: boolean("is_verified").default(false),
  marketingOptIn: boolean("marketing_opt_in").default(false),
  preferredLocale: varchar("preferred_locale", { length: 10 }).default("en"),
  currencyCode: char("currency_code", { length: 3 }).default("USD"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("customers_email_idx").on(table.email),
}));

// ============================================
// CUSTOMER ADDRESSES
// ============================================

export const customerAddresses = pgTable("customer_addresses", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  customerId: bigint("customer_id", { mode: "number" })
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  addressLine1: varchar("address_line1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  stateProvince: varchar("state_province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  countryCode: char("country_code", { length: 2 }).notNull(),
  isDefault: boolean("is_default").default(false),
  isShipping: boolean("is_shipping").default(true),
  isBilling: boolean("is_billing").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("addresses_customer_idx").on(table.customerId),
}));

// ============================================
// CARTS
// ============================================

export const carts = pgTable("carts", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  customerId: bigint("customer_id", { mode: "number" }).references(() => customers.id),
  sessionId: varchar("session_id", { length: 100 }),
  currencyCode: char("currency_code", { length: 3 }).default("USD"),
  couponCode: varchar("coupon_code", { length: 50 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  discountTotal: decimal("discount_total", { precision: 10, scale: 2 }).default("0"),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).default("0"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("carts_customer_idx").on(table.customerId),
  sessionIdx: index("carts_session_idx").on(table.sessionId),
}));

// ============================================
// CART ITEMS
// ============================================

export const cartItems = pgTable("cart_items", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  cartId: bigint("cart_id", { mode: "number" })
    .notNull()
    .references(() => carts.id, { onDelete: "cascade" }),
  variantId: bigint("variant_id", { mode: "number" })
    .notNull()
    .references(() => productVariants.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  cartVariantUnique: unique("cart_variant_unique").on(table.cartId, table.variantId),
  cartIdx: index("cart_items_cart_idx").on(table.cartId),
}));

// ============================================
// ORDERS
// ============================================

export const orders = pgTable("orders", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),
  customerId: bigint("customer_id", { mode: "number" })
    .notNull()
    .references(() => customers.id),
  billingAddressId: bigint("billing_address_id", { mode: "number" })
    .notNull()
    .references(() => customerAddresses.id),
  shippingAddressId: bigint("shipping_address_id", { mode: "number" })
    .notNull()
    .references(() => customerAddresses.id),
  status: orderStatusEnum("status").default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status").default("unfulfilled"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountTotal: decimal("discount_total", { precision: 10, scale: 2 }).default("0"),
  taxTotal: decimal("tax_total", { precision: 10, scale: 2 }).default("0"),
  shippingTotal: decimal("shipping_total", { precision: 10, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  currencyCode: char("currency_code", { length: 3 }).default("USD"),
  couponCode: varchar("coupon_code", { length: 50 }),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  placedAt: timestamp("placed_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("orders_customer_idx").on(table.customerId),
  statusIdx: index("orders_status_idx").on(table.status),
  placedIdx: index("orders_placed_idx").on(table.placedAt),
  orderNumberIdx: index("orders_order_number_idx").on(table.orderNumber),
}));

// ============================================
// ORDER ITEMS
// ============================================

export const orderItems = pgTable("order_items", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  orderId: bigint("order_id", { mode: "number" })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: bigint("variant_id", { mode: "number" })
    .notNull()
    .references(() => productVariants.id),
  productName: varchar("product_name", { length: 200 }).notNull(),
  variantLabel: varchar("variant_label", { length: 100 }),
  sku: varchar("sku", { length: 50 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("order_items_order_idx").on(table.orderId),
  variantIdx: index("order_items_variant_idx").on(table.variantId),
}));

// ============================================
// PAYMENTS
// ============================================

export const payments = pgTable("payments", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  orderId: bigint("order_id", { mode: "number" })
    .notNull()
    .references(() => orders.id),
  transactionId: varchar("transaction_id", { length: 100 }),
  paymentGateway: varchar("payment_gateway", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currencyCode: char("currency_code", { length: 3 }).default("USD"),
  status: paymentStatusEnum("status").default("pending"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  cardLast4: char("card_last4", { length: 4 }),
  errorMessage: text("error_message"),
  capturedAt: timestamp("captured_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("payments_order_idx").on(table.orderId),
  transactionIdx: index("payments_transaction_idx").on(table.transactionId),
}));

// ============================================
// SHIPMENTS
// ============================================

export const shipments = pgTable("shipments", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  orderId: bigint("order_id", { mode: "number" })
    .notNull()
    .references(() => orders.id),
  carrier: varchar("carrier", { length: 50 }).notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  trackingUrl: text("tracking_url"),
  shippingMethod: varchar("shipping_method", { length: 50 }),
  labelUrl: text("label_url"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  estimatedDelivery: date("estimated_delivery"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("shipments_order_idx").on(table.orderId),
  trackingIdx: index("shipments_tracking_idx").on(table.trackingNumber),
}));

// ============================================
// COUPONS
// ============================================

export const coupons = pgTable("coupons", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: couponTypeEnum("type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }),
  usageLimitPerUser: integer("usage_limit_per_user").default(1),
  usageLimitTotal: integer("usage_limit_total"),
  usedCount: integer("used_count").default(0),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  applicableProducts: jsonb("applicable_products"),
  applicableCategories: jsonb("applicable_categories"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  codeIdx: index("coupons_code_idx").on(table.code),
  activeIdx: index("coupons_active_idx").on(table.isActive),
}));

// ============================================
// REVIEWS
// ============================================

export const reviews = pgTable("reviews", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  customerId: bigint("customer_id", { mode: "number" })
    .notNull()
    .references(() => customers.id),
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: bigint("variant_id", { mode: "number" })
    .references(() => productVariants.id),
  orderId: bigint("order_id", { mode: "number" })
    .references(() => orders.id),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 100 }),
  comment: text("comment"),
  isVerified: boolean("is_verified").default(false),
  isApproved: boolean("is_approved").default(false),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("reviews_product_idx").on(table.productId),
  customerIdx: index("reviews_customer_idx").on(table.customerId),
  approvedIdx: index("reviews_approved_idx").on(table.isApproved),
}));

// ============================================
// REVIEW IMAGES
// ============================================

export const reviewImages = pgTable("review_images", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  reviewId: bigint("review_id", { mode: "number" })
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// ============================================
// DESIGNS (In-House Production)
// ============================================

export const designs = pgTable("designs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),
  designerName: varchar("designer_name", { length: 100 }),
  designSketch: text("design_sketch"),
  techPackUrl: text("tech_pack_url"),
  fabricSpecs: text("fabric_specs"),
  sampleStatus: sampleStatusEnum("sample_status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("designs_product_idx").on(table.productId),
}));

// ============================================
// MANUFACTURING BATCHES
// ============================================

export const manufacturingBatches = pgTable("manufacturing_batches", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  productId: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),
  batchNumber: varchar("batch_number", { length: 50 }).notNull(),
  quantityProduced: integer("quantity_produced").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  producedAt: date("produced_at"),
  receivedAt: date("received_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("batches_product_idx").on(table.productId),
  batchIdx: index("batches_batch_idx").on(table.batchNumber),
}));

// ============================================
// BLOG POSTS
// ============================================

export const blogPosts = pgTable("blog_posts", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  authorId: bigint("author_id", { mode: "number" }).references(() => customers.id),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("blog_slug_idx").on(table.slug),
  publishedIdx: index("blog_published_idx").on(table.isPublished),
}));

// ============================================
// STAFF USERS
// ============================================

export const staffUsers = pgTable("staff_users", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  role: staffRoleEnum("role").default("support"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("staff_email_idx").on(table.email),
}));

// ============================================
// ACTIVITY LOGS
// ============================================

export const activityLogs = pgTable("activity_logs", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  staffId: bigint("staff_id", { mode: "number" }).references(() => staffUsers.id),
  customerId: bigint("customer_id", { mode: "number" }).references(() => customers.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  staffIdx: index("logs_staff_idx").on(table.staffId),
  customerIdx: index("logs_customer_idx").on(table.customerId),
  createdIdx: index("logs_created_idx").on(table.createdAt),
}));

// ============================================
// RELATIONS
// ============================================

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
  collections: many(collections),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  brand: one(brands, { fields: [collections.brandId], references: [brands.id] }),
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  collection: one(collections, { fields: [products.collectionId], references: [collections.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
  reviews: many(reviews),
  designs: many(designs),
  tags: many(productTagMappings),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [productImages.variantId], references: [productVariants.id] }),
}));

export const productTagsRelations = relations(productTags, ({ many }) => ({
  products: many(productTagMappings),
}));

export const productTagMappingsRelations = relations(productTagMappings, ({ one }) => ({
  product: one(products, { fields: [productTagMappings.productId], references: [products.id] }),
  tag: one(productTags, { fields: [productTagMappings.tagId], references: [productTags.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(customerAddresses),
  orders: many(orders),
  reviews: many(reviews),
  carts: many(carts),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, { fields: [customerAddresses.customerId], references: [customers.id] }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  customer: one(customers, { fields: [carts.customerId], references: [customers.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  billingAddress: one(customerAddresses, { fields: [orders.billingAddressId], references: [customerAddresses.id] }),
  shippingAddress: one(customerAddresses, { fields: [orders.shippingAddressId], references: [customerAddresses.id] }),
  items: many(orderItems),
  payments: many(payments),
  shipments: many(shipments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, { fields: [shipments.orderId], references: [orders.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  customer: one(customers, { fields: [reviews.customerId], references: [customers.id] }),
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [reviews.variantId], references: [productVariants.id] }),
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  images: many(reviewImages),
}));

export const reviewImagesRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, { fields: [reviewImages.reviewId], references: [reviews.id] }),
}));

export const designsRelations = relations(designs, ({ one }) => ({
  product: one(products, { fields: [designs.productId], references: [products.id] }),
}));

export const manufacturingBatchesRelations = relations(manufacturingBatches, ({ one }) => ({
  product: one(products, { fields: [manufacturingBatches.productId], references: [products.id] }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(customers, { fields: [blogPosts.authorId], references: [customers.id] }),
}));