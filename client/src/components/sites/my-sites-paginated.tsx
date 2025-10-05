import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SiteCard from "./site-card";
import { SiteWithUser } from "../../types";

interface MySitesPaginatedProps {
  sites: SiteWithUser[];
  loading: boolean;
  emptyState: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
}

export default function MySitesPaginated({ sites, loading, emptyState }: MySitesPaginatedProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Hardcoded sites per page
  const sitesPerPage = 6;

  // Pagination calculations
  const totalPages = Math.ceil(sites.length / sitesPerPage);
  const startIndex = (currentPage - 1) * sitesPerPage;
  const endIndex = startIndex + sitesPerPage;
  const paginatedSites = sites.slice(startIndex, endIndex);

  // Reset to page 1 when sites change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-white rounded-xl border border-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
        <p className="text-gray-600 mb-4">{emptyState.description}</p>
        {emptyState.action}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
        {paginatedSites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t gap-4 sm:gap-0">
          <div className="text-sm text-gray-600 text-center sm:text-left">
            <span className="block sm:inline">Showing {Math.min(startIndex + 1, sites.length)}-{Math.min(endIndex, sites.length)} of {sites.length} sites</span>
            <span className="text-gray-400 block sm:inline sm:ml-2">({sitesPerPage} per page)</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}