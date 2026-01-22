"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect, useRef } from "react";
import { Search, X, Save, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerString } from "@/components/ui/date-picker";
import { CLAIM_STATUS_LABELS } from "@/lib/constants";

interface ClaimsFiltersProps {
  contractors: { id: string; companyName: string }[];
  estimators: { id: string; firstName: string; lastName: string }[];
  carriers: { id: string; name: string }[];
  currentFilters: {
    status?: string;
    contractor?: string;
    estimator?: string;
    carrier?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

interface SavedFilter {
  id: string;
  name: string;
  filters: {
    status?: string;
    contractor?: string;
    estimator?: string;
    carrier?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

const SAVED_FILTERS_KEY = "quickclaims_saved_filters";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ClaimsFilters({
  contractors,
  estimators,
  carriers,
  currentFilters,
}: ClaimsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(currentFilters.search || "");
  const [dateFrom, setDateFrom] = useState(currentFilters.dateFrom || "");
  const [dateTo, setDateTo] = useState(currentFilters.dateTo || "");
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [showSavedDropdown, setShowSavedDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search value
  const debouncedSearch = useDebounce(searchValue, 300);

  // Load saved filters from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SAVED_FILTERS_KEY);
    if (stored) {
      try {
        setSavedFilters(JSON.parse(stored));
      } catch {
        console.error("Failed to parse saved filters");
      }
    }
  }, []);

  // Apply debounced search
  useEffect(() => {
    if (debouncedSearch !== (currentFilters.search || "")) {
      updateFilter("search", debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSavedDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      startTransition(() => {
        router.push(`/dashboard/claims?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchValue("");
    setDateFrom("");
    setDateTo("");
    startTransition(() => {
      router.push("/dashboard/claims");
    });
  }, [router]);

  const handleDateFromChange = useCallback(
    (value: string) => {
      setDateFrom(value);
      updateFilter("dateFrom", value);
    },
    [updateFilter]
  );

  const handleDateToChange = useCallback(
    (value: string) => {
      setDateTo(value);
      updateFilter("dateTo", value);
    },
    [updateFilter]
  );

  const saveCurrentFilter = useCallback(() => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: {
        status: currentFilters.status,
        contractor: currentFilters.contractor,
        estimator: currentFilters.estimator,
        carrier: currentFilters.carrier,
        search: searchValue,
        dateFrom,
        dateTo,
      },
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
    setFilterName("");
    setShowSaveDialog(false);
  }, [filterName, currentFilters, searchValue, dateFrom, dateTo, savedFilters]);

  const applyFilter = useCallback(
    (filter: SavedFilter) => {
      const params = new URLSearchParams();
      if (filter.filters.status) params.set("status", filter.filters.status);
      if (filter.filters.contractor) params.set("contractor", filter.filters.contractor);
      if (filter.filters.estimator) params.set("estimator", filter.filters.estimator);
      if (filter.filters.carrier) params.set("carrier", filter.filters.carrier);
      if (filter.filters.search) params.set("search", filter.filters.search);
      if (filter.filters.dateFrom) params.set("dateFrom", filter.filters.dateFrom);
      if (filter.filters.dateTo) params.set("dateTo", filter.filters.dateTo);

      setSearchValue(filter.filters.search || "");
      setDateFrom(filter.filters.dateFrom || "");
      setDateTo(filter.filters.dateTo || "");
      setShowSavedDropdown(false);

      startTransition(() => {
        router.push(`/dashboard/claims?${params.toString()}`);
      });
    },
    [router]
  );

  const deleteFilter = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const updated = savedFilters.filter((f) => f.id !== id);
      setSavedFilters(updated);
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
    },
    [savedFilters]
  );

  const hasActiveFilters =
    currentFilters.status ||
    currentFilters.contractor ||
    currentFilters.estimator ||
    currentFilters.carrier ||
    currentFilters.search ||
    currentFilters.dateFrom ||
    currentFilters.dateTo;

  return (
    <Card>
      <CardContent className="p-[var(--rr-space-4)]">
        <div className="space-y-[var(--rr-space-4)]">
          {/* First Row: Search and Quick Filters */}
          <div className="flex flex-wrap items-center gap-[var(--rr-space-4)]">
            {/* Search with debounce */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="absolute left-[var(--rr-space-3)] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rr-color-text-tertiary)]"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by name, address, claim #..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-[var(--rr-input-height)] w-full rounded-[var(--rr-radius-lg)] border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] pl-10 pr-[var(--rr-space-4)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-primary)] outline-none transition-all focus:border-[var(--rr-color-border-focus)] focus:ring-2 focus:ring-[var(--rr-color-focus-ring-alpha)] placeholder:text-[var(--rr-color-text-tertiary)]"
                aria-label="Search claims"
              />
              {isPending && searchValue && (
                <div className="absolute right-[var(--rr-space-3)] top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-[var(--rr-radius-full)] border-2 border-[var(--rr-color-stone)] border-t-[var(--rr-color-brand-primary)]" />
                </div>
              )}
            </div>

            {/* Status Filter */}
            <Select
              value={currentFilters.status || "all"}
              onValueChange={(value) => updateFilter("status", value === "all" ? "" : value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]" aria-label="Filter by status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(CLAIM_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Contractor Filter */}
            <Select
              value={currentFilters.contractor || "all"}
              onValueChange={(value) => updateFilter("contractor", value === "all" ? "" : value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]" aria-label="Filter by contractor">
                <SelectValue placeholder="All Contractors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contractors</SelectItem>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor.id} value={contractor.id}>
                    {contractor.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Estimator Filter */}
            <Select
              value={currentFilters.estimator || "all"}
              onValueChange={(value) => updateFilter("estimator", value === "all" ? "" : value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]" aria-label="Filter by estimator">
                <SelectValue placeholder="All Estimators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Estimators</SelectItem>
                {estimators.map((estimator) => (
                  <SelectItem key={estimator.id} value={estimator.id}>
                    {estimator.firstName} {estimator.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Carrier Filter */}
            <Select
              value={currentFilters.carrier || "all"}
              onValueChange={(value) => updateFilter("carrier", value === "all" ? "" : value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]" aria-label="Filter by carrier">
                <SelectValue placeholder="All Carriers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carriers</SelectItem>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Second Row: Date Filters, Saved Filters, and Actions */}
          <div className="flex flex-wrap items-center gap-[var(--rr-space-4)]">
            {/* Date Range Filters */}
            <div className="flex items-center gap-[var(--rr-space-2)]">
              <label className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">From:</label>
              <DatePickerString
                value={dateFrom}
                onChange={handleDateFromChange}
                disabled={isPending}
                placeholder="Start date"
                aria-label="Date from"
                className="w-[140px]"
              />
            </div>
            <div className="flex items-center gap-[var(--rr-space-2)]">
              <label className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)]">To:</label>
              <DatePickerString
                value={dateTo}
                onChange={handleDateToChange}
                disabled={isPending}
                placeholder="End date"
                aria-label="Date to"
                className="w-[140px]"
              />
            </div>

            {/* Saved Filters Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                className="gap-[var(--rr-space-1)]"
              >
                Saved Filters
                <ChevronDown className="h-4 w-4" />
              </Button>

              {showSavedDropdown && (
                <div className="absolute top-full left-0 mt-[var(--rr-space-1)] w-64 rounded-[var(--rr-radius-lg)] border border-[var(--rr-color-border-default)] bg-[var(--rr-color-bg-secondary)] shadow-[var(--rr-shadow-lg)] z-50">
                  <div className="p-[var(--rr-space-2)]">
                    {savedFilters.length === 0 ? (
                      <p className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-secondary)] p-[var(--rr-space-2)]">No saved filters</p>
                    ) : (
                      <div className="space-y-[var(--rr-space-1)]">
                        {savedFilters.map((filter) => (
                          <div
                            key={filter.id}
                            className="flex items-center justify-between p-[var(--rr-space-2)] hover:bg-[var(--rr-color-surface-hover)] rounded-[var(--rr-radius-md)] cursor-pointer"
                            onClick={() => applyFilter(filter)}
                          >
                            <span className="text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-primary)]">{filter.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-[var(--rr-color-error)]/10 hover:text-[var(--rr-color-error)]"
                              onClick={(e) => deleteFilter(filter.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Current Filter */}
            {hasActiveFilters && (
              <>
                {!showSaveDialog ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="gap-[var(--rr-space-1)]"
                  >
                    <Save className="h-4 w-4" />
                    Save Filter
                  </Button>
                ) : (
                  <div className="flex items-center gap-[var(--rr-space-2)]">
                    <input
                      type="text"
                      placeholder="Filter name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveCurrentFilter()}
                      className="h-8 w-40 rounded-[var(--rr-radius-md)] border border-[var(--rr-color-border-default)] px-[var(--rr-space-2)] text-[var(--rr-font-size-sm)] text-[var(--rr-color-text-primary)] outline-none focus:border-[var(--rr-color-border-focus)] focus:ring-2 focus:ring-[var(--rr-color-focus-ring-alpha)]"
                      autoFocus
                    />
                    <Button size="sm" onClick={saveCurrentFilter}>
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSaveDialog(false);
                        setFilterName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                disabled={isPending}
                className="gap-[var(--rr-space-1)] text-[var(--rr-color-text-secondary)] hover:text-[var(--rr-color-text-primary)]"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
