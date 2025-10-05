import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const filters = [
  { id: "all", label: "All Exchanges" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function ExchangeFilters() {
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
