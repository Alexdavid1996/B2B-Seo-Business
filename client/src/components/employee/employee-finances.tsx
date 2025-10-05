import AdminFinances from "@/components/admin/admin-finances";

export default function EmployeeFinances() {
  // Employee finances reuses the exact same admin finances component
  // This ensures complete consistency in data, logic, and functionality
  return <AdminFinances isEmployeeView={true} />;
}