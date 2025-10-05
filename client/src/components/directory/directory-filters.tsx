import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowLeftRight, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DirectoryFiltersProps {
  mode: "exchange" | "marketplace";
  onModeChange: (mode: "exchange" | "marketplace") => void;
  filters?: {
    search: string;
    category: string;
    domainAuthority: string;
    traffic: string;
  };
  onFiltersChange?: (filters: {
    search: string;
    category: string;
    domainAuthority: string;
    traffic: string;
  }) => void;
  onSortChange?: (sortType: "bestSales" | "highTraffic" | null) => void;
}

export default function DirectoryFilters({
  mode,
  onModeChange,
  filters: propFilters,
  onFiltersChange,
  onSortChange,
}: DirectoryFiltersProps) {
  const [filters, setFilters] = useState(
    propFilters || {
      search: "",
      category: "all",
      domainAuthority: "any",
      traffic: "any",
    },
  );

  // Get site categories
  const { data: categories = [] } = useQuery<
    Array<{ id: string; name: string; slug: string }>
  >({
    queryKey: ["/api/categories"],
  });

  const handleReset = () => {
    const resetFilters = {
      search: "",
      category: "all",
      domainAuthority: "any",
      traffic: "any",
    };
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
    // Clear button sort when resetting
    onSortChange?.(null);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Auto-trigger appropriate sort when switching modes
  useEffect(() => {
    if (mode === "exchange") {
      // Clear dropdown filters and apply High Traffic sort
      const resetFilters = { ...filters, domainAuthority: "any", traffic: "any" };
      setFilters(resetFilters);
      onFiltersChange?.(resetFilters);
      onSortChange?.("highTraffic");
    } else if (mode === "marketplace") {
      // Clear dropdown filters and apply Best Sales sort
      const resetFilters = { ...filters, domainAuthority: "any", traffic: "any" };
      setFilters(resetFilters);
      onFiltersChange?.(resetFilters);
      onSortChange?.("bestSales");
    }
  }, [mode]); // Only run when mode changes

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        {/* Mode Toggle */}
        <div className="mb-4 sm:mb-6">
          <Tabs
            value={mode}
            onValueChange={(value) =>
              onModeChange(value as "exchange" | "marketplace")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="marketplace"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Guest Post</span>
                <span className="sm:hidden">Marketplace</span>
              </TabsTrigger>
              <TabsTrigger
                value="exchange"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
                Exchange
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {mode === "exchange"
              ? "Connect with sites for link collaboration"
              : "Explore available guest post opportunities"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div>
            <Label htmlFor="search">Search Domains</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Enter domain or keyword..."
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange({ ...filters, search: e.target.value })
                }
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                handleFilterChange({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="domainAuthority">Ahrefs DR</Label>
            <Select
              value={filters.domainAuthority}
              onValueChange={(value) => {
                handleFilterChange({ ...filters, domainAuthority: value });
                // Clear button sort when using dropdown
                onSortChange?.(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any DR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any DR</SelectItem>
                <SelectItem value="high-to-low">High to Low</SelectItem>
                <SelectItem value="low-to-high">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="traffic">Traffic Range</Label>
            <Select
              value={filters.traffic}
              onValueChange={(value) => {
                handleFilterChange({ ...filters, traffic: value });
                // Clear button sort when using dropdown
                onSortChange?.(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Traffic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Traffic</SelectItem>
                <SelectItem value="high-to-low">High to Low</SelectItem>
                <SelectItem value="low-to-high">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing{" "}
            {mode === "exchange"
              ? "sites available for collaboration"
              : "sites offering guest posts"}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Clear dropdown filters and apply sort
                const resetFilters = { ...filters, domainAuthority: "any", traffic: "any" };
                handleFilterChange(resetFilters);
                onSortChange?.("bestSales");
              }}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Best Sales
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Clear dropdown filters and apply sort
                const resetFilters = { ...filters, domainAuthority: "any", traffic: "any" };
                handleFilterChange(resetFilters);
                onSortChange?.("highTraffic");
              }}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              High Traffic
            </Button>
            <Button variant="outline" onClick={handleReset} size="sm">
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
