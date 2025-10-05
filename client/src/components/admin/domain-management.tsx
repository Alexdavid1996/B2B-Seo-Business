import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Check, X, Archive, Eye, Filter, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CategoryManagement from "./category-management";
import DynamicTimestamp from "@/components/ui/dynamic-timestamp";
import { useAppTimezone, useConvertToAppTimezone } from "@/hooks/use-app-timezone";

interface Site {
  id: string;
  domain: string;
  title: string;
  description?: string;
  category: string;
  purpose: string;
  linkType?: string;
  casinoAllowed?: string;
  status: string;
  price?: number;
  deliveryTime?: number;
  rejectionReason?: string;
  approvedBy?: string;
  rejectedBy?: string;
  processedAt?: string;
  ownerName: string;
  ownerUsername: string;
  userId: string;
  domainAuthority: number;
  drScore: number;
  monthlyTraffic: number;
  language: string;
  createdAt: string;
}

export default function DomainManagement({ isEmployeeView = false }: { isEmployeeView?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(isEmployeeView ? "pending-guest-posts" : "all");
  const [selectedDomain, setSelectedDomain] = useState<Site | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectSiteId, setRejectSiteId] = useState<string>("");
  const [rejectSiteDomain, setRejectSiteDomain] = useState<string>("");
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingSiteId, setDeletingSiteId] = useState<string>("");
  const [deletingSiteDomain, setDeletingSiteDomain] = useState<string>("");
  const [filters, setFilters] = useState({
    domainName: "",
    date: "",
    category: "all"
  });

  // Use app timezone for all date operations
  const { appTimezone } = useAppTimezone();
  const convertToAppTimezone = useConvertToAppTimezone();

  // Fetch rejection reasons
  const { data: rejectionReasons = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/rejection-reasons"]
  });

  // Fetch all domains
  const { data: allDomains = [], isLoading } = useQuery<Site[]>({
    queryKey: ["/api/admin/sites"],
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  // Update site mutation
  const updateSiteMutation = useMutation({
    mutationFn: ({ siteId, data }: { siteId: string; data: any }) =>
      apiRequest(`/api/admin/sites/${siteId}`, {
        method: "PUT",
        body: data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({ title: "Site updated successfully" });
      setEditingSite(null);
      setShowEditDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to update site", variant: "destructive" });
    },
  });

  // Site action mutations
  const approveSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      const response = await apiRequest(`/api/admin/sites/${siteId}/approve`, {
        method: "POST"
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({
        title: "Site approved",
        description: "The site has been approved successfully.",
      });
    },
  });

  const rejectSiteMutation = useMutation({
    mutationFn: async ({ siteId, reason }: { siteId: string; reason: string }) => {
      const response = await apiRequest(`/api/admin/sites/${siteId}/reject`, {
        method: "POST",
        body: { reason }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({
        title: "Site rejected",
        description: "The site has been rejected and moved to archive.",
      });
    },
  });

  const deleteSiteMutation = useMutation({
    mutationFn: async (siteId: string) => {
      const response = await apiRequest(`/api/sites/${siteId}`, {
        method: "DELETE"
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({
        title: "Site deleted",
        description: "The site has been permanently deleted.",
      });
    },
  });

  const handleApprove = (siteId: string) => {
    approveSiteMutation.mutate(siteId);
  };

  const handleReject = (siteId: string, domain: string) => {
    setRejectSiteId(siteId);
    setRejectSiteDomain(domain);
    setSelectedRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleRejectWithReason = () => {
    if (!selectedRejectionReason.trim()) {
      toast({ title: "Please select a rejection reason", variant: "destructive" });
      return;
    }
    rejectSiteMutation.mutate({ siteId: rejectSiteId, reason: selectedRejectionReason });
    setShowRejectDialog(false);
  };

  const handleDelete = (siteId: string, domain: string) => {
    setDeletingSiteId(siteId);
    setDeletingSiteDomain(domain);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteSiteMutation.mutate(deletingSiteId);
    setShowDeleteDialog(false);
    setDeletingSiteId("");
    setDeletingSiteDomain("");
  };

  // Filter domains based on active tab
  const getFilteredDomains = () => {
    let baseDomains: Site[] = [];
    
    switch (activeTab) {
      case "guest-posts":
        // Show only approved guest post sales
        baseDomains = allDomains.filter(domain => domain.purpose === "sales" && domain.status === "approved");
        break;
      case "exchange":
        // Show only active exchanges (approved)
        baseDomains = allDomains.filter(domain => domain.purpose === "exchange" && domain.status === "approved");
        break;
      case "pending-guest-posts":
        // Show only pending guest post sales
        baseDomains = allDomains.filter(domain => domain.purpose === "sales" && domain.status === "pending");
        break;
      case "pending-exchange":
        // Show only pending exchanges  
        baseDomains = allDomains.filter(domain => domain.purpose === "exchange" && domain.status === "pending");
        break;
      case "archived":
        baseDomains = allDomains.filter(domain => domain.status === "rejected" || domain.status === "blacklisted");
        break;
      case "all":
        // Show only approved domains (active ones)
        baseDomains = allDomains.filter(domain => domain.status === "approved");
        break;
      case "categories":
        return []; // No domains for categories tab
      default:
        baseDomains = allDomains.filter(domain => domain.status === "approved");
    }
    
    // Apply filters only if not on categories tab
    if (activeTab !== "categories") {
      return applyFilters(baseDomains);
    }
    
    return baseDomains;
  };

  const formatPrice = (price?: number) => {
    if (!price) return "N/A";
    return `$${price.toFixed(2)}`;
  };

  const truncateDescription = (description: string) => {
    if (description.length <= 110) return description;
    return description.substring(0, 110);
  };

  const needsViewDetails = (description?: string) => {
    return description && description.length > 110;
  };

  // Apply filters to domains with timezone-aware date filtering
  const applyFilters = (domains: Site[]) => {
    return domains.filter(domain => {
      const matchesDomain = !filters.domainName || 
        domain.domain.toLowerCase().includes(filters.domainName.toLowerCase()) ||
        domain.title.toLowerCase().includes(filters.domainName.toLowerCase());
      
      const matchesCategory = !filters.category || filters.category === "all" || domain.category === filters.category;
      
      // Timezone-aware date filtering using app timezone
      const matchesDate = !filters.date || (() => {
        try {
          const domainDate = new Date(domain.createdAt);
          const filterDate = new Date(filters.date);
          
          // Convert both dates to app timezone for comparison
          const domainDateInAppTZ = convertToAppTimezone(domainDate);
          const filterDateInAppTZ = convertToAppTimezone(filterDate);
          
          // Compare just the date part (YYYY-MM-DD)
          const domainDateStr = domainDateInAppTZ.split('T')[0];
          const filterDateStr = filterDateInAppTZ.split('T')[0];
          
          return domainDateStr === filterDateStr;
        } catch (error) {
          console.error("Error comparing dates with app timezone:", error);
          // Fallback to basic date comparison
          return new Date(domain.createdAt).toISOString().split('T')[0] === filters.date;
        }
      })();
      
      return matchesDomain && matchesCategory && matchesDate;
    });
  };

  const clearFilters = () => {
    setFilters({ domainName: "", date: "", category: "all" });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
      case "blacklisted":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderDomainCard = (domain: Site) => (
    <div key={domain.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-lg">{domain.title}</h4>
            <Badge variant={getStatusBadgeVariant(domain.status)}>
              {domain.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {domain.purpose}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">{domain.domain}</p>
          <p className="text-sm text-gray-500 mb-2">
            {domain.description ? truncateDescription(domain.description) : "No description"}
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Owner:</span> {domain.ownerUsername || domain.ownerName}
            </div>
            <div>
              <span className="font-medium">Category:</span> {domain.category}
            </div>
            <div>
              <span className="font-medium">Purpose:</span> {domain.purpose === "sales" ? "Guest Post" : "Exchange"}
            </div>
            {domain.purpose === "sales" && (
              <>
                <div>
                  <span className="font-medium">Price:</span> {formatPrice(domain.price)}
                </div>
                <div>
                  <span className="font-medium">Delivery:</span> {domain.deliveryTime || "N/A"} days
                </div>
                <div></div>
              </>
            )}
          </div>
          {domain.rejectionReason && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <span className="font-medium">Rejection reason:</span> {domain.rejectionReason}
            </div>
          )}
          {domain.approvedBy && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              <span className="font-medium">{domain.approvedBy}</span>
            </div>
          )}
          {domain.rejectedBy && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <span className="font-medium">{domain.rejectedBy}</span>
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2">
            Created: <DynamicTimestamp timestamp={domain.createdAt} showTime={false} />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 ml-4">
          {/* Edit button for all tabs except archived */}
          {domain.status !== "rejected" && domain.status !== "blacklisted" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingSite({ ...domain });
                setShowEditDialog(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}

          {domain.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(domain.id)}
                disabled={approveSiteMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(domain.id, domain.domain)}
                disabled={rejectSiteMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          
          {(activeTab === "all" || activeTab === "guest-posts" || activeTab === "exchange" || activeTab === "pending-guest-posts" || activeTab === "pending-exchange") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedDomain(domain)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{domain.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Domain:</span> {domain.domain}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-sm text-gray-600">{domain.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Owner:</span> {domain.ownerUsername || domain.ownerName}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {domain.category}
                    </div>
                    <div>
                      <span className="font-medium">Purpose:</span> {domain.purpose === "sales" ? "Guest Post" : "Exchange"}
                    </div>
                    <div>
                      <span className="font-medium">Link Type:</span>
                      <div className="flex gap-2 ml-2">
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                          domain.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {domain.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                        </div>
                        {domain.purpose === "sales" && domain.casinoAllowed && domain.casinoAllowed !== 'N/A' && (
                          <div className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                            domain.casinoAllowed === 'yes' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            Casino: {domain.casinoAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant={getStatusBadgeVariant(domain.status)} className="ml-2">
                        {domain.status}
                      </Badge>
                    </div>
                    {domain.purpose === "sales" && (
                      <>
                        <div>
                          <span className="font-medium">Price:</span> {formatPrice(domain.price)}
                        </div>
                        <div>
                          <span className="font-medium">Delivery Time:</span> {domain.deliveryTime || "N/A"} days
                        </div>
                      </>
                    )}
                    <div>
                      <span className="font-medium">Domain Authority:</span> {domain.domainAuthority}
                    </div>
                    <div>
                      <span className="font-medium">DR Score:</span> {domain.drScore}
                    </div>
                    <div>
                      <span className="font-medium">Monthly Traffic:</span> {domain.monthlyTraffic?.toLocaleString() || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Language:</span> {domain.language}
                    </div>
                  </div>
                  {domain.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <span className="font-medium text-red-700">Rejection Reason:</span>
                      <p className="text-red-600 text-sm mt-1">{domain.rejectionReason}</p>
                    </div>
                  )}
                  {domain.approvedBy && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <span className="font-medium text-green-700">{domain.approvedBy}</span>
                    </div>
                  )}
                  {domain.rejectedBy && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <span className="font-medium text-red-700">{domain.rejectedBy}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Created: {new Date(domain.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {(domain.status === "approved" || domain.status === "rejected") && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(domain.id, domain.domain)}
              disabled={deleteSiteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          
          {domain.status === "rejected" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApprove(domain.id)}
              disabled={approveSiteMutation.isPending}
            >
              <Archive className="h-4 w-4 mr-1" />
              Restore
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading domains...</div>
        </CardContent>
      </Card>
    );
  }

  const filteredDomains = getFilteredDomains();

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle>Domain Management</CardTitle>
        <p className="text-sm text-gray-600">Manage all domains, submissions, and site categories</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${isEmployeeView ? 'grid-cols-2' : 'grid-cols-7'}`}>
            {!isEmployeeView && <TabsTrigger value="all">All Listings</TabsTrigger>}
            {!isEmployeeView && <TabsTrigger value="guest-posts">Guest Posts</TabsTrigger>}
            {!isEmployeeView && <TabsTrigger value="exchange">Exchange</TabsTrigger>}
            <TabsTrigger value="pending-guest-posts">Pending Guest Posts</TabsTrigger>
            <TabsTrigger value="pending-exchange">Pending Exchange</TabsTrigger>
            {!isEmployeeView && <TabsTrigger value="archived">Rejected</TabsTrigger>}
            {!isEmployeeView && <TabsTrigger value="categories">Categories</TabsTrigger>}
          </TabsList>

          {/* Filters - shown for all tabs except Categories */}
          {activeTab !== "categories" && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <span className="font-medium text-sm">Filters</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Domain Name</label>
                  <Input
                    placeholder="Search by domain or title..."
                    value={filters.domainName}
                    onChange={(e) => setFilters(prev => ({ ...prev, domainName: e.target.value }))}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isEmployeeView && <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Active Domains ({filteredDomains.length})</h3>
                <div className="flex gap-2 text-sm text-gray-600">
                  <span>Guest Posts: {filteredDomains.filter(d => d.purpose === "sales").length}</span>
                  <span>Exchange: {filteredDomains.filter(d => d.purpose === "exchange").length}</span>
                  <span>Total Active: {filteredDomains.length}</span>
                </div>
              </div>
              {filteredDomains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active domains found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map(renderDomainCard)}
                </div>
              )}
            </div>
          </TabsContent>}

          {!isEmployeeView && <TabsContent value="guest-posts" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Guest Posts & Link Placements ({filteredDomains.length})</h3>
              {filteredDomains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No guest post or placement domains found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map(renderDomainCard)}
                </div>
              )}
            </div>
          </TabsContent>}

          {!isEmployeeView && <TabsContent value="exchange" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Exchange Domains ({filteredDomains.length})</h3>
              {filteredDomains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No exchange domains found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map(renderDomainCard)}
                </div>
              )}
            </div>
          </TabsContent>}

          <TabsContent value="pending-guest-posts" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pending Guest Posts ({filteredDomains.length})</h3>
              {filteredDomains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending guest post domains found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map(renderDomainCard)}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending-exchange" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pending Exchange ({filteredDomains.length})</h3>
              {filteredDomains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending exchange domains found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map(renderDomainCard)}
                </div>
              )}
            </div>
          </TabsContent>



          {!isEmployeeView && <TabsContent value="archived" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Archived Domains ({filteredDomains.length})</h3>
              {filteredDomains.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No archived domains found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map(renderDomainCard)}
                </div>
              )}
            </div>
          </TabsContent>}

          {!isEmployeeView && <TabsContent value="categories" className="mt-6">
            <CategoryManagement />
          </TabsContent>}
        </Tabs>
      </CardContent>
      </Card>
      
      {/* Rejection Dialog */}
    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Domain: {rejectSiteDomain}</DialogTitle>
          <DialogDescription>
            Select a rejection reason for this domain submission.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Select onValueChange={setSelectedRejectionReason} value={selectedRejectionReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select rejection reason" />
              </SelectTrigger>
              <SelectContent>
                {rejectionReasons.map((reason: any) => (
                  <SelectItem key={reason.id} value={reason.reasonText}>
                    {reason.reasonText}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              onClick={handleRejectWithReason}
              disabled={rejectSiteMutation.isPending || !selectedRejectionReason}
            >
              Reject Domain
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Edit Site Dialog */}
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Site: {editingSite?.domain}</DialogTitle>
        </DialogHeader>
        {editingSite && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Domain</Label>
                <Input
                  value={editingSite.domain}
                  onChange={(e) => setEditingSite({ ...editingSite, domain: e.target.value })}
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={editingSite.title}
                  onChange={(e) => setEditingSite({ ...editingSite, title: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={editingSite.description || ''}
                onChange={(e) => setEditingSite({ ...editingSite, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Domain Authority</Label>
                <Input
                  type="number"
                  value={editingSite.domainAuthority}
                  onChange={(e) => setEditingSite({ ...editingSite, domainAuthority: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>DR Score</Label>
                <Input
                  type="number"
                  value={editingSite.drScore}
                  onChange={(e) => setEditingSite({ ...editingSite, drScore: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Monthly Traffic</Label>
                <Input
                  type="number"
                  value={editingSite.monthlyTraffic}
                  onChange={(e) => setEditingSite({ ...editingSite, monthlyTraffic: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={editingSite.category}
                  onValueChange={(value) => setEditingSite({ ...editingSite, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link Type</Label>
                <Select
                  value={editingSite.linkType || 'dofollow'}
                  onValueChange={(value) => setEditingSite({ ...editingSite, linkType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dofollow">✅ Do Follow</SelectItem>
                    <SelectItem value="nofollow">🚫 No Follow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (if for sales)</Label>
                <Input
                  type="number"
                  value={editingSite.price ? editingSite.price.toString() : ''}
                  onChange={(e) => setEditingSite({ ...editingSite, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  placeholder="Leave empty for exchange-only"
                />
              </div>
              {editingSite.purpose === "sales" && (
                <div>
                  <Label>Casino Content Allowed</Label>
                  <Select
                    value={editingSite.casinoAllowed || 'N/A'}
                    onValueChange={(value) => setEditingSite({ ...editingSite, casinoAllowed: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">🎰 Yes - Casino content allowed</SelectItem>
                      <SelectItem value="no">🚫 No - Casino content not allowed</SelectItem>
                      <SelectItem value="N/A">➖ N/A - Not specified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  updateSiteMutation.mutate({
                    siteId: editingSite.id,
                    data: {
                      domain: editingSite.domain,
                      title: editingSite.title,
                      description: editingSite.description,
                      domainAuthority: editingSite.domainAuthority,
                      drScore: editingSite.drScore,
                      monthlyTraffic: editingSite.monthlyTraffic,
                      category: editingSite.category,
                      linkType: editingSite.linkType,
                      casinoAllowed: editingSite.casinoAllowed,
                      price: editingSite.price
                    }
                  });
                }}
                disabled={updateSiteMutation.isPending}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Site</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete the site <strong>{deletingSiteDomain}</strong>? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteSiteMutation.isPending}
          >
            {deleteSiteMutation.isPending ? "Deleting..." : "Delete Site"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}