import { CATEGORIES } from "@/constants/categories";
import type { CategoryType } from "@/types";
import { ListComponent } from "@/components";
import { useProjectCounts } from "@/hooks/useProjectCounts";
import CategoryCard from "./category-card";

const Categories = () => {
  const { 
    isLoading, 
    error, 
    getCountForCategory
  } = useProjectCounts();

  return (
    <section className="py-8 md:py-10 md:mt-8 mx-auto container">
      <div className="container mx-auto px-4 sm:px-0">
        <div className="text-center mb-16">
          <span
            className="
              inline-block px-4 py-1 rounded-full 
              bg-primary/10 dark:bg-primary/60
              text-primary dark:text-primary-foreground
              text-sm font-medium mb-4
            "
          >
            Categories
          </span>

          <h1
            className="
              text-4xl md:text-5xl font-bold tracking-tight
              text-primary dark:text-primary-foreground
              mb-4
            "
          >
            Browse by Categories
          </h1>

          <p
            className="
              text-sm sm:text-md 
              text-muted-foreground dark:text-gray-400
              mb-6
            "
          >
            Browse categories to get started quickly.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-0">
        <ListComponent
          data={CATEGORIES}
          renderItem={(item: CategoryType) => {
            // Get the actual count from backend data
            const actualCount = getCountForCategory(item.id);
            
            return (
              <CategoryCard 
                key={item.id} 
                item={item}
                activeProjectCount={actualCount} // This will be 0 if no data found
                isCountLoading={isLoading}
                hasCountError={!!error}
              />
            );
          }}
        />
      </div>
    </section>
  );
};

export default Categories;
