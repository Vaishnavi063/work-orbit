import { siteConfigs } from "@/config";

const SiteFooter = () => {
  return (
    <div className="h-14 px-4 sm:px-8 border-t flex items-center">
      <div className="relative text-sm text-center sm:text-start">
        © {new Date().getFullYear()} {siteConfigs.name}. All rights reserved.
      </div>
    </div>
  );
};

export default SiteFooter;
