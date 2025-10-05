import DomainManagement from "@/components/admin/domain-management";

export default function EmployeeDomains() {
  // Employee domains reuses the exact same admin domain management component
  // This ensures complete consistency in data, logic, and functionality
  return <DomainManagement isEmployeeView={true} />;
}