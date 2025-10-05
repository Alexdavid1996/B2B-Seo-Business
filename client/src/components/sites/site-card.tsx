import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { SiteWithUser } from "../../types";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EditSiteForm from "./edit-site-form";
import { formatCurrency } from "@/lib/formatters";

interface SiteCardProps {
  site: SiteWithUser;
}

export default function SiteCard({ site }: SiteCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Disapproved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInitials = (domain: string) => {
    return domain.split(".")[0].substring(0, 2).toUpperCase();
  };

  const getGradientClass = () => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-purple-500 to-pink-600",
      "from-indigo-500 to-blue-600",
      "from-emerald-500 to-teal-600",
      "from-rose-500 to-pink-600",
    ];
    const index = site.domain.length % gradients.length;
    return gradients[index];
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/sites/${site.id}`, {
        method: "DELETE",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sites/directory"] });
      // Invalidate user stats to update dashboard - get user from auth cache
      const authData = queryClient.getQueryData(["/api/auth/me"]) as any;
      const userId = authData?.user?.id || authData?.id;
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: [`/api/users/${userId}/stats`],
        });
      }
      toast({
        title: "Site deleted",
        description: "Your site has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Unable to delete site. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${site.domain}? This action cannot be undone.`,
      )
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${getGradientClass()} rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-white font-bold">
                {getInitials(site.domain)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {site.domain}
              </h3>
              <p className="text-sm text-gray-500 truncate">{site.title}</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            {getStatusBadge(site.status)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {site.domainAuthority}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Domain Authority
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {site.drScore}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">DR Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {site.monthlyTraffic?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Monthly Traffic
            </p>
          </div>
        </div>

        {/* Purpose and Sales Information */}
        <div className="mb-4 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Purpose:
                </span>
                <Badge
                  variant={site.purpose === "exchange" ? "secondary" : "default"}
                  className={
                    site.purpose === "exchange"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }
                >
                  {site.purpose === "exchange" ? "🔄 Exchange" : "💰 Sales"}
                </Badge>
              </div>
              
              {/* Link Type Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Link Type:
                </span>
                <div className={`inline-flex px-2 py-1 rounded text-xs font-medium text-white ${
                  site.linkType === 'dofollow' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {site.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                </div>
              </div>
            </div>
          </div>

          {/* Sales pricing info */}
          {site.purpose === "sales" && site.price && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Price
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(site.price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Delivery Time
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {site.deliveryTime ? `${site.deliveryTime} days` : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Casino Status */}
          {site.casinoAllowed && site.casinoAllowed !== 'N/A' && (
            <div className="mt-3">
              <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                site.casinoAllowed === 'yes' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                Casino: {site.casinoAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
              </div>
            </div>
          )}
        </div>

        {/* Rejection Reason Display */}
        {site.status === "rejected" && site.rejectionReason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Rejection Reason
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {site.rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons - always at bottom */}
        <div className="mt-auto pt-4">
          <div className="flex gap-2">
            {/* Only show Edit/Delete buttons for approved sites */}
            {site.status === "approved" && (
              <>
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl mx-4">
                    <DialogHeader>
                      <DialogTitle>Edit Site Description</DialogTitle>
                      <DialogDescription>
                        Update your site's description and settings to attract
                        more potential partners.
                      </DialogDescription>
                    </DialogHeader>
                    <EditSiteForm
                      site={site}
                      onSuccess={() => setShowEditModal(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}

            {/* Show View Details button for pending sites and read-only status for rejected sites */}
            {site.status === "pending" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl mx-4">
                  <DialogHeader>
                    <DialogTitle>{site.title}</DialogTitle>
                    <DialogDescription>
                      Site submission details and current status
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Domain:</span> {site.domain}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-sm text-gray-600">{site.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Category:</span> {site.category}
                      </div>
                      <div>
                        <span className="font-medium">Purpose:</span> {site.purpose === "sales" ? "Guest Post" : "Exchange"}
                      </div>
                      <div>
                        <span className="font-medium">Link Type:</span> {site.linkType === "dofollow" ? "Do Follow" : "No Follow"}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> 
                        <Badge className="ml-2 bg-amber-100 text-amber-800">
                          {site.status}
                        </Badge>
                      </div>
                      {site.purpose === "sales" && (
                        <>
                          <div>
                            <span className="font-medium">Price:</span> {formatCurrency(site.price ? site.price : 0)}
                          </div>
                          <div>
                            <span className="font-medium">Delivery Time:</span> {site.deliveryTime || "N/A"} days
                          </div>
                        </>
                      )}
                      {site.casinoAllowed && site.casinoAllowed !== 'N/A' && (
                        <div>
                          <span className="font-medium">Casino:</span>
                          <Badge className={`ml-2 ${
                            site.casinoAllowed === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {site.casinoAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
                          </Badge>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Domain Authority:</span> {site.domainAuthority}
                      </div>
                      <div>
                        <span className="font-medium">DR Score:</span> {site.drScore}
                      </div>
                      <div>
                        <span className="font-medium">Monthly Traffic:</span> {site.monthlyTraffic?.toLocaleString() || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Language:</span> {site.language}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Submitted: {new Date(site.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {site.status === "rejected" && (
              <div className="w-full text-center py-2 text-sm text-gray-500">
                Contact support for resubmission
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
