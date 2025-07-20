import SearchInput from "@/components/shared/search-input";

const ProjectFilters = () => {
  return (
    <div className="flex items-center sm:space-x-2 flex-col sm:flex-row gap-2">
      <SearchInput
        className="lg:w-[350px]"
        fn={() => {}}
        text={""}
        placeholder="Search all projects"
      />
    </div>
  );
};

export default ProjectFilters;
