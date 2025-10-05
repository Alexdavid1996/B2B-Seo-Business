import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";
import { SiteWithUser, ListingData } from "../../types";
import MarketplaceListingCard from "../marketplace/marketplace-listing-card";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DirectoryResultsProps {
  sites: SiteWithUser[];
  userSites: SiteWithUser[];
  mode: "exchange" | "marketplace";
  filters?: {
    search: string;
    category: string;
    domainAuthority: string;
    traffic: string;
  };
  sortType?: "bestSales" | "highTraffic" | null;
}

export default function DirectoryResults({
  sites,
  userSites,
  mode,
  filters,
  sortType,
}: DirectoryResultsProps) {
  const { user } = useAuth();

  // Format traffic numbers to K/M format
  const formatTraffic = (traffic: number): string => {
    if (traffic >= 1000000) {
      return (traffic / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (traffic >= 1000) {
      return (traffic / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return traffic.toString();
  };

  // Get marketplace listings for marketplace mode
  const { data: marketplaceListings = [], isLoading: listingsLoading } =
    useQuery<ListingData[]>({
      queryKey: ["/api/listings/marketplace"],
      enabled: mode === "marketplace",
    });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSite, setSelectedSite] = useState<SiteWithUser | null>(null);
  const [selectedUserSite, setSelectedUserSite] = useState("");
  const [message, setMessage] = useState("");
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Hardcoded marketplace items per page
  const marketplaceItemsPerPage = 12;

  const itemsPerPage = marketplaceItemsPerPage;

  // Reset page when mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [mode]);

  const exchangeMutation = useMutation({
    mutationFn: async (data: {
      requesterId: string;
      requestedUserId: string;
      requesterSiteId: string;
      requestedSiteId: string;
      message: string;
    }) => {
      const response = await apiRequest("/api/exchanges", {
        method: "POST",
        body: data,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/exchanges/user", user?.id],
      });
      toast({
        title: "Exchange request sent!",
        description: "Your exchange request has been sent to the site owner.",
      });
      setSelectedSite(null);
      setMessage("");
      setSelectedUserSite("");
    },
    onError: () => {
      toast({
        title: "Failed to send request",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleRequestExchange = () => {
    if (!selectedSite || !selectedUserSite || !user) return;

    exchangeMutation.mutate({
      requesterId: user.id,
      requestedUserId: selectedSite.userId,
      requesterSiteId: selectedUserSite,
      requestedSiteId: selectedSite.id,
      message,
    });
  };

  const getInitials = (domain: string) => {
    return domain.split(".")[0].substring(0, 2).toUpperCase();
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-indigo-500 to-blue-600",
      "from-emerald-500 to-teal-600",
      "from-rose-500 to-pink-600",
      "from-purple-500 to-indigo-600",
      "from-orange-500 to-red-600",
      "from-cyan-500 to-blue-600",
    ];
    return gradients[index % gradients.length];
  };

  // Apply filters to sites
  const getFilteredSites = () => {
    if (!filters)
      return sites.filter(
        (site) =>
          site.userId !== user?.id &&
          (mode === "exchange" ? site.purpose === "exchange" : true),
      );

    return sites.filter((site) => {
      // Exclude user's own sites
      if (site.userId === user?.id) return false;

      // Mode filtering
      if (mode === "exchange" && site.purpose !== "exchange") return false;

      // Search filter
      if (
        filters.search &&
        !site.domain.toLowerCase().includes(filters.search.toLowerCase()) &&
        !site.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !site.category.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (
        filters.category &&
        filters.category !== "all" &&
        site.category !== filters.category
      ) {
        return false;
      }

      // Domain Authority filter - only filter for old values, not sorting values (using DR Score)
      if (filters.domainAuthority !== "any" && 
          !["high-to-low", "low-to-high"].includes(filters.domainAuthority)) {
        // For old compatibility, keep high/medium/low filters using DR Score
        if (filters.domainAuthority === "high" && site.drScore < 60)
          return false;
        if (
          filters.domainAuthority === "medium" &&
          (site.drScore < 30 || site.drScore >= 60)
        )
          return false;
        if (filters.domainAuthority === "low" && site.drScore >= 30)
          return false;
      }

      // Traffic filter - only filter for old values, not sorting values
      if (filters.traffic !== "any" && 
          !["high-to-low", "low-to-high"].includes(filters.traffic)) {
        // For old compatibility, keep high/medium/low filters
        if (filters.traffic === "high" && site.monthlyTraffic < 100000)
          return false;
        if (
          filters.traffic === "medium" &&
          (site.monthlyTraffic < 10000 || site.monthlyTraffic >= 100000)
        )
          return false;
        if (filters.traffic === "low" && site.monthlyTraffic >= 10000)
          return false;
      }

      return true;
    });
  };

  // Apply sorting based on filters and sortType
  const getSortedSites = () => {
    let sites = getFilteredSites();
    
    // Debug logging
    console.log("Sorting filters:", filters);
    console.log("Sort type:", sortType);
    
    // Handle sort buttons first (Best Sales and High Traffic)
    if (sortType === "bestSales") {
      // Sort by purchase_count (order count) descending
      console.log("Sorting by best sales");
      return sites.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
    } else if (sortType === "highTraffic") {
      // Sort by monthly traffic descending
      console.log("Sorting by high traffic");
      return sites.sort((a, b) => b.monthlyTraffic - a.monthlyTraffic);
    }
    
    // Handle dropdown sorting options - prioritize traffic over domain authority
    if (filters?.traffic === "high-to-low") {
      console.log("Sorting by traffic high to low");
      return sites.sort((a, b) => b.monthlyTraffic - a.monthlyTraffic);
    } else if (filters?.traffic === "low-to-high") {
      console.log("Sorting by traffic low to high");
      console.log("Traffic values:", sites.map(s => ({domain: s.domain, traffic: s.monthlyTraffic})));
      const sorted = sites.sort((a, b) => a.monthlyTraffic - b.monthlyTraffic);
      console.log("After sorting:", sorted.map(s => ({domain: s.domain, traffic: s.monthlyTraffic})));
      return sorted;
    } else if (filters?.domainAuthority === "high-to-low") {
      console.log("Sorting by DR high to low");
      return sites.sort((a, b) => b.drScore - a.drScore);
    } else if (filters?.domainAuthority === "low-to-high") {
      console.log("Sorting by DR low to high");
      return sites.sort((a, b) => a.drScore - b.drScore);
    }
    
    // Default sorting by traffic (high to low)
    console.log("Using default sorting");
    return sites.sort((a, b) => b.monthlyTraffic - a.monthlyTraffic);
  };

  const filteredSites = getSortedSites();
  // Filter approved user sites with exchange capability and remove duplicates by domain
  const approvedUserSites = userSites.filter(
    (site) => site.status === "approved" && (site.purpose === "exchange" || site.purpose === "both")
  ).reduce((unique: SiteWithUser[], site) => {
    // Check if this domain already exists in the unique array
    const exists = unique.some(existingSite => existingSite.domain === site.domain);
    if (!exists) {
      unique.push(site);
    }
    return unique;
  }, []);

  // Pagination logic
  const getPaginatedItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: any[]) =>
    Math.ceil(items.length / itemsPerPage);

  const PaginationControls = ({ items }: { items: any[] }) => {
    const totalPages = getTotalPages(items);

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs sm:text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    );
  };

  // Show marketplace listings for marketplace mode
  if (mode === "marketplace") {
    if (listingsLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse"
            />
          ))}
        </div>
      );
    }

    // Apply filters to marketplace listings
    const getFilteredListings = () => {
      if (!filters) return marketplaceListings;

      return marketplaceListings.filter((listing) => {
        // Ensure listing has site data
        if (!listing.site) return false;

        // Search filter
        if (
          filters.search &&
          !listing.site.domain
            .toLowerCase()
            .includes(filters.search.toLowerCase()) &&
          !listing.site.title
            .toLowerCase()
            .includes(filters.search.toLowerCase()) &&
          !listing.site.category
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        // Category filter
        if (
          filters.category &&
          filters.category !== "all" &&
          listing.site.category !== filters.category
        ) {
          return false;
        }

        // Domain Authority filter (using DR Score)
        if (filters.domainAuthority !== "any") {
          if (
            filters.domainAuthority === "high" &&
            listing.site.drScore < 60
          )
            return false;
          if (
            filters.domainAuthority === "medium" &&
            (listing.site.drScore < 30 ||
              listing.site.drScore >= 60)
          )
            return false;
          if (
            filters.domainAuthority === "low" &&
            listing.site.drScore >= 30
          )
            return false;
        }

        // Traffic filter
        if (filters.traffic !== "any") {
          if (
            filters.traffic === "high" &&
            listing.site.monthlyTraffic < 100000
          )
            return false;
          if (
            filters.traffic === "medium" &&
            (listing.site.monthlyTraffic < 10000 ||
              listing.site.monthlyTraffic >= 100000)
          )
            return false;
          if (filters.traffic === "low" && listing.site.monthlyTraffic >= 10000)
            return false;
        }

        return true;
      });
    };

    const getSortedMarketplaceListings = () => {
      let listings = getFilteredListings();
      
      // Handle sort buttons first (Best Sales and High Traffic)
      if (sortType === "bestSales") {
        return listings.sort((a, b) => (b.site?.purchaseCount || 0) - (a.site?.purchaseCount || 0));
      } else if (sortType === "highTraffic") {
        return listings.sort((a, b) => (b.site?.monthlyTraffic || 0) - (a.site?.monthlyTraffic || 0));
      }
      
      // Handle dropdown sorting options - prioritize traffic over domain authority
      if (filters?.traffic === "high-to-low") {
        return listings.sort((a, b) => (b.site?.monthlyTraffic || 0) - (a.site?.monthlyTraffic || 0));
      } else if (filters?.traffic === "low-to-high") {
        console.log("Marketplace: Sorting by traffic low to high");
        return listings.sort((a, b) => (a.site?.monthlyTraffic || 0) - (b.site?.monthlyTraffic || 0));
      } else if (filters?.domainAuthority === "high-to-low") {
        return listings.sort((a, b) => (b.site?.drScore || 0) - (a.site?.drScore || 0));
      } else if (filters?.domainAuthority === "low-to-high") {
        return listings.sort((a, b) => (a.site?.drScore || 0) - (b.site?.drScore || 0));
      }
      
      // Default sorting by traffic (high to low)
      return listings.sort((a, b) => (b.site?.monthlyTraffic || 0) - (a.site?.monthlyTraffic || 0));
    };

    const filteredListings = getSortedMarketplaceListings();

    if (marketplaceListings.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No marketplace listings found
          </h3>
          <p className="text-gray-600">
            No guest post or link placement listings are currently available.
          </p>
        </div>
      );
    }

    if (filteredListings.length === 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results match your filters
          </h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or clearing some filters to see
            more listings.
          </p>
        </div>
      );
    }

    // Sort listings to prioritize guest posts first, then link placements
    const sortedListings = [...filteredListings].sort((a, b) => {
      if (a.type === "guest_post" && b.type === "link_placement") return -1;
      if (a.type === "link_placement" && b.type === "guest_post") return 1;
      return 0;
    });

    // Group listings by domain and select the best representative for each domain
    const groupedListings = sortedListings.reduce((groups, listing) => {
      const domain = listing.site?.domain;
      if (!domain) return groups;

      if (!groups[domain]) {
        // First listing for this domain - use as the base
        groups[domain] = {
          representativeListing: listing,
          allListings: [listing],
          lowestPrice: listing.price || 0,
          fastestDelivery: listing.site?.deliveryTime || listing.turnaroundTime || 999,
          totalSellers: 1,
          firstUser: listing.site?.user,
          highestOrderUser: listing.site?.user,
          highestOrderCount: listing.site?.purchaseCount || 0,
          highestOrderListing: listing
        };
      } else {
        // Add to existing domain group
        groups[domain].allListings.push(listing);
        groups[domain].totalSellers++;
        
        // Update lowest price if this listing has a lower price
        if (listing.price && listing.price < groups[domain].lowestPrice) {
          groups[domain].lowestPrice = listing.price;
        }
        
        // Update fastest delivery time
        const currentDelivery = listing.site?.deliveryTime || listing.turnaroundTime || 999;
        if (currentDelivery < groups[domain].fastestDelivery) {
          groups[domain].fastestDelivery = currentDelivery;
        }

        // Update highest order count seller
        const currentOrderCount = listing.site?.purchaseCount || 0;
        if (currentOrderCount > groups[domain].highestOrderCount) {
          groups[domain].highestOrderCount = currentOrderCount;
          groups[domain].highestOrderUser = listing.site?.user;
          groups[domain].highestOrderListing = listing;
        }
      }
      
      return groups;
    }, {} as Record<string, {
      representativeListing: any;
      allListings: any[];
      lowestPrice: number;
      fastestDelivery: number;
      totalSellers: number;
      firstUser: any;
      highestOrderUser: any;
      highestOrderCount: number;
      highestOrderListing: any;
    }>);

    // Convert grouped data back to listing format for display
    const groupedListingsArray = Object.values(groupedListings).map(group => {
      // Find the first submitted site for this domain (oldest creation date)
      const firstSubmittedSite = group.allListings
        .map(listing => listing.site)
        .filter(site => site) // Remove null/undefined sites
        .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())[0];
      
      const grouped = {
        ...group.representativeListing,
        price: group.lowestPrice, // Use lowest price
        site: {
          ...group.representativeListing.site,
          // Always use the first submitted domain's data for consistency
          domain: firstSubmittedSite?.domain || group.representativeListing.site?.domain,
          monthlyTraffic: firstSubmittedSite?.monthlyTraffic || group.representativeListing.site?.monthlyTraffic,
          domainAuthority: firstSubmittedSite?.domainAuthority || group.representativeListing.site?.domainAuthority,
          drScore: firstSubmittedSite?.drScore || group.representativeListing.site?.drScore,
          category: firstSubmittedSite?.category || group.representativeListing.site?.category,
          language: firstSubmittedSite?.language || group.representativeListing.site?.language,
          linkType: firstSubmittedSite?.linkType || group.representativeListing.site?.linkType,
          casinoAllowed: firstSubmittedSite?.casinoAllowed || group.representativeListing.site?.casinoAllowed,
          description: firstSubmittedSite?.description || group.representativeListing.site?.description,
          deliveryTime: group.fastestDelivery === 999 ? group.representativeListing.site?.deliveryTime : group.fastestDelivery
        },
        turnaroundTime: group.fastestDelivery === 999 ? group.representativeListing.turnaroundTime : group.fastestDelivery,
        totalSellers: group.totalSellers,
        allListings: group.allListings, // Keep all listings for seller selection
        firstUser: group.firstUser,
        highestOrderUser: group.highestOrderUser,
        highestOrderListing: group.highestOrderListing
      };
      

      
      return grouped;
    });

    const paginatedListings = getPaginatedItems(groupedListingsArray);

    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {paginatedListings.map((listing) => {
            // Calculate total purchase count from ALL sellers for this domain
            const totalPurchaseCount = listing.allListings 
              ? listing.allListings.reduce((sum, sellerListing) => {
                  const correspondingSite = sites.find(site => site.id === sellerListing.siteId);
                  return sum + (correspondingSite?.purchaseCount || 0);
                }, 0)
              : (() => {
                  const correspondingSite = sites.find(site => site.id === listing.siteId);
                  return correspondingSite?.purchaseCount || 0;
                })();
            
            return (
              <MarketplaceListingCard
                key={listing.id}
                listing={listing}
                currentUserId={user?.id || ""}
                purchaseCount={totalPurchaseCount}
              />
            );
          })}
        </div>
        <PaginationControls items={filteredListings} />
      </div>
    );
  }

  const paginatedExchangeSites = getPaginatedItems(filteredSites);

  return (
    <>
      {/* Warning message for users without approved sites */}
      {approvedUserSites.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3 mb-3">
          <p className="text-amber-800">
            You must have one approved site before connecting with others.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
        {paginatedExchangeSites.map((site, index) => (
          <Card
            key={site.id}
            className="border border-gray-200 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-3 sm:p-4">
              {/* Mobile and Tablet Layout */}
              <div className="block lg:hidden space-y-3">
                {/* Top row: user info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {(site.user as any)?.avatar ? (
                      <img
                        src={(site.user as any).avatar}
                        alt={`${site.user.firstName} ${site.user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {site.user?.firstName?.charAt(0) || "U"}
                          {site.user?.lastName?.charAt(0) || ""}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {site.domain}
                    </p>
                    {site.user && (
                      <p className="text-xs text-gray-500">
                        {site.user.firstName} {site.user.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats row for mobile - 3-column grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <img
                        src="/assets/google-analytics-icon.svg"
                        alt="Traffic"
                        className="w-3 h-3"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {formatTraffic(site.monthlyTraffic || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Traffic</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <img
                        src="/assets/Ahrefs-icon.jpeg"
                        alt="DR"
                        className="w-3 h-3"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {site.drScore || 50}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">DR</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <div className="w-3 h-3 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {site.domainAuthority || 50}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">DA</p>
                  </div>
                </div>

                {/* Link type and language for mobile */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        site.linkType === "dofollow"
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {site.linkType === "dofollow" ? "Do Follow" : "No Follow"}
                    </div>
                    {site.category && (
                      <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                        {site.category}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Lang: {site.language}</p>
                  </div>
                </div>

                {/* Actions for mobile */}
                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewDetailsId(site.id)}
                    className="flex-1 text-xs"
                  >
                    View Details
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setSelectedSite(site)}
                        className="flex-shrink-0 text-xs"
                      >
                        <ArrowLeftRight className="h-3 w-3 mr-1" />
                        Request Exchange
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
                      <DialogHeader>
                        <DialogTitle>
                          Request Exchange with {site.domain}
                        </DialogTitle>
                        <DialogDescription>
                          Send an exchange request to collaborate on link
                          building.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="userSite">Select Your Site</Label>
                          <Select
                            value={selectedUserSite}
                            onValueChange={setSelectedUserSite}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose your site" />
                            </SelectTrigger>
                            <SelectContent>
                              {approvedUserSites.map((userSite) => (
                                <SelectItem
                                  key={userSite.id}
                                  value={userSite.id}
                                >
                                  {userSite.domain}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            placeholder="Introduce yourself and explain your collaboration idea..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={handleRequestExchange}
                            disabled={
                              !selectedUserSite ||
                              approvedUserSites.length === 0 ||
                              exchangeMutation.isPending
                            }
                            className="w-full"
                          >
                            {exchangeMutation.isPending
                              ? "Sending..."
                              : "Send Request"}
                          </Button>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Desktop Layout (compact vertical) - hidden on mobile and small tablets */}
              <div className="hidden lg:block max-w-md mx-auto">
                {/* Header section with user info, domain, and language */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {(site.user as any)?.avatar ? (
                        <img
                          src={(site.user as any).avatar}
                          alt={`${site.user.firstName} ${site.user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {site.user?.firstName?.charAt(0) || "U"}
                            {site.user?.lastName?.charAt(0) || ""}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {site.domain}
                      </p>
                      {site.user && (
                        <p className="text-xs text-gray-500">
                          {site.user.firstName} {site.user.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Language only in top right for Exchange */}
                  <div className="text-right text-xs text-gray-600 ml-2">
                    <p>{site.language}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center space-x-2 mb-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      site.linkType === "dofollow"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {site.linkType === "dofollow" ? "Do Follow" : "No Follow"}
                  </div>
                  {site.category && (
                    <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                      {site.category}
                    </div>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 text-center mb-3">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 mb-1">
                      <img
                        src="/assets/google-analytics-icon.svg"
                        alt="Traffic"
                        className="w-4 h-4"
                      />
                      <span className="text-lg font-bold text-gray-900">
                        {formatTraffic(site.monthlyTraffic || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Traffic/mo</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 mb-1">
                      <img
                        src="/assets/Ahrefs-icon.jpeg"
                        alt="DR"
                        className="w-4 h-4"
                      />
                      <span className="text-lg font-bold text-gray-900">
                        {site.drScore}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">DR</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-1 mb-1">
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {site.domainAuthority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">DA</p>
                  </div>
                </div>

                {/* Site Description */}
                {site.description && (
                  <div className="mb-3 p-2 bg-gray-50 rounded">
                    <p
                      className="text-xs text-gray-600 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {site.description}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex space-x-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewDetailsId(site.id)}
                    className="flex-1 text-xs"
                  >
                    View Details
                  </Button>

                  <Dialog
                    open={selectedSite?.id === site.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setSelectedSite(null);
                        setMessage("");
                        setSelectedUserSite("");
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setSelectedSite(site)}
                        disabled={approvedUserSites.length === 0}
                        className="flex-shrink-0 text-xs"
                      >
                        Request Exchange
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Request Exchange with {site.domain}
                        </DialogTitle>
                        <DialogDescription>
                          Send a link exchange request to {site.user?.firstName}{" "}
                          {site.user?.lastName} who owns {site.domain}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="userSite">Your Site</Label>
                          <Select
                            value={selectedUserSite}
                            onValueChange={setSelectedUserSite}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your site" />
                            </SelectTrigger>
                            <SelectContent>
                              {approvedUserSites.map((userSite) => (
                                <SelectItem
                                  key={userSite.id}
                                  value={userSite.id}
                                >
                                  {userSite.domain}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Introduce yourself and explain why you'd like to exchange links..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedSite(null);
                              setMessage("");
                              setSelectedUserSite("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleRequestExchange}
                            disabled={
                              !selectedUserSite ||
                              !message.trim() ||
                              exchangeMutation.isPending
                            }
                          >
                            {exchangeMutation.isPending
                              ? "Sending..."
                              : "Send Request"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaginationControls items={filteredSites} />

      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No sites found
          </h3>
          <p className="text-gray-600">Try adjusting your search filters.</p>
        </div>
      )}

      {/* View Details Dialog for Exchange */}
      <Dialog
        open={viewDetailsId !== null}
        onOpenChange={() => setViewDetailsId(null)}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-4">
          {viewDetailsId &&
            (() => {
              const site = sites.find((s) => s.id === viewDetailsId);
              if (!site) return null;

              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {site.domain}
                    </DialogTitle>
                    <DialogDescription>
                      Complete site information and statistics
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Site Owner */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                        {(site.user as any)?.avatar ? (
                          <img
                            src={(site.user as any).avatar}
                            alt={`${site.user?.firstName} ${site.user?.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold">
                              {site.user?.firstName?.charAt(0) || "U"}
                              {site.user?.lastName?.charAt(0) || ""}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {site.user?.firstName} {site.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Publisher</p>
                      </div>
                    </div>

                    {/* Site Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <img
                            src="/assets/google-analytics-icon.svg"
                            alt="Traffic"
                            className="w-5 h-5"
                          />
                          <span className="text-2xl font-bold text-gray-900">
                            {formatTraffic(site.monthlyTraffic || 0)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Monthly Traffic</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <img
                            src="/assets/Ahrefs-icon.jpeg"
                            alt="DR"
                            className="w-5 h-5"
                          />
                          <span className="text-2xl font-bold text-gray-900">
                            {site.drScore}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Domain Rating</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              M
                            </span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">
                            {site.domainAuthority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Domain Authority
                        </p>
                      </div>
                    </div>

                    {/* Site Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Category</h4>
                        <div className="px-3 py-2 bg-blue-500 text-white rounded text-sm inline-block">
                          {site.category || "Not specified"}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Link Type</h4>
                        <div
                          className={`px-3 py-2 rounded text-sm inline-block text-white ${
                            site.linkType === "dofollow"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        >
                          {site.linkType === "dofollow"
                            ? "Do Follow"
                            : "No Follow"}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Language</h4>
                        <p className="text-gray-700">{site.language}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Website</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(`https://${site.domain}`, "_blank")
                          }
                          className="flex items-center space-x-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Visit Site</span>
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    {site.description && (
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {site.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setViewDetailsId(null)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setViewDetailsId(null);
                        setSelectedSite(site);
                      }}
                      disabled={approvedUserSites.length === 0}
                    >
                      Request Exchange
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
