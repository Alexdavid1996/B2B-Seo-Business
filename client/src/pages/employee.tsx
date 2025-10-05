import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, FileText, DollarSign, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import EmployeeSupport from "@/components/employee/employee-support";
import EmployeeFinances from "@/components/employee/employee-finances";
import EmployeeDomains from "@/components/employee/employee-domains";
import { useSEOPage } from "../hooks/use-seo";
import { ADMIN_BASE_PATH } from "@/lib/constants";

export default function EmployeeDashboard() {
  const { user, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // SEO for employee dashboard
  useSEOPage('admin'); // Employee uses admin SEO config

  // Fetch pending items for overview cards - use existing APIs
  const { data: sites = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/sites"],
    enabled: !!user?.role && (user.role === 'employee'),
  });

  const { data: pendingTopUps } = useQuery({
    queryKey: ["/api/admin/wallet-transactions/top_up/processing"],
    enabled: !!user?.role && (user.role === 'employee'),
  });

  const { data: pendingWithdrawals } = useQuery({
    queryKey: ["/api/admin/wallet-transactions/withdrawal/processing"],
    enabled: !!user?.role && (user.role === 'employee'),
  });

  const { data: supportTickets } = useQuery({
    queryKey: ["/api/admin/support/tickets/all/all/all"],
    enabled: !!user?.role && (user.role === 'employee'),
  });

  const pendingTickets = Array.isArray(supportTickets) ? supportTickets.filter((ticket: any) => ticket.status === 'open') : [];

  // Show loading state while authentication is loading
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we verify your access.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show access denied only after loading is complete and user is not an employee
  if (!user || user.role !== 'employee') {
    // Redirect to admin login page for authentication
    window.location.href = ADMIN_BASE_PATH;
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Redirecting...</CardTitle>
            <CardDescription>Redirecting to login page...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Users className="w-4 h-4 mr-2" />
                Employee
              </Badge>
              <Button 
                variant="outline" 
                onClick={logout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="finances">Finances</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pending Guest Posts */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Guest Posts</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sites.filter((site: any) => site.status === 'pending' && (site.purpose === 'sales' || site.purpose === 'both')).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Orders awaiting review
                  </p>
                </CardContent>
              </Card>

              {/* Pending Exchanges */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Exchanges</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sites.filter((site: any) => site.status === 'pending' && (site.purpose === 'exchange' || site.purpose === 'both')).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Exchange requests pending
                  </p>
                </CardContent>
              </Card>

              {/* Pending Top-Ups */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Top-Ups</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Array.isArray(pendingTopUps) ? pendingTopUps.length : 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Deposits awaiting approval
                  </p>
                </CardContent>
              </Card>

              {/* Pending Withdrawals */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <DollarSign className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Array.isArray(pendingWithdrawals) ? pendingWithdrawals.length : 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Withdrawals awaiting approval
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your primary tasks and responsibilities</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("support")}
                >
                  <Users className="h-6 w-6" />
                  <span>Support Tickets</span>
                  <Badge variant="secondary">{pendingTickets.length} open</Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("finances")}
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Financial Reviews</span>
                  <Badge variant="secondary">
                    {(Array.isArray(pendingTopUps) ? pendingTopUps.length : 0) + (Array.isArray(pendingWithdrawals) ? pendingWithdrawals.length : 0)} pending
                  </Badge>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => setActiveTab("domains")}
                >
                  <Globe className="h-6 w-6" />
                  <span>Domain Approvals</span>
                  <Badge variant="secondary">Review sites</Badge>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <EmployeeSupport />
          </TabsContent>

          <TabsContent value="finances">
            <EmployeeFinances />
          </TabsContent>

          <TabsContent value="domains">
            <EmployeeDomains />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}