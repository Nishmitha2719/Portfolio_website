import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          Hi, I'm Nishmitha Shetty
        </h1>
        <p className="text-2xl md:text-3xl text-white/90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Full Stack Developer
        </p>
        <Button
          onClick={scrollToProjects}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
        >
          View My Work
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default Hero;
