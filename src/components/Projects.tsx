import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import aiProject from "@/assets/ai-project.jpg";
import ecommerceProject from "@/assets/ecommerce-project.jpg";
import calendarProject from "@/assets/calendar-project.jpg";

const Projects = () => {
  const projects = [
    {
      title: "AI Image Generation",
      description: "A generative AI application that creates unique images from text prompts using advanced machine learning models. Built with Python and modern AI frameworks.",
      image: aiProject,
      tags: ["Python", "AI/ML", "Generative AI", "Flask"],
      liveLink: "#",
      githubLink: "#",
    },
    {
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce website with user authentication, product management, shopping cart, payment integration, and admin panel for managing orders and inventory.",
      image: ecommerceProject,
      tags: ["MERN Stack", "React", "Node.js", "MongoDB"],
      liveLink: "#",
      githubLink: "#",
    },
    {
      title: "College Events Calendar",
      description: "A comprehensive web application for managing and displaying college events with date-based filtering, event details, and real-time updates for students.",
      image: calendarProject,
      tags: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      liveLink: "https://college-events-sandy.vercel.app/",
      githubLink: "#",
    },
  ];

  return (
    <section id="projects" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-primary text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          My Projects
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <Card
              key={project.title}
              className="overflow-hidden border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-base">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {project.liveLink !== "#" && (
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="w-full"
                  >
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
