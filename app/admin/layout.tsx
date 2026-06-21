// app/admin/layout.tsx
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminDashboardClient>
      {children}
    </AdminDashboardClient>
  );
}