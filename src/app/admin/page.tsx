import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Owner dashboard",
  robots: { follow: false, index: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}

