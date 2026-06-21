"use server";

import { db } from "@/db";
import { orders, orderItems, payments, shipments, customers, customerAddresses } from "@/db/schema";
import { like, eq, or, and, count, desc, asc, sql } from "drizzle-orm";

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: string | null;
  paymentStatus: string | null;
  fulfillmentStatus: string | null;
  subtotal: string | null;
  grandTotal: string | null;
  currencyCode: string | null;
  placedAt: Date | null;
  customerName: string | null;
  customerEmail: string | null;
  itemCount: number;
}

export interface OrdersResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getOrdersList(
  search?: string,
  status?: string,
  page = 1,
  pageSize = 20
): Promise<OrdersResponse> {
  const offset = (page - 1) * pageSize;
  const conditions: any[] = [];

  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as any));
  }

  if (search) {
    conditions.push(
      or(
        like(orders.orderNumber, `%${search}%`),
        like(customers.firstName, `%${search}%`),
        like(customers.lastName, `%${search}%`),
        like(customers.email, `%${search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [total] = await db
    .select({ count: count() })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(where);

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      subtotal: orders.subtotal,
      grandTotal: orders.grandTotal,
      currencyCode: orders.currencyCode,
      placedAt: orders.placedAt,
      customerName: sql<string>`concat(${customers.firstName}, ' ', ${customers.lastName})`,
      customerEmail: customers.email,
      itemCount: sql<number>`(select count(*) from ${orderItems} where ${orderItems.orderId} = ${orders.id})`,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(where)
    .orderBy(desc(orders.placedAt))
    .limit(pageSize)
    .offset(offset);

  return { orders: rows, total: total.count, page, pageSize };
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  grandTotal: string;
  currencyCode: string;
  couponCode: string | null;
  notes: string | null;
  adminNotes: string | null;
  placedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
  billingAddress: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateProvince: string | null;
    postalCode: string;
    countryCode: string;
  } | null;
  shippingAddress: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateProvince: string | null;
    postalCode: string;
    countryCode: string;
  } | null;
  items: Array<{
    id: number;
    productName: string;
    variantLabel: string | null;
    sku: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  payments: Array<{
    id: number;
    transactionId: string | null;
    paymentGateway: string;
    amount: string;
    status: string | null;
    paymentMethod: string | null;
    cardLast4: string | null;
    capturedAt: Date | null;
  }>;
  shipments: Array<{
    id: number;
    carrier: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    shippingMethod: string | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    estimatedDelivery: string | null;
  }>;
}

export async function getOrderById(id: number): Promise<OrderDetail | null> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  const [customer] = order.customerId
    ? await db.select().from(customers).where(eq(customers.id, order.customerId)).limit(1)
    : [null];

  const [billing] = order.billingAddressId
    ? await db.select().from(customerAddresses).where(eq(customerAddresses.id, order.billingAddressId)).limit(1)
    : [null];

  const [shipping] = order.shippingAddressId
    ? await db.select().from(customerAddresses).where(eq(customerAddresses.id, order.shippingAddressId)).limit(1)
    : [null];

  const items = await db
    .select({
      id: orderItems.id,
      productName: orderItems.productName,
      variantLabel: orderItems.variantLabel,
      sku: orderItems.sku,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  const paymentsList = await db
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
    .where(eq(payments.orderId, id));

  const shipmentsList = await db
    .select({
      id: shipments.id,
      carrier: shipments.carrier,
      trackingNumber: shipments.trackingNumber,
      trackingUrl: shipments.trackingUrl,
      shippingMethod: shipments.shippingMethod,
      shippedAt: shipments.shippedAt,
      deliveredAt: shipments.deliveredAt,
      estimatedDelivery: shipments.estimatedDelivery,
    })
    .from(shipments)
    .where(eq(shipments.orderId, id));

  return {
    ...order,
    customer: customer ? { id: customer.id, firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone } : null,
    billingAddress: billing ? { addressLine1: billing.addressLine1, addressLine2: billing.addressLine2, city: billing.city, stateProvince: billing.stateProvince, postalCode: billing.postalCode, countryCode: billing.countryCode } : null,
    shippingAddress: shipping ? { addressLine1: shipping.addressLine1, addressLine2: shipping.addressLine2, city: shipping.city, stateProvince: shipping.stateProvince, postalCode: shipping.postalCode, countryCode: shipping.countryCode } : null,
    items,
    payments: paymentsList as OrderDetail["payments"],
    shipments: shipmentsList as OrderDetail["shipments"],
    subtotal: order.subtotal,
    discountTotal: order.discountTotal!,
    taxTotal: order.taxTotal!,
    shippingTotal: order.shippingTotal!,
    grandTotal: order.grandTotal,
    currencyCode: order.currencyCode!,
    couponCode: order.couponCode,
    notes: order.notes,
    adminNotes: order.adminNotes,
    placedAt: order.placedAt!,
    paidAt: order.paidAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt!,
    updatedAt: order.updatedAt!,
  } as OrderDetail;
}

export async function updateOrderStatus(id: number, status: string) {
  const updateData: Record<string, any> = { status, updatedAt: new Date() };
  if (status === "shipped") updateData.shippedAt = new Date();
  if (status === "delivered") updateData.deliveredAt = new Date();
  if (status === "paid") updateData.paidAt = new Date();
  await db.update(orders).set(updateData as any).where(eq(orders.id, id));
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
  const updateData: Record<string, any> = { paymentStatus, updatedAt: new Date() };
  if (paymentStatus === "paid") updateData.paidAt = new Date();
  await db.update(orders).set(updateData as any).where(eq(orders.id, id));
}

export async function updateFulfillmentStatus(id: number, fulfillmentStatus: string) {
  await db.update(orders).set({ fulfillmentStatus: fulfillmentStatus as any, updatedAt: new Date() }).where(eq(orders.id, id));
}

export async function updateAdminNotes(id: number, adminNotes: string) {
  await db.update(orders).set({ adminNotes, updatedAt: new Date() }).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  await db.delete(orders).where(eq(orders.id, id));
}
