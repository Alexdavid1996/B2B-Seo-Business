import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "../../hooks/use-auth";

// Parse traffic input with K/M format support
const parseTrafficInput = (value: string | number): number => {
  if (!value) return 0;
  
  const stringValue = value.toString().trim().toUpperCase();
  
  // Handle K format (e.g., 1K, 43K, 1.5K)
  if (stringValue.endsWith('K')) {
    const numericPart = parseFloat(stringValue.replace('K', ''));
    return Math.floor(numericPart * 1000);
  } 
  // Handle M format (e.g., 1M, 43M, 1.5M, 43.1M)
  else if (stringValue.endsWith('M')) {
    const numericPart = parseFloat(stringValue.replace('M', ''));
    return Math.floor(numericPart * 1000000);
  } 
  // Handle raw numbers (e.g., 15000, 1500000)
  else {
    const numericPart = parseFloat(stringValue);
    return isNaN(numericPart) ? 0 : Math.floor(numericPart);
  }
};

// Create dynamic schema based on minimum sales price setting
const createAddSiteSchema = (minimumSalesPrice: number = 10) => z.object({
  domain: z.string().min(1, "Domain is required").max(40, "Domain must be 40 characters or less").refine(
    (domain) => domain.includes("."),
    "Please enter a valid domain"
  ).refine(
    (domain) => !/[<>\"'&]/.test(domain),
    "Domain contains invalid characters"
  ),
  title: z.string().min(1, "Title is required").max(30, "Title must be 30 characters or less").refine(
    (title) => !/[<>\"'&]/.test(title),
    "Title contains invalid characters"
  ),
  description: z.string().max(500, "Description must be 500 characters or less").refine(
    (desc) => !desc || !/[<>\"'&]/.test(desc),
    "Description contains invalid characters"
  ).optional(),
  category: z.string().min(1, "Category is required"),
  domainAuthority: z.number().min(1).max(100),
  drScore: z.number().min(1).max(100),
  monthlyTraffic: z.number().min(1).max(199999999, "Monthly traffic must be less than 200,000,000"),
  language: z.string().min(1, "Language is required"),
  purpose: z.string().min(1, "Purpose is required"),
  linkType: z.string().min(1, "Link type is required"),
  casinoAllowed: z.string().optional(),
  price: z.union([z.number(), z.nan()]).optional().transform(val => val && !isNaN(val) ? val : undefined),
  deliveryTime: z.union([z.number(), z.nan()]).optional().transform(val => val && !isNaN(val) ? val : undefined),
}).refine((data) => {
  if (data.purpose === "sales") {
    if (!data.price || data.price < minimumSalesPrice) {
      return false;
    }
    if (!data.deliveryTime || data.deliveryTime <= 0) {
      return false;
    }
  }
  return true;
}, {
  message: `Price must be at least $${minimumSalesPrice} for sales listings`,
  path: ["price"],
}).refine((data) => {
  if (data.purpose === "sales") {
    if (!data.deliveryTime || data.deliveryTime <= 0) {
      return false;
    }
  }
  return true;
}, {
  message: "Delivery time is required for sales listings",
  path: ["deliveryTime"],
});

interface AddSiteFormProps {
  onSuccess: () => void;
  editingSite?: any; // Site data when editing
}

export default function AddSiteForm({ onSuccess, editingSite }: AddSiteFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get platform fee settings
  const { data: settings } = useQuery<{platformFee: string, platformFeeType: string, minimumSalesPrice: string}>({
    queryKey: ["/api/settings/public"],
  });

  // Get minimum sales price from settings
  const minimumSalesPrice = parseInt(settings?.minimumSalesPrice || "10");

  // Create dynamic schema with current minimum price
  const addSiteSchema = createAddSiteSchema(minimumSalesPrice);
  type AddSiteFormData = z.infer<typeof addSiteSchema>;

  // Get site categories
  const { data: categories = [] } = useQuery<Array<{id: string, name: string, slug: string}>>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<AddSiteFormData>({
    resolver: zodResolver(addSiteSchema),
    defaultValues: editingSite ? {
      domain: editingSite.domain || "",
      title: editingSite.title || "",
      description: editingSite.description || "",
      category: editingSite.category || "",
      domainAuthority: editingSite.domainAuthority || undefined,
      drScore: editingSite.drScore || undefined,
      monthlyTraffic: editingSite.monthlyTraffic || undefined,
      language: editingSite.language || "English",
      purpose: editingSite.purpose || "exchange",
      linkType: editingSite.linkType || "dofollow",
      casinoAllowed: editingSite.casinoAllowed || "N/A",
      price: editingSite.price ? editingSite.price : undefined, // Already in dollars
      deliveryTime: editingSite.deliveryTime || undefined,
    } : {
      domain: "",
      title: "",
      description: "",
      category: "",
      domainAuthority: undefined,
      drScore: undefined,
      monthlyTraffic: undefined,
      language: "English",
      purpose: "sales",
      linkType: "dofollow",
      casinoAllowed: "N/A",
      price: undefined,
      deliveryTime: undefined,
    },
  });

  const watchedPurpose = useWatch({
    control: form.control,
    name: "purpose",
  });

  // Initialize purpose value on component mount for new sites
  useEffect(() => {
    if (!editingSite) {
      form.setValue("purpose", "sales");
    }
  }, [editingSite, form]);

  const addSiteMutation = useMutation({
    mutationFn: async (data: AddSiteFormData) => {
      console.log("Form submission data:", data);
      console.log("Monthly traffic parsed:", data.monthlyTraffic);
      
      const url = editingSite ? `/api/sites/${editingSite.id}` : "/api/sites";
      const method = editingSite ? "PUT" : "POST";
      return await apiRequest(url, {
        method,
        body: {
          ...data,
          userId: user?.id,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sites/user", user?.id] });
      toast({
        title: editingSite ? "Site updated successfully!" : "Site added successfully!",
        description: editingSite ? "Your site changes have been saved." : "Your site has been submitted for approval.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      // Check if it's a duplicate domain error
      const errorMessage = error?.message || "Please check your information and try again.";

      toast({
        title: "Failed to add site",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddSiteFormData) => {
    console.log("Form submission data:", data);
    console.log("Form validation errors:", form.formState.errors);
    addSiteMutation.mutate(data);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Purpose Selection - Moved to top */}
        <div>
          <Label htmlFor="purpose">What would you like to do?</Label>
          <p className="text-sm text-gray-600 mb-2">Choose how you want to use your site:</p>
          <Select 
            onValueChange={(value) => form.setValue("purpose", value)} 
            value={form.watch("purpose")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select site purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sales">💰 Sales - Selling guest post spots or link placements</SelectItem>
              <SelectItem value="exchange">🤝 Link Collab – Non-reciprocal or reciprocal (A-B-C swaps)</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.purpose && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.purpose.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Link Type Selection */}
          <div>
            <Label htmlFor="linkType">Link Type</Label>
            <p className="text-sm text-gray-600 mb-2">Choose the type of link you provide:</p>
            <Select 
              onValueChange={(value) => form.setValue("linkType", value)} 
              value={form.watch("linkType")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select link type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dofollow">✅ Do Follow - Pass link juice and SEO value</SelectItem>
                <SelectItem value="nofollow">🚫 No Follow - Does not pass SEO value</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.linkType && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.linkType.message}
              </p>
            )}
          </div>

          {/* Casino Allowed Selection - Only for Sales */}
          {watchedPurpose === "sales" && (
            <div>
              <Label htmlFor="casinoAllowed">Casino Content Allowed</Label>
              <p className="text-sm text-gray-600 mb-2">Do you accept casino/gambling content?</p>
              <Select 
                onValueChange={(value) => form.setValue("casinoAllowed", value)} 
                value={form.watch("casinoAllowed")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select casino policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">🎰 Yes - Casino content allowed</SelectItem>
                  <SelectItem value="no">🚫 No - Casino content not allowed</SelectItem>
                  <SelectItem value="N/A">➖ N/A - Not specified</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.casinoAllowed && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.casinoAllowed.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            placeholder="example.com"
            {...form.register("domain")}
          />
          {form.formState.errors.domain && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.domain.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="title">Site Title</Label>
          <Input
            id="title"
            placeholder="My Awesome Blog"
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of your site..."
          {...form.register("description")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => form.setValue("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.category.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="language">Language</Label>
          <Select 
            defaultValue="English"
            onValueChange={(value) => form.setValue("language", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Portuguese">Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditional Sales Fields */}
      {watchedPurpose === "sales" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="md:col-span-2">
            <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">💰 Sales Information Required</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Both price and delivery time are required and will be publicly visible to buyers in the marketplace directory.
            </p>
          </div>

          <div>
            <Label htmlFor="price" className="text-blue-900 dark:text-blue-100 font-medium">
              Price (USD) *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
              <Input
                id="price"
                type="number"
                min={minimumSalesPrice}
                placeholder={`${minimumSalesPrice}`}
                className="pl-8 border-blue-300 dark:border-blue-700 focus:border-blue-500"
                {...form.register("price", { valueAsNumber: true })}
              />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Publicly visible to potential buyers
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Minimum price: ${minimumSalesPrice}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {settings?.platformFeeType === 'percentage'
              ? `${settings.platformFee}%`
              : `$${settings?.platformFee || '5'}`} Earnings Deduction
            </p>
            {form.formState.errors.price && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="deliveryTime" className="text-blue-900 dark:text-blue-100 font-medium">
              Delivery Time (Days) *
            </Label>
            <Input
              id="deliveryTime"
              type="number"
              min="1"
              placeholder="e.g., 2"
              className="border-blue-300 dark:border-blue-700 focus:border-blue-500"
              {...form.register("deliveryTime", { valueAsNumber: true })}
            />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Typical delivery time (days)
            </p>
            {form.formState.errors.deliveryTime && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.deliveryTime.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="domainAuthority">DA Score (1-100)</Label>
          <Input
            id="domainAuthority"
            type="number"
            min="1"
            max="100"
            placeholder="Moz DA"
            {...form.register("domainAuthority", { valueAsNumber: true })}
          />
          {form.formState.errors.domainAuthority && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.domainAuthority.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="drScore">DR Score (1-100)</Label>
          <Input
            id="drScore"
            type="number"
            min="1"
            max="100"
            placeholder="Ahrefs DR"
            {...form.register("drScore", { valueAsNumber: true })}
          />
          {form.formState.errors.drScore && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.drScore.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="monthlyTraffic">Monthly Traffic</Label>
          <Input
            id="monthlyTraffic"
            type="text"
            placeholder="No Fake"
            {...form.register("monthlyTraffic", {
              setValueAs: (value) => parseTrafficInput(value)
            })}
          />
          {form.formState.errors.monthlyTraffic && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.monthlyTraffic.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-950">
        <Button type="button" variant="outline" onClick={onSuccess} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={addSiteMutation.isPending} 
          className="w-full sm:w-auto"
          onClick={(e) => {
            console.log("Button clicked!");
            const formData = form.getValues();
            console.log("Current form values:", formData);
            console.log("Monthly traffic raw input:", (document.getElementById('monthlyTraffic') as HTMLInputElement)?.value);
            console.log("Monthly traffic parsed:", parseTrafficInput((document.getElementById('monthlyTraffic') as HTMLInputElement)?.value || ''));
            console.log("Form valid:", form.formState.isValid);
            console.log("Form errors:", form.formState.errors);
            
            // Trigger validation
            form.trigger();
          }}
        >
          {addSiteMutation.isPending 
            ? (editingSite ? "Updating..." : "Adding...") 
            : (editingSite ? "Update Site" : "Add Site")
          }
        </Button>
      </div>
      </form>
    </div>
  );
}
