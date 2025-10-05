import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, Ban, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminDomainsProps {
  isEmployeeView?: boolean;
}

export default function AdminDomains({ isEmployeeView = false }: AdminDomainsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showQuickRejectDialog, setShowQuickRejectDialog] = useState(false);
  const [quickRejectSiteId, setQuickRejectSiteId] = useState<string>("");
  const [quickRejectSiteDomain, setQuickRejectSiteDomain] = useState<string>("");
  
  // Fetch database rejection reasons
  const { data: rejectionReasons = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/rejection-reasons"]
  });

  const { data: sites = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/sites"],
  });

  const approveMutation = useMutation({
    mutationFn: (siteId: string) => apiRequest(`/api/admin/sites/${siteId}/approve`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({ title: "Site approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve site", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ siteId, reason }: { siteId: string; reason: string }) =>
      apiRequest(`/api/admin/sites/${siteId}/reject`, {
        method: "POST",
        body: { rejectionReason: reason }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({ title: "Site rejected successfully" });
      setRejectionReason("");
    },
    onError: () => {
      toast({ title: "Failed to reject site", variant: "destructive" });
    },
  });



  const blacklistMutation = useMutation({
    mutationFn: ({ siteId, reason }: { siteId: string; reason: string }) =>
      apiRequest(`/api/admin/sites/${siteId}/blacklist`, {
        method: "POST",
        body: { rejectionReason: reason }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({ title: "Site blacklisted successfully" });
      setRejectionReason("");
    },
    onError: () => {
      toast({ title: "Failed to blacklist site", variant: "destructive" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (siteId: string) => apiRequest(`/api/admin/sites/${siteId}/restore`, {
      method: "POST"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      toast({ title: "Site restored successfully" });
    },
    onError: () => {
      toast({ title: "Failed to restore site", variant: "destructive" });
    },
  });

  const renderUserInfo = (user: any) => {
    if (!user) {
      return (
        <div>
          <div className="font-medium">Unknown User</div>
          <div className="text-sm text-gray-500">No email available</div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="font-medium">{user.firstName} {user.lastName}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading domains...</div>;
  }

  const pendingSites = sites.filter((site: any) => site.status === "pending");
  const activeSites = sites.filter((site: any) => site.status === "approved");
  const blacklistedSites = sites.filter((site: any) => site.status === "blacklisted");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isEmployeeView ? "Domain Review" : "Domain Management"}</h1>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className={`grid w-full ${isEmployeeView ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <TabsTrigger value="pending">Pending Domains ({pendingSites.length})</TabsTrigger>
          {!isEmployeeView && (
            <>
              <TabsTrigger value="active">Active Domains ({activeSites.length})</TabsTrigger>
              <TabsTrigger value="blacklisted">Blacklisted Domains ({blacklistedSites.length})</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Domains - Awaiting Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>DA/DR</TableHead>
                    <TableHead>Traffic</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSites.map((site: any) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{site.domain}</div>
                          <div className="text-sm text-gray-500">{site.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderUserInfo(site.user)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{site.purpose}</Badge>
                        {site.purpose === 'sales' && site.price && (
                          <div className="text-sm text-gray-500 mt-1">
                            ${site.price.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>DA: {site.domainAuthority}</div>
                          <div>DR: {site.drScore}</div>
                        </div>
                      </TableCell>
                      <TableCell>{site.monthlyTraffic.toLocaleString()}</TableCell>
                      <TableCell>{new Date(site.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedSite(site)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader className="flex-shrink-0">
                                <DialogTitle>Domain Review: {site.domain}</DialogTitle>
                              </DialogHeader>
                              {selectedSite && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">Site Information</h4>
                                      <p><strong>Domain:</strong> {selectedSite.domain}</p>
                                      <p><strong>Title:</strong> {selectedSite.title}</p>
                                      <p><strong>Description:</strong> {selectedSite.description}</p>
                                      <p><strong>Purpose:</strong> {selectedSite.purpose}</p>
                                      <p><strong>Category:</strong> {selectedSite.category}</p>
                                      <p><strong>Link Type:</strong> 
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ml-2 ${
                                          selectedSite.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}>
                                          {selectedSite.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                                        </span>
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Owner Information</h4>
                                      {renderUserInfo(selectedSite.user)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold">SEO Metrics</h4>
                                      <p><strong>Domain Authority:</strong> {selectedSite.domainAuthority}</p>
                                      <p><strong>DR Score:</strong> {selectedSite.drScore}</p>
                                      <p><strong>Monthly Traffic:</strong> {selectedSite.monthlyTraffic.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">Pricing</h4>
                                      {selectedSite.purpose === 'sales' && selectedSite.price ? (
                                        <>
                                          <p><strong>Price:</strong> ${selectedSite.price.toFixed(2)}</p>
                                          <p><strong>Delivery Time:</strong> {selectedSite.deliveryTime} days</p>
                                        </>
                                      ) : (
                                        <p>Not for sale</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="rejection-reason">Rejection Reason (if rejecting/blacklisting)</Label>
                                      <Select onValueChange={setRejectionReason} value={rejectionReason}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select rejection reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {rejectionReasons.map((reason) => (
                                            <SelectItem key={reason.id} value={reason.reason}>
                                              {reason.reason}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-950">
                                      <Button
                                        onClick={() => approveMutation.mutate(selectedSite.id)}
                                        disabled={approveMutation.isPending}
                                        className="w-full sm:w-auto"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          if (!rejectionReason.trim()) {
                                            toast({ title: "Please provide a rejection reason", variant: "destructive" });
                                            return;
                                          }
                                          rejectMutation.mutate({ siteId: selectedSite.id, reason: rejectionReason });
                                        }}
                                        disabled={rejectMutation.isPending}
                                        className="w-full sm:w-auto"
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                      {!isEmployeeView && (
                                        <Button
                                          variant="destructive"
                                          onClick={() => {
                                            if (!rejectionReason.trim()) {
                                              toast({ title: "Please provide a blacklist reason", variant: "destructive" });
                                              return;
                                            }
                                            blacklistMutation.mutate({ siteId: selectedSite.id, reason: rejectionReason });
                                          }}
                                          disabled={blacklistMutation.isPending}
                                          className="w-full sm:w-auto"
                                        >
                                          <Ban className="h-4 w-4 mr-2" />
                                          Blacklist
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(site.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setQuickRejectSiteId(site.id);
                              setQuickRejectSiteDomain(site.domain);
                              setRejectionReason("");
                              setShowQuickRejectDialog(true);
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Domains Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="active">
            <Card>
            <CardHeader>
              <CardTitle>Active Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>DA/DR</TableHead>
                    <TableHead>Traffic</TableHead>
                    <TableHead>Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSites.map((site: any) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{site.domain}</div>
                          <div className="text-sm text-gray-500">{site.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderUserInfo(site.user)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{site.purpose}</Badge>
                        {site.purpose === 'sales' && site.price && (
                          <div className="text-sm text-gray-500 mt-1">
                            ${site.price.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>DA: {site.domainAuthority}</div>
                          <div>DR: {site.drScore}</div>
                        </div>
                      </TableCell>
                      <TableCell>{site.monthlyTraffic.toLocaleString()}</TableCell>
                      <TableCell>{new Date(site.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TabsContent>
        )}

        {/* Blacklisted Domains Tab - Admin Only */}
        {!isEmployeeView && (
          <TabsContent value="blacklisted">
            <Card>
            <CardHeader>
              <CardTitle>Blacklisted Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Blacklisted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklistedSites.map((site: any) => (
                    <TableRow key={site.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{site.domain}</div>
                          <div className="text-sm text-gray-500">{site.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderUserInfo(site.user)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{site.rejectionReason || 'No reason provided'}</div>
                      </TableCell>
                      <TableCell>{new Date(site.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreMutation.mutate(site.id)}
                          disabled={restoreMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          </TabsContent>
        )}
      </Tabs>
      
      {/* Quick Reject Dialog */}
      <Dialog open={showQuickRejectDialog} onOpenChange={setShowQuickRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Domain: {quickRejectSiteDomain}</DialogTitle>
            <DialogDescription>
              Select a rejection reason for this domain submission.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quick-rejection-reason">Rejection Reason</Label>
              <Select onValueChange={setRejectionReason} value={rejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rejection reason" />
                </SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.reason}>
                      {reason.reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    toast({ title: "Please select a rejection reason", variant: "destructive" });
                    return;
                  }
                  rejectMutation.mutate({ siteId: quickRejectSiteId, reason: rejectionReason });
                  setShowQuickRejectDialog(false);
                }}
                disabled={rejectMutation.isPending}
              >
                Reject Domain
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowQuickRejectDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}