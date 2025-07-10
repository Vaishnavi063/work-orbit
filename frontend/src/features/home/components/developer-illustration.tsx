import illustration from "/assests/working-man.png";

const DeveloperIllustration = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-6 py-8 dark:bg-slate-900">
      <div className="mt-8 md:mt-0 md:mr-20">
        <img
          src={illustration}
          alt="Freelancer working remotely"
          width={400}
          height={400}
          className="w-full h-auto"
        />
      </div>
      <div className="max-w-xl text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          Work from Anywhere. Earn Everywhere.
        </h1>
        <p className="text-muted-foreground text-lg mb-6">
          Join thousands of freelancers building their future — one project at a
          time. Whether you're a developer, designer, or writer, get paid for
          what you do best.
        </p>
        <button className="bg-primary text-white py-3 px-6 rounded-lg text-base hover:bg-primary/80 transition">
          Become a Freelancer
        </button>
      </div>
    </section>
  );
};

export default DeveloperIllustration;
