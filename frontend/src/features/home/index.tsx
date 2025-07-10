import Categories from "./components/categories";
import Hero from "./components/hero";
import WorkSection from "./components/work-section";

const HomePage = () => {
  return (
    <div className="relative mx-auto container">
      <Hero />
      <WorkSection />
      <Categories />
    </div>
  );
};

export default HomePage;
