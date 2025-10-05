import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign } from "lucide-react";
import { ListingData } from "../../types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { UserAvatar } from "@/components/ui/user-avatar";

interface MarketplaceListingCardProps {
  listing: ListingData & {
    totalSellers?: number;
    allListings?: ListingData[];
    firstUser?: any;
    highestOrderUser?: any;
    highestOrderListing?: any;
  };
  currentUserId: string;
  purchaseCount?: number;
}

export default function MarketplaceListingCard({ listing, currentUserId, purchaseCount = 0 }: MarketplaceListingCardProps) {
  const { toast } = useToast();
  
  // Format traffic numbers to K/M format
  const formatTraffic = (traffic: number): string => {
    if (traffic >= 1000000) {
      return (traffic / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (traffic >= 1000) {
      return (traffic / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return traffic.toString();
  };
  const queryClient = useQueryClient();
  const [showSellerDialog, setShowSellerDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [googleDocLink, setGoogleDocLink] = useState("");
  const [targetLink, setTargetLink] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);

  // Get wallet balance
  const { data: walletData } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!currentUserId,
  });

  // Get platform fee settings
  const { data: settings } = useQuery<{platformFee: string, platformFeeType: string}>({
    queryKey: ["/api/settings/public"],
  });

  const platformFeeAmount = settings ? parseFloat(settings.platformFee) : 5;
  const platformFeeType = settings?.platformFeeType || 'percentage';

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("/api/orders", {
        method: "POST",
        body: orderData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      setShowPurchaseDialog(false);
      setShowSellerDialog(false);
      setGoogleDocLink("");
      setTargetLink("");
      setAdditionalRequirements("");
      setSelectedSeller(null);
      toast({
        title: "Order placed!",
        description: "Your order has been sent to the seller's Sales Inbox for review.",
      });
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "Unable to place order. Please check your wallet balance.",
        variant: "destructive",
      });
    },
  });

  const handlePriceButtonClick = () => {
    if (isOwnListing) return;
    
    // Get the actual price to pay (either lowest price from multiple sellers or single seller price)
    const actualPrice = listing.totalSellers && listing.totalSellers > 1 && listing.allListings
      ? Math.min(...listing.allListings.map((l: any) => l.price)) 
      : listing.price;
    
    const hasBalance = walletData && (walletData as any).balance >= actualPrice;
    if (!hasBalance) {
      toast({
        title: "Insufficient balance",
        description: `You need at least ${formatCurrency(actualPrice)} to place this order. Please add funds to your wallet.`,
        variant: "destructive",
      });
      return;
    }
    
    // If multiple sellers, show seller selection first
    if (listing.totalSellers && listing.totalSellers > 1) {
      // Pre-select the seller with highest orders
      if (listing.highestOrderListing) {
        setSelectedSeller(listing.highestOrderListing.id);
      }
      setShowSellerDialog(true);
    } else {
      // Single seller, go directly to purchase
      setSelectedSeller(listing.id);
      setShowPurchaseDialog(true);
    }
  };

  const handleSellerSelected = (sellerId: string) => {
    setSelectedSeller(sellerId);
    setShowSellerDialog(false);
    setShowPurchaseDialog(true);
  };

  const handlePurchase = () => {
    if (!googleDocLink.trim()) {
      toast({
        title: "Google Doc URL required",
        description: "Please provide a link to your guest post content.",
        variant: "destructive",
      });
      return;
    }

    if (!targetLink.trim()) {
      toast({
        title: "Target link required", 
        description: "Please provide the URL you want linked in the guest post.",
        variant: "destructive",
      });
      return;
    }

    // If there are multiple sellers, user must select one
    if (listing.totalSellers && listing.totalSellers > 1 && !selectedSeller) {
      toast({
        title: "Please select a seller",
        description: "Choose which seller you want to purchase from.",
        variant: "destructive",
      });
      return;
    }

    // Get the actual price to pay based on selected seller or single listing
    const actualPrice = selectedSeller 
      ? listing.allListings?.find((l: any) => l.id === selectedSeller)?.price || listing.price
      : listing.price;

    const hasBalance = walletData && (walletData as any).balance >= actualPrice;
    if (!hasBalance) {
      toast({
        title: "Insufficient balance",
        description: `You need at least ${formatCurrency(actualPrice)} to place this order. Please add funds to your wallet.`,
        variant: "destructive",
      });
      return;
    }

    // Use selected seller's listing ID, or default listing ID if only one seller
    const finalListingId = selectedSeller || listing.id;

    createOrderMutation.mutate({
      listingId: finalListingId,
      googleDocLink: googleDocLink.trim(),
      targetLink: targetLink.trim(),
      requirements: additionalRequirements.trim() || undefined,
    });
  };

  const buyerPrice = listing.price;
  const platformFee = platformFeeType === 'percentage' 
    ? listing.price * (platformFeeAmount / 100)
    : platformFeeAmount;
  const sellerReceives = listing.price - platformFee;
  const isOwnListing = listing.userId === currentUserId;

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-3 sm:p-4">
        {/* Mobile and Tablet layout (stacked) */}
        <div className="block lg:hidden space-y-3">
          {/* Top row: user info and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="relative">
                <UserAvatar 
                  user={listing.firstUser || listing.site?.user} 
                  size="lg"
                  className="bg-gray-200"
                />
                {listing.totalSellers && listing.totalSellers > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    +{listing.totalSellers - 1}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{listing.site?.domain}</p>
                {listing.totalSellers && listing.totalSellers > 1 ? (
                  <p className="text-xs text-gray-500">
                    {listing.totalSellers} sellers available
                  </p>
                ) : listing.site?.user && (
                  <p className="text-xs text-gray-500">
                    {listing.site.user.firstName} {listing.site.user.lastName}
                  </p>
                )}
              </div>
            </div>
            {/* Mobile price display only */}
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">{formatCurrency(buyerPrice)}</p>
            </div>
          </div>

          {/* Dialog containers for mobile actions */}
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-lg lg:max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="text-lg sm:text-xl">{listing.site?.domain}</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Complete listing details for this guest post opportunity.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Site Summary */}
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {listing.site?.domain?.charAt(0).toUpperCase() || 'S'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {listing.site?.domain}
                    </h4>
                    <div className="flex items-center space-x-4 mt-1">
                      {listing.totalSellers && listing.totalSellers > 1 ? (
                        <span className="text-sm text-blue-600 font-medium">
                          {listing.totalSellers} sellers available
                        </span>
                      ) : (
                        <span className="text-sm text-blue-600 font-medium">
                          1 seller available
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        From {formatCurrency(listing.price)}
                      </span>
                      {(listing.turnaroundTime || listing.site?.deliveryTime) && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {listing.turnaroundTime || listing.site?.deliveryTime} days
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Website Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <img src="/assets/google-analytics-icon.svg" alt="Traffic" className="w-4 h-4" />
                      <span className="text-base sm:text-lg font-bold text-gray-900">{formatTraffic(listing.site?.monthlyTraffic || 1000)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Monthly Traffic</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <img src="/assets/Ahrefs-icon.jpeg" alt="DR" className="w-4 h-4" />
                      <span className="text-base sm:text-lg font-bold text-gray-900">{listing.site?.drScore || 50}</span>
                    </div>
                    <p className="text-xs text-gray-500">Domain Rating</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3 col-span-2 sm:col-span-1">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900">{listing.site?.domainAuthority || 50}</span>
                    </div>
                    <p className="text-xs text-gray-500">Domain Authority</p>
                  </div>
                </div>

                {/* Website Details */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">Website URL:</span>
                    <a 
                      href={`https://${listing.site?.domain}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {listing.site?.domain}
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">Category:</span>
                    <span className="text-sm">{listing.site?.category}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">Language:</span>
                    <span className="text-sm">{listing.site?.language}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">Link Type:</span>
                    <div className="flex gap-2 flex-wrap">
                      <div className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        listing.site?.linkType === 'dofollow' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {listing.site?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="font-medium text-sm sm:text-base">Starting Price:</span>
                    <span className="font-bold text-green-600 text-lg">From {formatCurrency(listing.price)}</span>
                  </div>
                  {(listing.turnaroundTime || listing.site?.deliveryTime) && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-medium text-sm sm:text-base">Fastest Delivery:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{listing.turnaroundTime || listing.site?.deliveryTime} days</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {listing.site?.description && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Site Description:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{listing.site.description}</p>
                    {/* Casino Badge below description in dialog */}
                    {listing.site?.casinoAllowed && listing.site.casinoAllowed !== 'N/A' && (
                      <div className="mt-3 flex justify-start">
                        <div className={`px-3 py-1 rounded text-sm font-medium ${
                          listing.site.casinoAllowed === 'yes' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          Casino: {listing.site.casinoAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="text-sm">
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Seller Selection Dialog - Step 1 */}
          <Dialog open={showSellerDialog} onOpenChange={setShowSellerDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Choose Your Seller</DialogTitle>
                <DialogDescription>
                  Select which seller you want to purchase from for {listing.site?.domain}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[60vh] pr-2">
                <div className="grid grid-cols-1 gap-4">
                  {listing.allListings && listing.allListings
                    .sort((a: any, b: any) => (b.site?.purchaseCount || 0) - (a.site?.purchaseCount || 0)) // Sort by highest order count first
                    .map((sellerListing: any) => {
                      const canAfford = walletData && (walletData as any).balance >= sellerListing.price;
                      return (
                    <div
                      key={sellerListing.id}
                      onClick={() => canAfford ? handleSellerSelected(sellerListing.id) : null}
                      className={`p-4 border rounded-lg transition-all ${
                        canAfford 
                          ? 'cursor-pointer hover:shadow-md hover:border-gray-300 bg-white' 
                          : 'cursor-not-allowed bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header with avatar and name */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <UserAvatar 
                              user={sellerListing.site?.user} 
                              size="lg"
                              className="bg-gray-200"
                            />
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {sellerListing.site?.user ? 
                                  `${sellerListing.site.user.firstName} ${sellerListing.site.user.lastName}` : 
                                  'Anonymous Seller'
                                }
                              </p>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-2xl font-bold text-green-600">
                                  {formatCurrency(sellerListing.price)}
                                </span>
                                {(sellerListing.turnaroundTime || sellerListing.site?.deliveryTime) && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <Clock className="h-4 w-4" />
                                    <span>{sellerListing.turnaroundTime || sellerListing.site?.deliveryTime} days delivery</span>
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {(() => {
                                    const orderCount = sellerListing.site?.purchaseCount || 0;
                                    return `${orderCount} orders`;
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={`font-medium ${canAfford ? 'text-blue-600' : 'text-gray-400'}`}>
                            {canAfford ? `Select - Buy ${formatCurrency(sellerListing.price)}` : 'Insufficient Balance'}
                          </div>
                        </div>

                        {/* Badges and details */}
                        <div className="flex flex-wrap gap-2">
                          {sellerListing.site?.linkType && (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              sellerListing.site.linkType === 'dofollow' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {sellerListing.site.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
                            </div>
                          )}
                          
                          {sellerListing.site?.casinoAllowed && sellerListing.site.casinoAllowed !== 'N/A' && (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              sellerListing.site.casinoAllowed === 'yes' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              Casino: {sellerListing.site.casinoAllowed === 'yes' ? 'Accepted' : 'Not Accepted'}
                            </div>
                          )}

                          {sellerListing.site?.category && (
                            <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                              {sellerListing.site.category}
                            </div>
                          )}
                        </div>

                        {/* Bio - if available */}
                        {sellerListing.site?.user?.bio && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 italic">
                              "{sellerListing.site.user.bio}"
                            </p>
                          </div>
                        )}

                        {/* Language section */}
                        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            {sellerListing.site?.language || 'English'}
                          </span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSellerDialog(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Purchase Dialog - Step 2 */}
          <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Complete Your Order</DialogTitle>
                <DialogDescription>
                  {(() => {
                    const sellerListing = selectedSeller 
                      ? listing.allListings?.find((l: any) => l.id === selectedSeller)
                      : listing;
                    const sellerName = sellerListing?.site?.user 
                      ? `${sellerListing.site.user.firstName} ${sellerListing.site.user.lastName}`
                      : 'the seller';
                    const price = sellerListing?.price || listing.price;
                    return `Ordering from ${sellerName} for ${formatCurrency(price)} on ${listing.site?.domain}`;
                  })()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Selected Seller Info */}
                {selectedSeller && (() => {
                  const sellerListing = listing.allListings?.find((l: any) => l.id === selectedSeller) || listing;
                  const sellerUser = sellerListing.site?.user;
                  return (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <UserAvatar 
                          user={sellerUser} 
                          size="md"
                          className="bg-gray-200"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {sellerUser ? `${sellerUser.firstName} ${sellerUser.lastName}` : 'Anonymous Seller'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="font-bold text-green-600">
                              {formatCurrency(sellerListing.price)}
                            </span>
                            {(sellerListing.turnaroundTime || sellerListing.site?.deliveryTime) && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{sellerListing.turnaroundTime || sellerListing.site?.deliveryTime} days</span>
                              </div>
                            )}
                            {sellerListing.site?.casinoAllowed && sellerListing.site.casinoAllowed !== 'N/A' && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                sellerListing.site.casinoAllowed === 'yes' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                Casino: {sellerListing.site.casinoAllowed === 'yes' ? 'OK' : 'No'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <Label htmlFor="googleDoc">Google Doc Link *</Label>
                  <Input
                    id="googleDoc"
                    value={googleDocLink}
                    onChange={(e) => setGoogleDocLink(e.target.value)}
                    placeholder="https://docs.google.com/document/..."
                  />
                </div>
                <div>
                  <Label htmlFor="targetLink">Target Link *</Label>
                  <Input
                    id="targetLink" 
                    value={targetLink}
                    onChange={(e) => setTargetLink(e.target.value)}
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    placeholder="Any specific requests..."
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => {
                    setShowPurchaseDialog(false);
                    setSelectedSeller(null);
                    setGoogleDocLink("");
                    setTargetLink("");
                    setAdditionalRequirements("");
                  }}>
                    Back
                  </Button>
                  <Button
                    onClick={handlePurchase}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Processing..." : (() => {
                      const displayPrice = selectedSeller 
                        ? listing.allListings?.find((l: any) => l.id === selectedSeller)?.price || listing.price
                        : listing.price;
                      return `Buy for ${formatCurrency(displayPrice)}`;
                    })()}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Stats grid for mobile */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <img src="/assets/google-analytics-icon.svg" alt="Traffic" className="w-3 h-3" />
                <span className="text-sm font-bold text-gray-900">{formatTraffic(listing.site?.monthlyTraffic || 1000)}</span>
              </div>
              <p className="text-xs text-gray-500">Traffic</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <img src="/assets/Ahrefs-icon.jpeg" alt="DR" className="w-3 h-3" />
                <span className="text-sm font-bold text-gray-900">{listing.site?.drScore || 50}</span>
              </div>
              <p className="text-xs text-gray-500">DR</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{listing.site?.domainAuthority || 50}</span>
              </div>
              <p className="text-xs text-gray-500">DA</p>
            </div>
          </div>
          
          {/* Bottom row: badges and info - matching Exchange horizontal style */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 flex-wrap">
              {listing.site?.category && (
                <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                  {listing.site.category}
                </div>
              )}
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                listing.site?.linkType === 'dofollow' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {listing.site?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Lang: {listing.site?.language}</p>
              {(listing.turnaroundTime || listing.site?.deliveryTime) && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{listing.turnaroundTime || listing.site?.deliveryTime} days</span>
                </div>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {(() => {
                  // Calculate total orders from all sellers for this domain
                  const totalOrders = listing.allListings 
                    ? listing.allListings.reduce((sum, sellerListing) => {
                        return sum + (sellerListing.site?.purchaseCount || 0);
                      }, 0)
                    : (listing.site?.purchaseCount || 0);
                  return `${totalOrders} orders`;
                })()}
              </p>
            </div>
          </div>

          {/* Action buttons for mobile - matching Exchange style */}
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  Details
                </Button>
              </DialogTrigger>
            </Dialog>
            {!isOwnListing && (
              <Button
                size="sm"
                className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white"
                onClick={handlePriceButtonClick}
              >
                Buy {formatCurrency(buyerPrice)}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop layout (compact vertical) - hidden on mobile and small tablets */}
        <div className="hidden lg:block max-w-md mx-auto">
          {/* Header section with user info, domain, and language/delivery */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="relative">
                <UserAvatar 
                  user={listing.highestOrderUser || listing.firstUser || listing.site?.user} 
                  size="md"
                  className="bg-gray-200"
                />
                {listing.totalSellers && listing.totalSellers > 1 && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    +{listing.totalSellers - 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{listing.site?.domain}</p>
                {listing.totalSellers && listing.totalSellers > 1 ? (
                  <p className="text-xs text-gray-500">
                    {listing.totalSellers} sellers available
                  </p>
                ) : listing.site?.user && (
                  <p className="text-xs text-gray-500">
                    {listing.site.user.firstName} {listing.site.user.lastName}
                  </p>
                )}
              </div>
            </div>
            
            {/* Language and delivery in top right */}
            <div className="text-right text-xs text-gray-600 ml-2">
              <p>{listing.site?.language}</p>
              {(listing.turnaroundTime || listing.site?.deliveryTime) && (
                <div className="flex items-center gap-1 justify-end mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{listing.turnaroundTime || listing.site?.deliveryTime} days</span>
                </div>
              )}
              <p className="text-gray-500 mt-1">{purchaseCount} orders</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center space-x-1 mb-3 flex-wrap">
            {listing.site?.category && (
              <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                {listing.site.category}
              </div>
            )}
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              listing.site?.linkType === 'dofollow' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {listing.site?.linkType === 'dofollow' ? 'Do Follow' : 'No Follow'}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 text-center mb-3">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1 mb-1">
                <img src="/assets/google-analytics-icon.svg" alt="Traffic" className="w-4 h-4" />
                <span className="text-lg font-bold text-gray-900">{formatTraffic(listing.site?.monthlyTraffic || 1000)}</span>
              </div>
              <p className="text-xs text-gray-500">Traffic/mo</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1 mb-1">
                <img src="/assets/Ahrefs-icon.jpeg" alt="DR" className="w-4 h-4" />
                <span className="text-lg font-bold text-gray-900">{listing.site?.drScore || 50}</span>
              </div>
              <p className="text-xs text-gray-500">DR</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{listing.site?.domainAuthority || 50}</span>
              </div>
              <p className="text-xs text-gray-500">DA</p>
            </div>
          </div>



          {/* Site Description */}
          {listing.site?.description && (
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>{listing.site.description}</p>
            </div>
          )}

          {/* Casino Badge below description - left aligned */}
          {listing.site?.casinoAllowed && listing.site.casinoAllowed !== 'N/A' && (
            <div className="mb-3 flex justify-start">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                listing.site.casinoAllowed === 'yes' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                Casino: {listing.site.casinoAllowed === 'yes' ? 'Allowed' : 'Not Allowed'}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setShowDetailsDialog(true)}>
              View Details
            </Button>

            <Button size="sm" disabled={isOwnListing} className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 flex-shrink-0" onClick={handlePriceButtonClick}>
              {isOwnListing ? "Your Listing" : formatCurrency(buyerPrice)}
            </Button>

            <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
              <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>Purchase Guest Post</DialogTitle>
                  <DialogDescription>
                    Complete your order for a guest post on {listing.site?.domain}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="googleDoc">Google Doc Link to Your Content *</Label>
                    <Input
                      id="googleDoc"
                      placeholder="https://docs.google.com/document/d/..."
                      value={googleDocLink}
                      onChange={(e) => setGoogleDocLink(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Share a Google Doc with your guest post content (must have view/comment access)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="targetLink">Target Link for Guest Post *</Label>
                    <Input
                      id="targetLink"
                      placeholder="https://your-website.com/target-page"
                      value={targetLink}
                      onChange={(e) => setTargetLink(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The URL you want linked in your guest post
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="requirements">Additional Requirements (Optional)</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Any specific instructions for the guest post placement..."
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    {(() => {
                      const actualPrice = selectedSeller 
                        ? listing.allListings?.find((l: any) => l.id === selectedSeller)?.price || listing.price
                        : listing.price;
                      return (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <span>Guest Post Price:</span>
                            <span className="font-bold">{formatCurrency(actualPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span className="text-green-600">{formatCurrency(actualPrice)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handlePurchase}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Processing..." : "Complete Order"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}