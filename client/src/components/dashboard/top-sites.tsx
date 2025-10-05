import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { SiteWithUser, OrderData } from "../../types";

interface TopSitesProps {
  sites: SiteWithUser[];
  orders: OrderData[];
}

export default function TopSites({ sites, orders }: TopSitesProps) {
  // Use purchaseCount from database instead of calculating from orders
  const topSites = sites
    .filter((site) => site.status === "approved")
    .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (domain: string) => {
    return domain.split(".")[0].substring(0, 2).toUpperCase();
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-purple-500 to-pink-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          🔥 Top Performing Sites
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {topSites.length > 0 ? (
            topSites.map((site, index) => (
              <div key={site.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${getGradientClass(index)} rounded-lg flex items-center justify-center`}
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{site.domain}</p>
                    <p className="text-sm text-gray-500">
                      {site.purchaseCount || 0} orders | DA:{" "}
                      {site.domainAuthority} | Traffic:{" "}
                      {site.monthlyTraffic?.toLocaleString() || 0}/mo
                    </p>
                  </div>
                </div>
                <div className="text-right">{getStatusBadge(site.status)}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                No sites with completed orders yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
