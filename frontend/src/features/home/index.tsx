import Categories from "./components/categories";
import DeveloperIllustration from "./components/developer-illustration";
import Hero from "./components/hero";
import WorkSection from "./components/work-section";

const HomePage = () => {
  return (
    <div className="relative">
      <Hero />
      <DeveloperIllustration />
      <WorkSection />
      <Categories />
    </div>
  );
};

export default HomePage;
