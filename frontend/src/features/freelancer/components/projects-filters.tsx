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

  const handleSortFieldChange = (sortBy: string) => {
    onSort({ ...currentSort, sortBy });
  };

  const toggleSortDirection = () => {
    const newDirection = currentSort.sortDir === "asc" ? "desc" : "asc";
    onSort({ ...currentSort, sortDir: newDirection });
  };

  const getSortIcon = () => {
    if (currentSort.sortDir === "asc") {
      return <ArrowUp className="h-4 w-4" />;
    } else if (currentSort.sortDir === "desc") {
      return <ArrowDown className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === currentSort.sortBy);
    return option?.label || "Date Created";
  };

  return (
    <div className="flex items-center space-x-3 flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <SearchInput
        className="lg:w-[350px] w-full sm:w-auto"
        fn={onSearch}
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
          <SelectTrigger className="w-[140px]">
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
          className="px-3"
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
