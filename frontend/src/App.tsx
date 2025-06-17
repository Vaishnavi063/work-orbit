import { TrafficCone } from "lucide-react";
const App = () => {
  return (
    <div className="min-h-screen w-full">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]">
          <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
            <p className="text-6xl font-extrabold tracking-tight leading-tight sm:text-7xl">
              Work-Orbit
            </p>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              Freelance Job Bidding Platform
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <p className="text-2xl sm:text-3xl font-medium text-red-500">
                Work in Progress
              </p>
              <TrafficCone size="28" className="text-red-500" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
