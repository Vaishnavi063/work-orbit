import { cn } from "@/lib/utils";
import type { CategoryType } from "@/types";

interface CategoryCardProps {
  item: CategoryType;
}

const CategoryCard = ({ item }: CategoryCardProps) => {
  return (
    <div
      className={cn(
        "p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow flex items-center gap-5 cursor-pointer bg-white"
      )}
    >
      <item.Icon className={cn(item.color)} size={40} />
      <div>
        <h2 className="text-lg font-semibold text-foreground">{item.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {item.available} jobs available
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
