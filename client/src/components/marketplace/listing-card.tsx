import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Edit, Trash2, Clock, TrendingUp } from "lucide-react";
import { ListingData } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ListingCardProps {
  listing: ListingData;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleActiveMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      const response = await apiRequest(`/api/listings/${listing.id}`, {
        method: "PATCH",
        body: {
          isActive,
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      toast({
        title: listing.isActive ? "Listing deactivated" : "Listing activated",
        description: listing.isActive 
          ? "Your listing is no longer visible to buyers" 
          : "Your listing is now visible to buyers",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/listings/${listing.id}`, {
        method: "DELETE"
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      toast({
        title: "Listing deleted",
        description: "Your listing has been permanently removed.",
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    toggleActiveMutation.mutate(checked);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const price = listing.price; // Already in dollars
  const totalPrice = (listing.price + listing.serviceFee);

  return (
    <Card className={listing.isActive ? "border-green-200" : "border-gray-200"}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {listing.site?.domain}
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant={listing.type === 'guest_post' ? 'default' : 'secondary'}>
                {listing.type === 'guest_post' ? 'Guest Post' : 'Guest Post'}
              </Badge>
              <Badge variant={listing.isActive ? 'default' : 'secondary'}>
                {listing.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              ${price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Buyer pays: ${totalPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {listing.site && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              DA: {listing.site.domainAuthority}
            </div>
            <div>
              Traffic: {listing.site.monthlyTraffic.toLocaleString()}/mo
            </div>
            <div>
              Category: {listing.site.category}
            </div>
          </div>
        )}

        {listing.turnaroundTime && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Delivery: {listing.turnaroundTime} days</span>
          </div>
        )}

        {listing.requirements && (
          <div className="text-sm">
            <div className="font-medium text-gray-700 mb-1">Requirements:</div>
            <p className="text-gray-600 line-clamp-2">{listing.requirements}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={listing.isActive}
              onCheckedChange={handleToggle}
              disabled={toggleActiveMutation.isPending}
            />
            <span className="text-sm text-gray-600">
              {listing.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}