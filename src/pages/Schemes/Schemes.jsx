import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo, Suspense, lazy } from "react";
import Papa from "papaparse";
import { Skeleton } from "@/components/ui/skeleton";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Filter, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import useDebounce from "@/hooks/useDebounce";
import NotifyChecker from "@/components/NotifyChecker";

// Lazy load SchemeCard for better initial loading performance
const SchemeCard = lazy(() => import("./SchemeCard"));

// Constants
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT1kiCFeQNcNGhn3MMlsKdg8EhDi4Qbamuy2NKPentn37a3L85gvJkABfAnlPYi-8IdVuEg7Pbi58-F/pub?output=csv";

const Schemes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allSchemes, setAllSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get filter values from URL params
  const categoryParam = searchParams.get("sector") || "";
  const fundingTypeParam = searchParams.get("fundingType") || "";
  const statusParam = searchParams.get("status") || "";
  
  // Local state for input fields
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);
  const [fundingTypeFilter, setFundingTypeFilter] = useState(fundingTypeParam);
  const [statusFilter, setStatusFilter] = useState(statusParam);
  
  // Debounce filter inputs to prevent excessive URL updates
  const debouncedCategoryFilter = useDebounce(categoryFilter, 500);
  const debouncedFundingTypeFilter = useDebounce(fundingTypeFilter, 500);
  const debouncedStatusFilter = useDebounce(statusFilter, 500);
  
  // Process CSV data into usable format
  const formatFundingData = useCallback((data) => {
    const deadlineDate = data["Deadline"] ? new Date(data["Deadline"]) : null;
    const currentDate = new Date();
  
    let status = "Unknown";
    if (deadlineDate) {
      status = deadlineDate < currentDate ? "Closed" : "Open";   
    }
  
    return {
      title: data["Program"] || "Untitled Program",
      organization: data["Organization"] || "Unknown Organization",
      focusAreas: data["Focus_Area"]
        ? data["Focus_Area"].replace(/^[\s\"\']*(.*?)[\s\"\']*$/, "$1").split(",").map((f) => f.trim())
        : [],
      support: data["Grant/Support"] || "Not specified",
      deadline: data["Deadline"] || null,
      applyLink: data["Link"] || "#",
      fundingType: data["Funding Type"] || "Not specified Funding Type",
      status,
    };
  }, []);
  ;
  

  // Fetch schemes data
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    <NotifyChecker/>
    const fetchSchemes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(CSV_URL, { signal });
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        
        const text = await res.text();

        const parsed = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          transformHeader: (header) => header.trim()
        });

        if (parsed.errors.length > 0) {
          console.warn("CSV parsing had errors:", parsed.errors);
        }
         
        const formatted = parsed.data
          .map(formatFundingData)
          .sort((a, b) => {
            // Sort by status (open first) and then by deadline (soonest first)
            if (a.status.toLowerCase() === "open" && b.status.toLowerCase() !== "open") return -1;
            if (a.status.toLowerCase() !== "open" && b.status.toLowerCase() === "open") return 1;
            
            // If both have the same status and have valid deadlines, sort by deadline
            if (a.deadline && b.deadline) {
              return new Date(a.deadline) - new Date(b.deadline);
            }
          
            return 0;
          });
          // console.log(formatted)
        setAllSchemes(formatted);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Failed to fetch or parse CSV data:", error);
          setError("Failed to load funding schemes. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
    
    // Cleanup function to abort fetch if component unmounts
    return () => controller.abort();
  }, [formatFundingData]);

  // Update URL when debounced filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (debouncedCategoryFilter) newParams.set("sector", debouncedCategoryFilter);
    if (debouncedFundingTypeFilter) newParams.set("fundingType", debouncedFundingTypeFilter);
    if (debouncedStatusFilter) newParams.set("status", debouncedStatusFilter);
    
    setSearchParams(newParams, { replace: true });
  }, [debouncedCategoryFilter, debouncedFundingTypeFilter, debouncedStatusFilter, setSearchParams]);

  // Generate list of unique categories, funding types, and statuses for dropdown options
  const { uniqueCategories, uniqueFundingTypes, uniqueStatuses } = useMemo(() => {
    if (!allSchemes.length) {
      return { uniqueCategories: [], uniqueFundingTypes: [], uniqueStatuses: [] };
    }
    
    return {
      uniqueCategories: [...new Set(allSchemes.flatMap(scheme => scheme.focusAreas))].filter(Boolean).sort(),
      uniqueFundingTypes: [...new Set(allSchemes.map(scheme => scheme.fundingType))].filter(Boolean).sort(),
      uniqueStatuses: [...new Set(allSchemes.map(scheme => scheme.status))].filter(Boolean).sort()
    };
  }, [allSchemes]);

  // Filter schemes based on current URL parameters
  const filteredSchemes = useMemo(() => {
    if (!allSchemes.length) return [];
  
    return allSchemes.filter((scheme) => {
      const matchesCategory = 
        categoryParam === "all" || 
        scheme.focusAreas.some((area) => 
          new RegExp(`\\b${categoryParam.toLowerCase()}`).test(area.toLowerCase())
        );
  
      const matchesFundingType = 
        fundingTypeParam === "all" || 
        new RegExp(`\\b${fundingTypeParam.toLowerCase()}`).test(scheme.fundingType?.toLowerCase());
  
      const matchesStatus = 
        statusParam === "all" || 
        new RegExp(`\\b${statusParam.toLowerCase()}`).test(scheme.status?.toLowerCase());
  
      return matchesCategory && matchesFundingType && matchesStatus;
    });
  }, [allSchemes, categoryParam, fundingTypeParam, statusParam]);
  

  // Reset all filters
  const handleResetFilters = () => {
    setCategoryFilter("");
    setFundingTypeFilter("");
    setStatusFilter("");
    setSearchParams({});
  };

  // Generate title based on current category filter
  const pageTitle = useMemo(() => {
    if (categoryParam) {
      return `${categoryParam.charAt(0).toUpperCase()}${categoryParam.slice(1)} Schemes`;
    }
    return "All Funding Schemes";
  }, [categoryParam]);

  // Filter stats
  const totalSchemes = allSchemes.length;
  const filteredCount = filteredSchemes.length;
  const openSchemesCount = filteredSchemes.filter(s => s.status?.toLowerCase() === "open").length;

  // Render skeletons while loading
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, idx) => (
      <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden h-96">
        <div className="h-2 bg-gray-200 w-full"></div>
        <div className="p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    ));
  };
  const splitIntoChunks = (arr, chunkSize) => {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            Filter Schemes
          </h3>
          {(categoryFilter || fundingTypeFilter || statusFilter) && (
            <button 
              onClick={handleResetFilters}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       
  {/* Category Filter */}
  <div className="space-y-2">
    <Label htmlFor="category-filter">Category</Label>
    <Select 
      value={categoryFilter} 
      onValueChange={setCategoryFilter}
    >
      <SelectTrigger id="category-filter">
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {splitIntoChunks(uniqueCategories, 10).map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {chunk.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  </div>
          {/* Funding Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="funding-type-filter">Funding Type</Label>
            <Select 
              value={fundingTypeFilter} 
              onValueChange={setFundingTypeFilter}
            >
              <SelectTrigger id="funding-type-filter">
                <SelectValue placeholder="All Funding Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funding Types</SelectItem>
                {uniqueFundingTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status.toLowerCase()}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Main Content */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{pageTitle}</h1>
          
          {!loading && allSchemes.length > 0 && (
            <div className="text-sm text-gray-500">
              <span className="font-medium text-emerald-600">{filteredCount}</span>
              <span> of </span>
              <span>{totalSchemes}</span>
              <span> schemes </span>
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">{openSchemesCount} open</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderSkeletons()}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No matching schemes found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Try adjusting your filters or check back later for new funding opportunities.
            </p>
            <button 
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              View All Schemes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={renderSkeletons()}>
              {filteredSchemes.map((scheme, idx) => (
                <motion.div
                  key={`${scheme.title}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <SchemeCard scheme={scheme} />
                </motion.div>
              ))}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};



export default Schemes;