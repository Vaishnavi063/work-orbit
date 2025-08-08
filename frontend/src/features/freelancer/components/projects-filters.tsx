import { useCallback, useMemo } from "react";
import SearchInput from "@/components/shared/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { debounce } from "@/lib/utils";

export interface SortConfig {
  sortBy: string;
  sortDir: string;
}

interface ProjectFiltersProps {
  onSearch: (text: string) => void;
  onSort: (sortConfig: SortConfig) => void;
  currentSort: SortConfig;
}

const ProjectFilters = ({
  onSearch,
  onSort,
  currentSort,
}: ProjectFiltersProps) => {
  const sortOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "budget", label: "Budget" },
    { value: "deadline", label: "Deadline" },
    { value: "title", label: "Title" },
    { value: "category", label: "Category" },
  ];

  const debouncedSearch = useMemo(() => debounce(onSearch, 400), [onSearch]);

  const handleSearch = useCallback(
    (text: string) => {
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const handleSortFieldChange = (sortBy: string) => {
    onSort({ ...currentSort, sortBy });
  };

  const toggleSortDirection = () => {
    const newDirection = currentSort.sortDir === "asc" ? "desc" : "asc";
    onSort({ ...currentSort, sortDir: newDirection });
  };

  const getSortIcon = () => {
    if (currentSort.sortDir === "asc") {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    } else if (currentSort.sortDir === "desc") {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === currentSort.sortBy);
    return option?.label || "Date Created";
  };

  return (
    <div className="flex items-center space-x-3 flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <SearchInput
        className="lg:w-[350px] w-full sm:w-auto rounded-md border border-gray-200 shadow-sm"
        fn={handleSearch}
        text=""
        placeholder="Search all projects"
      />

      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <span className="text-sm text-gray-600 whitespace-nowrap hidden sm:inline">
          Sort by:
        </span>

        <Select
          value={currentSort.sortBy}
          onValueChange={handleSortFieldChange}
        >
          <SelectTrigger className="w-[140px] bg-white border border-gray-200 text-gray-800 shadow-sm hover:border-blue-300 focus:ring-blue-100">
            <SelectValue placeholder="Sort by">
              {getCurrentSortLabel()}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortDirection}
          className="px-3 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 shadow-sm"
          title={`Sort ${
            currentSort.sortDir === "asc" ? "Descending" : "Ascending"
          }`}
        >
          {getSortIcon()}
        </Button>
      </div>
    </div>
  );
};

export default ProjectFilters;
