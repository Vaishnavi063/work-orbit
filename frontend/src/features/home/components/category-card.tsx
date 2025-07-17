import { cn } from "@/lib/utils";
import type { CategoryType } from "@/types";

interface CategoryCardProps {
  item: CategoryType;
}

const CategoryCard = ({ item }: CategoryCardProps) => {
  return (
    <div
      className={cn(
        "p-4 sm:p-6 rounded-lg border transition-all duration-200 cursor-pointer",
        "flex items-center gap-5",
        "bg-white dark:bg-slate-900",
        "border-gray-200 dark:border-gray-700",
        "hover:shadow-lg dark:hover:shadow-primary/20"
      )}
    >
      <item.Icon className={cn(item.color)} size={40} />

      <div>
        <h2 className="text-lg font-semibold text-foreground dark:text-white">
          {item.title}
        </h2>
        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
          {item.available} jobs available
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
