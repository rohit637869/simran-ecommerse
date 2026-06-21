"use server";

import { db } from "@/db";
import { user } from "@/auth-schema";
import { eq } from "drizzle-orm";

export async function checkAdminExists() {
  const admins = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "admin"))
    .limit(1);
  return admins.length > 0;
}

export async function getUserRole(userId: string) {
  const result = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return result[0]?.role ?? null;
}
