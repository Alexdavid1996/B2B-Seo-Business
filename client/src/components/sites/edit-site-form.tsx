import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "../../hooks/use-auth";

const editSiteSchema = z.object({
  description: z.string().min(1, "Description is required"),
  casinoAllowed: z.string().min(1, "Casino preference is required"),
  price: z.number().min(1, "Price must be at least $1").optional(),
  deliveryTime: z.number().min(1, "Delivery time must be at least 1 day").max(365, "Delivery time cannot exceed 365 days").optional(),
}).refine((data) => {
  // For sales sites, price and delivery time are required
  return true; // Let the backend handle this validation since we have access to site.purpose there
}, {
  message: "Price and delivery time are required for sales sites",
});

type EditSiteFormData = z.infer<typeof editSiteSchema>;

interface EditSiteFormProps {
  site: any;
  onSuccess: () => void;
}

export default function EditSiteForm({ site, onSuccess }: EditSiteFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditSiteFormData>({
    resolver: zodResolver(editSiteSchema),
    defaultValues: {
      description: site.description || "",
      casinoAllowed: site.purpose === 'sales' ? (site.casinoAllowed || "N/A") : undefined,
      price: site.purpose === 'sales' ? site.price : undefined, // Already in dollars
      deliveryTime: site.purpose === 'sales' ? site.deliveryTime : undefined,
    },
  });

  const editSiteMutation = useMutation({
    mutationFn: async (data: EditSiteFormData) => {
      const updateData: any = {
        description: data.description,
      };
      
      // Only update price, delivery time, and casino setting for sales sites
      if (site.purpose === 'sales') {
        updateData.price = data.price ? Math.round(data.price) : 0; // Price is already in dollars, no conversion needed
        updateData.deliveryTime = data.deliveryTime || 1;
        updateData.casinoAllowed = data.casinoAllowed; // Only update casino setting for sales sites
      } else {
        // For exchange sites, don't send casino setting at all
        delete updateData.casinoAllowed;
      }
      
      console.log('Original form data.price:', data.price); // Debug log
      console.log('Sending update data:', updateData); // Debug log
      const result = await apiRequest(`/api/sites/${site.id}`, {
        method: "PUT",
        body: updateData
      });
      console.log('Update response:', result); // Debug log
      return result;
    },
    onSuccess: async (updatedSite) => {
      console.log('Update success, invalidating queries...'); // Debug log
      
      // Invalidate all relevant queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/sites/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/sites/directory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings/marketplace"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user", user?.id] });
      
      toast({
        title: "Site updated successfully!",
        description: site.purpose === 'sales' ? "Your site details have been updated." : "Your site description has been updated.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Failed to update site",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: EditSiteFormData) => {
    editSiteMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="description">Site Description</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe your website, its content, and target audience..."
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Casino Content - Only for Sales Sites (Guest Posts) */}
      {site.purpose === 'sales' && (
        <div>
          <Label htmlFor="casinoAllowed">Casino Content</Label>
          <p className="text-sm text-gray-600 mb-2">Are casino-related links and content allowed on your site?</p>
          <Select 
            onValueChange={(value) => form.setValue("casinoAllowed", value)} 
            value={form.watch("casinoAllowed")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select casino preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">✅ Yes - Casino content is allowed</SelectItem>
              <SelectItem value="no">❌ No - Casino content is NOT allowed</SelectItem>
              <SelectItem value="N/A">➖ Not Applicable / Not Specified</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.casinoAllowed && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.casinoAllowed.message}
            </p>
          )}
        </div>
      )}

      {site.purpose === 'sales' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter price in USD"
                  className="pl-8"
                  {...form.register("price", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.price && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
              <Input
                id="deliveryTime"
                type="number"
                min="1"
                max="365"
                placeholder="Days to complete"
                {...form.register("deliveryTime", { valueAsNumber: true })}
              />
              {form.formState.errors.deliveryTime && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.deliveryTime.message}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={editSiteMutation.isPending}>
          {editSiteMutation.isPending ? "Updating..." : site.purpose === 'sales' ? "Update Site Details" : "Update Description"}
        </Button>
      </div>
    </form>
  );
}