import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SiteWithUser, ListingData } from "../../types";

const listingSchema = z.object({
  siteId: z.string().min(1, "Please select a site"),
  type: z.enum(["guest_post", "link_placement"]),
  price: z.number().min(1, "Price must be at least $1").max(10000, "Price must be less than $10,000"),
  requirements: z.string().max(500, "Requirements must be 500 characters or less").refine(
    (req) => !req || !/[<>\"'&]/.test(req),
    "Requirements contain invalid characters"
  ).optional(),
  turnaroundTime: z.number().min(1, "Turnaround time must be at least 1 day").max(30, "Maximum 30 days"),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface SellListingFormProps {
  sites: SiteWithUser[];
  onSuccess?: () => void;
}

export default function SellListingForm({ sites, onSuccess }: SellListingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch platform fee setting
  const { data: settings } = useQuery<{platformFee: string, platformFeeType: string}>({
    queryKey: ["/api/settings/public"],
  });

  const platformFeeAmount = settings ? parseFloat(settings.platformFee) : 5; // Default 5
  const platformFeeType = settings?.platformFeeType || 'percentage'; // Default percentage
  
  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      price: 50,
      turnaroundTime: 7,
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const serviceFee = platformFeeType === 'percentage' 
        ? data.price * (platformFeeAmount / (100 - platformFeeAmount)) // Fee calculated so seller gets their full price
        : platformFeeAmount; // Fixed fee in dollars
      const response = await apiRequest("/api/listings", {
        method: "POST",
        body: {
          ...data,
          price: data.price, // Keep as dollars
          serviceFee,
        }
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      toast({
        title: "Listing created!",
        description: "Your link listing is now available for purchase.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ListingFormData) => {
    createListingMutation.mutate(data);
  };

  const approvedSites = sites.filter(site => site.status === 'approved');

  if (approvedSites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Approved Sites</CardTitle>
          <CardDescription>
            You need at least one approved site to create listings. Please add and verify your sites first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const watchedPrice = form.watch("price") || 0;
  const serviceFee = platformFeeType === 'percentage' 
    ? watchedPrice * (platformFeeAmount / 100) // Percentage fee
    : platformFeeAmount; // Fixed fee in dollars
  const totalPrice = watchedPrice + serviceFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Listing</CardTitle>
        <CardDescription>
          Set up a listing to sell guest posts or link placements on your site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteId">Select Site</Label>
              <Select onValueChange={(value) => form.setValue("siteId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your site" />
                </SelectTrigger>
                <SelectContent>
                  {approvedSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.domain} - {site.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.siteId && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.siteId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="type">Service Type</Label>
              <Select onValueChange={(value: "guest_post" | "link_placement") => form.setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest_post">Guest Post</SelectItem>
                  <SelectItem value="link_placement">Link Collab</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Your Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="1"
                placeholder="50"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="turnaroundTime">Turnaround Time (days)</Label>
              <Input
                id="turnaroundTime"
                type="number"
                min="1"
                max="30"
                placeholder="7"
                {...form.register("turnaroundTime", { valueAsNumber: true })}
              />
              {form.formState.errors.turnaroundTime && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.turnaroundTime.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Requirements & Guidelines</Label>
            <Textarea
              id="requirements"
              placeholder="Describe any specific requirements, content guidelines, or restrictions..."
              {...form.register("requirements")}
            />
          </div>

          {watchedPrice > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-2">Pricing Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Your price:</span>
                  <span>${watchedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Service fee ({platformFeeType === 'percentage' ? `${platformFeeAmount}%` : `$${platformFeeAmount} fixed`}):</span>
                  <span>+${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Buyer pays:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Includes service and processing fees
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={createListingMutation.isPending}
          >
            {createListingMutation.isPending ? "Creating Listing..." : "Create Listing"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}