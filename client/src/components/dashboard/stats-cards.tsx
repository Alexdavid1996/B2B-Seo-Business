import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, ArrowLeftRight, Clock, DollarSign } from "lucide-react";
import { SiteWithUser, ExchangeWithDetails } from "../../types";

interface StatsCardsProps {
  sites: SiteWithUser[];
  exchanges: ExchangeWithDetails[];
  userStats?: {
    totalSites: number;
    completedExchanges: number;
    pendingApproval: number;
  };
  totalSales?: number;
}

export default function StatsCards({ sites, exchanges, userStats, totalSales = 0 }: StatsCardsProps) {
  // Use API data if available, fallback to calculated data
  const totalSites = userStats?.totalSites ?? sites.length;
  const completedExchanges = userStats?.completedExchanges ?? exchanges.filter(e => 
    e.status === "completed" && 
    e.requesterCompleted === true && 
    e.requestedUserCompleted === true
  ).length;
  const pendingApproval = userStats?.pendingApproval ?? sites.filter(s => s.status === "pending").length;

  const stats = [
    {
      title: "Total Sites",
      value: totalSites.toString(),
      icon: LayoutDashboard,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      change: totalSites > 0 ? (totalSites === 1 ? "1 site registered" : `${totalSites} sites registered`) : "No sites yet",
      changeText: ""
    },
    {
      title: "Completed Exchanges", 
      value: completedExchanges.toString(),
      icon: ArrowLeftRight,
      bgColor: "bg-green-50", 
      iconColor: "text-green-600",
      change: completedExchanges > 0 ? "Successfully completed" : "No exchanges yet",
      changeText: ""
    },
    {
      title: "Pending Approval",
      value: pendingApproval.toString(),
      icon: Clock,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      change: pendingApproval > 0 ? "Review needed" : "All approved",
      changeText: ""
    },
    {
      title: "Total Sales",
      value: `$${totalSales.toFixed(0)}`,
      icon: DollarSign,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      change: totalSales > 0 ? "Revenue earned" : "No sales yet",
      changeText: ""
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{stat.change}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full flex-shrink-0 ml-3`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.iconColor}`} />
              </div>
            </div>
            {stat.changeText && (
              <div className="mt-2 sm:mt-4 flex items-center text-xs sm:text-sm">
                <span className={`font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-amber-600'}`}>
                  {stat.change}
                </span>
                {stat.changeText && (
                  <span className="text-gray-600 ml-1 truncate">{stat.changeText}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
